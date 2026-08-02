import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = { title: "الخصوصية" };

export default function PrivacyPage() {
  return (
    <section className="section-pad">
      <Container>
        <SectionHeading
          align="start"
          title="سياسة الخصوصية"
          sub="نجمع اسمك ورقم جوالك لتنفيذ الطلب وتأكيده وتوصيله فقط."
        />
        <p className="mx-auto mt-8 max-w-[38rem] text-body-lg text-ink-soft">
          لا نبيع بياناتك. النص القانوني الكامل يُستكمل قبل الإطلاق مع بيانات
          المنشأة والسجل التجاري.
        </p>
      </Container>
    </section>
  );
}
