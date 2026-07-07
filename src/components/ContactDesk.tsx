"use client";

import { useInstrumentHover } from "@/hooks/useInstrumentHover";
import { useLenis } from "@/hooks/useLenis";
import type { InstrumentShapeId } from "@/scenes/targetShapes";

type DeskLink = {
  id: InstrumentShapeId;
  label: string;
  detail: string;
  href: string;
  external: boolean;
};

const LINKS: DeskLink[] = [
  {
    id: "compass",
    label: "Email",
    detail: "miftahulislam504@gmail.com",
    href: "mailto:miftahulislam504@gmail.com",
    external: false,
  },
  {
    id: "tsquare",
    label: "GitHub",
    detail: "miftahulislam504-crypto",
    href: "https://github.com/miftahulislam504-crypto",
    external: true,
  },
  {
    id: "scale",
    label: "CIVION",
    detail: "The predecessor archive",
    href: "https://mrcivion.vercel.app",
    external: true,
  },
];

const RETURN_LINK: Omit<DeskLink, "href" | "external"> = {
  id: "protractor",
  label: "Return to cover",
  detail: "Back to sheet A-00",
};

export default function ContactDesk() {
  const { setHovered } = useInstrumentHover();
  const lenis = useLenis();

  return (
    <div className="relative z-20 flex flex-col items-center justify-center h-full px-6">
      <div className="font-display text-[10px] tracking-[0.3em] uppercase text-brass/60 mb-3">
        DWG A-11 — INSTRUMENT DESK
      </div>
      <h2 className="font-display text-lg sm:text-xl tracking-[0.15em] uppercase text-linework/80 mb-10 text-center">
        Everything on this sheet is real
      </h2>

      <nav className="flex flex-col items-center gap-6 sm:gap-7">
        {LINKS.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            data-cursor-hover
            onPointerEnter={() => setHovered(link.id)}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setHovered(link.id)}
            onBlur={() => setHovered(null)}
            className="group flex flex-col items-center gap-1"
          >
            <span className="font-display text-base sm:text-lg tracking-[0.2em] uppercase text-linework/70 group-hover:text-brass transition-colors">
              {link.label}
            </span>
            <span className="font-body text-xs text-linework/35">
              {link.detail}
            </span>
          </a>
        ))}

        {/* A real page-scroll, not a navigation — goes through Lenis's own
            scrollTo rather than a native #hash anchor, which Lenis doesn't
            reliably intercept and could desync from its internal scroll
            position tracking. */}
        <button
          type="button"
          data-cursor-hover
          onPointerEnter={() => setHovered(RETURN_LINK.id)}
          onPointerLeave={() => setHovered(null)}
          onFocus={() => setHovered(RETURN_LINK.id)}
          onBlur={() => setHovered(null)}
          onClick={() => lenis?.scrollTo(0, { duration: 2.2 })}
          className="group flex flex-col items-center gap-1"
        >
          <span className="font-display text-base sm:text-lg tracking-[0.2em] uppercase text-linework/70 group-hover:text-brass transition-colors">
            {RETURN_LINK.label}
          </span>
          <span className="font-body text-xs text-linework/35">
            {RETURN_LINK.detail}
          </span>
        </button>
      </nav>

      <p className="font-display text-[9px] tracking-[0.25em] uppercase text-linework/25 mt-16">
        Drafted from a phone in Sirajganj, Bangladesh
      </p>
    </div>
  );
}
