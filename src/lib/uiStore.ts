"use client";

import { useSyncExternalStore } from "react";

/** Tiny global UI store shared by the header, menu, preloader and 3D stage. */
type UIState = {
  menuOpen: boolean;
  /** True once the preloader has finished (models ready or timed out). */
  loaded: boolean;
  /** Page-driven header ink: "dark" = white ink on a black page. */
  headerTheme: "light" | "dark";
};

let state: UIState = { menuOpen: false, loaded: false, headerTheme: "light" };
const listeners = new Set<() => void>();

export const ui = {
  get: () => state,
  set(patch: Partial<UIState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

const serverState: UIState = { menuOpen: false, loaded: false, headerTheme: "light" };

export function useUI<T>(selector: (s: UIState) => T): T {
  return useSyncExternalStore(
    ui.subscribe,
    () => selector(state),
    () => selector(serverState),
  );
}
