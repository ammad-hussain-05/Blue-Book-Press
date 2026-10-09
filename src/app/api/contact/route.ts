import { normalizeContact, validateContact, type ContactPayload } from "@/lib/contact";
import { site } from "@/data/site";

/**
 * POST /api/contact — validates a contact-form submission and emails it to
 * the press via Resend (https://resend.com, plain REST: no SDK needed).
 *
 * Environment (server-only — see .env.example):
 *   RESEND_API_KEY      required to send; without it the route answers 503
 *   CONTACT_TO_EMAIL    inbox for submissions (default associatesalman@gmail.com)
 *   CONTACT_FROM_EMAIL  verified sender (default Resend's onboarding sender)
 */

const DEFAULT_TO = "associatesalman@gmail.com";
const DEFAULT_FROM = "Blue Book Press <onboarding@resend.dev>";

/** Light per-IP throttle (per server instance): 5 submissions / 10 minutes. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function compose(d: ContactPayload) {
  const rows: [string, string][] = [
    ["Name", d.name],
    ["Email", d.email],
    ["Phone", d.phone],
    ["Book title", d.bookTitle],
    ["Service", d.service],
  ];
  const text = [...rows.map(([k, v]) => `${k}: ${v}`), "", "Message:", d.message].join("\n");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#0b0b0c;max-width:600px">
  <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#1f4fe0">New enquiry · ${escape(site.name)}</p>
  <h2 style="margin:0 0 20px;font-weight:normal;font-size:22px">${escape(d.name)} — ${escape(d.service)}</h2>
  <table style="border-collapse:collapse;width:100%;font-size:14px">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid #e3e5e3;color:#75777c;white-space:nowrap">${k}</td><td style="padding:8px 0;border-bottom:1px solid #e3e5e3">${escape(v)}</td></tr>`,
      )
      .join("")}
  </table>
  <p style="margin:24px 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#75777c">Message</p>
  <p style="margin:0;font-size:15px;line-height:1.6;white-space:pre-wrap">${escape(d.message)}</p>
</div>`;
  return { text, html };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "We couldn’t read that submission. Please try again." }, { status: 400 });
  }

  // Honeypot: real visitors never fill the hidden "company" field.
  if (body && typeof body === "object" && (body as Record<string, unknown>).company) {
    return Response.json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (throttled(ip)) {
    return Response.json(
      { ok: false, error: "You’ve sent a few messages in a short time. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  const data = normalizeContact(body);
  const errors = validateContact(data);
  if (Object.keys(errors).length) {
    return Response.json({ ok: false, error: "Please check the highlighted fields.", errors }, { status: 422 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[contact] RESEND_API_KEY is not set — submission not sent. See .env.example.");
    return Response.json(
      {
        ok: false,
        error: `Our message service is being set up. Please email us directly at ${site.email} — we’d love to hear from you.`,
      },
      { status: 503 },
    );
  }

  const { text, html } = compose(data);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
        to: [process.env.CONTACT_TO_EMAIL || DEFAULT_TO],
        reply_to: data.email,
        subject: `New enquiry: ${data.service} — ${data.name}`,
        text,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[contact] Resend rejected the message:", res.status, await res.text());
      throw new Error(`Resend ${res.status}`);
    }
  } catch (err) {
    console.error("[contact] Sending failed:", err);
    return Response.json(
      { ok: false, error: `We couldn’t send your message just now. Please try again, or email us at ${site.email}.` },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
