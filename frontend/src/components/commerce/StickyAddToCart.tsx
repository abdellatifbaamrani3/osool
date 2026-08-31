"use client";

import { useEffect, useState } from "react";
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
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-white/95 shadow-[var(--shadow-lg)] backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="container-page flex h-[68px] items-center gap-3">
        <div className="hidden size-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] sm:block">
          <ProductImage
            product={product}
            ratio="1/1"
            className="rounded-none ring-0"
            sizes="48px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm font-medium text-brand-900">
            {product.shortName} · {offer.title}
          </p>
          <p className="text-body-sm text-muted">
            <LTR>{offer.priceSar}</LTR> {ar.common.sar}
          </p>
        </div>
        <Button
          size="lg"
          onClick={onAdd}
          data-cta="pdp-sticky-atc"
          className="shrink-0"
        >
          {ar.cta.addToCart} — <LTR>{offer.priceSar}</LTR>
        </Button>
      </div>
    </div>
  );
}
