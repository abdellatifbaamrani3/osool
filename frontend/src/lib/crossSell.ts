import { products, type Product } from "@/content/products";

const REASONS: Record<string, Partial<Record<string, string>>> = {
  "redensyl-copper-peptide-serum": {
    "iron-bisglycinate-vitamin-c-tonic":
      "السيروم يوقظ البصيلة — بس لو المخزون فاضي، النتيجة تكون أبطأ",
    "salicylic-2-zinc-scalp-exfoliant":
      "فروة نظيفة تخلّي السيروم يوصل للبصيلة. هذي الخطوة اللي تفرق.",
  },
  "iron-bisglycinate-vitamin-c-tonic": {
    "redensyl-copper-peptide-serum":
      "التونك يعمّر المخزون من جوّه — والسيروم يشتغل على البصيلة من فوق",
    "salicylic-2-zinc-scalp-exfoliant":
      "باقي خطوة: فروة نظيفة عشان السيروم يوصل",
  },
  "salicylic-2-zinc-scalp-exfoliant": {
    "redensyl-copper-peptide-serum":
      "فتحت الطريق. الآن السيروم يوصل للبصيلة فعلياً",
    "iron-bisglycinate-vitamin-c-tonic":
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
  const serum = "redensyl-copper-peptide-serum";
  const tonic = "iron-bisglycinate-vitamin-c-tonic";
  const exf = "salicylic-2-zinc-scalp-exfoliant";

  if (has(serum) && !has(tonic) && !has(exf)) order.push(tonic, exf);
  else if (has(tonic) && !has(serum) && !has(exf)) order.push(serum, exf);
  else if (has(exf) && !has(serum) && !has(tonic)) order.push(serum, tonic);
  else if (has(serum) && has(tonic) && !has(exf)) order.push(exf);
  else if (has(serum) && has(exf) && !has(tonic)) order.push(tonic);
  else if (has(tonic) && has(exf) && !has(serum)) order.push(serum);
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
