# 05 — Arabic Copy Guide (Saudi Dialect) + RTL Typography

This is a working manual, not a style suggestion. Copy that reads as translated is the single
fastest way to destroy a premium Saudi DTC brand. Every string that ships must pass §7.

## 1. The register: "خليجي أبيض" — clean Saudi

Not Modern Standard Arabic (MSA/فصحى), which reads like a government circular or a translated
manual. Not heavy regional slang, which alienates buyers outside that region. The target is
**educated, warm, everyday Saudi speech** — the way a well-spoken Riyadh woman writes a long
WhatsApp message to a friend.

**Calibration test:** read the sentence aloud. If it sounds like a news anchor, it is too
MSA. If it needs a glossary outside Najd, it is too regional. If it sounds like a smart
friend explaining something she actually understands, it is right.

### Where each register belongs

| Surface | Register | Why |
|---|---|---|
| Hero, section headings, body copy, FAQ, reviews, buttons | **Saudi dialect** | This is the voice; it does the persuading |
| Ingredient names, INCI, percentages | **Latin/technical, untranslated** | Redensyl, Vitamin C, Salicylic Acid, Zinc |
| Legal pages (terms, privacy, returns) | **Light MSA** | Legal formality is expected and *increases* trust here |
| Error and validation messages | **Dialect, short, kind** | «رقم الجوال ما يبدأ بـ ٥ — تأكدي منه» |
| Meta titles/descriptions | **Dialect + searchable MSA keywords** | She searches in both |

## 2. Lexicon: use / avoid

| Concept | ✅ Use | ❌ Avoid (too MSA / translated / Egyptian / Levantine) |
|---|---|---|
| you (f. sg.) | أنتِ، شعرك، جرّبي، اطلبي | أنت (m.), حضرتك, سيادتك |
| I want / you want | تبغين، أبغى | تريدين، أريد |
| now | الآن، حالياً | الآنَ (over-vocalised) |
| a lot | كثير، واجد (sparingly) | جداً في كل جملة، كتير (Levantine), أوي (Egyptian) |
| good / great | حلو، ممتاز، مرة حلو | رائع، مذهل، خلاب |
| it works | يشتغل، ينفع، يفيد | يعمل، فعّال جداً |
| it stopped | وقف، خفّ، قلّ | توقّف تماماً، انحسر |
| try it | جرّبيه | قومي بتجربته |
| order now | اطلبيه الآن | قومي بالطلب، اضغط هنا للطلب |
| shipping | التوصيل | الشحن والتسليم |
| pay on delivery | الدفع عند الاستلام، تدفعين كاش لما يوصلك | خدمة الدفع نقداً عند التسليم |
| price | السعر | القيمة المالية |
| free | مجاناً، ببلاش (informal only) | بدون مقابل مادي |
| my hair falls | شعري يتساقط، شعري ينسدح، شعري يطيح | يتعرض شعري للتساقط |
| scalp | فروة الرأس، الفروة | فروة الرأسِ الجافة (over-formal) |
| the part line | المفرق | خط الفراق |
| thinning / gaps | فراغات، خفّة، خفّ من قدّام | تخلخل الكثافة |
| build-up | تراكمات | ترسبات متراكمة |
| flaking | قشور | التقشر الجلدي |
| itching | حكة، تحكّني | الهرش |
| tired / depleted | تعبانة، مرهقة، ما فيني حيل | مصابة بالإجهاد |
| results | نتيجة، فرق يبان | نتائج ملحوظة وفورية |
| studies | دراسات | الأبحاث العلمية المحكّمة |
| ask your doctor | استشيري طبيبك | يرجى مراجعة الطبيب المختص |
| we / us (brand) | إحنا، في أصول | نحن في شركة أصول المحدودة |
| customers | البنات، عميلاتنا (sparingly) | العملاء الكرام، زوارنا الأعزاء |

**Never use in UI:** «عملاءنا الكرام»، «يرجى ملاحظة أن»، «نأسف للإزعاج»، «تم بنجاح!»
(use «تم» or a specific confirmation), «انقر هنا».

## 3. Gender: always feminine singular

Every verb, adjective, pronoun, and CTA addresses **one woman**.

- ✅ اطلبي، جرّبي، اختاري، أضيفي، أكملي، شعرك، تبغين، لاحظتِ
- ❌ اطلب، جرّب (masculine), اطلبوا (plural), العميل (masculine noun)

Audit target: `grep` the codebase for masculine imperatives (`اطلب`, `اشتر`, `أضف`, `اختر`,
`أكمل`, `سجل`, `تابع`) as standalone button strings. Every one is a bug.

**The only exception:** legal pages may use neutral MSA phrasing (المستخدم، العميل) because
legal register expects it.

## 4. Numbers, currency, dates, time

