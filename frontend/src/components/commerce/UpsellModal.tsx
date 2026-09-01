"use client";

import { useEffect, useRef, useState } from "react";
import { ar } from "@/content/ar";
import { getProduct } from "@/content/products";
import { UPSELL_HOLD_SECONDS, type UpsellOffer } from "@/lib/upsell";
import { Button } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { ProductImage } from "@/components/commerce/ProductImage";

type Props = {
  offer: UpsellOffer;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

export function UpsellModal({ offer, busy, onAccept, onDecline }: Props) {
  const acceptRef = useRef<HTMLButtonElement>(null);
  const finished = useRef(false);
  const onDeclineRef = useRef(onDecline);
  const onAcceptRef = useRef(onAccept);
  const [secondsLeft, setSecondsLeft] = useState(UPSELL_HOLD_SECONDS);
  onDeclineRef.current = onDecline;
  onAcceptRef.current = onAccept;

  useEffect(() => {
    acceptRef.current?.focus();
  }, []);

  useEffect(() => {
    if (busy) return;
    const started = Date.now();
    const tick = () => {
      if (finished.current) return;
      const left = Math.max(
        0,
        UPSELL_HOLD_SECONDS - Math.floor((Date.now() - started) / 1000),
      );
      setSecondsLeft(left);
      if (left <= 0) {
        finished.current = true;
        onDeclineRef.current();
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [busy]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy && !finished.current) {
        finished.current = true;
        onDeclineRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy]);

  const saved = offer.compare_at_sar - offer.price_sar;
  const progress = Math.min(100, (secondsLeft / UPSELL_HOLD_SECONDS) * 100);
  const product = getProduct(offer.slug);

  function accept() {
    if (busy || finished.current) return;
    finished.current = true;
    onAcceptRef.current();
  }

  function decline() {
    if (busy || finished.current) return;
    finished.current = true;
    onDeclineRef.current();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center lg:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(16,26,23,.6)]"
        aria-label={ar.upsell.decline}
        onClick={decline}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upsell-title"
        className="relative flex max-h-[100dvh] w-full max-w-[480px] flex-col overflow-y-auto rounded-t-[var(--radius-xl)] bg-ivory shadow-[var(--shadow-lg)] lg:max-h-[90dvh] lg:rounded-[var(--radius-xl)]"
      >
        <div className="px-5 pb-8 pt-6 sm:px-7">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-body-sm font-medium text-brand-800 ring-1 ring-brand-100">
            <span aria-hidden>✓</span>
            {ar.upsell.saved}
          </p>

          <p className="mt-4 text-body-sm font-medium text-gold-600">
            {ar.upsell.eyebrow}
          </p>
          <h2 id="upsell-title" className="mt-1 text-h2 text-brand-900">
            {ar.upsell.intro}
          </h2>

          <p className="mt-2 text-body text-ink-soft" aria-live="off">
            {ar.upsell.timer}{" "}
            <LTR className="font-medium text-brand-900">{secondsLeft}</LTR>{" "}
            {ar.upsell.seconds}
          </p>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-200"
            aria-hidden
          >
            <div
              className="h-full origin-right rounded-full bg-brand-600 transition-[width] duration-300 ease-linear motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mx-auto mt-5 max-w-[220px]">
            {product ? (
              <ProductImage product={product} ratio="1/1" sizes="220px" />
            ) : (
              <PlaceholderImage label={offer.short_name} ratio="1/1" />
            )}
          </div>

          <p className="mt-4 text-center text-h3 text-brand-900">
            {offer.short_name}
          </p>
          <p className="mt-1 text-center text-body-sm text-ink-soft">
            {ar.upsell.causeOf}: {offer.cause_name}
          </p>

          <div className="mt-3 flex items-baseline justify-center gap-2">
            <span className="text-h1 tabular-nums text-brand-900">
              <LTR>{offer.price_sar}</LTR>
            </span>
            <span className="text-body text-muted">{ar.common.sar}</span>
            <span className="text-body tabular-nums text-muted line-through">
              <LTR>{offer.compare_at_sar}</LTR>
            </span>
          </div>
          {saved > 0 ? (
            <p className="mt-1 text-center text-body-sm text-brand-700">
              {ar.upsell.savePrefix} <LTR>{saved}</LTR> {ar.common.sar}
            </p>
          ) : null}

          <p className="mx-auto mt-3 max-w-[36ch] text-center text-body text-ink-soft">
            {offer.reason}
          </p>

          <Button
            ref={acceptRef}
            type="button"
            size="xl"
            fullWidth
            className="mt-6"
            disabled={busy || secondsLeft <= 0}
            onClick={accept}
            data-cta="upsell-accept"
          >
            {busy ? (
              ar.upsell.accepting
            ) : (
              <>
                {ar.upsell.accept} <LTR>{offer.price_sar}</LTR> {ar.common.sar}
              </>
            )}
          </Button>

          <p className="mt-4 text-center text-body-sm text-muted">
            {ar.upsell.reassure}
          </p>
        </div>
      </div>
    </div>
  );
}
