/**
 * Payment methods offered at checkout.
 *
 * Prepaid is the default. Cash carries a fee equal to what the courier charges
 * us to handle it, which is also the single biggest lever on delivery rate:
 * a prepaid order is almost never refused at the door.
 */

export type PaymentMethod = "prepaid_link" | "cod";

export const COD_FEE_SAR = 15;

export const PAYMENT_METHODS: PaymentMethod[] = ["prepaid_link", "cod"];

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = "prepaid_link";

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "prepaid_link" || value === "cod";
}

export function codFeeFor(method: PaymentMethod): number {
  return method === "cod" ? COD_FEE_SAR : 0;
}