| Item | Rule | Example |
|---|---|---|
| Digits | Western Arabic numerals in UI, prices, counters, timers | `199`, `279`, `349` |
| Digits in flowing prose | Arabic-Indic acceptable for small counts inside sentences | «ثلاث أسباب»، «٤ إلى ٨ أسابيع» |
| Currency | «ريال» after the number; `SAR` only in code/exports | `199 ريال` — not `ر.س 199`, not `199.00` |
| Decimals | Never shown. All prices are whole SAR integers. | `199` not `199.00` |
| Price direction | Wrap the number+currency in `dir="ltr"` inside RTL prose to stop reordering | `<bdi>199 ريال</bdi>` |
| Percentages | Number then `٪` or `%`; be consistent — use `٪` in Arabic prose, `%` in technical/INCI lists | `ساليسيليك ٢٪` |
| Phone display | Always `05X XXX XXXX`, wrapped in `<bdi dir="ltr">` | `0551234567` → `055 123 4567` |
| Dates | Gregorian, Arabic month names | `١٢ أغسطس` |
| Delivery windows | Business days, stated in days | «٢–٤ أيام عمل» |

**Critical bidi rule.** Any run of Latin characters or digits inside Arabic text must be
isolated, or the browser will reorder it and produce visibly wrong output (a price rendering
as `ريال 199` in some positions, or `Redensyl 3%` becoming `3% Redensyl`). Always use `<bdi>`
or `<span dir="ltr">`. Build a helper:

```tsx
export const LTR = ({ children }: { children: React.ReactNode }) => (
  <bdi dir="ltr" className="latin">{children}</bdi>
);
// usage: <LTR>199</LTR> ريال   |   سيروم <LTR>Redensyl 3%</LTR>
```

## 5. Microcopy library — ship these strings

Centralise all of these in `frontend/src/content/ar.ts` as a typed object. No hardcoded
Arabic strings scattered through components.

### Buttons / CTAs

| Key | String |
|---|---|
| `atc` | أضيفي للسلة |
| `atcSticky` | أضيفي للسلة — <LTR>{price}</LTR> ريال |
| `buyNow` | اطلبيه الآن |
| `checkout` | أكملي الطلب |
| `checkoutSubmit` | تأكيد الطلب — دفع عند الاستلام |
| `continueShopping` | كمّلي تسوّق |
| `viewProduct` | تفاصيل المنتج |
| `addUpsell` | أضيفيه بـ <LTR>99</LTR> ريال |
| `skipUpsell` | لا شكراً، أكملي طلبي |
| `whatsapp` | كلّمينا واتساب |
| `shopAll` | شوفي المنتجات |
| `quiz` | وش سبب تساقطك؟ |

### Offer selector

| Key | String |
|---|---|
| `offer1Title` | قطعة واحدة |
| `offer1Sub` | تجربة شهر |
| `offer2Title` | قطعتين |
| `offer2Sub` | شهرين — الأكثر طلباً |
| `offer3Title` | ٣ قطع |
| `offer3Sub` | ٣ شهور — النتيجة الكاملة |
| `perUnit` | <LTR>{n}</LTR> ريال للقطعة |
| `save` | توفير <LTR>{n}</LTR> ريال |
| `bestValue` | أفضل قيمة |
| `mostPopular` | الأكثر طلباً |

### Trust strip

| Key | String |
|---|---|
| `trustCod` | دفع عند الاستلام |
| `trustCodSub` | ولا ريال قبل ما يوصلك |
| `trustShipping` | توصيل لكل السعودية |
| `trustShippingSub` | <LTR>2–4</LTR> أيام عمل |
| `trustDiscreet` | تغليف مقفل |
| `trustDiscreetSub` | ما فيه أي تفاصيل من الخارج |
| `trustSupport` | دعم واتساب |
| `trustSupportSub` | نرد خلال ساعة |

### Cart drawer

| Key | String |
|---|---|
| `cartTitle` | سلّتك |
| `cartEmpty` | سلّتك فاضية |
| `cartEmptySub` | ابدئي من هنا — اختاري السبب اللي يشبه وضعك |
| `crossSellTitle` | كمّلي النظام |
| `crossSellSub` | أنتِ غطيتِ سبب واحد. باقي سببين. |
| `cartTotal` | الإجمالي |
| `cartCodNote` | الدفع كاش عند الاستلام |
| `cartFreeShip` | التوصيل مجاني |

### Checkout modal

| Key | String |
|---|---|
| `coTitle` | خطوة واحدة وينتهي طلبك |
| `coSub` | ما نطلب منك بطاقة ولا حساب. بس اسمك ورقمك. |
| `nameLabel` | الاسم |
| `namePlaceholder` | اسمك الكامل |
| `phoneLabel` | رقم الجوال |
| `phonePlaceholder` | <LTR>05X XXX XXXX</LTR> |
| `phoneHelp` | نتواصل معك على هذا الرقم لتأكيد الطلب |
| `coScarcity` | <LTR>{n}</LTR> بنات يكملون طلبهم الآن |
| `coGuarantee` | تدفعين كاش لما يوصلك — وتقدرين ترفضين الاستلام |

### Validation messages

