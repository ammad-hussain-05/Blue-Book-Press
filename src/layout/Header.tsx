"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SUITE_PATH } from "@/data/navigation";
import { ui, useUI } from "@/lib/uiStore";
import { cn } from "@/lib/cn";
import { MenuOverlay } from "./MenuOverlay";
import { SoundToggle } from "./SoundToggle";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Clean on load; tucks away while scrolling down, returns on scroll up and
 * gains a frosted backing once the page has moved. On the blue Publishing
 * Suite page it switches to white ink.
 */
export function Header() {
  const menuOpen = useUI((s) => s.menuOpen);
  const loaded = useUI((s) => s.loaded);
  const headerTheme = useUI((s) => s.headerTheme);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 240 && y > last + 2 ? true : y < last - 2 ? false : (h) => h);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = () => ui.set({ menuOpen: !menuOpen });
  const solid = scrolled && !menuOpen;
  // White ink on the solid-blue suite page and on dark pages (Portfolio).
  const blue = pathname === SUITE_PATH && !menuOpen;
  const dark = !blue && headerTheme === "dark" && !menuOpen;
  const inverse = blue || dark;

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: hidden && !menuOpen ? "-110%" : 0, opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="fixed inset-x-0 top-0 z-[60] h-header"
      >
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 border-b transition-all duration-700",
            !solid
              ? "border-transparent bg-transparent"
              : blue
                ? "border-paper/15 bg-blue/75 backdrop-blur-xl"
                : dark
                ? "border-paper/10 bg-ink/70 backdrop-blur-xl"
                : "border-line/80 bg-paper/75 backdrop-blur-xl",
          )}
        />
        <div className="container-site relative flex h-full items-center justify-between">
          <Link
            href="/"
            onClick={() => ui.set({ menuOpen: false })}
            className="group flex shrink-0 items-center gap-2.5 py-2 [--si:0.155] [--sw:0.31] md:gap-3 md:[--si:0.185] md:[--sw:0.37]"
            aria-label="Blue Book Press — home"
          >
            <Logo inverse={inverse} />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={cn(
                "hidden transition-opacity duration-500 md:block",
                menuOpen ? "pointer-events-none opacity-0" : "opacity-100",
              )}
            >
              <Button href="/#contact" variant={inverse ? "white" : "primary"} className="h-11 px-5 text-sm">
                Start Publishing
              </Button>
            </div>
            <SoundToggle inverse={inverse} />
            <button
              type="button"
              onClick={toggle}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className={cn(
                "group flex h-11 items-center gap-3 rounded-full border pl-5 pr-2 backdrop-blur transition-colors duration-500",
                inverse
                  ? "border-paper/30 bg-paper/10 text-paper hover:border-paper/70"
                  : "border-ink/15 bg-paper/60 hover:border-ink/40",
              )}
            >
              <span className="eyebrow relative block h-4 w-[3.4rem] overflow-hidden text-left text-[0.68rem]">
                <span
                  className={cn(
                    "block transition-transform duration-500 ease-out-expo",
                    menuOpen && "-translate-y-full",
                  )}
                >
                  Menu
                </span>
                <span
                  className={cn(
                    "absolute inset-0 block transition-transform duration-500 ease-out-expo",
                    menuOpen ? "translate-y-0" : "translate-y-full",
                  )}
                >
                  Close
                </span>
              </span>
              <span className="relative grid size-8 place-items-center rounded-full bg-ink text-paper">
                <span
                  className={cn(
                    "absolute h-px w-3.5 bg-current transition-transform duration-500 ease-out-expo",
                    menuOpen ? "rotate-45" : "-translate-y-[3px]",
                  )}
                />
                <span
                  className={cn(
                    "absolute h-px w-3.5 bg-current transition-transform duration-500 ease-out-expo",
                    menuOpen ? "-rotate-45" : "translate-y-[3px]",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>
      <MenuOverlay />
    </>
  );
}

/** Source logo (public/logo.png, 585 × 585, transparent) and its two parts, in source px. */
const LOGO = { src: "/logo.png", size: 585 } as const;
const MARK = { x: 168, y: 171, w: 248, h: 181 } as const; // stacked books
const WORDMARK = { x: 98, y: 370, w: 390, h: 44 } as const; // "Blue Book Press"

/**
 * The Blue Book Press logo as a horizontal lockup for the header: the book
 * mark beside the wordmark, both cropped (never redrawn or stretched) from
 * the one logo file. Fixed-size boxes, so nothing shifts while it loads. On
 * blue / dark headers the grey wordmark turns white; the mark keeps its colours.
 */
function Logo({ inverse }: { inverse: boolean }) {
  return (
    <>
      <LogoPart part={MARK} scale="var(--si)" className="transition-transform duration-700 ease-out-expo group-hover:-translate-y-0.5" />
      <LogoPart
        part={WORDMARK}
        scale="var(--sw)"
        className={cn(
          "transition-[filter] duration-500 max-[379px]:hidden",
          inverse && "[filter:brightness(0)_invert(1)]",
        )}
      />
    </>
  );
}

function LogoPart({
  part,
  scale,
  className,
}: {
  part: { x: number; y: number; w: number; h: number };
  scale: string;
  className?: string;
}) {
  const px = (n: number) => `calc(${n}px * ${scale})`;
  return (
    <span aria-hidden className={cn("relative block shrink-0 overflow-hidden", className)} style={{ width: px(part.w), height: px(part.h) }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO.src}
        alt=""
        width={LOGO.size}
        height={LOGO.size}
        decoding="async"
        fetchPriority="high"
        draggable={false}
        className="absolute max-w-none select-none"
        style={{ width: px(LOGO.size), height: px(LOGO.size), left: px(-part.x), top: px(-part.y) }}
      />
    </span>
  );
}
