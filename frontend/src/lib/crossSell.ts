import { products, type Product } from "@/content/products";

const REASONS: Record<string, Partial<Record<string, string>>> = {
  "redensyl-biotin-hair-serum": {
    "iron-bisglycinate-drops":
      "السيروم يوقظ البصيلة — بس لو المخزون فاضي، النتيجة تكون أبطأ",
    "pdrn-scalp-ampoule":
      "السيروم يشتغل على البصيلة، والأمبولة ترمّم البيئة حولها. هذي الخطوة اللي تفرق.",
  },
  "iron-bisglycinate-drops": {
    "redensyl-biotin-hair-serum":
      "القطرات تعمّر المخزون من جوّه — والسيروم يشتغل على البصيلة من فوق",
    "pdrn-scalp-ampoule":
      "باقي خطوة: فروة مرتاحة عشان الجذور تثبت",
  },
  "pdrn-scalp-ampoule": {
    "redensyl-biotin-hair-serum":
      "رمّمت البيئة. الآن السيروم يشتغل على البصيلة نفسها",
    "iron-bisglycinate-drops":
      "باقي سبب واحد: المخزون من الداخل",
  },
};

/** Pairing priority from docs/08 §2. */
export function getCrossSellProducts(cartSlugs: string[]): {
  product: Product;
  reason: string;
}[] {
  const inCart = new Set(cartSlugs);
  const missing = products.filter((p) => !inCart.has(p.slug));
  if (missing.length === 0) return [];

  const order: string[] = [];
  const has = (slug: string) => inCart.has(slug);
  const serum = "redensyl-biotin-hair-serum";
  const drops = "iron-bisglycinate-drops";
  const amp = "pdrn-scalp-ampoule";

  if (has(serum) && !has(drops) && !has(amp)) order.push(drops, amp);
  else if (has(drops) && !has(serum) && !has(amp)) order.push(serum, amp);
  else if (has(amp) && !has(serum) && !has(drops)) order.push(serum, drops);
  else if (has(serum) && has(drops) && !has(amp)) order.push(amp);
  else if (has(serum) && has(amp) && !has(drops)) order.push(drops);
  else if (has(drops) && has(amp) && !has(serum)) order.push(serum);
  else order.push(...missing.map((m) => m.slug));

  const anchor = cartSlugs[0] ?? serum;

  return order
    .slice(0, 2)
    .map((slug) => {
      const product = products.find((p) => p.slug === slug);
      if (!product) return null;
      const reason =
        REASONS[anchor]?.[slug] ??
        REASONS[slug]?.[anchor] ??
        "كمّل النظام عشان تغطي الأسباب الثلاثة";
      return { product, reason };
    })
    .filter(Boolean) as { product: Product; reason: string }[];
}
