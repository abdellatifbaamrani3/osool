"use client";

import { useEffect, useState } from "react";
import { Banknote } from "lucide-react";
import { ar } from "@/content/ar";
import type { Offer, Product } from "@/content/products";
import { Button } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";
import { ProductImage } from "@/components/commerce/ProductImage";

export function StickyAddToCart({
  product,
  offer,
  onAdd,
}: {
  product: Product;
  offer: Offer;
  onAdd: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById("offer");
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const isNotVisible = !entry.isIntersecting;
        setVisible((prev) => (prev !== isNotVisible ? isNotVisible : prev));
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-white shadow-[0_-8px_25px_rgba(16,26,23,0.1)] transform-gpu transition-[transform,opacity] duration-200"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <div className="container-page flex h-[68px] items-center gap-3">
        <div className="hidden size-12 shrink-0 overflow-hidden rounded-[var(--radius-md)] ring-1 ring-sand-200 sm:block">
          <ProductImage
            product={product}
            ratio="1/1"
            className="rounded-none ring-0"
            sizes="48px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm font-bold text-brand-900">
            {product.shortName} <span className="font-normal text-muted">· {offer.title}</span>
          </p>
          <div className="flex items-center gap-2">
            <p className="text-body-sm font-bold tabular-nums text-brand-900">
              <LTR>{offer.priceSar}</LTR> {ar.common.sar}
            </p>
            <span className="hidden items-center gap-1 text-[11px] font-medium text-brand-600 sm:inline-flex">
              <Banknote className="size-3" /> الدفع عند الاستلام · ضمان ٣٠ يوم
            </span>
          </div>
        </div>
        <Button
          size="lg"
          onClick={onAdd}
          data-cta="pdp-sticky-atc"
          className="shrink-0 shadow-[0_4px_14px_rgba(20,72,60,0.25)] font-bold text-body-sm sm:text-body"
        >
          {ar.cta.addToCart} — <LTR>{offer.priceSar}</LTR> {ar.common.sar}
        </Button>
      </div>
    </div>
  );
}
