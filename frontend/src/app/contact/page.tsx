import type { Metadata } from "next";
import { ar } from "@/content/ar";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";

export const metadata: Metadata = {
  title: ar.nav.contact,
};

export default function ContactPage() {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966500000000";

  return (
    <section className="section-pad">
      <Container>
        <SectionHeading
          title="تواصل معنا"
          sub="نرد على واتساب خلال ساعة في أوقات العمل. للدعم قبل وبعد الطلب — أو راسلنا على الإيميل."
        />
        <div className="mx-auto mt-10 max-w-md text-center">
          <ButtonLink
            href={`https://wa.me/${wa}?text=${encodeURIComponent(ar.whatsapp.prefill)}`}
            size="xl"
            fullWidth
          >
            {ar.cta.whatsapp}
          </ButtonLink>
          <p className="mt-6 text-body-sm text-muted">{ar.footer.emailLabel}</p>
          <a
            href={`mailto:${ar.footer.email}`}
            className="mt-1 inline-block text-h3 text-brand-900 underline-offset-4 hover:underline"
          >
            <LTR>{ar.footer.email}</LTR>
          </a>
        </div>
      </Container>
    </section>
  );
}
