import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LTR } from "@/components/ui/LTR";

export const metadata: Metadata = {
  title: "سياسة الاستبدال والإرجاع",
  description: "سياسة الاستبدال والاسترجاع وضمان تجربة ٣٠ يوماً لدى متجر أصول في المملكة العربية السعودية.",
};

const sections = [
  {
    title: "١. ضمان تجربة ٣٠ يوماً",
    body: [
      "نحرص في «أصول» على أن تكون تجربتك معنا موثوقة ومريحة تماماً. لذلك نقدم ضمان تجربة حقيقي لمدة ٣٠ يوماً من تاريخ استلام طلبك.",
      "اطلب المنتج وجرّبه بنفسك؛ وإن لم تقتنع بالنتيجة أو لم يناسبك، يمكنك التواصل معنا خلال ٣٠ يوماً لطلب استرجاع المبلغ — حتى لو فُتحت العبوة واستُخدمت.",
    ],
  },
  {
    title: "٢. الحق النظامي للمستهلك",
    body: [
      "بالإضافة إلى ضمان تجربة أصول، يتمتع العميل بكافة حقوقه المنصوص عليها في نظام التجارة الإلكترونية ولائحته التنفيذية بالمملكة العربية السعودية فيما يخص استبدال أو استرجاع المنتجات المعيبة أو غير المطابقة للمواصفات.",
    ],
  },
  {
    title: "٣. ضوابط وشروط الإرجاع",
    body: [
      "أن يتم تقديم طلب الإرجاع أو الاستبدال خلال ٣٠ يوماً من تاريخ استلام الشحنة الفعلي.",
      "أن يكون المنتج تم شراؤه مباشرة عبر موقعنا الرسمي (osool.shop).",
      "تقديم رقم الطلب أو رقم الجوال المستخدم وقت الشراء للتحقق من بيانات الطلب.",
      "مراعاة الاستخدام الشخصي المعتاد والآمن للمستحضرات التجميلية وعدم تعرض العبوة لأي كسر أو تلف متعمد.",
    ],
  },
  {
    title: "٤. آلية تقديم الطلب",
    body: [
      "تواصل مع فريق خدمة العملاء عبر واتساب الرسمي أو عبر البريد الإلكتروني: contact@osool.shop مع تزويدنا برقم الطلب.",
      "يتولى فريقنا مراجعة الطلب وترتيب إجراءات الاسترجاع والتواصل معك بدون أي تعقيد أو تأخير.",
    ],
  },
  {
    title: "٥. استرداد المبالغ",
    body: [
      "بعد تأكيد طلب الإرجاع، تتم إعادة المبلغ المستحق عبر تحويل بنكي لحساب العميل البنكي داخل المملكة العربية السعودية.",
      "تستغرق عملية إيداع المبلغ بحسابك البنكي من ٣ إلى ٧ أيام عمل من تاريخ استكمال وتأكيد الإجراءات.",
    ],
  },
  {
    title: "٦. تكاليف الشحن عند الإرجاع",
    body: [
      "في حالات استلام منتج تالف أو وجود عيب مصنعي أو خطأ في إرسال المنتج، تتحمل «أصول» كامل تكاليف الشحن والإرجاع دون أي تكلفة إضافية على العميل.",
    ],
  },
];

export default function ReturnsPage() {
  return (
    <section className="section-pad bg-ivory">
      <Container>
        <SectionHeading
          align="start"
          title="ضمان التجربة والاسترجاع"
          sub="اطلب بكل اطمئنان: ضمان تجربة ٣٠ يوماً مع حق الإرجاع النظامي الكامل."
        />

        <div className="mx-auto mt-10 max-w-[42rem] space-y-6">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[var(--radius-lg)] bg-white p-6 ring-1 ring-sand-200"
            >
              <h2 className="text-h3 text-brand-900">{section.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {section.body.map((line) => (
                  <li key={line} className="text-body text-ink-soft">
                    {line}
                  </li>
                ))}
              </ul>
            </article>
          ))}

          <p className="pt-2 text-body-sm text-muted">
            لأي استفسار عن طلبك أو رغبة في الإرجاع، يسعدنا تواصلك معنا مباشرة عبر البريد:{" "}
            <a href="mailto:contact@osool.shop" className="text-brand-700 underline">
              <LTR>contact@osool.shop</LTR>
            </a>
            {" · "}
            <Link href="/shipping" className="text-brand-700 underline">
              سياسة التوصيل
            </Link>
            {" · "}
            <Link href="/terms" className="text-brand-700 underline">
              الشروط والأحكام
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
