"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
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
import { ProductImage } from "@/components/commerce/ProductImage";
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
      <div className="border-b border-sand-200 bg-ivory">
        <Container className="py-3 text-body-sm text-muted">
          <Link href="/" className="hover:text-brand-700">
            {ar.nav.home}
          </Link>
          <span className="mx-2">/</span>
          <Link href="/collection" className="hover:text-brand-700">
            {ar.nav.collection}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-brand-900">{product.shortName}</span>
        </Container>
      </div>

      {/* Hero offer */}
      <section id="offer" className="section-pad bg-ivory pt-8 lg:pt-12">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="order-1 lg:order-2">
              <div className="relative">
                <ProductImage
                  product={product}
                  ratio="1/1"
                  className="mx-auto max-w-lg lg:max-w-none"
                  priority
                />
                <div className="absolute start-4 top-4">
                  <Badge>
                    {ar.common.causeOf} {causeNumerals[product.causeNumber]}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="order-2 lg:order-1">
              <p className="text-label font-medium tracking-wide text-gold-600">
                السبب {causeNumerals[product.causeNumber]} — {product.causeName}
              </p>
              <h1 className="mt-2 text-h1 text-balance text-brand-900">
                {product.name}
              </h1>
              <p className="mt-3 text-body-lg text-ink-soft">{product.subtitle}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Rating value={4.8} />
                <span className="inline-flex items-center gap-1 text-body-sm text-brand-600">
                  <Check className="size-4" aria-hidden />
                  {ar.common.verified}
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {product.benefits.map((b) => {
                  const [latin, rest] = splitLeadingLatin(b);
                  return (
                    <li key={b} className="flex gap-3 text-body text-ink-soft">
                      <Check
                        className="mt-0.5 size-5 shrink-0 text-gold-600"
                        aria-hidden
                      />
                      <span>
                        {latin ? (
                          <>
                            <LTR>{latin}</LTR>
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

              <div className="mt-8">
                <OfferSelector
                  offers={product.offers}
                  selectedQty={qty}
                  onChange={setQty}
                />
              </div>

              <p className="mt-4 text-body-sm text-muted">
                {ar.common.perDay} <LTR>{perDay}</LTR> {ar.common.perDaySuffix}
              </p>

              <Button
                size="xl"
                fullWidth
                className="mt-4"
                onClick={onAdd}
                data-cta="pdp-hero-atc"
              >
                {ar.cta.addToCart} — <LTR>{offer.priceSar}</LTR> {ar.common.sar}
              </Button>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-body-sm text-brand-700">
                <span>{ar.trust.cod.label}</span>
                <span>{ar.trust.delivery.label}</span>
                <span>{ar.trust.guarantee.label}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <TrustStrip />

      {/* Recognition */}
      <section className="section-pad bg-ivory">
        <Container>
          <SectionHeading title="لو هذا وضعك… هالصفحة لك" />
          <ul className="mx-auto mt-8 max-w-[38rem] space-y-4">
            {product.recognition.map((line) => (
              <li
                key={line}
                className="flex gap-3 text-body-lg text-ink-soft"
              >
                <Check
                  className="mt-1 size-5 shrink-0 text-gold-500"
                  aria-hidden
                />
                {line}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Causes with highlight */}
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
                  className={`rounded-[var(--radius-lg)] p-6 transition-opacity ${
                    active
                      ? "border-2 border-gold-500 bg-brand-800 opacity-100"
                      : "border border-gold-500/25 bg-brand-800/70 opacity-70 hover:opacity-100"
                  }`}
                >
                  {active ? (
                    <Badge className="mb-3">{ar.common.thisProduct}</Badge>
                  ) : null}
                  <p className="font-[family-name:var(--font-aref)] text-3xl text-gold-500">
                    {c.n}
                  </p>
                  <h3 className="mt-3 text-h3 text-ivory">{c.title}</h3>
                  <p className="mt-2 text-body-sm text-gold-200">{c.body}</p>
                </Link>
              );
            })}
          </div>
          <p className="mt-8 text-center text-body text-gold-300">
            <a href="#system" className="underline-offset-4 hover:underline">
              {ar.common.coverAll}
            </a>
          </p>
        </Container>
      </section>

      {/* Mechanism — split index 1: text start / image end */}
      <SplitSection
        id="mechanism"
        reverse={false}
        eyebrow="كيف يشتغل"
        title={product.mechanismTitle}
        imageLabel={`آلية · ${product.shortName}`}
      >
        <ol className="space-y-5">
          {product.mechanismSteps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-100 text-body-sm font-medium text-gold-600">
                {i + 1}
              </span>
              <span>
                <span className="block font-medium text-brand-900">
                  {s.title}
                </span>
                <span className="mt-1 block text-body text-ink-soft">
                  {s.body}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </SplitSection>

      {/* Ingredients */}
      <section id="ingredients" className="section-pad bg-sand-100">
        <Container>
          <SectionHeading
            eyebrow="المكوّنات"
            title="وش فيه بالضبط، وبأي تركيز"
            sub='كل مكوّن فعّال مكتوب بنسبته. ما فيه "خلاصات طبيعية" مجهولة.'
          />
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {product.ingredients.map((ing) => (
              <div
                key={ing.name}
                className="grid gap-2 rounded-[var(--radius-lg)] bg-white p-5 ring-1 ring-sand-200 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <p className="text-body font-medium text-brand-900">
                    <LTR>{ing.name}</LTR>
                  </p>
                  <p className="mt-1 text-body-sm text-ink-soft">{ing.role}</p>
                </div>
                <p className="text-h3 tabular-nums text-gold-600">
                  <LTR>{ing.conc}</LTR>
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Evidence */}
      <section id="evidence" className="section-pad bg-ivory">
        <Container>
          <SectionHeading
            eyebrow="بالدليل"
            title="الأرقام، ومن وين جت"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {product.evidence.map((e) => (
              <article
                key={e.number + e.claim}
                className="rounded-[var(--radius-lg)] bg-white p-6 ring-1 ring-sand-200"
              >
                <p className="font-[family-name:var(--font-aref)] text-3xl text-gold-600">
                  <LTR>{e.number}</LTR>
                </p>
                <p className="mt-3 text-body font-medium text-brand-900">
                  {e.claim}
                </p>
                <p className="mt-2 text-body-sm text-ink-soft">{e.source}</p>
                <p className="mt-4 rounded-[var(--radius-md)] border border-sand-200 bg-sand-100/60 p-3 text-body-sm text-muted">
                  {e.limit}
                </p>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-[38rem] text-center text-body-sm text-muted">
            {product.evidenceFooter}
          </p>
          {product.requiresSupplementWarnings ? (
            <div className="mx-auto mt-8 max-w-2xl rounded-[var(--radius-lg)] border border-gold-500/40 bg-gold-100 p-6">
              <p className="text-h3 text-brand-900">
                تبي تعرف وضعك بالضبط؟
              </p>
              <p className="mt-2 text-body text-ink-soft">
                اطلب تحليل فيريتين من أي مختبر. ما نبيعه — بس ننصح به بصدق.
              </p>
            </div>
          ) : null}

          {product.comparisonNote ? (
            <div className="mx-auto mt-8 max-w-2xl rounded-[var(--radius-lg)] bg-white p-6 ring-1 ring-sand-200">
              <p className="text-h3 text-brand-900">
                {product.comparisonTitle}
              </p>
              <p className="mt-3 text-body text-ink-soft">
                {product.comparisonNote}
              </p>
            </div>
          ) : null}
        </Container>
      </section>

      {/* Timeline */}
      <section id="timeline" className="section-pad bg-brand-50">
        <Container>
          <SectionHeading
            eyebrow="بصراحة"
            title="متى تشوف فرق؟ خلّينا نكون واضحين"
          />
          <ol className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-4">
            {product.timeline.map((t) => (
              <li
                key={t.when}
                className="rounded-[var(--radius-lg)] bg-white p-5 ring-1 ring-brand-100"
              >
                <p className="text-label font-medium text-gold-600">
                  <LTR>{t.when}</LTR>
                </p>
                <p className="mt-2 text-body-sm text-ink-soft">{t.what}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center text-body text-ink-soft">
            الاستمرارية هي كل شي. لهذا عرض الشهرين والثلاث شهور هو الأنسب.{" "}
            <a href="#offer" className="font-medium text-brand-700 underline">
              ارجع للعروض
            </a>
          </p>
        </Container>
      </section>

      {/* Reviews */}
      <section id="reviews" className="section-pad bg-ivory">
        <Container>
          <SectionHeading
            eyebrow={home.reviews.eyebrow}
            title={home.reviews.title}
            sub={home.reviews.note}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {home.reviews.items.slice(0, 6).map((r) => (
              <article
                key={r.name + r.week}
                className="rounded-[var(--radius-lg)] bg-white p-5 ring-1 ring-sand-200"
              >
                <Rating value={r.stars} size="sm" />
                <p className="mt-3 text-body text-ink-soft">{r.text}</p>
                <p className="mt-4 text-body-sm font-medium text-brand-900">
                  {r.name} · {r.city}
                </p>
                <p className="text-body-sm text-muted">{r.week}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Comparison */}
      <section id="comparison" className="section-pad bg-sand-100">
        <Container>
          <SectionHeading title="ليش أصول ومو الخيارات الثانية؟" />
          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-[var(--radius-lg)] bg-white ring-1 ring-sand-200">
            <div className="grid grid-cols-4 border-b border-sand-200 bg-brand-50 text-body-sm font-medium text-brand-900">
              <div className="p-3">المعيار</div>
              <div className="p-3 text-center">أصول</div>
              <div className="p-3 text-center">زيوت</div>
              <div className="p-3 text-center">فيتامينات عشوائية</div>
            </div>
            {[
              ["تركيز مكتوب", "✓", "—", "غالباً لا"],
              ["يوصل للسبب", "✓", "الشعرة فقط", "أحياناً"],
              ["دراسات على المكوّن", "✓", "—", "نادراً"],
              ["دفع عند الاستلام", "✓", "يختلف", "يختلف"],
              ["مدة واقعية معلنة", "✓", "وعود فورية", "وعود فورية"],
              ["نتيجة فورية", "لا", "لمعة فقط", "لا"],
            ].map((row) => (
              <div
                key={row[0]}
                className="grid grid-cols-4 border-b border-sand-200 text-body-sm last:border-0"
              >
                <div className="p-3 font-medium text-brand-900">{row[0]}</div>
                <div className="p-3 text-center text-brand-700">{row[1]}</div>
                <div className="p-3 text-center text-muted">{row[2]}</div>
                <div className="p-3 text-center text-muted">{row[3]}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How to use — split reverse */}
      <SplitSection
        id="howto"
        reverse
        eyebrow="طريقة الاستخدام"
        title={product.howtoTitle}
        imageLabel={`استخدام · ${product.shortName}`}
        className="bg-ivory"
      >
        <ol className="space-y-3">
          {product.howtoSteps.map((s, i) => (
            <li key={s} className="flex gap-3 text-body text-ink-soft">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-label text-ivory">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
        {product.howtoWarning ? (
          <div className="mt-6 rounded-[var(--radius-md)] bg-urgent-bg p-4 text-body-sm text-urgent">
            {product.howtoWarning}
          </div>
        ) : null}
      </SplitSection>

      {/* System cross-sell */}
      <section id="system" className="section-pad bg-brand-50">
        <Container>
          <SectionHeading
            eyebrow="النظام الكامل"
            title="غطّيت سبب واحد. باقي سببين."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {others.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Container>
      </section>

      {/* Safety */}
      <section id="safety" className="section-pad bg-ivory">
        <Container>
          <div className="mx-auto max-w-2xl rounded-[var(--radius-xl)] bg-brand-50 p-8 ring-1 ring-brand-100">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-6 text-brand-700" aria-hidden />
              <h2 className="text-h3 text-brand-900">الأمان والاستخدام</h2>
            </div>
            <ul className="mt-6 space-y-3">
              {product.safety.map((s) => (
                <li key={s} className="flex gap-3 text-body text-ink-soft">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-brand-600"
                    aria-hidden
                  />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Guarantee band */}
      <SplitSection
        id="guarantee"
        reverse={false}
        eyebrow={home.guarantee.eyebrow}
        title={home.guarantee.title}
        imageLabel={home.guarantee.imageLabel}
        className="bg-sand-100"
      >
        <p>{home.guarantee.body}</p>
        <ul className="mt-2 space-y-3">
          {home.guarantee.points.map((p) => (
            <li key={p} className="flex gap-3 text-body text-ink-soft">
              <Check
                className="mt-0.5 size-5 shrink-0 text-gold-600"
                aria-hidden
              />
              {p}
            </li>
          ))}
        </ul>
      </SplitSection>

      {/* FAQ */}
      <section id="faq" className="section-pad bg-ivory">
        <Container>
          <SectionHeading eyebrow="أسئلة" title="قبل ما تضيف للسلة" />
          <div className="mx-auto mt-10 max-w-2xl">
            <Accordion items={product.faq} />
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-900 py-20 lg:py-28">
        <Container className="text-center">
          <h2 className="text-h2 text-ivory">جاهز تبدأ من الأصل؟</h2>
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
            className="mt-8 min-w-[260px]"
            onClick={onAdd}
            data-cta="pdp-final-atc"
          >
            {ar.cta.addToCart} — <LTR>{offer.priceSar}</LTR> {ar.common.sar}
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
