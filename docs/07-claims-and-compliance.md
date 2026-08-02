# 07 — Claims, Compliance, and Legal Guardrails

This document protects the business. Regulatory trouble in KSA can mean the store being
blocked, product listings cancelled, and advertising accounts banned. Snapchat, TikTok, and
Meta also reject health-claim creatives, so over-claiming has a direct paid-media cost.

**Rule of thumb for every sentence written on this site:** cosmetics change *appearance and
condition*; medicines *treat, prevent, cure, or relieve disease*. We only ever do the first.

---

## 1. The regulator and what it says

**SFDA (الهيئة العامة للغذاء والدواء)** regulates both cosmetics and food/health supplements
in Saudi Arabia. The relevant instruments:

- *SFDA General Rules for Products Claims*
- *SFDA Products Classification Guidance* (v7)
- *Implementing Regulation of the Cosmetic Products Law* (Royal Decree M/49)
- Cosmetic safety requirements **SFDA.CO/GSO 1943**

Key provisions we are bound by, quoted in substance:

> A cosmetic is any substance intended to be placed in contact with the external parts of the
> human body (epidermis, **hair system**, nails, lips, external genital organs) or with the
> teeth and oral mucous membranes, exclusively or mainly to clean, perfume, change the
> appearance of, protect, keep in good condition, or correct body odour.

> Cosmetic products **should not contain medicinal or therapeutic claims**, and they **should
> not have a significant physiological effect**. The product **should not be presented as
> treating or preventing disease**.

> Claims made explicitly or implicitly to **"protect, prevent, relieve symptoms, cure, heal,
> eliminate"** can be regarded as **medical claims**.

> Products intended for **internal use cannot be considered cosmetic products** — e.g.
> products taken orally (syrup, solution, drink, capsules, tablets).

> It is not allowed to promote a cosmetic product without authority permission if the
> authority cancels the listing, bans, withdraws, or suspends trading of the product.

---

## 2. Product classification — and the one that is different

| Product | Route of use | SFDA classification | Notification path |
|---|---|---|---|
| Redensyl + copper peptides serum | Topical (leave-on, scalp) | **Cosmetic** | Cosmetic product notification (Ghad system) |
| Salicylic 2% + zinc exfoliant | Topical (rinse-off, scalp) | **Cosmetic** | Cosmetic product notification (Ghad system) |
| **Iron bisglycinate + Vitamin C tonic** | **Oral** | **NOT a cosmetic. Health/food supplement (مكمل غذائي).** | **Separate supplement registration path** |

> ### ⚠️ Business action required before launch
> The iron tonic cannot be notified as a cosmetic. Oral products are explicitly excluded from
> the cosmetic definition. It needs the SFDA health/food-supplement route, with its own
> requirements around composition limits, labelling, and permitted claims. **This is a task
> for the owner, not the coder — but the coder must build the page as if the stricter
> supplement rules apply, because they do.**

Additionally: cosmetic products **must not contain medicinal or therapeutic substances**, and
the two topicals must comply with SFDA's prohibited/restricted substances lists. Confirm the
supplier's INCI list against those lists before launch (see `33`).

---

## 3. Banned words and phrases — hard blocklist

None of these may appear anywhere on the site, in any language, including alt text, meta
descriptions, structured data, review content, and ad creative.

**Medical/therapeutic verbs (Arabic):**
يعالج · علاج · يشفي · شفاء · يقضي على · يمنع · وقاية من · يزيل · يداوي · يخفف أعراض ·
مضاد للـ(مرض) · دواء · وصفة طبية · بديل الدواء · بديل المينوكسيديل

**Disease and condition names as targets of treatment:**
الثعلبة · الأنيميا · فقر الدم · نقص الحديد (as something we *treat*) · الصدفية · الإكزيما ·
التهاب الجلد الدهني · الأمراض الجلدية · اضطرابات الهرمونات

**Absolute / superlative / guarantee claims:**
مضمون ١٠٠٪ · نتائج مؤكدة · نتائج فورية · معجزة · سحري · يوقف التساقط نهائياً ·
الأفضل في العالم · الأول في السعودية · أقوى من (any drug) · بدون أي أعراض جانبية

**False authority:**
معتمد من الهيئة / معتمد من وزارة الصحة (unless we hold that exact document — approval to
market is not an endorsement) · أطباء ينصحون به (unless we hold real, named, consenting
endorsements) · موصى به من الجمعية… (unless true) · FDA approved · نتائج مخبرية مؤكدة

**Fabrications of any kind:**
Invented clinical trials, invented percentages, invented customer counts, invented "as seen
in" press logos, doctor characters in white coats implying medical endorsement, before/after
photos we do not own with documented consent.

