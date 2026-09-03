"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Banknote,
  CheckCircle2,
  Clock,
  Download,
  Lock,
  MessageCircle,
  Package,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  Check,
} from "lucide-react";
import { ar } from "@/content/ar";
import { home } from "@/content/home";
import { getCrossSellProducts } from "@/lib/crossSell";
import { getProduct, type Product } from "@/content/products";
import { Container } from "@/components/layout/Container";
import { Button, ButtonLink } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";
import { Rating } from "@/components/ui/Rating";
import { upsellPriceFor } from "@/lib/upsell";

type SummaryItem = {
  product_short_name_ar: string;
  offer_label_ar: string;
  line_total_sar: number;
  bundles?: number;
  total_units?: number;
  slug?: string;
};

type Summary = {
  id: string;
  order_number: string;
  customer_name?: string;
  phone_masked?: string;
  phone_local?: string;
  phone_e164?: string;
  subtotal_sar?: number;
  shipping_sar?: number;
  total_sar: number;
  created_at?: string;
  items: SummaryItem[];
};

/** True when KSA local time is inside our 9am–9pm call window. */
function isWithinCallHours(): boolean {
  try {
    const hour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Riyadh",
        hour: "numeric",
        hour12: false,
      }).format(new Date()),
    );
    return hour >= 9 && hour < 21;
  } catch {
    return true;
  }
}

