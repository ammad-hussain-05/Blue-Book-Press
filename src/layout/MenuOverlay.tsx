"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useLenis, useScrollTo } from "@/components/providers/SmoothScrollProvider";
import { primaryNav } from "@/data/navigation";
import { site } from "@/data/site";
import { ui, useUI } from "@/lib/uiStore";
import { cn } from "@/lib/cn";
import { StairList } from "./SuiteDropdown";

const MenuScene = dynamic(() => import("@/3d/MenuScene"), { ssr: false, loading: () => null });

const EASE = [0.76, 0, 0.24, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Full-screen menu: rotating satellite books on the left, centred serif
 * links, contact / CTA column on the right.
 */
export function MenuOverlay() {
  const open = useUI((s) => s.menuOpen);
  const lenis = useLenis();
  const scrollTo = useScrollTo();
  const router = useRouter();
  const pathname = usePathname();
  const close = () => ui.set({ menuOpen: false });
  const [suiteOpen, setSuiteOpen] = useState(false);

  useEffect(() => {
    if (!open) setSuiteOpen(false);
  }, [open]);

  // Lock the page while open: no wheel/touch/keyboard scroll, no scrollbar,
  // no layout shift when the scrollbar disappears.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const scrollbar = window.innerWidth - html.clientWidth;
    lenis?.stop();
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.paddingRight = scrollbar ? `${scrollbar}px` : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && ui.set({ menuOpen: false });
    // iOS Safari ignores overflow:hidden on body for touch scrolling.
    // The nav column may scroll when the services list is expanded.
    const blockTouch = (e: TouchEvent) => {
      if (!(e.target as HTMLElement).closest("[data-menu-scroll]")) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchmove", blockTouch, { passive: false });
    return () => {
      lenis?.start();
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.paddingRight = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchmove", blockTouch);
    };
  }, [open, lenis]);

  // Internal links inside the menu: close first, then either glide to the
  // section (same page) or navigate (other page, e.g. /about ↔ /publishing-suite#cover-design).
  const onLinkClick = (e: React.MouseEvent) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="/"], a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute("href") ?? "/";
    const [path, hash] = href.split("#");
    const samePage = path === "" || path === pathname;
    e.preventDefault();
    e.stopPropagation();
    close();
    window.setTimeout(() => {
      if (samePage) scrollTo(hash ? `#${hash}` : 0);
      else router.push(href);
    }, 450);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[55] h-dvh w-full touch-none overflow-hidden overscroll-none bg-paper"
          onClickCapture={onLinkClick}
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.8, ease: EASE, delay: 0.15 } }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-[10%] top-[10%] size-[40rem] rounded-full bg-blue/[0.06] blur-[120px]" />
            <div className="absolute -right-[10%] bottom-0 size-[36rem] rounded-full bg-blue-light/[0.06] blur-[120px]" />
          </div>

          <div className="container-site relative grid h-full grid-rows-[1fr_auto] pt-header">
            <div
              data-menu-scroll
              className="grid min-h-0 items-center gap-8 overflow-y-auto overscroll-contain py-6 [align-content:safe_center] [scrollbar-width:none] lg:grid-cols-[0.9fr_1.4fr_0.8fr] lg:gap-8 lg:py-10"
            >
              {/* Left — rotating books */}
              <motion.div
                className="relative hidden h-[min(66vh,40rem)] lg:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 1, delay: 0.4 } }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
              >
                <MenuScene />
              </motion.div>

              {/* Centre — navigation */}
              <nav aria-label="Primary" className="lg:justify-self-center">
                <ul className="space-y-1">
                  {primaryNav.map((item, i) => (
                    <li key={item.href}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <motion.a
                          href={item.href}
                          className="group flex items-baseline gap-5 py-1"
                          initial={{ y: "110%" }}
                          animate={{ y: 0, transition: { duration: 1, ease: EASE_OUT, delay: 0.35 + i * 0.07 } }}
                          exit={{ y: "110%", transition: { duration: 0.5, ease: EASE, delay: i * 0.03 } }}
                        >
                          <span className="w-6 text-xs tabular-nums text-ink-muted transition-colors duration-500 group-hover:text-blue">
                            0{i + 1}
                          </span>
                          <span className="font-serif text-[clamp(2rem,min(4.4vw,7vh),4.5rem)] leading-[1.02] tracking-[-0.035em] transition-all duration-700 ease-out-expo group-hover:translate-x-3 group-hover:italic group-hover:text-blue">
                            {item.label}
                          </span>
                        </motion.a>
                        {item.children && (
                          <motion.button
                            type="button"
                            onClick={() => setSuiteOpen((v) => !v)}
                            aria-expanded={suiteOpen}
                            aria-controls="menu-suite-list"
                            aria-label={suiteOpen ? "Hide services" : "Show services"}
                            className={cn(
                              "grid size-10 shrink-0 place-items-center rounded-full border transition-colors duration-500",
                              suiteOpen ? "border-blue bg-blue text-paper" : "border-ink/20 text-ink hover:border-blue hover:text-blue",
                            )}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE_OUT, delay: 0.6 } }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          >
                            <span className="relative block size-3">
                              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
                              <span
                                className={cn(
                                  "absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current transition-transform duration-500 ease-out-expo",
                                  suiteOpen && "rotate-90 scale-y-0",
                                )}
                              />
                            </span>
                          </motion.button>
                        )}
                      </div>
                      <AnimatePresence initial={false}>
                        {item.children && suiteOpen && (
                          <motion.div
                            id="menu-suite-list"
                            className="max-w-md pb-3 pl-11 pt-2"
                            initial={{ height: 0 }}
                            animate={{ height: "auto", transition: { duration: 0.6, ease: EASE_OUT } }}
                            exit={{ height: 0, transition: { duration: 0.45, ease: EASE, delay: 0.2 } }}
                          >
                            <StairList items={item.children} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Right — brand message + contact */}
              <motion.aside
                className="max-w-sm space-y-6 lg:space-y-10 lg:justify-self-end"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 1, ease: EASE_OUT, delay: 0.6 } }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
              >
                <div className="hidden lg:block">
                  <p className="eyebrow text-blue">Stories beyond the page</p>
                  <p className="mt-4 font-serif text-2xl leading-snug">
                    Every great story deserves to be published — in print, on screen and in sound.
                  </p>
                </div>
                <div className="space-y-2 border-t border-line pt-6 lg:pt-8">
                  <p className="eyebrow text-ink-muted">Write to us</p>
                  <a href={`mailto:${site.email}`} className="block text-lg transition-colors hover:text-blue">
                    {site.email}
                  </a>
                </div>
                <Button href="/#contact" className="w-full justify-between" arrow>
                  Start Publishing
                </Button>
              </motion.aside>
            </div>

            <motion.div
              className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-5 text-sm text-ink-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.8 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <ul className="flex gap-6">
                {site.socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} className="transition-colors hover:text-ink">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p>© {new Date().getFullYear()} {site.name}</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
