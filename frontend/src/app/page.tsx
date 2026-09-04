import Image from "next/image";
import { Check } from "lucide-react";
import { ar } from "@/content/ar";
import { home } from "@/content/home";
import { products } from "@/content/products";
import { Container } from "@/components/layout/Container";
import { StickyMobileCta } from "@/components/layout/StickyMobileCta";
import { TrustStrip } from "@/components/commerce/TrustStrip";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";
import { Rating } from "@/components/ui/Rating";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SplitSection } from "@/components/sections/SplitSection";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { CredentialsStrip } from "@/components/sections/CredentialsStrip";
import { IngredientSpotlight } from "@/components/sections/IngredientSpotlight";
import { QuickDiagnosis } from "@/components/sections/QuickDiagnosis";

export default function HomePage() {
  return (
    <>
      {/* Hero — copy at start (right), image at end */}
      <section className="overflow-hidden bg-ivory">
        <Container className="grid items-center gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div className="order-2 lg:order-1">
            <p className="text-label font-medium tracking-wide text-gold-600">
              {home.hero.eyebrow}
            </p>
            <h1 className="mt-3 text-display text-balance text-brand-900">
              {home.hero.title}
            </h1>
            <p className="mt-5 max-w-[38rem] text-body-lg text-ink-soft">
              {home.hero.sub}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="#quiz"
                size="xl"
                fullWidth
                className="sm:w-auto"
                data-cta="home-hero-primary"
              >
                {home.hero.primaryCta}
              </ButtonLink>
              <ButtonLink
                href="/collection"
                variant="secondary"
                size="xl"
                fullWidth
                className="sm:w-auto"
                data-cta="home-hero-secondary"
              >
                {home.hero.secondaryCta}
              </ButtonLink>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
              {home.hero.proofChips.map((chip) => (
                <li
                  key={chip}
                  className="flex items-center gap-1.5 text-body-sm text-ink-soft"
                >
                  <Check className="size-4 shrink-0 text-brand-600" aria-hidden />
                  {chip}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-body-sm text-muted">{ar.brand.campaign}</p>
          </div>
          <div className="order-1 lg:order-2">
            <div
              className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-[var(--radius-xl)] bg-brand-50 ring-1 ring-brand-100 lg:max-w-none"
              aria-label={home.hero.imageLabel}
              role="img"
            >
              <Image
                src="/brand/home-hero.webp"
                alt={home.hero.imageLabel}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain"
              />
            </div>
          </div>
        </Container>
      </section>

      <TrustStrip />

      {/* Pharmacy-grade authority */}
      <CredentialsStrip />

      {/* Recognition */}
      <section className="section-pad bg-ivory">
        <Container>
          <SectionHeading title={home.recognition.title} />
          <ul className="mx-auto mt-8 max-w-[38rem] space-y-4">
            {home.recognition.lines.map((line) => (
              <li key={line} className="flex gap-3 text-body-lg text-ink-soft">
                <Check
                  className="mt-1 size-5 shrink-0 text-gold-500"
                  aria-hidden
                />
                {line}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-8 max-w-[38rem] text-center text-body-lg text-ink-soft">
            {home.recognition.close}
          </p>
        </Container>
      </section>

      {/* Emotional pain — split */}
      <SplitSection
        reverse={false}
        eyebrow={home.pain.eyebrow}
        title={home.pain.title}
        imageLabel={home.pain.imageLabel}
        imageSrc={home.pain.imageSrc}
        imageAlt={home.pain.imageAlt}
        className="bg-sand-100"
      >
        {home.pain.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </SplitSection>

      {/* Three causes */}
      <section id="causes" className="section-pad bg-brand-900">
        <Container>
          <SectionHeading
            eyebrow={home.causes.eyebrow}
            title={home.causes.title}
            sub={home.causes.sub}
            tone="dark"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {home.causes.items.map((c) => (
              <a
                key={c.n}
                href={`/products/${c.slug}`}
                className="rounded-[var(--radius-lg)] border border-gold-500/25 bg-brand-800 p-6 transition-transform hover:-translate-y-0.5"
                data-cta={`home-cause-${c.slug}`}
              >
                <p className="font-[family-name:var(--font-aref)] text-3xl text-gold-500">
                  {c.n}
                </p>
                <h3 className="mt-3 text-h3 text-ivory">{c.title}</h3>
                <p className="mt-2 text-body-sm text-gold-200">{c.body}</p>
                <p className="mt-5 text-body-sm font-medium text-gold-300">
                  {c.link} ←
                </p>
              </a>
            ))}
          </div>
          <p className="mt-8 text-center text-body text-gold-200">
            {home.causes.footer}
          </p>
        </Container>
      </section>

      {/* Interactive self-diagnosis */}
      <QuickDiagnosis />

      {/* Products */}
      <section id="products" className="section-pad bg-ivory">
        <Container>
          <SectionHeading
            eyebrow={home.products.eyebrow}
            title={home.products.title}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          <div className="mt-8 rounded-[var(--radius-xl)] bg-gold-100 p-6 text-center ring-1 ring-gold-300/50 md:p-8">
            <h3 className="text-h3 text-brand-900">
              {home.products.bundleTitle}
            </h3>
            <p className="mt-2 text-body text-ink-soft">
              {home.products.bundleBody}
            </p>
            <ButtonLink
              href="/collection"
              className="mt-5"
              data-cta="home-bundle"
            >
              {home.products.bundleCta}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Why failed — split text start */}
      <SplitSection
        reverse={false}
        eyebrow={home.failed.eyebrow}
        title={home.failed.title}
        imageLabel={home.failed.imageLabel}
        imageSrc={home.failed.imageSrc}
        imageAlt={home.failed.imageAlt}
        className="bg-sand-100"
      >
        <div className="space-y-4">
          {home.failed.rows.map((row) => (
            <div
              key={row.tried}
              className="rounded-[var(--radius-md)] bg-white p-4 ring-1 ring-sand-200"
            >
              <p className="text-body font-medium text-brand-900">
                {row.tried}
              </p>
              <p className="mt-1 text-body-sm text-ink-soft">{row.why}</p>
            </div>
          ))}
        </div>
      </SplitSection>

      {/* System — split reverse */}
      <SplitSection
        id="how"
        reverse
        eyebrow={home.system.eyebrow}
        title={home.system.title}
        imageLabel={home.system.imageLabel}
        imageSrc={home.system.imageSrc}
        imageAlt={home.system.imageAlt}
      >
        <ol className="space-y-5">
          {home.system.steps.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-body-sm font-medium text-brand-900">
                {s.n}
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
        <p className="rounded-[var(--radius-md)] bg-gold-100 p-4 text-body-sm text-ink-soft">
          {home.system.note}
        </p>
        <ButtonLink
          href="/collection"
          variant="secondary"
          className="mt-2"
          data-cta="home-system"
        >
          {home.system.cta}
        </ButtonLink>
      </SplitSection>

      {/* Named actives with written concentrations */}
      <IngredientSpotlight />

      {/* Honest category comparison */}
      <ComparisonTable />

      {/* Covered scalp — authority local insight */}
      <SplitSection
        reverse={false}
        eyebrow={home.coveredScalp.eyebrow}
        title={home.coveredScalp.title}
        imageLabel={home.coveredScalp.imageLabel}
        imageSrc={home.coveredScalp.imageSrc}
        imageAlt={home.coveredScalp.imageAlt}
        dark
      >
        <p>{home.coveredScalp.body}</p>
      </SplitSection>

      {/* Evidence & science */}
      <section id="proof" className="section-pad bg-sand-100">
        <Container>
          <SectionHeading
            eyebrow={home.proof.eyebrow}
            title={home.proof.title}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {home.proof.cards.map((card) => (
              <article
                key={card.active}
                className="rounded-[var(--radius-lg)] bg-white p-6 ring-1 ring-sand-200"
              >
                <p className="text-label font-medium text-gold-600">
                  <LTR>{card.active}</LTR>
                </p>
                <p className="mt-2 font-[family-name:var(--font-aref)] text-3xl text-gold-600">
                  <LTR>{card.number}</LTR>
                </p>
                <p className="mt-3 text-body font-medium text-brand-900">
                  {card.claim}
                </p>
                <p className="mt-2 text-body-sm text-ink-soft">{card.source}</p>
                <p className="mt-4 rounded-[var(--radius-md)] border border-sand-200 bg-sand-100/60 p-3 text-body-sm text-muted">
                  {card.limit}
                </p>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-[38rem] text-center text-body-sm text-muted">
            {home.proof.footer}
          </p>
          <div className="mx-auto mt-8 max-w-2xl rounded-[var(--radius-lg)] border border-gold-500/40 bg-gold-100 p-6 text-center">
            <p className="text-h3 text-brand-900">{home.proof.calloutTitle}</p>
            <p className="mt-2 text-body text-ink-soft">
              {home.proof.calloutBody}
            </p>
          </div>
        </Container>
      </section>

      {/* Authority pillars */}
      <section className="section-pad bg-ivory">
        <Container>
          <SectionHeading
            eyebrow={home.authority.eyebrow}
            title={home.authority.title}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {home.authority.points.map((p) => (
              <article
                key={p.title}
                className="rounded-[var(--radius-lg)] bg-brand-50 p-6 ring-1 ring-brand-100"
              >
                <h3 className="text-h3 text-brand-900">{p.title}</h3>
                <p className="mt-2 text-body text-ink-soft">{p.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Reviews / social proof */}
      <section id="reviews" className="section-pad bg-sand-100">
        <Container>
          <SectionHeading
            eyebrow={home.reviews.eyebrow}
            title={home.reviews.title}
            sub={home.reviews.note}
          />
          <div className="mt-6 flex justify-center">
            <Rating value={home.reviews.average} count={home.reviews.count} />
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {home.reviews.items.map((r) => (
              <article
                key={r.name + r.city}
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

      {/* Founder */}
      <SplitSection
        reverse={false}
        eyebrow={home.founder.eyebrow}
        title={home.founder.title}
        imageLabel={home.founder.imageLabel}
        imageSrc={home.founder.imageSrc}
        imageAlt={home.founder.imageAlt}
      >
        {home.founder.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <ButtonLink href="/about" variant="ghost" className="mt-2 px-0">
          {home.founder.cta} ←
        </ButtonLink>
      </SplitSection>

      {/* Expectations */}
      <section className="section-pad bg-ivory">
        <Container>
          <SectionHeading
            eyebrow={home.expectations.eyebrow}
            title={home.expectations.title}
          />
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] bg-brand-50 p-6 ring-1 ring-brand-100">
              <h3 className="text-h3 text-brand-900">
                {home.expectations.yesTitle}
              </h3>
              <ul className="mt-4 space-y-3">
                {home.expectations.yes.map((x) => (
                  <li key={x} className="flex gap-2 text-body text-ink-soft">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-brand-600"
                      aria-hidden
                    />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[var(--radius-lg)] bg-white p-6 ring-1 ring-sand-200">
              <h3 className="text-h3 text-brand-900">
                {home.expectations.noTitle}
              </h3>
              <ul className="mt-4 space-y-3">
                {home.expectations.no.map((x) => (
                  <li key={x} className="flex gap-2 text-body text-muted">
                    <span aria-hidden>—</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <ol className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row sm:justify-between">
            {home.expectations.timeline.map((t) => (
              <li
                key={t.when}
                className="flex-1 rounded-[var(--radius-md)] bg-sand-100 px-4 py-3 text-center"
              >
                <p className="text-label font-medium text-gold-600">
                  <LTR>{t.when}</LTR>
                </p>
                <p className="mt-1 text-body-sm text-ink-soft">{t.what}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 30-day guarantee */}
      <SplitSection
        id="guarantee"
        reverse
        eyebrow={home.guarantee.eyebrow}
        title={home.guarantee.title}
        imageLabel={home.guarantee.imageLabel}
        imageSrc={home.guarantee.imageSrc}
        imageAlt={home.guarantee.imageAlt}
        className="bg-sand-100"
      >
        <p>{home.guarantee.body}</p>
        <ul className="space-y-3">
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
          <SectionHeading eyebrow={home.faq.eyebrow} title={home.faq.title} />
          <div className="mx-auto mt-10 max-w-2xl">
            <Accordion items={[...home.faq.items]} />
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-900 py-20 lg:py-28">
        <Container className="text-center">
          <h2 className="text-h2 text-ivory">{home.finalCta.title}</h2>
          <p className="mx-auto mt-4 max-w-lg text-body-lg text-gold-200">
            {home.finalCta.sub}
          </p>
          <ButtonLink
            href="/collection"
            variant="gold"
            size="xl"
            className="mt-8"
            data-cta="home-final"
          >
            {home.finalCta.cta}
          </ButtonLink>
          <p className="mt-5 text-body-sm text-gold-300">
            {home.finalCta.reassurance}
          </p>
        </Container>
      </section>

      <StickyMobileCta
        href="#quiz"
        label={ar.cta.stickyHome}
        note={ar.cta.stickyHomeNote}
      />
    </>
  );
}
