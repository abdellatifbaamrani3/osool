"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { ar } from "@/content/ar";
import { home } from "@/content/home";
import { getProduct, singlePriceSar } from "@/content/products";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";

const { quiz } = home;

const SERUM = "redensyl-biotin-hair-serum";
const DROPS = "iron-bisglycinate-drops";
const AMP = "pdrn-scalp-ampoule";

/**
 * Answer weights, not a lookup table: the second question can override a weak
 * first signal (heavy shedding after childbirth points at ferritin, the same
 * shedding with a family history points at the follicle).
 */
const WEIGHTS: Record<string, Partial<Record<string, number>>> = {
  gaps: { [SERUM]: 2 },
  shedding: { [SERUM]: 1, [DROPS]: 1 },
  scalp: { [AMP]: 2 },
  postpartum: { [DROPS]: 2 },
  gradual: { [SERUM]: 2 },
  cover: { [AMP]: 2 },
};

function recommend(a1: string, a2: string): string {
  const scores: Record<string, number> = { [SERUM]: 0, [DROPS]: 0, [AMP]: 0 };
  for (const answer of [a1, a2]) {
    for (const [slug, points] of Object.entries(WEIGHTS[answer] ?? {})) {
      scores[slug] += points ?? 0;
    }
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function OptionButton({
  label,
  selected,
  onClick,
  cta,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  cta: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      data-cta={cta}
      className={`flex min-h-14 w-full items-center gap-3 rounded-[var(--radius-md)] border p-4 text-start text-body transition-[background-color,border-color] duration-[var(--dur-fast)] ${
        selected
          ? "border-brand-600 bg-brand-50 font-medium text-brand-900"
          : "border-sand-200 bg-white text-ink-soft hover:border-brand-100"
      }`}
    >
      <span
        aria-hidden
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
          selected
            ? "border-brand-600 bg-brand-600 text-ivory"
            : "border-sand-200"
        }`}
      >
        {selected ? <Check className="size-3.5" /> : null}
      </span>
      {label}
    </button>
  );
}

export function QuickDiagnosis() {
  const [a1, setA1] = useState<string | null>(null);
  const [a2, setA2] = useState<string | null>(null);

  const answered = a1 !== null && a2 !== null;
  const product = answered ? getProduct(recommend(a1, a2)) : undefined;
  const step = a1 === null ? 1 : a2 === null ? 2 : 3;

  return (
    <section id="quiz" className="section-pad bg-sand-100">
      <Container>
        <SectionHeading eyebrow={quiz.eyebrow} title={quiz.title} sub={quiz.sub} />

        <div className="mx-auto mt-10 max-w-2xl rounded-[var(--radius-xl)] bg-white p-6 ring-1 ring-sand-200 md:p-8">
          <div className="flex items-center gap-2" aria-hidden>
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 flex-1 rounded-[var(--radius-pill)] ${
                  s <= step ? "bg-gold-500" : "bg-sand-200"
                }`}
              />
            ))}
          </div>

          <fieldset className="mt-6">
            <legend className="text-h3 text-brand-900">{quiz.q1.label}</legend>
            <div className="mt-4 space-y-3">
              {quiz.q1.options.map((o) => (
                <OptionButton
                  key={o.id}
                  label={o.label}
                  selected={a1 === o.id}
                  onClick={() => setA1(o.id)}
                  cta={`quiz-q1-${o.id}`}
                />
              ))}
            </div>
          </fieldset>

          {a1 !== null ? (
            <fieldset className="reveal mt-8 border-t border-sand-200 pt-8">
              <legend className="text-h3 text-brand-900">{quiz.q2.label}</legend>
              <div className="mt-4 space-y-3">
                {quiz.q2.options.map((o) => (
                  <OptionButton
                    key={o.id}
                    label={o.label}
                    selected={a2 === o.id}
                    onClick={() => setA2(o.id)}
                    cta={`quiz-q2-${o.id}`}
                  />
                ))}
              </div>
            </fieldset>
          ) : null}

          {product ? (
            <div
              className="reveal mt-8 rounded-[var(--radius-lg)] border border-gold-500/40 bg-gold-100 p-6"
              role="status"
            >
              <p className="text-label font-medium tracking-wide text-gold-600">
                {quiz.resultTitle}
              </p>
              <h3 className="mt-2 text-h2 text-brand-900">
                {product.shortName}
              </h3>
              <p className="mt-1 text-body text-ink-soft">{product.subtitle}</p>
              <p className="mt-3 text-body font-medium text-brand-900">
                {ar.common.from} <LTR>{singlePriceSar(product)}</LTR>{" "}
                {ar.common.sar}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href={`/products/${product.slug}`}
                  size="lg"
                  fullWidth
                  className="sm:w-auto"
                  data-cta={`quiz-result-${product.slug}`}
                >
                  {quiz.cta}
                </ButtonLink>
                <ButtonLink
                  href="/collection"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="sm:w-auto"
                  data-cta="quiz-result-bundle"
                >
                  {quiz.bundleLabel}
                </ButtonLink>
              </div>

              <p className="mt-5 text-body-sm text-muted">{quiz.resultNote}</p>

              <button
                type="button"
                onClick={() => {
                  setA1(null);
                  setA2(null);
                }}
                className="mt-4 inline-flex items-center gap-2 text-body-sm font-medium text-brand-700 hover:underline"
                data-cta="quiz-restart"
              >
                <RotateCcw className="size-4" aria-hidden />
                {quiz.restart}
              </button>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