| Key | String |
|---|---|
| `errNameRequired` | اكتبي اسمك |
| `errNameShort` | الاسم قصير — اكتبيه كامل |
| `errPhoneRequired` | اكتبي رقم جوالك |
| `errPhoneInvalid` | الرقم غير صحيح — لازم يبدأ بـ <LTR>05</LTR> ويكون <LTR>10</LTR> أرقام |
| `errPhoneNotSaudi` | نوصّل داخل السعودية فقط حالياً |
| `errGeneric` | صار خطأ عندنا، مو عندك. جرّبي مرة ثانية أو كلّمينا واتساب. |
| `errNetwork` | الاتصال ضعيف — طلبك محفوظ، جرّبي مرة ثانية |

### Upsell (post-checkout, timed)

| Key | String |
|---|---|
| `upsellEyebrow` | عرض خاص — لهذي المرة فقط |
| `upsellTitle` | ضيفي {product} بـ <LTR>99</LTR> ريال بدل <LTR>199</LTR> |
| `upsellSub` | نفس الطلب، نفس التوصيل، ولا ريال إضافي على التوصيل. |
| `upsellTimer` | العرض ينتهي بعد <LTR>{s}</LTR> ثانية |
| `upsellWhy` | ليش هذا بالتحديد؟ |

### Thank-you page

| Key | String |
|---|---|
| `tyTitle` | تم — طلبك وصلنا |
| `tySub` | رقم طلبك <LTR>{id}</LTR> |
| `tyNext` | وش يصير الآن؟ |
| `tyStep1` | نكلّمك على <LTR>{phone}</LTR> خلال <LTR>24</LTR> ساعة لتأكيد الطلب |
| `tyStep2` | بعد التأكيد نشحنه، ويوصلك خلال <LTR>2–4</LTR> أيام عمل |
| `tyStep3` | تدفعين كاش للمندوب عند الاستلام |
| `tyImportant` | مهم: لو ما رديتِ على المكالمة، الطلب ما يتشحن. احفظي رقمنا. |
| `tyHowToUse` | كيف تستخدمينه صح |

## 6. Formatting rules for long-form sections

- **One idea per sentence.** Arabic invites long chains with «و» and «الذي». Break them.
- **Max 3 sentences per paragraph** on mobile.
- **Bold the payload, not the whole sentence.** One bold phrase per paragraph maximum.
- **Headings are claims, not labels.** ❌ «المكوّنات» ✅ «وش فيه بالضبط، وبأي تركيز»
- **Bullets are parallel.** All start with a verb, or all with a noun. Never mixed.
- **No exclamation marks in body copy.** At most one per page, and never in a heading.
- **No emoji in body copy or headings.** A single check/star glyph in a list is acceptable; faces are not.
- **Numbers up front.** «٤ إلى ٨ أسابيع قبل ما يبان الفرق» beats «الفرق يبان خلال فترة تتراوح…»

## 7. Pre-ship copy checklist

Every Arabic string must pass all eleven:

- [ ] Feminine singular address
- [ ] Dialect, not MSA (except legal pages)
- [ ] No banned words from `04` §8 or `07` §3
- [ ] Latin/digit runs wrapped in `<bdi>`/`dir="ltr"`
- [ ] No letter-spacing, no italics, no uppercase applied to Arabic
- [ ] Line-height ≥ 1.5 for body, ≥ 1.7 for long-form
- [ ] Reads naturally aloud (say it out loud — this catches 90% of translated-feel)
- [ ] Any claim maps to a proof pillar (`04` §5)
- [ ] Any number is real, not invented
- [ ] Lives in `content/ar.ts`, not inline in a component
- [ ] Renders correctly at 390px without truncation or overflow

## 8. RTL implementation rules (engineering)

These are technical, but they are copy-quality issues in practice.

1. `<html lang="ar" dir="rtl">`. Set it in the root layout, not client-side.
2. **Use logical CSS properties everywhere.** `ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`,
   `text-start`/`text-end`, `border-s`/`border-e`. Tailwind supports these natively — using
   `ml-4` or `left-0` anywhere is a bug.
3. **Directional icons must flip.** Chevrons, arrows, back buttons: `rtl:-scale-x-100` or use
   the mirrored glyph. **Non-directional icons must NOT flip** — cart, star, check, phone,
   WhatsApp, clock, shield. A mirrored WhatsApp logo is instantly noticeable.
4. **Numbers and progress bars flow visually the way the user expects.** A "step 1 of 3"
   indicator fills from the right. A countdown reads right-to-left in layout but the digits
   themselves stay LTR.
5. **Carousels/sliders:** swipe direction must feel natural in RTL (next = swipe right-to-left
   toward the start edge). Configure the slider library's `rtl` option explicitly and test it
   — most default to LTR and silently feel wrong.
6. **Form inputs:** `dir="rtl"` for the name field, `dir="ltr"` + `text-align: right` for the
   phone field (digits must be LTR but the field visually aligns with the RTL layout), and
   `type="tel"`, `inputMode="numeric"`, `autoComplete="tel"`.
7. **Shadows and asymmetric radii** must mirror. A card with a bottom-right accent in LTR
   becomes bottom-left in RTL.
8. **Test every page at 390px in RTL before calling it done.** Most RTL bugs only appear at
   narrow widths where a `left`-anchored absolute element escapes the viewport.