**English equivalents are equally banned:** treats, cures, prevents, heals, eliminates,
clinically proven (for our finished product), FDA approved, guaranteed results, miracle.

---

## 4. Approved claim language — use these

### 4.1 Topical cosmetics (serum, exfoliant)

| ✅ Allowed | ❌ Not allowed |
|---|---|
| يدعم كثافة الشعر | يعالج تساقط الشعر |
| يقلل مظهر التساقط | يوقف التساقط |
| يساعد على تحسين مظهر الفروة | يعالج التهاب الفروة |
| يفكّك التراكمات والقشور | يقضي على القشرة نهائياً |
| يهدّي الإحساس بالحكة | يزيل الحكة / يعالج الحكة |
| يحافظ على الفروة في حالة جيدة | يشفي الفروة |
| يستهدف البصيلة | ينشّط البصيلات ويولّد شعر جديد مضمون |
| يساعد على تحسين نسبة الشعر النامي (بناءً على دراسات المادة الفعالة) | يزيد الشعر ١٠,٠٠٠ شعرة (as our own promise) |
| مكوّنات مدروسة بتراكيز واضحة | مكوّنات مثبتة علمياً لعلاج الصلع |
| يرطّب ويقلل الجفاف | يجدّد خلايا الفروة |

### 4.2 The oral supplement (tonic) — stricter

| ✅ Allowed | ❌ Not allowed |
|---|---|
| يدعم مخزون الحديد في الجسم | يعالج نقص الحديد / يعالج فقر الدم |
| الحديد يساهم في تقليل الشعور بالإرهاق والتعب | يعالج الإرهاق المزمن |
| الحديد عنصر أساسي لنمو الشعر الطبيعي | يوقف التساقط الناتج عن نقص الحديد |
| فيتامين C يحسّن امتصاص الحديد | فيتامين C يضاعف الامتصاص ٥ مرات |
| مكمّل غذائي يدعم الشعر والطاقة | بديل عن حقن الحديد |
| للحصول على صورة دقيقة، اطلبي تحليل فيريتين | تحليلك ما يعني شي، خذي الحديد على طول |

**Mandatory on the tonic page and in the cart line item:**
> مكمّل غذائي — ولا يُستخدم كبديل عن نظام غذائي متوازن أو عن استشارة طبية.
> احفظيه بعيداً عن متناول الأطفال. الجرعات العالية من الحديد خطيرة على الأطفال.
> استشيري طبيبك إذا كنتِ حاملاً أو مرضعة أو تتناولين مكمّل حديد آخر.

---

## 5. How to present evidence legally and credibly

Four rules. All four apply to every citation on the site.

1. **Attribute to the ingredient, never to our product.**
   ✅ «دراسات على ريدنسل ٣٪ أظهرت…»  ❌ «دراساتنا أظهرت…» / «سيرومنا مثبت سريرياً»
2. **State the source honestly, including when it is the supplier.**
   ✅ «بيانات الشركة المصنّعة للمادة الفعالة»  ❌ presenting supplier marketing data as independent research
3. **State the limits.** Sample size, in-vitro vs in-vivo, different formulation, mixed literature. Every single time.
4. **Add the variation disclaimer wherever a number appears.**
   > النتائج تختلف من شخص لآخر، وتعتمد على سبب التساقط والالتزام بالاستخدام.

**Standard evidence-section footer (use verbatim):**
> المراجع المذكورة هي دراسات على **المكوّنات الفعالة** بتراكيز مشابهة، ومو دراسات على منتج
> أصول النهائي. أصول منتجات عناية تجميلية ومكمّل غذائي — ومو أدوية، وما تُستخدم لتشخيص أو
> علاج أي حالة مرضية. لو التساقط شديد أو مفاجئ، راجعي طبيبة جلدية.

---

## 6. Social proof integrity

Reviews are our strongest asset and our biggest liability.

- **Never fabricate a review attributed to a real-sounding person as if genuine.** Seeded
  placeholder content must be flagged `is_seed = true` in the database and must be **removed
  or replaced with real reviews before launch**. See `21`.
- Under the KSA E-Commerce Law, Article 11, an electronic advertisement must not include a
  false offer, statement, claim, or any misrepresentation that directly or indirectly deceives
  or misleads a consumer. Fake reviews and fake struck-through prices are squarely within this.
- Reviews must not contain medical claims either. If a real customer writes «عالج تساقطي»,
  we may publish it only with a visible disclaimer, or not publish it. Safer: do not publish it.
- Before/after photos require documented written consent and must be unretouched, with
  consistent lighting, angle, and framing. State the time elapsed.
