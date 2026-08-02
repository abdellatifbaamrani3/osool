import type { Metadata } from "next";
import { ar } from "@/content/ar";
import { products } from "@/content/products";
import { Container } from "@/components/layout/Container";
import { TrustStrip } from "@/components/commerce/TrustStrip";
import { ProductCard } from "@/components/commerce/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: ar.nav.collection,
  description:
    "ثلاث خطوات لعناية الفروة والجذور — سيروم، تونك، ومقشّر. اختار سببك أو ابدأ بالنظام الكامل.",
};

export default function CollectionPage() {
  return (
    <>
      <section className="section-pad bg-ivory pb-10">
        <Container>
          <SectionHeading
            eyebrow={ar.brand.descriptor}
            title="ثلاث خطوات. اختار اللي يشبه وضعك."
            sub="كل منتج يشتغل على سبب واحد. النظام الكامل يغطي الثلاثة."
          />
        </Container>
      </section>

      <TrustStrip />

      <section className="section-pad bg-ivory pt-10">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>

          <div className="mt-12 rounded-[var(--radius-xl)] bg-brand-900 px-6 py-10 text-center md:px-10">
            <h2 className="text-h2 text-ivory">ما تدري وش سببك؟</h2>
            <p className="mx-auto mt-3 max-w-lg text-body-lg text-gold-200">
              ابدأ بالنظام الكامل — سيروم + تونك + مقشّر. ضمان تجربة ٣٠ يوم ودفع
              عند الاستلام.
            </p>
            <ButtonLink
              href="/products/redensyl-copper-peptide-serum"
              variant="gold"
              size="xl"
              className="mt-6"
              data-cta="collection-start-serum"
            >
              ابدأ بالسيروم
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
