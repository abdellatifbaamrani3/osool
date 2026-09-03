"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  Check,
  Package,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { ar } from "@/content/ar";
import { home } from "@/content/home";
import type { Product } from "@/content/products";
import { getOtherProducts } from "@/content/products";
import { Container } from "@/components/layout/Container";
import { TrustStrip } from "@/components/commerce/TrustStrip";
import { OfferSelector } from "@/components/commerce/OfferSelector";
import { StickyAddToCart } from "@/components/commerce/StickyAddToCart";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";
import { Rating } from "@/components/ui/Rating";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SplitSection } from "@/components/sections/SplitSection";
import { useCart } from "@/store/cart";

/**
 * Some benefit lines open with a Latin active (Redensyl, PDRN) before switching
 * to Arabic. Without isolation the bidi algorithm drags the trailing punctuation
 * to the wrong side of the name.
 */
function splitLeadingLatin(text: string): [string, string] {
  const firstArabic = text.search(/[\u0600-\u06FF]/);
  if (firstArabic <= 0 || !/^[A-Za-z]/.test(text)) return ["", text];
  const head = text.slice(0, firstArabic).replace(/[\s+\u2014\u2013-]+$/, "");
  return [head, text.slice(head.length)];
}

function PageImage({
  src,
  alt,
  ratio = "1/1",
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  ratio?: "1/1" | "4/5";
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-lg)] bg-white ring-1 ring-sand-200 ${
        ratio === "1/1" ? "aspect-square" : "aspect-[4/5]"
      } ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}

