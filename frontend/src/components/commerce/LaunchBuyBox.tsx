"use client";

import { useMemo, useState } from "react";
import { ar } from "@/content/ar";
import { getProduct } from "@/content/products";
import { LAUNCH_SERUM_IMAGE, LAUNCH_SERUM_SLUG } from "@/lib/snapSafe";
import { useCart } from "@/store/cart";
import { OfferSelector } from "@/components/commerce/OfferSelector";
import { StickyAddToCart } from "@/components/commerce/StickyAddToCart";
import { Button } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";

export function LaunchBuyBox() {
  const product = getProduct(LAUNCH_SERUM_SLUG);
  const addOffer = useCart((s) => s.addOffer);
  const [qty, setQty] = useState(
    () => product?.offers.find((o) => o.isDefault)?.qty ?? 1,
  );

  const offer = useMemo(
    () => product?.offers.find((o) => o.qty === qty) ?? product?.offers[0],
    [product, qty],
  );

  if (!product || !offer) return null;

  const selectedProduct = product;
  const selectedOffer = offer;
  const displayProduct = {
    ...selectedProduct,
    imageSrc: LAUNCH_SERUM_IMAGE,
    imageAlt: "زجاجة سيروم أصول",
  };

  function onAdd() {
    addOffer(selectedProduct, selectedOffer);
  }

  return (
    <>
      <div id="offer" className="rounded-[var(--radius-xl)] bg-white p-5 ring-1 ring-sand-200 md:p-6">
        <OfferSelector
          offers={product.offers}
          selectedQty={qty}
          onChange={setQty}
        />
        <Button
          size="xl"
          fullWidth
          className="mt-5 font-bold"
          onClick={onAdd}
          data-cta="launch-atc"
        >
          {ar.cta.addToCart} — <LTR>{offer.priceSar}</LTR> {ar.common.sar}
        </Button>
        <p className="mt-3 text-center text-body-sm text-muted">
          {ar.trust.cod.label} · {ar.trust.delivery.label} · الأسعار شاملة الضريبة
        </p>
      </div>
      <StickyAddToCart product={displayProduct} offer={offer} onAdd={onAdd} />
    </>
  );
}
