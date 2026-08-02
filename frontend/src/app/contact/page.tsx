import type { Metadata } from "next";
import { ar } from "@/content/ar";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: ar.nav.contact,
};

export default function ContactPage() {
  return (
    <section className="section-pad">
      <Container>
        <SectionHeading
          title="تواصل معنا"
          sub="نرد على واتساب خلال ساعة في أوقات العمل. للدعم قبل وبعد الطلب."
        />
        <div className="mx-auto mt-10 max-w-md text-center">
          <ButtonLink
            href={`https://wa.me/966500000000?text=${encodeURIComponent(ar.whatsapp.prefill)}`}
            size="xl"
            fullWidth
          >
            {ar.cta.whatsapp}
          </ButtonLink>
          <p className="mt-4 text-body-sm text-muted">
            بدّلي رقم واتساب في الإعدادات قبل الإطلاق.
          </p>
        </div>
      </Container>
    </section>
  );
}
