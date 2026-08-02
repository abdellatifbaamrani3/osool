import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "الاستبدال والإرجاع",
};

export default function ReturnsPage() {
  return (
    <section className="section-pad">
      <Container>
        <SectionHeading
          title="ضمان تجربة ٣٠ يوم"
          sub="اطلب، جرّب، ولو ما اقتنعت تواصل معنا خلال ٣٠ يوم من الاستلام."
          align="start"
        />
        <div className="mx-auto mt-10 max-w-[38rem] space-y-4 text-body-lg text-ink-soft">
          <p>
            نبغى تكون مرتاح. لذلك عندك ضمان تجربة ٣٠ يوم حسب الشروط أدناه —
            بالإضافة لحقك النظامي في الإرجاع حسب نظام التجارة الإلكترونية.
          </p>
          <p>
            المنتجات المفتوحة من فئة المكملات الغذائية (التونك) قد تخضع لقيود
            صحية على الإرجاع — نوضحها بصراحة عند طلب الإرجاع.
          </p>
          <p>تواصل واتساب مع رقم الطلب، ونرتّب الباقي بدون لف ودوران.</p>
        </div>
      </Container>
    </section>
  );
}
