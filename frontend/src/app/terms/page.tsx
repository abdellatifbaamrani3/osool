import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = { title: "الشروط" };

export default function TermsPage() {
  return (
    <section className="section-pad">
      <Container>
        <SectionHeading
          align="start"
          title="الشروط والأحكام"
          sub="الدفع عند الاستلام · الأسعار شاملة الضريبة · التوصيل ٢–٤ أيام عمل."
        />
        <p className="mx-auto mt-8 max-w-[38rem] text-body-lg text-ink-soft">
          النسخة القانونية الكاملة تُضاف مع بيانات المنشأة قبل الإطلاق العام.
        </p>
      </Container>
    </section>
  );
}
