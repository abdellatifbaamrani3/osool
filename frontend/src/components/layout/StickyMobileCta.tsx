"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Mobile-only persistent CTA. Hidden until the hero has scrolled away so it
 * never competes with the hero's own buttons, and it sits above the WhatsApp
 * FAB rather than under it.
 */
export function StickyMobileCta({
  href,
  label,
  note,
  showAfter = 600,
}: {
  href: string;
  label: string;
  note?: string;
  showAfter?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-ivory/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-[var(--dur-base)] md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <ButtonLink
        href={href}
        size="xl"
        fullWidth
        tabIndex={visible ? undefined : -1}
        data-cta="sticky-mobile-home"
      >
        {label}
      </ButtonLink>
      {note ? (
        <p className="mt-2 text-center text-body-sm text-muted">{note}</p>
      ) : null}
    </div>
  );
}
