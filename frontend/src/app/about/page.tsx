import type { Metadata } from "next";
import Image from "next/image";
import { Check, Clock } from "lucide-react";
import { home } from "@/content/home";
import { ar } from "@/content/ar";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "من نحن",
  description:
    "أصول — بيت سعودي للمكمّلات والعناية بالشعر يشتغل بمعايير صيدلية: مكوّنات مسمّاة، تراكيز مكتوبة، وشهادة تحليل عند الطلب.",
};

export default function AboutPage() {
  return (
    <>
      {/* Story */}
      <section className="section-pad bg-ivory">
        <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[var(--radius-lg)] bg-sand-100 ring-1 ring-sand-200 lg:max-w-none">
            <Image
              src={home.founder.imageSrc}
              alt={home.founder.imageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <SectionHeading
              align="start"
              eyebrow={home.founder.eyebrow}
              title={home.founder.title}
            />
            <div className="mt-6 max-w-[38rem] space-y-4 text-body-lg text-ink-soft">
              {home.founder.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* What "pharmacy-grade" means */}
      <section className="section-pad bg-brand-50">
        <Container>
          <SectionHeading
            eyebrow={home.standards.eyebrow}
            title={home.standards.title}
            sub={home.standards.intro}
          />

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] bg-white p-6 ring-1 ring-brand-100">
              <h3 className="text-h3 text-brand-900">
                {home.standards.have.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {home.standards.have.points.map((p) => (
                  <li key={p} className="flex gap-2 text-body text-ink-soft">
                    <Check
                      className="mt-0.5 size-5 shrink-0 text-brand-600"
                      aria-hidden
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[var(--radius-lg)] bg-white p-6 ring-1 ring-sand-200">
              <h3 className="text-h3 text-brand-900">
                {home.standards.building.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {home.standards.building.points.map((p) => (
                  <li key={p} className="flex gap-2 text-body text-muted">
                    <Clock
                      className="mt-0.5 size-5 shrink-0 text-gold-600"
                      aria-hidden
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-[42rem] rounded-[var(--radius-lg)] border border-gold-500/40 bg-gold-100 p-5 text-center text-body text-ink-soft">
            {home.standards.note}
          </p>
        </Container>
      </section>

      {/* Values / identity pillars */}
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

      {/* CTA */}
      <section className="bg-brand-900 py-20 lg:py-28">
        <Container className="text-center">
          <h2 className="text-h2 text-ivory">{ar.brand.tagline}</h2>
          <p className="mx-auto mt-4 max-w-lg text-body-lg text-gold-200">
            {ar.brand.campaign}
          </p>
          <ButtonLink
            href="/collection"
            variant="gold"
            size="xl"
            className="mt-8"
            data-cta="about-cta"
          >
            {ar.cta.seeProducts}
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
