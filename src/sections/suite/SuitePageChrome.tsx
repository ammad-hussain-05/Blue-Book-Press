"use client";

import { useEffect } from "react";

/** Paints the document solid blue (incl. overscroll) while on the Publishing Suite. */
export function SuitePageChrome() {
  useEffect(() => {
    const html = document.documentElement;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const prev = meta?.content;
    html.classList.add("suite-page");
    if (meta) meta.content = "#1f4fe0";
    return () => {
      html.classList.remove("suite-page");
      if (meta && prev) meta.content = prev;
    };
  }, []);
  return null;
}
