"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CONTACT_SERVICES,
  normalizeContact,
  validateContact,
  type ContactErrors,
  type ContactField,
} from "@/lib/contact";
import { ArrowIcon } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;
type Status = "idle" | "sending" | "success" | "error";

/**
 * The enquiry form. Validates in the browser with the same rules as the
 * server, posts JSON to /api/contact, and reports success or failure in
 * place. All fields are required.
 */
export function ContactForm() {
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const clear = (field: ContactField) =>
    setErrors((e) => {
      if (!e[field]) return e;
      const next = { ...e };
      delete next[field];
      return next;
    });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    const data = normalizeContact(raw);
    const found = validateContact(data);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus("error");
      setMessage("Please complete the highlighted fields.");
      const first = Object.keys(found)[0];
      form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, company: raw.company ?? "" }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: ContactErrors };
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        setStatus("error");
        setMessage(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      form.current?.reset();
    } catch {
      setStatus("error");
      setMessage("We couldn’t reach the server. Please check your connection and try again.");
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="success"
            role="status"
            className="flex min-h-[32rem] flex-col items-start justify-center rounded-[1.6rem] border border-line bg-paper p-8 md:p-12"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className="grid size-14 place-items-center rounded-full bg-blue text-paper">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <motion.path
                  d="M5 12.5 10 17.5 19 7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
                />
              </svg>
            </span>
            <p className="eyebrow mt-8 text-[0.68rem] text-blue">Message received</p>
            <h3 className="mt-3 font-serif text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.05] tracking-[-0.03em]">
              Thank you — your story <em>has reached us.</em>
            </h3>
            <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-ink-soft">
              Our team will read your message and reply personally with clear next steps for your book.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="eyebrow mt-8 inline-flex items-center gap-3 text-[0.68rem] text-ink transition-colors hover:text-blue"
            >
              Send another message
              <span aria-hidden className="h-px w-8 bg-current" />
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={form}
            noValidate
            onSubmit={onSubmit}
            aria-describedby={message ? "contact-status" : undefined}
            className="rounded-[1.6rem] border border-line bg-paper p-6 shadow-[0_40px_100px_-60px_rgba(15,42,138,0.35)] sm:p-8 md:p-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            {/* Honeypot (hidden from people and assistive tech) */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Company
                <input type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              <Field label="Full Name" error={errors.name}>
                {(p) => <input {...p} name="name" type="text" autoComplete="name" onInput={() => clear("name")} />}
              </Field>
              <Field label="Email Address" error={errors.email}>
                {(p) => <input {...p} name="email" type="email" autoComplete="email" onInput={() => clear("email")} />}
              </Field>
              <Field label="Phone Number" error={errors.phone}>
                {(p) => <input {...p} name="phone" type="tel" autoComplete="tel" onInput={() => clear("phone")} />}
              </Field>
              <Field label="Book Title" hint="A working title is fine" error={errors.bookTitle}>
                {(p) => <input {...p} name="bookTitle" type="text" onInput={() => clear("bookTitle")} />}
              </Field>
              <Field label="Service Interest" error={errors.service} className="sm:col-span-2">
                {(p) => (
                  <div className="relative">
                    <select
                      {...p}
                      name="service"
                      defaultValue=""
                      onChange={() => clear("service")}
                      className={cn(p.className, "cursor-pointer appearance-none pr-10 invalid:text-ink-muted")}
                    >
                      <option value="" disabled>
                        Choose a service
                      </option>
                      {CONTACT_SERVICES.map((s) => (
                        <option key={s} value={s} className="text-ink">
                          {s}
                        </option>
                      ))}
                    </select>
                    <svg
                      viewBox="0 0 16 16"
                      aria-hidden
                      className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </Field>
              <Field label="Message" error={errors.message} className="sm:col-span-2">
                {(p) => (
                  <textarea
                    {...p}
                    name="message"
                    rows={5}
                    placeholder="Tell us about your book, where it is today and what you need."
                    onInput={() => clear("message")}
                    className={cn(p.className, "resize-y placeholder:text-ink-muted/70")}
                  />
                )}
              </Field>
            </div>

            <div className="mt-9 flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p
                id="contact-status"
                role={status === "error" ? "alert" : undefined}
                aria-live="polite"
                className={cn(
                  "min-h-[1.25rem] text-[0.85rem] leading-snug",
                  status === "error" ? "text-[#b42318]" : "text-ink-muted",
                )}
              >
                {status === "error" ? message : "All fields are required."}
              </p>
              <button
                type="submit"
                disabled={status === "sending"}
                className="group/btn relative isolate inline-flex h-13 shrink-0 items-center justify-center gap-3 overflow-hidden rounded-full bg-ink px-7 text-[0.95rem] font-medium tracking-tight text-paper transition-opacity disabled:cursor-wait disabled:opacity-80"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 translate-y-full rounded-full bg-blue transition-transform duration-700 ease-out-expo group-hover/btn:translate-y-0"
                />
                {status === "sending" ? (
                  <>
                    <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send Message
                    <ArrowIcon className="size-4 transition-transform duration-500 group-hover/btn:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

type ControlProps = {
  id: string;
  required: true;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
  className: string;
};

/** Label + control + error, with an underline that turns blue on focus. */
function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: (props: ControlProps) => ReactNode;
}) {
  const id = useId();
  const errId = `${id}-error`;
  return (
    <div className={cn("group/field flex flex-col", className)}>
      <label htmlFor={id} className="eyebrow flex items-baseline justify-between gap-3 text-[0.62rem] text-ink-soft">
        <span>
          {label} <span className="text-blue">*</span>
        </span>
        {hint && <span className="normal-case tracking-normal text-ink-muted">{hint}</span>}
      </label>
      <div className="relative mt-2">
        {children({
          id,
          required: true,
          "aria-invalid": !!error,
          "aria-describedby": error ? errId : undefined,
          className: cn(
            "w-full border-0 border-b bg-transparent px-0 py-2.5 text-[1rem] text-ink outline-none transition-colors duration-300 focus:ring-0",
            error ? "border-[#b42318]" : "border-line hover:border-ink/40",
          ),
        })}
        {/* Focus line */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-blue transition-transform duration-500 ease-out-expo group-focus-within/field:scale-x-100"
        />
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={errId}
            className="mt-2 text-[0.78rem] leading-snug text-[#b42318]"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
