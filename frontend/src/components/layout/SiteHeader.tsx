"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { ar } from "@/content/ar";
import { Logo } from "@/components/ui/Logo";
import { useCart } from "@/store/cart";
import { LTR } from "@/components/ui/LTR";

const links = [
  { href: "/collection", label: ar.nav.collection },
  { href: "/#how", label: ar.nav.protocol },
  { href: "/#proof", label: ar.nav.science },
  { href: "/#guarantee", label: ar.nav.guarantee },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const openCart = useCart((s) => s.openCart);
  const lines = useCart((s) => s.lines);
  const itemCount = lines.reduce((sum, l) => sum + l.bundles, 0);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/80 bg-ivory/95 backdrop-blur-md">
      <div className="container-page flex h-[60px] items-center justify-between gap-4 lg:h-[72px]">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="رئيسي">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-body-sm font-medium text-ink-soft transition-colors hover:text-brand-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/collection"
            className="hidden min-h-11 items-center rounded-[var(--radius-md)] bg-brand-700 px-4 text-body-sm font-medium text-ivory shadow-[var(--shadow-cta)] transition-colors hover:bg-brand-600 md:inline-flex"
            data-cta="header-shop"
          >
            {ar.cta.seeProducts}
          </Link>
          <button
            type="button"
            className="relative inline-flex size-11 items-center justify-center rounded-[var(--radius-md)] text-brand-800 hover:bg-brand-50"
            aria-label={ar.nav.cart}
            onClick={openCart}
            data-cta="header-cart"
          >
            <ShoppingBag className="size-5" aria-hidden />
            {mounted && itemCount > 0 ? (
              <span className="absolute end-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-medium text-brand-900">
                <LTR>{itemCount > 9 ? "9+" : itemCount}</LTR>
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-[var(--radius-md)] text-brand-800 hover:bg-brand-50 lg:hidden"
            aria-label={open ? ar.common.close : ar.nav.menu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-sand-200 bg-ivory lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-3" aria-label="جوال">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-[var(--radius-md)] px-3 py-3 text-body font-medium text-brand-900 hover:bg-brand-50"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
