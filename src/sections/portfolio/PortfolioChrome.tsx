"use client";

import { useEffect } from "react";

/** Paints the document black (overscroll included) while on the Portfolio. */
export function PortfolioChrome() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("portfolio-page");
    return () => html.classList.remove("portfolio-page");
  }, []);
  return null;
}