export function ProductPageClient({ product }: { product: Product }) {
  const addOffer = useCart((s) => s.addOffer);
  const isCartOpen = useCart((s) => s.isCartOpen);
  const defaultOffer =
    product.offers.find((o) => o.isDefault) ??
    product.offers[1] ??
    product.offers[0];
  const [qty, setQty] = useState(defaultOffer.qty);
  const offer = useMemo(
    () => product.offers.find((o) => o.qty === qty) ?? defaultOffer,
    [product.offers, qty, defaultOffer],
  );
  const others = getOtherProducts(product.slug);
  const perDay = Math.max(1, Math.round(offer.priceSar / (offer.qty * 30)));

  const onAdd = () => {
    addOffer(product, offer, 1);
  };

  const causeNumerals = ["", "①", "②", "③"] as const;

  return (
    <>
      {/* Breadcrumb Navigation */}
      <div className="border-b border-sand-200 bg-ivory">
        <Container className="py-2.5 text-body-sm text-muted">
          <Link href="/" className="transition-colors hover:text-brand-700">
            {ar.nav.home}
          </Link>
          <span className="mx-2">/</span>
          <Link href="/collection" className="transition-colors hover:text-brand-700">
            {ar.nav.collection}
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-brand-900">{product.shortName}</span>
        </Container>
      </div>

      {/* Hero Section — Optimized for Conversion & ICP Emotions */}
      <section id="offer" className="section-pad bg-ivory pt-6 lg:pt-10">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            
            {/* Product Gallery & Visual Anchors */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <PageImage
                  src={product.pageImages.hero.src}
                  alt={product.pageImages.hero.alt}
                  ratio="1/1"
                  className="mx-auto max-w-lg shadow-[var(--shadow-md)] lg:max-w-none"
                  priority
                />
                <div className="absolute start-4 top-4 flex flex-col gap-2">
                  <Badge className="bg-brand-900 text-ivory">
                    {ar.common.causeOf} {causeNumerals[product.causeNumber]} — {product.causeName}
                  </Badge>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-brand-900 shadow-xs">
                    <Sparkles className="size-3.5" aria-hidden />
                    معايير صيدلية معلنة
                  </span>
                </div>
              </div>

              {/* Instant Trust Strip below Image on Desktop */}
              <div className="mt-6 hidden grid-cols-3 gap-3 sm:grid">
                <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] bg-white p-3 ring-1 ring-sand-200">
                  <Truck className="size-5 shrink-0 text-brand-600" />
                  <div className="text-xs">
                    <p className="font-semibold text-brand-900">شحن سريع مجاني</p>
                    <p className="text-muted">٢ – ٤ أيام للسعودية</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] bg-white p-3 ring-1 ring-sand-200">
                  <Banknote className="size-5 shrink-0 text-brand-600" />
                  <div className="text-xs">
                    <p className="font-semibold text-brand-900">الدفع عند الاستلام</p>
                    <p className="text-muted">كاش عند باب البيت</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] bg-white p-3 ring-1 ring-sand-200">
                  <ShieldCheck className="size-5 shrink-0 text-brand-600" />
                  <div className="text-xs">
                    <p className="font-semibold text-brand-900">ضمان ذهبي ٣٠ يوم</p>
                    <p className="text-muted">استرجاع كامل المبلغ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Offer Callouts & Direct CTA */}
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
                  <Zap className="size-3.5 fill-gold-500 text-gold-500" />
                  شحن متوفر اليوم نقدياً عند الاستلام
                </span>
              </div>

              <h1 className="mt-3 text-h1 text-balance font-bold text-brand-900">
                {product.name}
              </h1>
              
              <p className="mt-2.5 text-body-lg font-medium text-brand-700">
                {product.subtitle} — <span className="text-ink-soft">{product.hook}</span>
              </p>

              {/* Verified Rating & Social Proof Anchor */}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Rating value={4.8} count={128} />
                <span className="inline-flex items-center gap-1 text-body-sm font-medium text-brand-600">
                  <Check className="size-4 stroke-[2.5]" aria-hidden />
                  تقييمات عملاء موثّقة
                </span>
              </div>

              {/* Key ICP Value Highlights */}
              <ul className="mt-6 space-y-3">
                {product.benefits.map((b) => {
                  const [latin, rest] = splitLeadingLatin(b);
                  return (
                    <li key={b} className="flex gap-3 text-body text-ink-soft">
                      <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-600">
                        <Check className="size-3.5 stroke-[3]" aria-hidden />
                      </div>
                      <span>
                        {latin ? (
                          <>
                            <LTR className="font-semibold text-brand-900">{latin}</LTR>
                            {rest}
                          </>
                        ) : (
                          b
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Offer Selector */}
              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-body-sm font-semibold text-brand-900">اختر باقة العرض المناسبة:</span>
                  <span className="text-xs text-muted">توصيل مجاني شامل الضريبة</span>
                </div>
                <OfferSelector
                  offers={product.offers}
                  selectedQty={qty}
                  onChange={setQty}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-body-sm">
                <span className="text-muted">
                  حسبة التكلفة: <LTR className="font-semibold text-brand-900">{perDay}</LTR> {ar.common.sar} فقط باليوم
                </span>
                <span className="font-medium text-gold-600">
                  {offer.qty > 1 ? `عرض المجموعات — توصيل مجاني` : `شحن مجاني`}
                </span>
              </div>

              {/* Primary Add To Cart Button */}
              <Button
                size="xl"
                fullWidth
                className="mt-5 shadow-[0_8px_24px_rgba(20,72,60,0.25)] transition-[box-shadow,background-color] hover:shadow-[0_12px_30px_rgba(20,72,60,0.35)]"
                onClick={onAdd}
                data-cta="pdp-hero-atc"
              >
                {ar.cta.addToCart} — <LTR>{offer.priceSar}</LTR> {ar.common.sar} (الدفع عند الاستلام)
              </Button>

              {/* Risk Reversal Guarantee Line */}
              <p className="mt-3 flex items-center justify-center gap-2 text-body-sm font-medium text-brand-700">
                <ShieldCheck className="size-4 shrink-0 text-gold-600" aria-hidden />
                {ar.trust.guarantee.sub}
              </p>

              {/* Mobile Quick Badges */}
              <div className="mt-4 grid grid-cols-3 gap-2 sm:hidden">
                <div className="flex flex-col items-center gap-1 rounded-[var(--radius-md)] bg-white p-2.5 text-center ring-1 ring-sand-200">
                  <Banknote className="size-4 text-brand-600" />
                  <span className="text-[11px] font-medium text-brand-900">{ar.trust.cod.label}</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-[var(--radius-md)] bg-white p-2.5 text-center ring-1 ring-sand-200">
                  <Truck className="size-4 text-brand-600" />
                  <span className="text-[11px] font-medium text-brand-900">شحن سريع مجاني</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-[var(--radius-md)] bg-white p-2.5 text-center ring-1 ring-sand-200">
                  <ShieldCheck className="size-4 text-brand-600" />
                  <span className="text-[11px] font-medium text-brand-900">ضمان ٣٠ يوم</span>
                </div>
              </div>

            </div>
          </div>
        </Container>
      </section>

      {/* Trust Strip */}
      <TrustStrip />

      {/* Problem -> Solution Paired Cards */}
      <section className="section-pad bg-ivory">
        <Container>
          <SectionHeading
            eyebrow="لو هذا وضعك… أنت في المكان الصح"
            title="فهمنا المشكلة من أصلها… وجبنا الحل العلمي"
            sub="بدون وعود وهمية أو خلطات مجهولة — خطوات واضحة ومكوّنات مكتوبة بالرقم."
          />
          <div className="mx-auto mt-10 grid max-w-5xl items-stretch gap-6 lg:grid-cols-2">
            
            {/* Problem Box */}
            <div className="flex flex-col justify-between rounded-[var(--radius-xl)] bg-urgent-bg/70 p-6 ring-1 ring-urgent/20 lg:p-8">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-urgent text-white text-xs font-bold">!</span>
                  <p className="text-label font-bold tracking-wide text-urgent">
                    المشكلة الواقعية اللي تعاني منها
                  </p>
                </div>
                <ul className="mt-5 space-y-4">
                  {product.recognition.map((line) => (
                    <li key={line} className="flex gap-3 text-body text-ink-soft">
                      <span
                        className="mt-2 size-2 shrink-0 rounded-full bg-urgent"
                        aria-hidden
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-6 text-body-sm font-medium text-urgent">
                شعور مقلق… والحل التقليدي ما جاب نتيجة لأن التركيز ما كان مكتوب.
              </p>
            </div>

            {/* Solution Box */}
            <div className="flex flex-col justify-between rounded-[var(--radius-xl)] bg-brand-50 p-6 ring-1 ring-brand-100 lg:p-8">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-brand-600 text-ivory text-xs font-bold">✓</span>
                  <p className="text-label font-bold tracking-wide text-brand-600">
                    حل أصول بمعايير صيدلية
                  </p>
                </div>
                <h3 className="mt-3 text-h3 font-bold text-brand-900">{product.hook}</h3>
                <ul className="mt-5 space-y-3">
                  {product.benefits.map((b) => {
                    const [latin, rest] = splitLeadingLatin(b);
                    return (
                      <li key={b} className="flex gap-3 text-body text-ink-soft">
                        <Check
                          className="mt-0.5 size-5 shrink-0 text-gold-600 stroke-[2.5]"
                          aria-hidden
                        />
                        <span>
                          {latin ? (
                            <>
                              <LTR className="font-semibold text-brand-900">{latin}</LTR>
                              {rest}
                            </>
                          ) : (
                            b
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <a
                href="#offer"
                className="mt-8 inline-flex items-center gap-2 text-body font-semibold text-brand-700 hover:text-brand-900"
              >
                <span>ابدأ رحلة الحل الآن</span>
                <span>←</span>
              </a>
            </div>

          </div>
        </Container>
      </section>

      {/* Mechanism Section */}
      <SplitSection
        id="mechanism"
        reverse={false}
        eyebrow="كيف يشتغل بالدقيقة"
        title={product.mechanismTitle}
        imageLabel={`آلية عمل · ${product.shortName}`}
        imageSrc={product.pageImages.mechanism.src}
        imageAlt={product.pageImages.mechanism.alt}
      >
        <ol className="space-y-6">
          {product.mechanismSteps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-500 font-bold text-brand-900 shadow-sm">
                {i + 1}
              </span>
              <div>
                <span className="block text-body font-bold text-brand-900">
                  {s.title}
                </span>
                <span className="mt-1 block text-body text-ink-soft leading-relaxed">
                  {s.body}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </SplitSection>

      {/* Science & Ingredients Breakdown */}
      <section id="ingredients" className="section-pad bg-sand-100">
        <Container>
          <SectionHeading
            eyebrow="المكوّنات الفعّالة"
            title="وش فيه بالضبط، وبأي تركيز بالرقم"
            sub='ما نكتب "خلاصات طبيعية" مبهمة. كل مادة مكتوبة باسمها العلمي الصريح ونسبتها المئوية.'
          />
          <div className="mx-auto mt-10 max-w-4xl grid gap-4 sm:grid-cols-2">
            {product.ingredients.map((ing) => (
              <div
                key={ing.name}
                className="flex flex-col justify-between rounded-[var(--radius-lg)] bg-white p-6 shadow-sm ring-1 ring-sand-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-body font-bold text-brand-900">
                      <LTR>{ing.name}</LTR>
                    </p>
                    <span className="rounded-full bg-gold-100 px-3 py-1 text-h3 font-bold tabular-nums text-gold-600">
                      <LTR>{ing.conc}</LTR>
                    </span>
                  </div>
                  <p className="mt-3 text-body-sm text-ink-soft leading-relaxed">{ing.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Clinical Evidence & Radical Honesty */}
      <section id="evidence" className="section-pad bg-ivory">
        <Container>
          <SectionHeading
            eyebrow="بالدليل العلمي"
            title="الأرقام من المورّد السريري… والحدود الصريحة"
            sub="نقول لك وين يبدأ الدليل ووين ينتهي. العلم قبل الإعلان."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {product.evidence.map((e) => (
              <article
                key={e.number + e.claim}
                className="flex flex-col justify-between rounded-[var(--radius-lg)] bg-white p-6 ring-1 ring-sand-200"
              >
                <div>
                  <p className="font-[family-name:var(--font-aref)] text-4xl font-bold text-gold-600">
                    <LTR>{e.number}</LTR>
                  </p>
                  <p className="mt-3 text-body font-bold text-brand-900 leading-snug">
                    {e.claim}
                  </p>
                  <p className="mt-2 text-body-sm text-ink-soft">{e.source}</p>
                </div>
                <p className="mt-5 rounded-[var(--radius-md)] border border-sand-200 bg-sand-100/70 p-3 text-xs text-muted">
                  💡 {e.limit}
                </p>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-[40rem] text-center text-body-sm text-muted">
            {product.evidenceFooter}
          </p>

          {product.requiresSupplementWarnings ? (
            <div className="mx-auto mt-8 max-w-2xl rounded-[var(--radius-lg)] border border-gold-500/40 bg-gold-100/80 p-6 text-center">
              <p className="text-h3 font-bold text-brand-900">
                نصيحة أصول الصريحة قبل الشراء:
              </p>
              <p className="mt-2 text-body text-ink-soft">
                اطلب تحليل فيريتين (مخزون الحديد) من أي مختبر. ما نبيعه ولا ناخذ عليه ريال — بس ننصح به بصدق لتعرف وضعك تماماً.
              </p>
            </div>
          ) : null}

          {product.comparisonNote ? (
            <div className="mx-auto mt-8 max-w-2xl rounded-[var(--radius-lg)] bg-white p-6 ring-1 ring-sand-200">
              <p className="text-h3 font-bold text-brand-900">
                {product.comparisonTitle}
              </p>
              <p className="mt-3 text-body text-ink-soft leading-relaxed">
                {product.comparisonNote}
              </p>
            </div>
          ) : null}
        </Container>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="section-pad bg-sand-100">
        <Container>
          <SectionHeading
            eyebrow="مقارنة صريحة"
            title="ليش أصول مو مثل الزيوت والفيتامينات العشوائية؟"
            sub="جدول يوضح الفرق بين المعايير الصيدلية والوعود الإعلانية."
          />
          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-[var(--radius-xl)] bg-white ring-1 ring-sand-200 shadow-sm">
            <div className="grid grid-cols-4 border-b border-sand-200 bg-brand-900 text-body-sm font-bold text-ivory">
              <div className="p-4">المعيار الأساسي</div>
              <div className="p-4 text-center text-gold-300">أصول 🌿</div>
              <div className="p-4 text-center">زيوت شائعة</div>
              <div className="p-4 text-center">حبوب عشوائية</div>
            </div>
            {[
              ["تراكيز مكتوبة بالرقم", "✓ مكتوبة صراحة", "— مجهولة", "غالباً لا"],
              ["يوصل لأصل السبب", "✓ يستهدف البصيلة والمخزون", "الشعرة فقط", "أحياناً"],
              ["دراسات على المواد", "✓ مثبتة علمياً", "— لا يوجد", "نادراً"],
              ["الدفع عند الاستلام", "✓ كاش للمندوب", "يختلف", "يختلف"],
              ["مدة واقعية للنتائج", "✓ معلنة بشفافية", "وعود فورية", "وعود فورية"],
              ["ضمان استرجاع ٣٠ يوم", "✓ ضمان ذهبي كامل", "لا يوجد", "لا يوجد"],
            ].map((row) => (
              <div
                key={row[0]}
                className="grid grid-cols-4 border-b border-sand-200 text-body-sm last:border-0 hover:bg-sand-100/40"
              >
                <div className="p-3.5 font-bold text-brand-900">{row[0]}</div>
                <div className="p-3.5 text-center font-bold text-brand-700 bg-brand-50/50">{row[1]}</div>
                <div className="p-3.5 text-center text-muted">{row[2]}</div>
                <div className="p-3.5 text-center text-muted">{row[3]}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Customer Reviews & Social Proof */}
      <section id="reviews" className="section-pad bg-ivory">
        <Container>
          <SectionHeading
            eyebrow={home.reviews.eyebrow}
            title={home.reviews.title}
            sub={home.reviews.note}
          />
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_1.4fr]">
            <div className="lg:sticky lg:top-28">
              <PageImage
                src={product.pageImages.testimonial.src}
                alt={product.pageImages.testimonial.alt}
                ratio="4/5"
                className="mx-auto w-full max-w-md shadow-md lg:max-w-none"
              />
              <div className="mt-4 rounded-[var(--radius-lg)] bg-brand-50 p-4 text-center ring-1 ring-brand-100">
                <Rating value={4.8} count={128} />
                <p className="mt-1.5 text-xs font-semibold text-brand-800">
                  تجارب حقيقية من عملاء بالمملكة العربية السعودية
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {home.reviews.items.slice(0, 6).map((r) => (
                <article
                  key={r.name + r.week}
                  className="flex flex-col justify-between rounded-[var(--radius-lg)] bg-white p-5 ring-1 ring-sand-200 shadow-sm"
                >
                  <div>
                    <Rating value={r.stars} size="sm" />
                    <p className="mt-3 text-body text-ink-soft leading-relaxed">«{r.text}»</p>
                  </div>
                  <div className="mt-4 border-t border-sand-200 pt-3">
                    <p className="text-body-sm font-bold text-brand-900">
                      {r.name} · {r.city}
                    </p>
                    <p className="text-xs text-muted">{r.week}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Journey Timeline */}
      <section id="timeline" className="section-pad bg-brand-50">
        <Container>
          <SectionHeading
            eyebrow="رحلتك المباشرة مع أصول"
            title="وش تتوقّع، أسبوع بأسبوع"
            sub="الاستمرارية اليومية هي السر — وهذه خريطة طريق النتيجة."
          />
          <ol className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-4">
            {product.timeline.map((t) => (
              <li
                key={t.when}
                className="flex flex-col justify-between rounded-[var(--radius-lg)] bg-white p-5 ring-1 ring-brand-100 shadow-sm"
              >
                <div>
                  <span className="inline-block rounded-full bg-gold-100 px-3 py-1 text-xs font-bold text-gold-600">
                    <LTR>{t.when}</LTR>
                  </span>
                  <p className="mt-3 text-body-sm text-ink-soft leading-relaxed">{t.what}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center text-body font-medium text-ink-soft">
            الاستمرارية هي كل شيء — لهذا باقة الشهرين والثلاثة أشهر هي الخيار الأوفر والأكثر طلباً.{" "}
            <a href="#offer" className="font-bold text-brand-700 underline underline-offset-4">
              اختر باقتك الآن
            </a>
          </p>
        </Container>
      </section>

      {/* How to Use Section */}
      <SplitSection
        id="howto"
        reverse
        eyebrow="طريقة الاستخدام بكل سهولة"
        title={product.howtoTitle}
        imageLabel={`طريقة استخدام · ${product.shortName}`}
        imageSrc={product.pageImages.howto.src}
        imageAlt={product.pageImages.howto.alt}
        className="bg-ivory"
      >
        <ol className="space-y-4">
          {product.howtoSteps.map((s, i) => (
            <li key={s} className="flex gap-3 text-body text-ink-soft">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-ivory">
                {i + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
        {product.howtoWarning ? (
          <div className="mt-6 rounded-[var(--radius-md)] bg-urgent-bg p-4 text-body-sm font-medium text-urgent border border-urgent/20">
            ⚠️ {product.howtoWarning}
          </div>
        ) : null}
      </SplitSection>

      {/* COD & Delivery Reassurance Strip */}
      <section className="section-pad bg-ivory">
        <Container>
          <div className="mx-auto max-w-3xl rounded-[var(--radius-xl)] bg-brand-50 p-8 ring-1 ring-brand-100 lg:p-10">
            <SectionHeading
              eyebrow="خطوات التسليم والدفع"
              title="طلبك يوصلك بكل سهولة وأمان"
            />
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: PhoneCall,
                  title: "١. اتصال تأكيد سريع",
                  body: "نتواصل معك هاتفياً (٩ص–٩م) لتأكيد العنوان بدقة قبل تجهيز الشحنة.",
                },
                {
                  icon: Banknote,
                  title: "٢. الدفع عند الاستلام",
                  body: "تدفع كاش للمندوب عند وصول الشحنة لباب بيتك — بدون أي مخاطرة أو بيانات بطاقة.",
                },
                {
                  icon: Package,
                  title: "٣. تغليف مقفل ومحايد",
                  body: "يوصلك الطلب بتغليف آمن ومحايد يضمن الخصوصية التامة 100%.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="text-center">
                  <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-white text-brand-700 shadow-sm ring-1 ring-brand-100">
                    <Icon className="size-5" aria-hidden strokeWidth={1.75} />
                  </span>
                  <p className="mt-3 text-body font-bold text-brand-900">
                    {title}
                  </p>
                  <p className="mt-1.5 text-body-sm text-ink-soft leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Causes & Cross-Sell Protocol */}
      <section id="causes" className="section-pad bg-brand-900">
        <Container>
          <SectionHeading
            eyebrow={home.causes.eyebrow}
            title={home.causes.title}
            sub={home.causes.sub}
            tone="dark"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {home.causes.items.map((c, index) => {
              const active = index + 1 === product.causeNumber;
              return (
                <Link
                  key={c.n}
                  href={`/products/${c.slug}`}
                  className={`rounded-[var(--radius-lg)] p-6 transition-[border-color,background-color,opacity,box-shadow] ${
                    active
                      ? "border-2 border-gold-500 bg-brand-800 opacity-100 shadow-md"
                      : "border border-gold-500/25 bg-brand-800/70 opacity-70 hover:opacity-100"
                  }`}
                >
                  {active ? (
                    <Badge className="mb-3 bg-gold-500 text-brand-900">{ar.common.thisProduct}</Badge>
                  ) : null}
                  <p className="font-[family-name:var(--font-aref)] text-3xl font-bold text-gold-500">
                    {c.n}
                  </p>
                  <h3 className="mt-3 text-h3 font-bold text-ivory">{c.title}</h3>
                  <p className="mt-2 text-body-sm text-gold-200 leading-relaxed">{c.body}</p>
                </Link>
              );
            })}
          </div>
          <p className="mt-8 text-center text-body text-gold-300">
            <a href="#system" className="font-semibold underline-offset-4 hover:underline">
              {ar.common.coverAll}
            </a>
          </p>
        </Container>
      </section>

      {/* System Protocol Cross-Sell */}
      <section id="system" className="section-pad bg-brand-50">
        <Container>
          <SectionHeading
            eyebrow="النظام الكامل"
            title="تبي تغطية شاملة للأسباب الثلاثة؟"
            sub="أكمل روتينك بالمنتجات المكملة للسببين الآخرين."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {others.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Container>
      </section>

      {/* Safety Info */}
      <section id="safety" className="section-pad bg-ivory">
        <Container>
          <div className="mx-auto max-w-2xl rounded-[var(--radius-xl)] bg-sand-100 p-8 ring-1 ring-sand-200">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-6 text-brand-700" aria-hidden />
              <h2 className="text-h3 font-bold text-brand-900">الأمان والاستخدام الموصى به</h2>
            </div>
            <ul className="mt-6 space-y-3">
              {product.safety.map((s) => (
                <li key={s} className="flex gap-3 text-body-sm text-ink-soft">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-brand-600 stroke-[2.5]"
                    aria-hidden
                  />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Guarantee Section */}
      <SplitSection
        id="guarantee"
        reverse={false}
        eyebrow={home.guarantee.eyebrow}
        title={home.guarantee.title}
        imageLabel={home.guarantee.imageLabel}
        className="bg-sand-100"
      >
        <p className="text-body-lg leading-relaxed">{home.guarantee.body}</p>
        <ul className="mt-4 space-y-3">
          {home.guarantee.points.map((p) => (
            <li key={p} className="flex gap-3 text-body text-ink-soft">
              <Check
                className="mt-0.5 size-5 shrink-0 text-gold-600 stroke-[2.5]"
                aria-hidden
              />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </SplitSection>

      {/* FAQ Accordion */}
      <section id="faq" className="section-pad bg-ivory">
        <Container>
          <SectionHeading eyebrow="أسئلة وأجوبة" title="كل ما يدور ببالك قبل إضافة المنتج للسلة" />
          <div className="mx-auto mt-10 max-w-3xl">
            <Accordion items={product.faq} />
          </div>
        </Container>
      </section>

      {/* Final High Impact CTA Section */}
      <section className="bg-brand-900 py-20 lg:py-28">
        <Container className="text-center">
          <Badge className="bg-gold-500 text-brand-900 mb-3">ضمان تجربة ذهبي ٣٠ يوم</Badge>
          <h2 className="text-h2 font-bold text-ivory">جاهز تبدأ رحلتك من الأصل؟</h2>
          <p className="mx-auto mt-4 max-w-lg text-body-lg text-gold-200">
            {ar.trust.guarantee.sub} · {ar.trust.cod.sub}
          </p>
          <div className="mx-auto mt-8 max-w-3xl">
            <OfferSelector
              offers={product.offers}
              selectedQty={qty}
              onChange={setQty}
              dark
            />
          </div>
          <Button
            variant="gold"
            size="xl"
            className="mt-8 min-w-[280px] shadow-[0_10px_30px_rgba(194,161,91,0.3)] hover:bg-gold-300"
            onClick={onAdd}
            data-cta="pdp-final-atc"
          >
            {ar.cta.addToCart} — <LTR>{offer.priceSar}</LTR> {ar.common.sar} (الدفع عند الاستلام)
          </Button>
          <p className="mt-5 text-body-sm text-gold-300">
            {home.finalCta.reassurance}
          </p>
        </Container>
      </section>

      <div className="pb-[88px] lg:pb-0" />
      {!isCartOpen ? (
        <StickyAddToCart product={product} offer={offer} onAdd={onAdd} />
      ) : null}
    </>
  );
}
