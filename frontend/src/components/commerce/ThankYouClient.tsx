"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { ar } from "@/content/ar";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";

type Summary = {
  id: string;
  order_number: string;
  phone_masked?: string;
  phone_e164?: string;
  total_sar: number;
  items: {
    product_short_name_ar: string;
    offer_label_ar: string;
    line_total_sar: number;
  }[];
};

export function ThankYouClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Summary | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let fromCache: Summary | null = null;
      try {
        const cached = sessionStorage.getItem(`osool_order_${orderId}`);
        if (cached) {
          const parsed = JSON.parse(cached) as Summary;
          if (parsed?.id) {
            fromCache = {
              id: parsed.id,
              order_number: parsed.order_number,
              total_sar: parsed.total_sar,
              items: parsed.items ?? [],
              phone_masked: parsed.phone_masked,
              phone_e164: parsed.phone_e164,
            };
            if (!cancelled) setOrder(fromCache);
          }
        }
      } catch {
        /* ignore */
      }

      try {
        const res = await fetch(`/api/orders/${orderId}/summary`);
        if (res.ok) {
          const data = (await res.json()) as Summary;
          if (!cancelled) setOrder(data);
          return;
        }
      } catch {
        /* ignore */
      }

      if (!cancelled && !fromCache) setMissing(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9665XXXXXXXX";
  const waText = order
    ? `مرحباً، طلبي رقم ${order.order_number} — أفضّل التأكيد على واتساب`
    : ar.whatsapp.prefill;

  if (missing && !order) {
    return (
      <section className="section-pad">
        <Container className="max-w-lg text-center">
          <h1 className="text-h2 text-brand-900">ما لقينا الطلب</h1>
          <p className="mt-3 text-body text-ink-soft">
            لو أكملت الطلب قبل شوي، راجع واتساب أو ارجع للمتجر.
          </p>
          <ButtonLink href="/collection" className="mt-6">
            {ar.thankYou.backHome}
          </ButtonLink>
        </Container>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="section-pad">
        <Container className="max-w-lg text-center text-muted">…</Container>
      </section>
    );
  }

  return (
    <>
      <section className="bg-brand-50 py-16">
        <Container className="max-w-lg text-center">
          <CheckCircle2
            className="mx-auto size-14 text-brand-600"
            aria-hidden
          />
          <h1 className="mt-4 text-h1 text-brand-900">{ar.thankYou.title}</h1>
          <p className="mt-2 text-body-lg text-ink-soft">
            {ar.thankYou.orderNo} <LTR>#{order.order_number}</LTR>
          </p>
          {order.phone_masked ? (
            <p className="mt-2 text-body text-muted">
              {ar.thankYou.savedOn} <LTR>{order.phone_masked}</LTR>
            </p>
          ) : null}
        </Container>
      </section>

      <section className="section-pad">
        <Container className="max-w-lg">
          <h2 className="text-h2 text-brand-900">{ar.thankYou.nextTitle}</h2>
          <ol className="mt-8 space-y-5">
            {[
              {
                n: "١",
                title: ar.thankYou.step1Title,
                body: ar.thankYou.step1Body,
              },
              {
                n: "٢",
                title: ar.thankYou.step2Title,
                body: ar.thankYou.step2Body,
              },
              {
                n: "٣",
                title: ar.thankYou.step3Title,
                body: `${ar.thankYou.step3Body} — ${order.total_sar} ${ar.common.sar}`,
              },
            ].map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-500 font-[family-name:var(--font-aref)] text-brand-900">
                  {s.n}
                </span>
                <span>
                  <span className="block font-medium text-brand-900">
                    {s.title}
                  </span>
                  <span className="mt-1 block text-body text-ink-soft">
                    {s.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-[var(--radius-lg)] border border-urgent/20 bg-urgent-bg p-5">
            <h3 className="text-h3 text-brand-900">
              {ar.thankYou.saveNumberTitle}
            </h3>
            <p className="mt-2 text-body text-ink-soft">
              {ar.thankYou.saveNumberBody}
            </p>
            <ButtonLink
              href={`https://wa.me/${wa}?text=${encodeURIComponent(waText)}`}
              className="mt-4"
              fullWidth
            >
              {ar.thankYou.whatsappConfirm}
            </ButtonLink>
          </div>

          <div className="mt-8 rounded-[var(--radius-lg)] bg-white p-5 ring-1 ring-sand-200">
            <p className="text-body-sm font-medium text-brand-900">
              {ar.checkout.summary}
            </p>
            <ul className="mt-3 space-y-2">
              {order.items.map((item) => (
                <li
                  key={item.product_short_name_ar + item.offer_label_ar}
                  className="flex justify-between gap-3 text-body-sm text-ink-soft"
                >
                  <span>
                    {item.product_short_name_ar} · {item.offer_label_ar}
                  </span>
                  <span className="tabular-nums">
                    <LTR>{item.line_total_sar}</LTR>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-sand-200 pt-3 font-medium text-brand-900">
              <span>{ar.cart.total}</span>
              <span className="tabular-nums">
                <LTR>{order.total_sar}</LTR> {ar.common.sar}
              </span>
            </div>
          </div>

          <ButtonLink
            href="/collection"
            variant="secondary"
            className="mt-8"
            fullWidth
          >
            {ar.thankYou.backHome}
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