/** Downloads vCard contact file so user can save OSOOL Confirmation number with 1 tap. */
function downloadVCard(phoneDigits: string) {
  const cleanPhone = phoneDigits.replace(/[^\d+]/g, "");
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:أصول - تأكيد الطلبات",
    "ORG:متجر أصول OSOOL",
    `TEL;TYPE=CELL,VOICE:+${cleanPhone}`,
    "NOTE:رقم فريق تأكيد الطلبات والعنوان - متجر أصول",
    "END:VCARD",
  ].join("\n");

  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "osool-confirmation-team.vcf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ThankYouClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Summary | null>(null);
  const [missing, setMissing] = useState(false);
  const [withinHours, setWithinHours] = useState(true);
  const [vcardSaved, setVcardSaved] = useState(false);

  // Instant Add-to-Shipment state
  const [addingSlug, setAddingSlug] = useState<string | null>(null);
  const [upsellSuccessMsg, setUpsellSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setWithinHours(isWithinCallHours());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let fromCache: Summary | null = null;
      try {
        const cached = sessionStorage.getItem(`osool_order_${orderId}`);
        if (cached) {
          const parsed = JSON.parse(cached) as Summary;
          if (parsed?.id) {
            fromCache = parsed;
            if (!cancelled) setOrder(parsed);
          }
        }
      } catch {
        /* ignore */
      }

      try {
        const res = await fetch(`/api/orders/${orderId}/summary`);
        if (res.ok) {
          const data = (await res.json()) as Summary;
          if (!cancelled) {
            setOrder({
              ...fromCache,
              ...data,
              customer_name: data.customer_name ?? fromCache?.customer_name,
              phone_local: data.phone_local ?? fromCache?.phone_local,
              phone_masked: data.phone_masked ?? fromCache?.phone_masked,
              created_at: data.created_at ?? fromCache?.created_at,
            });
          }
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

  const crossSell = useMemo(() => {
    if (!order) return [];
    const orderSlugs = order.items
      .map((i) => i.slug)
      .filter((s): s is string => Boolean(s));
    return getCrossSellProducts(orderSlugs);
  }, [order]);

  const primaryProduct = useMemo(() => {
    const slug = order?.items.find((i) => i.slug)?.slug;
    return slug ? getProduct(slug) : undefined;
  }, [order]);

  async function handleAddUpsell(product: Product) {
    if (!order || addingSlug) return;
    setAddingSlug(product.slug);
    setUpsellSuccessMsg(null);

    try {
      const res = await fetch(`/api/orders/${order.id}/upsell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: product.slug }),
      });

      if (res.ok) {
        const updated = (await res.json()) as Summary;
        const newSummary: Summary = {
          ...order,
          ...updated,
          items: updated.items ?? order.items,
          total_sar: updated.total_sar ?? order.total_sar,
        };
        setOrder(newSummary);
        try {
          sessionStorage.setItem(
            `osool_order_${order.id}`,
            JSON.stringify(newSummary),
          );
        } catch {
          /* ignore */
        }
        setUpsellSuccessMsg(
          `تمت إضافة «${product.shortName}» لشحنتك بنجاح! 📦🎉`,
        );
      } else {
        // Fallback: WhatsApp prefilled add-on request
        const text = `مرحباً أصول، أود إضافة منتج «${product.shortName}» لشحنتي الحالية رقم ${order.order_number}`;
        window.open(
          `https://wa.me/${wa}?text=${encodeURIComponent(text)}`,
          "_blank",
        );
      }
    } catch {
      const text = `مرحباً أصول، أود إضافة منتج «${product.shortName}» لشحنتي الحالية رقم ${order.order_number}`;
      window.open(
        `https://wa.me/${wa}?text=${encodeURIComponent(text)}`,
        "_blank",
      );
    } finally {
      setAddingSlug(null);
    }
  }

  function handleSaveVCard() {
    downloadVCard(wa);
    setVcardSaved(true);
    setTimeout(() => setVcardSaved(false), 5000);
  }

  if (missing && !order) {
    return (
      <section className="section-pad">
        <Container className="max-w-lg text-center">
          <h1 className="text-h2 text-brand-900">ما لقينا الطلب</h1>
          <p className="mt-3 text-body text-ink-soft">
            لو أكملت الطلب قبل شوي، يمكنك التواصل معنا على الواتساب أو العودة للمتجر.
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
        <Container className="max-w-lg text-center text-muted">
          جاري تحميل بيانات طلبك…
        </Container>
      </section>
    );
  }

  const firstName = order.customer_name?.trim().split(/\s+/)[0] ?? "";
  const phoneDisplay = order.phone_local || order.phone_masked || "";
  const shipping = order.shipping_sar ?? 0;
  const subtotal = order.subtotal_sar ?? order.total_sar;

  const waConfirmText = `مرحباً فريق أصول، أود تأكيد طلبي رقم #${
    order.order_number
  }${
    order.customer_name ? ` باسم ${order.customer_name}` : ""
  } وتأكيد شحن العنوان فوراً.`;

  return (
    <>
      {/* ─── 1. HERO HEADER BANNER ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-900 py-12 text-center text-ivory sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15),transparent_70%)]" />
        <Container className="relative max-w-xl">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gold-500/20 ring-4 ring-gold-500/40">
            <CheckCircle2 className="size-10 text-gold-400" aria-hidden />
          </div>

          <h1 className="mt-4 text-h1 text-ivory">
            {firstName
              ? `${ar.thankYou.greetingPrefix} ${firstName}! تم استلام طلبك بنجاح 🎉`
              : ar.thankYou.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-body-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/10 px-3.5 py-1 text-gold-300 ring-1 ring-gold-500/30">
              {ar.thankYou.orderNo}: <LTR className="font-semibold text-gold-200">#{order.order_number}</LTR>
            </span>
            {phoneDisplay ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-ivory/90 ring-1 ring-white/20">
                <Phone className="size-3.5 text-gold-300" aria-hidden />
                <span>نتصل بك على: <LTR className="font-medium text-white">{phoneDisplay}</LTR></span>
              </span>
            ) : null}
          </div>

          <p className="mt-3 text-body-sm text-ivory/80">
            الدفع عند الاستلام (كاش للمندوب) · شحن آمن وتغليف محايد 100%
          </p>
        </Container>
      </section>

      {/* ─── 2. TIME-AWARE CONFIRMATION CALL BANNER (COD CALL ENGINE) ────── */}
      <section className="border-b border-gold-200 bg-gradient-to-b from-gold-50/70 to-sand-100 py-8">
        <Container className="max-w-2xl">
          <div className="overflow-hidden rounded-[var(--radius-lg)] border-2 border-gold-500/50 bg-white shadow-lg">
            {/* Header Status Ribbon */}
            <div
              className={`flex items-center justify-between px-5 py-2.5 text-body-xs font-semibold ${
                withinHours
                  ? "bg-emerald-950 text-emerald-200"
                  : "bg-brand-950 text-gold-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {withinHours ? (
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
                  </span>
                ) : (
                  <Clock className="size-3.5 text-gold-400" aria-hidden />
                )}
                <span>
                  {withinHours
                    ? ar.thankYou.bannerNowBadge
                    : ar.thankYou.bannerLaterBadge}
                </span>
              </div>
              <span className="text-ivory/70">أوقات الاتصال: 9am - 9pm</span>
            </div>

            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-200">
                  <Phone className="size-6 animate-pulse text-brand-700" aria-hidden strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-h3 text-brand-900">
                    {withinHours
                      ? ar.thankYou.bannerNowTitle
                      : ar.thankYou.bannerLaterTitle}
                  </h2>
                  <p className="mt-2 text-body leading-relaxed text-ink-soft">
                    {withinHours
                      ? ar.thankYou.bannerNowBody
                      : ar.thankYou.bannerLaterBody}
                  </p>
                </div>
              </div>

              {/* Call Reassurance Warning Box */}
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-gold-300 bg-gold-50/80 p-4 text-brand-950">
                <ShieldCheck className="size-6 shrink-0 text-gold-700" aria-hidden />
                <p className="text-body-sm font-medium leading-snug">
                  <strong className="text-brand-900">مهم للغايه:</strong> اتصالاتنا تظهر غالباً من رقم غير محفوّظ لديك. يرجى الرد فوراً لتأكيد العنوان حتى لا تتأخر الشحنة!
                </p>
              </div>


              {/* Action CTAs */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ButtonLink
                  href={`https://wa.me/${wa}?text=${encodeURIComponent(
                    waConfirmText,
                  )}`}
                  variant="primary"
                  fullWidth
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                >
                  <MessageCircle className="size-5 shrink-0" aria-hidden />
                  <span>{ar.thankYou.whatsappConfirm}</span>
                </ButtonLink>

                <Button
                  onClick={handleSaveVCard}
                  variant="secondary"
                  fullWidth
                  className="border-brand-300 text-brand-900 hover:bg-brand-50"
                >
                  {vcardSaved ? (
                    <>
                      <Check className="size-4 text-emerald-600" aria-hidden />
                      <span>تم حفظ الرقم ✓</span>
                    </>
                  ) : (
                    <>
                      <Download className="size-4 text-brand-700" aria-hidden />
                      <span>{ar.thankYou.saveNumberCta}</span>
                    </>
                  )}
                </Button>
              </div>

              {vcardSaved ? (
                <p className="mt-2 text-center text-body-xs font-medium text-emerald-700">
                  {ar.thankYou.saveNumberToast}
                </p>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 3. VISUAL 4-STEP ORDER JOURNEY TRACKER ─────────────────────── */}
      <section className="section-pad bg-white">
        <Container className="max-w-2xl">
          <div className="text-center">
            <p className="text-label font-medium tracking-wide text-gold-600">
              تتبع شحنتك
            </p>
            <h2 className="mt-1 text-h2 text-brand-900">
              {ar.thankYou.nextTitle}
            </h2>
          </div>

          <div className="mt-8 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-4 sm:gap-3">
            {[
              {
                step: "١",
                title: "تم استلام الطلب",
                sub: "مسجّل بنجاح ✓",
                icon: CheckCircle2,
                active: true,
                done: true,
              },
              {
                step: "٢",
                title: "اتصال التأكيد",
                sub: withinHours ? "جاري الاتصال الآن" : "الصباح 9:00am",
                icon: Phone,
                active: true,
                done: false,
              },
              {
                step: "٣",
                title: "التغليف المحايد",
                sub: "شحن آمن ومقفل",
                icon: Package,
                active: false,
                done: false,
              },
              {
                step: "٤",
                title: "التسليم والدفع",
                sub: "تدفع كاش للمندوب",
                icon: Truck,
                active: false,
                done: false,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className={`relative flex items-center gap-3 rounded-2xl p-4 ring-1 sm:flex-col sm:text-center ${
                    s.done
                      ? "bg-emerald-50/70 text-emerald-900 ring-emerald-200"
                      : s.active
                      ? "bg-gold-50/80 text-brand-950 ring-gold-300 font-medium shadow-sm"
                      : "bg-sand-50 text-ink-soft ring-sand-200"
                  }`}
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-bold sm:mx-auto ${
                      s.done
                        ? "bg-emerald-600 text-white"
                        : s.active
                        ? "bg-gold-500 text-brand-950"
                        : "bg-sand-200 text-muted"
                    }`}
                  >
                    {s.done ? (
                      <Check className="size-5" aria-hidden strokeWidth={2.5} />
                    ) : (
                      <Icon className="size-5" aria-hidden strokeWidth={2} />
                    )}
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-brand-900 sm:mt-1">
                      {s.title}
                    </p>
                    <p className="text-body-xs text-ink-soft">{s.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ─── 4. REDESIGNED ORDER & DELIVERY SUMMARY CARD ────────────────── */}
      <section className="section-pad bg-sand-100/60">
        <Container className="max-w-2xl">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-sand-200">
            {/* Summary Title */}
            <div className="flex items-center justify-between border-b border-sand-200 bg-sand-100/80 px-6 py-4">
              <h2 className="text-h3 text-brand-900">
                {ar.thankYou.summaryTitle}
              </h2>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-body-xs font-semibold text-brand-800 ring-1 ring-brand-200">
                طلب <LTR>#{order.order_number}</LTR>
              </span>
            </div>

            {/* Customer Details Block (Name, Phone, Address Confirmation) */}
            <div className="border-b border-sand-200 bg-emerald-50/40 p-6">
              <p className="text-body-xs font-bold uppercase tracking-wider text-emerald-800">
                {ar.thankYou.customerDetailsTitle}
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden />
                  <div>
                    <span className="block text-body-xs font-medium text-muted">
                      {ar.thankYou.customerNameLabel}
                    </span>
                    <span className="text-body font-semibold text-brand-900">
                      {order.customer_name || "المستلم"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden />
                  <div>
                    <span className="block text-body-xs font-medium text-muted">
                      {ar.thankYou.customerPhoneLabel}
                    </span>
                    <span className="text-body font-semibold tabular-nums text-brand-900">
                      <LTR>{phoneDisplay || "—"}</LTR>
                    </span>
                    <span className="mt-0.5 block text-body-xs font-medium text-emerald-700">
                      {ar.thankYou.customerPhoneNote}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Banknote className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden />
                  <div>
                    <span className="block text-body-xs font-medium text-muted">
                      {ar.thankYou.paymentMethodLabel}
                    </span>
                    <span className="text-body-sm font-semibold text-brand-900">
                      {ar.thankYou.paymentMethodValue}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden />
                  <div>
                    <span className="block text-body-xs font-medium text-muted">
                      {ar.thankYou.packagingLabel}
                    </span>
                    <span className="text-body-sm font-semibold text-brand-900">
                      {ar.thankYou.packagingValue}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items List (Spacious & Clean Layout) */}
            <div className="p-6">
              <p className="text-body-xs font-bold uppercase tracking-wider text-muted">
                محتويات الطلب
              </p>
              <ul className="mt-3 divide-y divide-sand-200">
                {order.items.map((item, idx) => {
                  const itemProduct = item.slug ? getProduct(item.slug) : undefined;
                  return (
                    <li
                      key={item.product_short_name_ar + idx}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      {itemProduct?.imageSrc ? (
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-sand-100 ring-1 ring-sand-200">
                          <Image
                            src={itemProduct.imageSrc}
                            alt={item.product_short_name_ar}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-200">
                          <Package className="size-7" aria-hidden />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-body font-bold text-brand-900">
                          {item.product_short_name_ar}
                        </p>
                        <p className="mt-0.5 text-body-sm text-ink-soft">
                          {item.offer_label_ar}
                        </p>
                        <span className="mt-1 inline-block rounded bg-sand-100 px-2 py-0.5 text-body-xs font-medium text-muted">
                          الكمية: {item.bundles || 1}
                        </span>
                      </div>

                      <div className="text-left shrink-0">
                        <p className="text-body-lg font-bold tabular-nums text-brand-900">
                          <LTR>{item.line_total_sar}</LTR> {ar.common.sar}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Financial Breakdown Box */}
            <div className="border-t border-sand-200 bg-sand-50 p-6 space-y-2.5 text-body-sm">
              <div className="flex justify-between text-ink-soft">
                <span>{ar.thankYou.subtotal}</span>
                <span className="tabular-nums font-medium text-brand-900">
                  <LTR>{subtotal}</LTR> {ar.common.sar}
                </span>
              </div>

              <div className="flex justify-between text-ink-soft">
                <span>{ar.thankYou.shipping}</span>
                <span className="font-semibold text-emerald-700">
                  {shipping > 0 ? (
                    <>
                      <LTR>{shipping}</LTR> {ar.common.sar}
                    </>
                  ) : (
                    ar.thankYou.free
                  )}
                </span>
              </div>

              <div className="flex justify-between text-ink-soft">
                <span>{ar.thankYou.codFee}</span>
                <span className="font-semibold text-emerald-700">مجاناً 🎁</span>
              </div>

              <div className="flex justify-between border-t border-sand-300 pt-3 text-body-lg font-bold text-brand-900">
                <span>{ar.thankYou.totalCodLabel}</span>
                <span className="tabular-nums text-emerald-800">
                  <LTR>{order.total_sar}</LTR> {ar.common.sar}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 5. RECOMMENDED PRODUCTS / 1-CLICK ADD-TO-SHIPMENT ─────────── */}
      {crossSell.length > 0 ? (
        <section className="section-pad bg-white">
          <Container className="max-w-4xl">
            {upsellSuccessMsg ? (
              <div className="mb-8 flex items-center gap-3 rounded-2xl bg-emerald-600 p-4 text-white shadow-lg animate-fadeIn">
                <CheckCircle2 className="size-6 shrink-0" aria-hidden />
                <p className="text-body font-bold">{upsellSuccessMsg}</p>
              </div>
            ) : null}

            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-body-xs font-semibold text-gold-800">
                <Sparkles className="size-3.5" aria-hidden />
                {ar.thankYou.crossTitle}
              </span>
              <h2 className="mt-2 text-h2 text-brand-900">
                أكمل روتينك بأفضل نتيجة وشحنة واحدة
              </h2>
              <p className="mt-2 text-body text-ink-soft">
                {ar.thankYou.crossBody}
              </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {crossSell.map(({ product, reason }) => {
                const addPrice = upsellPriceFor(product);
                const isLoading = addingSlug === product.slug;

                return (
                  <div
                    key={product.slug}
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-sand-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start gap-4">
                        {product.imageSrc ? (
                          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-sand-100 ring-1 ring-sand-200">
                            <Image
                              src={product.imageSrc}
                              alt={product.shortName}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        ) : null}
                        <div>
                          <span className="rounded bg-brand-50 px-2 py-0.5 text-body-xs font-semibold text-brand-800">
                            {product.causeName}
                          </span>
                          <h3 className="mt-1 text-h3 text-brand-900">
                            {product.shortName}
                          </h3>
                          <p className="mt-0.5 text-body-xs text-muted">
                            {product.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Scientific pairing reason */}
                      <div className="mt-4 rounded-xl bg-sand-50 p-3 text-body-sm text-ink-soft ring-1 ring-sand-200">
                        <strong className="text-brand-900">لماذا يحتاجه روتينك؟ </strong>
                        {reason}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-sand-200 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-body-xs text-muted block">سعر الإضافة مع الشحنة:</span>
                        <span className="text-h3 font-bold text-emerald-800 tabular-nums">
                          <LTR>{addPrice}</LTR> {ar.common.sar}
                        </span>
                      </div>

                      <Button
                        onClick={() => handleAddUpsell(product)}
                        disabled={Boolean(addingSlug)}
                        variant="primary"
                        className="bg-emerald-700 hover:bg-emerald-800 text-white"
                      >
                        {isLoading ? (
                          <span>جاري الإضافة…</span>
                        ) : (
                          <>
                            <Plus className="size-4" aria-hidden />
                            <span>{ar.thankYou.crossCta}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ─── 6. RESULTS EXPECTATIONS TIMELINE ──────────────────────────── */}
      {primaryProduct ? (
        <section className="section-pad bg-brand-50/60">
          <Container className="max-w-4xl">
            <div className="text-center max-w-xl mx-auto">
              <p className="text-label font-medium tracking-wide text-gold-600">
                {ar.thankYou.resultsEyebrow}
              </p>
              <h2 className="mt-1 text-h2 text-brand-900">
                {ar.thankYou.resultsTitle}
              </h2>
            </div>

            <ol className="mt-8 grid gap-4 md:grid-cols-4">
              {primaryProduct.timeline.map((t, index) => (
                <li
                  key={t.when}
                  className="rounded-2xl bg-white p-5 ring-1 ring-brand-100 shadow-sm"
                >
                  <span className="inline-block rounded-md bg-gold-100 px-2.5 py-0.5 text-body-xs font-bold text-gold-800">
                    مرحلة {index + 1}: <LTR>{t.when}</LTR>
                  </span>
                  <p className="mt-3 text-body-sm font-medium text-brand-900">{t.what}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-center text-body-sm text-ink-soft max-w-2xl mx-auto">
              {ar.thankYou.resultsNote}
            </p>
          </Container>
        </section>
      ) : null}

      {/* ─── 7. SOCIAL PROOF & GUARANTEES ───────────────────────────────── */}
      <section className="section-pad bg-white">
        <Container className="max-w-4xl">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Golden 30-Day Guarantee */}
            <div className="rounded-2xl border-2 border-gold-400 bg-gradient-to-b from-gold-50/50 to-white p-6 shadow-sm">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gold-500 text-brand-950 font-bold">
                <ShieldCheck className="size-7" aria-hidden />
              </div>
              <h3 className="mt-4 text-h3 text-brand-900">
                {ar.thankYou.guaranteeTitle}
              </h3>
              <p className="mt-2 text-body-sm leading-relaxed text-ink-soft">
                {ar.thankYou.guaranteeBody}
              </p>
            </div>

            {/* Packaging Privacy */}
            <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <Package className="size-6" aria-hidden />
              </div>
              <h3 className="mt-4 text-h3 text-brand-900">
                {ar.trust.discreet.label}
              </h3>
              <p className="mt-2 text-body-sm leading-relaxed text-ink-soft">
                {ar.trust.discreet.sub}
              </p>
            </div>

            {/* Instant Support */}
            <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <MessageCircle className="size-6" aria-hidden />
              </div>
              <h3 className="mt-4 text-h3 text-brand-900">
                {ar.thankYou.supportTitle}
              </h3>
              <p className="mt-2 text-body-sm leading-relaxed text-ink-soft">
                {ar.thankYou.supportBody}
              </p>
              <a
                href={`https://wa.me/${wa}?text=${encodeURIComponent(waConfirmText)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-body-sm font-semibold text-emerald-700 hover:underline"
              >
                <span>تواصل مع الدعم الفوري</span>
                <MessageCircle className="size-4" aria-hidden />
              </a>
            </div>
          </div>

          {/* Social Proof Reviews */}
          <div className="mt-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-label font-medium tracking-wide text-gold-600">
                  {ar.thankYou.socialEyebrow}
                </p>
                <h2 className="mt-1 text-h2 text-brand-900">
                  {ar.thankYou.socialTitle}
                </h2>
              </div>
              <Rating value={4.8} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {home.reviews.items.slice(0, 3).map((r) => (
                <article
                  key={r.name + r.week}
                  className="rounded-2xl bg-sand-50/70 p-5 ring-1 ring-sand-200"
                >
                  <Rating value={r.stars} size="sm" />
                  <p className="mt-3 text-body-sm leading-relaxed text-ink-soft">
                    &ldquo;{r.text}&rdquo;
                  </p>
                  <p className="mt-4 text-body-xs font-semibold text-brand-900">
                    {r.name} · {r.city}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <ButtonLink
              href="/collection"
              variant="secondary"
              className="px-8 py-3"
            >
              {ar.thankYou.backHome}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
