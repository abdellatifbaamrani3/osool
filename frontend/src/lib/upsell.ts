import { getProduct, singlePriceSar, type Product } from "@/content/products";

/**
 * Discount applied to the completion offer shown after checkout. Kept modest
 * on purpose: a deep post-purchase cut tells the customer the price they just
 * paid was never real, and it poisons every repeat purchase after it.
 */
export const UPSELL_DISCOUNT = 0.2;

/** How long the pre-confirm offer stays on screen before auto-continuing. */
export const UPSELL_HOLD_SECONDS = 14;

/**
 * Server-side validity window for accepting the offer. This exists to stop a
 * stale tab from mutating an order hours later — it is never surfaced as a
 * countdown in the UI.
 */
export const UPSELL_VALIDITY_MINUTES = 30;

const SERUM = "redensyl-biotin-hair-serum";
const DROPS = "iron-bisglycinate-drops";
const AMP = "pdrn-scalp-ampoule";

/** Why-this-one copy from docs/08 §3.1 */
const REASON: Record<string, string> = {
  [`${SERUM}|${AMP}`]:
    "السيروم يوقظ البصيلة، والأمبولة ترمّم البيئة حولها. هذي الخطوة اللي تفرق.",
  [`${DROPS}|${SERUM}`]:
    "القطرات تشتغل من جوّه. السيروم يشتغل على البصيلة. مع بعض أسرع.",
  [`${AMP}|${SERUM}`]: "رمّمت الفروة — الآن خلّي السيروم يشتغل على البصيلة.",
  [`${SERUM}+${DROPS}|${AMP}`]: "باقي خطوة واحدة عشان النظام يكتمل.",
  [`${SERUM}+${AMP}|${DROPS}`]: "باقي سبب واحد: المخزون من الداخل.",
  [`${DROPS}+${AMP}|${SERUM}`]: "باقي القطعة اللي تشتغل على البصيلة.",
  all: "علبة إضافية من السيروم — عشان ما تنقطع الاستمرارية.",
};

export type UpsellOffer = {
  slug: string;
  short_name: string;
  cause_name: string;
  reason: string;
  price_sar: number;
  compare_at_sar: number;
  discount_pct: number;
};

function has(slugs: Set<string>, slug: string) {
  return slugs.has(slug);
}

/** Offer price: the product's own single price less the completion discount. */
export function upsellPriceFor(product: Product): number {
  const full = singlePriceSar(product);
  return Math.round((full * (1 - UPSELL_DISCOUNT)) / 10) * 10 - 1;
}

/** Pick the highest-priority product not already in the order (docs/08 §3.1). */
export function pickUpsell(orderSlugs: string[]): UpsellOffer {
  const set = new Set(orderSlugs);
  let slug = AMP;
  let reasonKey = "";

  if (has(set, SERUM) && has(set, DROPS) && has(set, AMP)) {
    slug = SERUM;
    reasonKey = "all";
  } else if (has(set, SERUM) && !has(set, DROPS) && !has(set, AMP)) {
    slug = AMP;
    reasonKey = `${SERUM}|${AMP}`;
  } else if (has(set, DROPS) && !has(set, SERUM) && !has(set, AMP)) {
    slug = SERUM;
    reasonKey = `${DROPS}|${SERUM}`;
  } else if (has(set, AMP) && !has(set, SERUM) && !has(set, DROPS)) {
    slug = SERUM;
    reasonKey = `${AMP}|${SERUM}`;
  } else if (has(set, SERUM) && has(set, DROPS) && !has(set, AMP)) {
    slug = AMP;
    reasonKey = `${SERUM}+${DROPS}|${AMP}`;
  } else if (has(set, SERUM) && has(set, AMP) && !has(set, DROPS)) {
    slug = DROPS;
    reasonKey = `${SERUM}+${AMP}|${DROPS}`;
  } else if (has(set, DROPS) && has(set, AMP) && !has(set, SERUM)) {
    slug = SERUM;
    reasonKey = `${DROPS}+${AMP}|${SERUM}`;
  } else {
    slug = AMP;
    reasonKey = `${SERUM}|${AMP}`;
  }

  const product = getProduct(slug) as Product;
  const compareAt = singlePriceSar(product);
  const price = upsellPriceFor(product);
  return {
    slug: product.slug,
    short_name: product.shortName,
    cause_name: product.causeName,
    reason: REASON[reasonKey] ?? REASON.all,
    price_sar: price,
    compare_at_sar: compareAt,
    discount_pct: Math.round((1 - price / compareAt) * 100),
  };
}

export function upsellExpiresAt(from = new Date()): string {
  return new Date(
    from.getTime() + UPSELL_VALIDITY_MINUTES * 60 * 1000,
  ).toISOString();
}