- Any influencer or UGC content must be labelled as advertising material where required — the
  E-Commerce Implementing Regulations require advertisements to be clearly identified as such.

---

## 7. KSA E-Commerce Law obligations that affect the build

The Saudi E-Commerce Law (2019) and its Implementing Regulations apply to us and to any
business selling to KSA consumers. Concrete build requirements:

| Obligation | Where it must appear |
|---|---|
| Merchant must register the e-shop in the Commercial Register | Footer: CR number and legal entity name (owner to supply) |
| Disclose a minimum set of service-provider information on the store | Footer + Contact page: legal name, CR number, address, phone, email |
| Provide a statement of terms and conditions covering: how the contract is formed, the main characteristics of products, payment and delivery arrangements, warranties | `/terms` page |
| **Consumer may rescind within 7 days of receiving the product**, provided it has not been used or benefited from; consumer bears rescission cost unless agreed otherwise | `/returns` page, checkout modal, thank-you page |
| Provide an invoice showing purchase cost, total price inclusive of all fees and taxes, delivery cost, and date/place of delivery | Order confirmation content + what the delivery agent hands over |
| If delivery is delayed more than 15 days (unless otherwise agreed), consumer may cancel and receive a full refund | `/shipping` page |
| Advertisements must not be false or misleading, and must be identifiable as advertising | All copy; ad creative briefs |
| Advertisement must not use a counterfeit logo or one we have no right to use | No fake trust badges, no borrowed press logos |

**VAT:** KSA VAT is currently 15%. Displayed prices must be VAT-inclusive and the site must
state that clearly («الأسعار شاملة ضريبة القيمة المضافة»). Confirm the business's VAT
registration status with the owner; if registered, the VAT number goes in the footer and on
invoices.

---

## 8. Required legal pages

Four pages, in light MSA, linked from the footer and from the checkout modal. Content outlines
are in `29-security-and-legal-pages.md`.

| Route | Arabic title | Must cover |
|---|---|---|
| `/terms` | الشروط والأحكام | Contract formation, product characteristics, prices and VAT, payment (COD), delivery, warranties, liability limits, governing law (KSA), dispute resolution |
| `/privacy` | سياسة الخصوصية | What we collect (name, phone, IP, device, behavioural), why, retention period, third parties (Meta/TikTok/Snap, delivery company, Google Sheets), her rights, PDPL reference, contact for requests |
| `/returns` | سياسة الاستبدال والإرجاع | The 7-day statutory right, condition requirements (unused, sealed), who bears return shipping, refund method and timeframe for COD, how to initiate (WhatsApp), exclusions |
| `/shipping` | سياسة التوصيل | Coverage, delivery windows by region, COD fee if any, the 15-day delay right, discreet packaging, what happens on failed delivery attempts |

**Saudi PDPL (Personal Data Protection Law) note:** we collect name, phone, IP, and behavioural
data, and we share hashed identifiers with three ad platforms and order data with Google.
The privacy policy must disclose this specifically, and there must be a lawful basis. See
`29` §PDPL and `23` §consent.

---

## 9. Advertising-platform policy (affects creative and landing page)

Meta, TikTok, and Snapchat all restrict health and body-related advertising, and they review
the **landing page**, not just the ad.

- No before/after imagery of body/hair transformation in ad creative (Meta prohibits it; TikTok and Snap restrict it).
- No implication of a negative self-perception ("your hair looks terrible").
- No claims of guaranteed results, and no medical claims — the landing page copy is part of the review surface.
- Supplement advertising has extra restrictions and may require additional certification in some placements.
- **Consequence:** the honest-claims approach in this document is also what keeps the ad accounts alive. It is not just legal caution; it is media strategy.

---

## 10. Coder's compliance checklist

Run this before shipping any content-bearing page:

- [ ] No word from §3 appears anywhere, including alt text, meta tags, JSON-LD, and seed reviews
- [ ] Every claim maps to an approved phrasing in §4
- [ ] Every cited study is attributed to the ingredient and carries its stated limit
- [ ] The evidence-section footer from §5 is present on every product page
- [ ] The tonic page carries all mandatory supplement warnings from §4.2
- [ ] The tonic is never described as a cosmetic or as treating anything
- [ ] All seeded reviews are flagged `is_seed = true` and appear in the pre-launch removal checklist
- [ ] Prices state VAT inclusion; no fake struck-through "original" prices
- [ ] Four legal pages exist, are linked in the footer, and are linked from the checkout modal
- [ ] Footer carries legal entity name, CR number, address, phone, email (placeholders clearly marked `TODO: owner to supply`)
- [ ] Countdown timers and stock counters reflect real state (see `18` §honest urgency)
- [ ] A dermatologist-referral line appears on each product page
