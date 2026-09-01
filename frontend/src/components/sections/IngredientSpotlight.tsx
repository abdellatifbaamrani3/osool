import Link from "next/link";
import { home } from "@/content/home";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LTR } from "@/components/ui/LTR";

const { spotlight } = home;

export function IngredientSpotlight() {
  return (
    <section id="ingredients" className="section-pad bg-brand-900">
      <Container>
        <SectionHeading
          eyebrow={spotlight.eyebrow}
          title={spotlight.title}
          sub={spotlight.sub}
          tone="dark"
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {spotlight.items.map((item) => (
            <Link
              key={item.active}
              href={`/products/${item.slug}`}
              className="group flex flex-col rounded-[var(--radius-lg)] border border-gold-500/25 bg-brand-800 p-6 transition-transform duration-[var(--dur-base)] hover:-translate-y-0.5"
              data-cta={`home-ingredient-${item.slug}`}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-aref)] text-3xl text-gold-500">
                  <LTR>{item.conc}</LTR>
                </span>
                <span className="text-label font-medium tracking-wide text-gold-300">
                  <LTR>{item.active}</LTR>
                </span>
              </div>

              <h3 className="mt-3 text-h3 text-ivory">{item.nameAr}</h3>
              <p className="mt-2 text-body-sm text-gold-200">{item.what}</p>

              <p className="mt-4 rounded-[var(--radius-md)] bg-brand-900/60 p-3 text-body-sm text-gold-200">
                {item.why}
              </p>

              <p className="mt-auto pt-5 text-body-sm font-medium text-gold-300">
                {item.inProduct} ←
              </p>
            </Link>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-[38rem] text-center text-body-sm text-gold-300">
          {spotlight.footer}
        </p>
      </Container>
    </section>
  );
}
