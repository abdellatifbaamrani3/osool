import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { launch } from "@/content/launch";
import { ar } from "@/content/ar";
import { LAUNCH_SERUM_IMAGE } from "@/lib/snapSafe";
import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/layout/Container";
import { TrustStrip } from "@/components/commerce/TrustStrip";
import { LaunchBuyBox } from "@/components/commerce/LaunchBuyBox";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: launch.metaTitle,
  description: launch.metaDescription,
  robots: { index: false, follow: false },
  openGraph: {
    title: launch.metaTitle,
    description: launch.metaDescription,
    url: "https://osool.shop/launch",
    images: [{ url: LAUNCH_SERUM_IMAGE }],
  },
};

export default function LaunchPage() {
  return (
    <>
      <section className="section-pad bg-ivory pb-10">
        <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] bg-white ring-1 ring-sand-200 lg:max-w-none">
            <Image
              src={LAUNCH_SERUM_IMAGE}
              alt={launch.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-label font-medium tracking-wide text-gold-600">
              {launch.eyebrow}
            </p>
            <h1 className="mt-3 text-display text-brand-900">{launch.title}</h1>
            <p className="mt-4 max-w-[38rem] text-body-lg text-ink-soft">
              {launch.sub}
            </p>
            <ul className="mt-6 space-y-3">
              {launch.benefits.map((item) => (
                <li key={item} className="flex gap-3 text-body text-ink-soft">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-500"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <LaunchBuyBox />
            </div>
          </div>
        </Container>
      </section>

      <TrustStrip />

      <section className="section-pad bg-ivory">
        <Container>
          <SectionHeading title={launch.ingredientsTitle} />
          <ul className="mx-auto mt-10 max-w-3xl divide-y divide-sand-200 overflow-hidden rounded-[var(--radius-xl)] bg-white ring-1 ring-sand-200">
            {launch.ingredients.map((ing) => (
              <li
                key={ing.name}
                className="grid gap-1 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
              >
                <div>
                  <p className="text-body font-medium text-brand-900">
                    {ing.name}
                    <span className="ms-2 text-gold-600">{ing.conc}</span>
                  </p>
                  <p className="text-body-sm text-ink-soft">{ing.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="section-pad bg-brand-50">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading align="start" title={launch.howtoTitle} />
            <ol className="mt-8 space-y-4">
              {launch.howtoSteps.map((step, i) => (
                <li key={step} className="flex gap-4 text-body text-ink-soft">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-body-sm font-medium text-ivory">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SectionHeading align="start" title={launch.safetyTitle} />
            <ul className="mt-8 space-y-3">
              {launch.safety.map((item) => (
                <li key={item} className="text-body text-ink-soft">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="section-pad bg-ivory">
        <Container>
          <SectionHeading title={launch.faqTitle} />
          <div className="mx-auto mt-10 max-w-3xl">
            <Accordion items={[...launch.faq]} />
          </div>
          <p className="mx-auto mt-10 max-w-xl text-center text-body-sm text-muted">
            <Link href="/privacy" className="underline hover:text-brand-700">
              {ar.footer.privacy}
            </Link>
            {" · "}
            <Link href="/terms" className="underline hover:text-brand-700">
              {ar.footer.terms}
            </Link>
            {" · "}
            <Link href="/returns" className="underline hover:text-brand-700">
              {ar.footer.returns}
            </Link>
            {" · "}
            <Link href="/shipping" className="underline hover:text-brand-700">
              {ar.footer.shipping}
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
