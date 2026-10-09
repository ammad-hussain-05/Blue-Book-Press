"use client";

import { useEffect, useSyncExternalStore, type RefObject } from "react";

/**
 * Site-wide ambient sound. One Web Audio graph for the whole visit (it lives
 * in this module, so client-side navigation never restarts it): a gapless
 * looping buffer → gain (smooth fades) → speakers.
 *
 * - `pref` is the visitor's choice, saved in localStorage ("on" by default).
 * - Browsers only allow audio after a user gesture: until then the state is
 *   `blocked` and the first click / key / tap anywhere starts it.
 * - Any page media with its own sound can `duck` the ambience (e.g. the
 *   Portfolio intro film). It fades out while any duck is held, and returns
 *   only if the visitor hasn't switched it off.
 */

/** Swap this file to change the sound (any format the browser can decode). */
export const AMBIENT_SRC = "/audio/site-ambient.wav";
const VOLUME = 0.2;
const FADE_IN = 0.9; // time constants (s) for setTargetAtTime
const FADE_OUT = 0.35;
const STORAGE_KEY = "bbp-sound";

type Pref = "on" | "off";
export type AmbientState = {
  pref: Pref;
  /** Sound is wanted but the browser is waiting for a first interaction. */
  blocked: boolean;
  /** Audible right now (pref on, unlocked, not ducked). */
  playing: boolean;
  /** Muted for page media (e.g. the Portfolio film). */
  ducked: boolean;
};

let state: AmbientState = { pref: "on", blocked: true, playing: false, ducked: false };
const listeners = new Set<() => void>();
const emit = (patch: Partial<AmbientState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let source: AudioBufferSourceNode | null = null;
let bytes: Promise<ArrayBuffer | null> | null = null;
let starting: Promise<void> | null = null;
let suspendTimer: number | undefined;
let initialised = false;
const ducks = new Set<string>();

type UA = { userActivation?: { isActive: boolean; hasBeenActive: boolean } };
const activation = () => (navigator as Navigator & UA).userActivation;

const readPref = (): Pref => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "off" ? "off" : "on";
  } catch {
    return "on";
  }
};
const writePref = (p: Pref) => {
  try {
    localStorage.setItem(STORAGE_KEY, p);
  } catch {
    /* storage unavailable: preference lasts for this visit only */
  }
};

/** Should sound be audible right now? */
const wanted = () => state.pref === "on" && ducks.size === 0 && !document.hidden;

/** Fade toward the wanted level; idle the audio thread once silent. */
function apply() {
  const ducked = ducks.size > 0;
  if (!ctx || !gain) {
    emit({ ducked, playing: false });
    return;
  }
  const on = wanted();
  window.clearTimeout(suspendTimer);
  if (on) {
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    // Short hold before fading in, so a duck that arrives on the same
    // gesture (e.g. the film unmuting) wins without any overlap.
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setTargetAtTime(VOLUME, ctx.currentTime + 0.25, FADE_IN);
  } else {
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setTargetAtTime(0, ctx.currentTime, FADE_OUT);
    suspendTimer = window.setTimeout(() => {
      if (ctx && !wanted() && ctx.state === "running") ctx.suspend().catch(() => {});
    }, FADE_OUT * 6 * 1000);
  }
  emit({ ducked, playing: on && ctx.state !== "closed" });
}

/** Create the graph (must run inside a user gesture, or after one). */
function start() {
  if (starting) return starting;
  starting = (async () => {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();
    gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    // Unlocked once the context first runs: stop listening for gestures.
    const c = ctx;
    const onState = () => {
      if (c.state !== "running") return;
      c.removeEventListener("statechange", onState);
      GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true));
      emit({ blocked: false });
    };
    c.addEventListener("statechange", onState);
    // Resume synchronously within the gesture, before any await.
    if (c.state === "suspended") c.resume().catch(() => {});
    else onState();
    const data = await (bytes ?? load());
    if (!data || !ctx) return;
    try {
      const buffer = await ctx.decodeAudioData(data.slice(0));
      source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start();
    } catch {
      return; // undecodable file: stay silent rather than break the page
    }
    apply();
  })();
  return starting;
}

/** Fetch the file early (no gesture needed); decode happens on start. */
function load() {
  bytes = fetch(AMBIENT_SRC)
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .catch(() => null);
  return bytes;
}

const GESTURES = ["pointerdown", "pointerup", "keydown", "touchend", "click"] as const;
/** Until audio is unlocked, every real gesture tries to start / resume it. */
function onGesture(e: Event) {
  if (state.pref !== "on") return;
  // The sound button handles its own click (see `toggle`).
  if ((e.target as Element | null)?.closest?.("[data-ambient-toggle]")) return;
  // Only inside a genuine activation (e.g. touch pointerdown isn't one).
  const ua = activation();
  if (ua && !ua.isActive) return;
  if (!ctx) start();
  else if (ctx.state === "suspended" && wanted()) ctx.resume().catch(() => {});
}

export const ambient = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },

  /** Call once on the client (the global sound control does). */
  init() {
    if (initialised) return;
    initialised = true;
    emit({ pref: readPref() });
    load();
    document.addEventListener("visibilitychange", apply);
    GESTURES.forEach((g) => window.addEventListener(g, onGesture, { capture: true, passive: true }));
    // Already interacted with this tab (e.g. arrived via a link): try now.
    if (state.pref === "on" && activation()?.hasBeenActive) start();
  },

  /** The on/off button. Clicking it is itself the gesture that unlocks audio. */
  toggle() {
    const next: Pref = state.pref === "on" && !state.blocked ? "off" : "on";
    writePref(next);
    emit({ pref: next });
    if (next === "on" && !ctx) start();
    else apply();
  },

  /** Hold (true) or release (false) a duck for a piece of page media. */
  duck(id: string, on: boolean) {
    const had = ducks.has(id);
    if (on === had) return;
    if (on) ducks.add(id);
    else ducks.delete(id);
    apply();
  },
};

const serverState: AmbientState = { pref: "on", blocked: true, playing: false, ducked: false };

export function useAmbient<T>(selector: (s: AmbientState) => T): T {
  return useSyncExternalStore(
    ambient.subscribe,
    () => selector(state),
    () => selector(serverState),
  );
}

/**
 * Page media with its own sound takes priority: holds a duck on the ambience
 * while `ref`'s element is playing unmuted, and releases it when it pauses,
 * ends, is muted or unmounts.
 */
export function useDuckWhileAudible(ref: RefObject<HTMLMediaElement | null>, id: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => ambient.duck(id, !el.paused && !el.ended && !el.muted && el.volume > 0);
    const events = ["play", "playing", "pause", "ended", "volumechange", "emptied"] as const;
    events.forEach((e) => el.addEventListener(e, update));
    update();
    return () => {
      events.forEach((e) => el.removeEventListener(e, update));
      ambient.duck(id, false);
    };
  }, [ref, id]);
}
