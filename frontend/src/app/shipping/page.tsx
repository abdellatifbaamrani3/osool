import type { Metadata } from "next";
import Link from "next/link";
import { ar } from "@/content/ar";
import { shippingPolicy } from "@/content/shipping";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";

export const metadata: Metadata = {
  title: shippingPolicy.title,
  description:
    "سياسة توصيل أصول: لجميع مناطق السعودية خلال ٢–٤ أيام عمل، توصيل مجاني، تغليف مقفل، ودفع عند الاستلام.",
};

export default function ShippingPage() {
  return (
    <section className="section-pad">
      <Container>
        <SectionHeading
          align="start"
          title={shippingPolicy.title}
          sub={shippingPolicy.intro}
        />
        <p className="mt-4 text-body-sm text-muted">
          آخر تحديث: <LTR>{shippingPolicy.updated}</LTR>
        </p>

        <div className="mx-auto mt-10 max-w-[42rem] space-y-8">
          {shippingPolicy.sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[var(--radius-lg)] bg-white p-6 ring-1 ring-sand-200"
            >
              <h2 className="text-h3 text-brand-900">{section.title}</h2>
              <ul className="mt-4 space-y-3">
                {section.body.map((line) => (
                  <li key={line} className="text-body text-ink-soft">
                    {line}
                  </li>
                ))}
              </ul>
            </article>
          ))}

          <p className="text-body text-ink-soft">{shippingPolicy.contactNote}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact" size="lg">
              {ar.cta.whatsapp}
            </ButtonLink>
            <ButtonLink href="/returns" variant="secondary" size="lg">
              {ar.footer.returns}
            </ButtonLink>
          </div>

          <p className="text-body-sm text-muted">
            للإرجاع والاستبدال انظر{" "}
            <Link href="/returns" className="text-brand-700 underline">
              {ar.footer.returns}
            </Link>
            . للشروط العامة انظر{" "}
            <Link href="/terms" className="text-brand-700 underline">
              {ar.footer.terms}
            </Link>
            .
          </p>
        </div>
      </Container>
    </section>
  );
}
