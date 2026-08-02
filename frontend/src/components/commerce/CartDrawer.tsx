"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Banknote, Check, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { ar } from "@/content/ar";
import { products } from "@/content/products";
import { getCrossSellProducts } from "@/lib/crossSell";
import { addDefaultOffer, useCart } from "@/store/cart";
import { Button, ButtonLink } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export function CartDrawer() {
  const {
    lines,
    isCartOpen,
    isCheckoutOpen,
    closeCart,
    openCheckout,
    setBundles,
    removeLine,
    totalSar,
    itemCount,
  } = useCart();

  const [addedSlug, setAddedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!isCartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isCheckoutOpen) closeCart();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isCartOpen, isCheckoutOpen, closeCart]);

  if (!isCartOpen) return null;

  const total = totalSar();
  const count = itemCount();
  const crossSell = getCrossSellProducts(lines.map((l) => l.slug));
  const missingCount = new Set(
    products.map((p) => p.slug).filter((s) => !lines.some((l) => l.slug === s)),
  ).size;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={ar.cart.title}>
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(16,26,23,.45)]"
        aria-label={ar.common.close}
        onClick={closeCart}
      />

      <div className="relative flex h-[100dvh] w-full max-w-[420px] flex-col bg-ivory shadow-[var(--shadow-lg)]">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-sand-200 px-4">
          <h2 className="text-h3 text-brand-900">
            {ar.cart.title}
            {count > 0 ? (
              <span className="ms-2 text-muted">
                (<LTR>({count})</LTR>
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-[var(--radius-md)] text-brand-800 hover:bg-brand-50"
            aria-label={ar.common.close}
            onClick={closeCart}
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <ShoppingBag className="size-12 text-sand-200" aria-hidden />
              <p className="mt-4 text-h3 text-brand-900">{ar.cart.empty}</p>
              <p className="mt-2 max-w-xs text-body text-ink-soft">
                {ar.cart.emptySub}
              </p>
              <ButtonLink
                href="/collection"
                className="mt-6"
                onClick={closeCart}
              >
                {ar.cta.seeProducts}
              </ButtonLink>
            </div>
          ) : (
            <>
              <ul className="space-y-4">
                {lines.map((line) => (
                  <li
                    key={line.key}
                    className="flex gap-3 rounded-[var(--radius-lg)] bg-white p-3 ring-1 ring-sand-200"
                  >
                    <div className="size-16 shrink-0 overflow-hidden rounded-[var(--radius-md)]">
                      <PlaceholderImage
                        label={line.shortName}
                        ratio="1/1"
                        className="rounded-none ring-0"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body font-medium text-brand-900">
                        {line.shortName}
                      </p>
                      <p className="text-body-sm text-muted">
                        {line.offerTitle} · {line.offerDuration}
                      </p>
                      <p className="mt-1 text-body font-medium tabular-nums text-brand-900">
                        {line.bundles > 1 ? (
                          <>
                            <LTR>{line.bundles}</LTR> ×{" "}
                            <LTR>{line.unitPriceSar}</LTR> ={" "}
                          </>
                        ) : null}
                        <LTR>{line.unitPriceSar * line.bundles}</LTR>{" "}
                        {ar.common.sar}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="inline-flex items-center rounded-[var(--radius-md)] border border-sand-200">
                          <button
                            type="button"
                            className="inline-flex size-9 items-center justify-center"
                            aria-label={ar.cart.decrease}
                            onClick={() =>
                              setBundles(line.key, line.bundles - 1)
                            }
                          >
                            <Minus className="size-4" aria-hidden />
                          </button>
                          <span className="min-w-6 text-center text-body-sm tabular-nums">
                            <LTR>{line.bundles}</LTR>
                          </span>
                          <button
                            type="button"
                            className="inline-flex size-9 items-center justify-center"
                            aria-label={ar.cart.increase}
                            onClick={() =>
                              setBundles(line.key, line.bundles + 1)
                            }
                          >
                            <Plus className="size-4" aria-hidden />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="inline-flex size-9 items-center justify-center rounded-[var(--radius-md)] text-muted hover:bg-urgent-bg hover:text-urgent"
                          aria-label={ar.cart.remove}
                          onClick={() => removeLine(line.key)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {crossSell.length > 0 ? (
                  <>
                    <h3 className="text-h3 text-brand-900">
                      {ar.cart.crossSellTitle}
                    </h3>
                    <p className="mt-1 text-body-sm text-ink-soft">
                      {missingCount === 1
                        ? ar.cart.crossSellSubOne
                        : ar.cart.crossSellSubTwo}
                    </p>
                    <ul className="mt-4 space-y-3">
                      {crossSell.map(({ product, reason }) => (
                        <li
                          key={product.slug}
                          className="flex gap-3 rounded-[var(--radius-lg)] bg-white p-3 ring-1 ring-sand-200"
                        >
                          <div className="size-20 shrink-0 overflow-hidden rounded-[var(--radius-md)]">
                            <PlaceholderImage
                              label={product.shortName}
                              ratio="1/1"
                              className="rounded-none ring-0"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-body font-medium text-brand-900">
                              {product.shortName}
                            </p>
                            <p className="text-label text-gold-600">
                              السبب {["", "①", "②", "③"][product.causeNumber]} —{" "}
                              {product.causeName}
                            </p>
                            <p className="mt-1 text-body-sm text-ink-soft">
                              {reason}
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <p className="text-body-sm font-medium text-brand-900">
                                <LTR>
                                  {(
                                    product.offers.find((o) => o.isDefault) ??
                                    product.offers[0]
                                  ).priceSar}
                                </LTR>{" "}
                                {ar.common.sar}
                              </p>
                              <Button
                                size="sm"
                                variant={
                                  addedSlug === product.slug
                                    ? "secondary"
                                    : "primary"
                                }
                                onClick={() => {
                                  addDefaultOffer(product.slug);
                                  setAddedSlug(product.slug);
                                  window.setTimeout(
                                    () => setAddedSlug(null),
                                    1500,
                                  );
                                }}
                                data-cta={`cart-crosssell-${product.slug}`}
                              >
                                {addedSlug === product.slug ? (
                                  <>
                                    <Check className="size-4" aria-hidden />
                                    {ar.cta.added}
                                  </>
                                ) : (
                                  ar.cta.addToCart
                                )}
                              </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="rounded-[var(--radius-lg)] bg-brand-50 p-4 text-body-sm text-brand-800 ring-1 ring-brand-100">
                    {ar.cart.systemComplete}
                  </div>
                )}
              </div>

              <ul className="mt-6 space-y-2 text-body-sm text-brand-700">
                <li className="flex items-center gap-2">
                  <Check className="size-4" aria-hidden /> {ar.trust.cod.label}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4" aria-hidden />{" "}
                  {ar.trust.delivery.label}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4" aria-hidden />{" "}
                  {ar.trust.discreet.label}
                </li>
              </ul>
            </>
          )}
        </div>

        <footer
          className="shrink-0 border-t border-sand-200 bg-white px-4 pt-4 shadow-[0_-8px_24px_rgba(16,26,23,.06)]"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-body text-ink-soft">{ar.cart.total}</span>
            <span className="text-h3 tabular-nums text-brand-900">
              <LTR>{total}</LTR> {ar.common.sar}
            </span>
          </div>
          <p className="mt-1 text-body-sm text-muted">{ar.cart.freeShip}</p>
          <Button
            size="xl"
            fullWidth
            className="mt-3"
            disabled={lines.length === 0}
            onClick={openCheckout}
            data-cta="cart-checkout"
          >
            {ar.cta.checkout}
          </Button>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-body-sm text-muted">
            <Banknote className="size-4" aria-hidden />
            {ar.cart.codNote}
          </p>
          {lines.length === 0 ? null : (
            <p className="mt-2 text-center">
              <Link
                href="/collection"
                className="text-body-sm text-brand-700 underline"
                onClick={closeCart}
              >
                {ar.cta.continueShopping}
              </Link>
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
