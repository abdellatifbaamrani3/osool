"use client";

import { ar } from "@/content/ar";
import type { Offer } from "@/content/products";
import { LTR } from "@/components/ui/LTR";

export function OfferSelector({
  offers,
  selectedQty,
  onChange,
  dark = false,
}: {
  offers: Offer[];
  selectedQty: number;
  onChange: (qty: number) => void;
  dark?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="اختر العرض"
      className="grid gap-3 md:grid-cols-3"
    >
      {offers.map((offer) => {
        const selected = offer.qty === selectedQty;
        const perUnit = Math.round(offer.priceSar / offer.qty);
        const save =
          offer.qty > 1
            ? offer.qty * offers[0].priceSar - offer.priceSar
            : 0;

        return (
          <button
            key={offer.qty}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(offer.qty)}
            className={`relative flex flex-col justify-between rounded-[var(--radius-lg)] p-4 text-start transition-[border-color,box-shadow,background-color] duration-[var(--dur-fast)] cursor-pointer ${
              selected
                ? dark
                  ? "border-2 border-gold-500 bg-brand-800 shadow-[var(--shadow-md)]"
                  : "border-2 border-gold-500 bg-gold-100/90 shadow-[var(--shadow-md)] ring-1 ring-gold-500/50"
                : dark
                  ? "border border-white/15 bg-brand-800/60 hover:border-gold-500/40"
                  : "border border-sand-200 bg-white hover:border-brand-100 hover:shadow-[var(--shadow-sm)]"
            }`}
          >
            {offer.badge ? (
              <span className="absolute -top-2.5 end-3 rounded-[var(--radius-pill)] bg-gold-500 px-2.5 py-0.5 text-xs font-bold text-brand-900 shadow-sm">
                {offer.badge}
              </span>
            ) : null}

            <div className="flex items-start gap-3">
              <span
                className={`mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  selected
                    ? "border-gold-500 bg-gold-500"
                    : dark
                      ? "border-gold-300/50"
                      : "border-sand-200"
                }`}
                aria-hidden
              >
                {selected ? (
                  <span className="size-1.5 rounded-full bg-brand-900" />
                ) : null}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-body font-bold ${
                    dark ? "text-ivory" : "text-brand-900"
                  }`}
                >
                  {offer.title}
                </p>
                <p
                  className={`mt-0.5 text-body-sm font-medium ${
                    dark ? "text-gold-200" : "text-muted"
                  }`}
                >
                  {offer.duration}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-sand-200/50 pt-3">
              <div className="flex items-baseline justify-between">
                <p
                  className={`text-h3 font-bold tabular-nums ${
                    dark ? "text-ivory" : "text-brand-900"
                  }`}
                >
                  <LTR>{offer.priceSar}</LTR> {ar.common.sar}
                </p>
                {save > 0 ? (
                  <span className="rounded bg-gold-500/20 px-1.5 py-0.5 text-xs font-bold text-gold-600">
                    وفر <LTR>{save}</LTR> ريال
                  </span>
                ) : null}
              </div>
              <p
                className={`mt-1 text-xs ${
                  dark ? "text-gold-300" : "text-muted"
                }`}
              >
                (<LTR>{perUnit}</LTR> {ar.common.sar} للقطعة)
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
