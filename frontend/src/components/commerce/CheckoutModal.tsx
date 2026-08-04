"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { ar } from "@/content/ar";
import {
  formatPhoneDisplay,
  isValidSaudiMobile,
  maskPhoneLocal,
  normalizeSaudiMobile,
  phoneError,
  validateName,
} from "@/lib/phone";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { LTR } from "@/components/ui/LTR";

export function CheckoutModal() {
  const router = useRouter();
  const {
    lines,
    isCheckoutOpen,
    closeCheckout,
    totalSar,
    clear,
  } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const openedAt = useMemo(() => Date.now(), [isCheckoutOpen]);

  useEffect(() => {
    if (!isCheckoutOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCheckout();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCheckoutOpen, closeCheckout]);

  if (!isCheckoutOpen) return null;

  const total = totalSar();
  const nameErr = validateName(name);
  const phoneDigitsOk = isValidSaudiMobile(phone);
  const phoneErrMsg = phoneError(phone);
  const canSubmit = !nameErr && phoneDigitsOk && lines.length > 0 && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameTouched(true);
    setPhoneTouched(true);
    setFormError(null);

    if (nameErr || !phoneDigitsOk || lines.length === 0) return;

    setSubmitting(true);
    try {
      const eventId = crypto.randomUUID();
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": eventId,
        },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          lines: lines.map((l) => ({
            slug: l.slug,
            offer_qty: l.offerQty,
            bundles: l.bundles,
          })),
          honeypot,
          event_id: eventId,
          client_ts: new Date(openedAt).toISOString(),
        }),
        signal: AbortSignal.timeout(20000),
      });

      const data = (await res.json()) as {
        id?: string;
        message_ar?: string;
      };

      if (!res.ok || !data.id) {
        setFormError(data.message_ar ?? ar.checkout.errorGeneric);
        return;
      }

      try {
        const national = normalizeSaudiMobile(phone);
        sessionStorage.setItem(
          `osool_order_${data.id}`,
          JSON.stringify({
            ...data,
            phone_masked: national ? maskPhoneLocal(national) : undefined,
          }),
        );
      } catch {
        /* ignore */
      }

      clear();
      router.push(`/thank-you/${data.id}`);
    } catch {
      setFormError(ar.checkout.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center lg:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(16,26,23,.55)]"
        aria-label={ar.common.close}
        onClick={closeCheckout}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className="relative flex max-h-[100dvh] w-full max-w-[480px] flex-col overflow-y-auto rounded-t-[var(--radius-xl)] bg-ivory shadow-[var(--shadow-lg)] lg:max-h-[90dvh] lg:rounded-[var(--radius-xl)]"
      >
        <button
          type="button"
          className="absolute end-3 top-3 z-10 inline-flex size-11 items-center justify-center rounded-[var(--radius-md)] text-brand-800 hover:bg-brand-50"
          aria-label={ar.common.close}
          onClick={closeCheckout}
        >
          <X className="size-5" aria-hidden />
        </button>

        <form onSubmit={onSubmit} className="px-5 pb-8 pt-6 sm:px-7">
          <h2
            id="checkout-title"
            className="pe-10 text-h2 text-brand-900"
          >
            {ar.checkout.title}
          </h2>
          <p className="mt-2 text-body text-ink-soft">{ar.checkout.sub}</p>

          <div className="mt-6 rounded-[var(--radius-lg)] bg-white p-4 ring-1 ring-sand-200">
            <p className="text-body-sm font-medium text-brand-900">
              {ar.checkout.summary}
            </p>
            <ul className="mt-3 space-y-2">
              {lines.map((l) => (
                <li
                  key={l.key}
                  className="flex items-start justify-between gap-3 text-body-sm text-ink-soft"
                >
                  <span>
                    {l.shortName} · {l.offerTitle}
                    {l.bundles > 1 ? (
                      <>
                        {" "}
                        × <LTR>{l.bundles}</LTR>
                      </>
                    ) : null}
                  </span>
                  <span className="shrink-0 tabular-nums text-brand-900">
                    <LTR>{l.unitPriceSar * l.bundles}</LTR>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-sand-200 pt-3 text-body-sm">
              <div className="flex justify-between text-ink-soft">
                <span>{ar.checkout.shipping}</span>
                <span>{ar.checkout.free}</span>
              </div>
              <div className="mt-1 flex justify-between font-medium text-brand-900">
                <span>{ar.cart.total}</span>
                <span className="tabular-nums">
                  <LTR>{total}</LTR> {ar.common.sar}
                </span>
              </div>
              <p className="mt-1 text-muted">{ar.footer.vat}</p>
            </div>
          </div>

          {/* honeypot */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="absolute start-[-9999px] h-0 w-0 opacity-0"
            aria-hidden
          />

          <div className="mt-5">
            <label
              htmlFor="co-name"
              className="mb-1.5 block text-body-sm font-medium text-brand-900"
            >
              {ar.checkout.nameLabel}
            </label>
            <input
              id="co-name"
              type="text"
              autoComplete="name"
              dir="rtl"
              placeholder={ar.checkout.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              className={`h-[52px] w-full rounded-[var(--radius-md)] border bg-white px-4 text-base text-ink outline-none focus:border-brand-600 ${
                nameTouched && nameErr
                  ? "border-urgent"
                  : "border-sand-200"
              }`}
            />
            {nameTouched && nameErr ? (
              <p className="mt-1 text-body-sm text-urgent" role="alert">
                {nameErr}
              </p>
            ) : null}
          </div>

          <div className="mt-4">
            <label
              htmlFor="co-phone"
              className="mb-1.5 block text-body-sm font-medium text-brand-900"
            >
              {ar.checkout.phoneLabel}
            </label>
            <div className="relative">
              <input
                id="co-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                dir="ltr"
                placeholder={ar.checkout.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(formatPhoneDisplay(e.target.value))}
                onBlur={() => setPhoneTouched(true)}
                className={`h-[52px] w-full rounded-[var(--radius-md)] border bg-white px-4 text-base text-ink outline-none focus:border-brand-600 ${
                  phoneTouched && phoneErrMsg && !phoneDigitsOk
                    ? "border-urgent"
                    : phoneDigitsOk
                      ? "border-brand-600"
                      : "border-sand-200"
                }`}
                style={{ textAlign: "right" }}
              />
              {phoneDigitsOk ? (
                <Check
                  className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 text-brand-600"
                  aria-hidden
                />
              ) : null}
            </div>
            <p className="mt-1 text-body-sm text-muted">
              {ar.checkout.phoneHelp}
            </p>
            {phoneTouched && phoneErrMsg && !phoneDigitsOk ? (
              <p className="mt-1 text-body-sm text-urgent" role="alert">
                {phoneErrMsg}
              </p>
            ) : null}
          </div>

          {formError ? (
            <p className="mt-4 rounded-[var(--radius-md)] bg-urgent-bg px-3 py-2 text-body-sm text-urgent" role="alert">
              {formError}
            </p>
          ) : null}

          <Button
            type="submit"
            size="xl"
            fullWidth
            className="mt-6"
            disabled={!canSubmit}
            data-cta="checkout-submit"
          >
            {submitting ? ar.checkout.submitting : ar.cta.checkoutSubmit}
          </Button>

          <ul className="mt-4 space-y-2 text-body-sm text-ink-soft">
            <li className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              {ar.checkout.guarantee1}
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              {ar.checkout.guarantee2}
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              {ar.checkout.guarantee3}
            </li>
          </ul>

          <p className="mt-4 text-center text-body-sm text-muted">
            {ar.checkout.consent}{" "}
            <Link href="/terms" className="text-brand-700 underline">
              {ar.checkout.terms}
            </Link>{" "}
            {ar.checkout.and}{" "}
            <Link href="/privacy" className="text-brand-700 underline">
              {ar.checkout.privacy}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
