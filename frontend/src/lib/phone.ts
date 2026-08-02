/** KSA mobile normalisation + validation (docs/16 §4). */

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EASTERN_ARABIC = "۰۱۲۳۴۵۶۷۸۹";

export function toWesternDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (ch) => {
    const i = ARABIC_INDIC.indexOf(ch);
    if (i >= 0) return String(i);
    const j = EASTERN_ARABIC.indexOf(ch);
    return j >= 0 ? String(j) : ch;
  });
}

/** Returns 9-digit national number starting with 5, or null. */
export function normalizeSaudiMobile(raw: string): string | null {
  let s = toWesternDigits(raw);
  s = s.replace(/[^\d]/g, "");

  if (s.startsWith("00966")) s = s.slice(5);
  else if (s.startsWith("966")) s = s.slice(3);
  else if (s.startsWith("0")) s = s.slice(1);

  if (!/^5[013-9]\d{7}$/.test(s)) return null;
  return s;
}

export function isValidSaudiMobile(raw: string): boolean {
  return normalizeSaudiMobile(raw) !== null;
}

/** Display as 05X XXX XXXX while typing. */
export function formatPhoneDisplay(raw: string): string {
  let digits = toWesternDigits(raw).replace(/[^\d]/g, "");

  if (digits.startsWith("00966")) digits = "0" + digits.slice(5);
  else if (digits.startsWith("966")) digits = "0" + digits.slice(3);
  else if (digits.startsWith("5") && digits.length <= 9) digits = "0" + digits;

  digits = digits.slice(0, 10);

  const a = digits.slice(0, 3);
  const b = digits.slice(3, 6);
  const c = digits.slice(6, 10);
  if (digits.length <= 3) return a;
  if (digits.length <= 6) return `${a} ${b}`;
  return `${a} ${b} ${c}`;
}

export function phoneForms(national: string) {
  return {
    phone_national: national,
    phone_e164: `+966${national}`,
    phone_digits: `966${national}`,
    phone_local: `0${national}`,
  };
}

export function maskPhoneLocal(national: string): string {
  const local = `0${national}`;
  return `${local.slice(0, 3)} *** ${local.slice(6)}`;
}

export function validateName(name: string): string | null {
  const t = name.trim();
  if (!t) return "اكتب اسمك";
  if (t.length < 2) return "الاسم قصير — اكتبه كامل";
  if (t.length > 60) return "الاسم طويل زيادة";
  if (/[<>]/.test(t)) return "الاسم فيه رموز غير مسموحة";
  if (!/[\u0600-\u06FFa-zA-Z]/.test(t)) return "اكتب اسمك";
  if (/^\d+$/.test(t)) return "اكتب اسمك";
  return null;
}

export function phoneError(raw: string): string | null {
  const digits = toWesternDigits(raw).replace(/[^\d]/g, "");
  if (!digits) return "اكتب رقم جوالك";
  if (/^01/.test(digits) || /^1/.test(digits.replace(/^0/, ""))) {
    return "هذا رقم أرضي — نحتاج رقم جوال يبدأ بـ 05";
  }
  const national = digits
    .replace(/^00966/, "")
    .replace(/^966/, "")
    .replace(/^0/, "");
  if (national.length < 9) return "الرقم ناقص — لازم ١٠ أرقام تبدأ بـ 05";
  if (!normalizeSaudiMobile(raw)) return "تأكد من الرقم — لازم جوال سعودي يبدأ بـ 05";
  return null;
}
