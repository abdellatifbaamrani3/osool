# 11 — Home Page Blueprint

**Route:** `/`
**Job:** establish the brand as a credible authority in under 8 seconds, teach the three-cause
model, and route her to the right product page. The home page does **not** need to close the
sale — the product page does. Home page success = a qualified click into a product page.

**Primary KPI:** home → product page click-through ≥ 55%
**Secondary:** scroll depth past `#causes` ≥ 60%

**Traffic note:** most paid traffic lands on product pages, not here. Home page visitors are
disproportionately *researchers* checking whether we are legitimate. Optimise for credibility
and orientation, not for hard selling.

---

## Section stack

Sections are numbered; `[S]` marks the alternating split-section layout (see `10` §3.1). The
`reverse` value shows the desktop arrangement.

| # | Section | Layout | Anchor |
|---|---|---|---|
| 1 | Announcement bar | full-bleed strip | — |
| 2 | Hero | media + copy | — |
| 3 | Trust strip | 4-up | — |
| 4 | Recognition ("هذا وضعك؟") | centred | — |
| 5 | The three causes | 3-up cards | `#causes` |
| 6 | Product ↔ cause matcher | 3-up product cards | `#products` |
| 7 | Why what she tried failed | `[S]` text-start | — |
| 8 | The system / routine | `[S]` text-end | `#how` |
| 9 | Evidence & authority | centred + logos/citations | `#proof` |
| 10 | Reviews | grid + UGC strip | `#reviews` |
| 11 | Founder / brand story teaser | `[S]` text-start | — |
| 12 | Honest expectations | timeline | — |
| 13 | FAQ | accordion | `#faq` |
| 14 | Final CTA | full-bleed dark | — |
| 15 | Footer | 4-col | — |

---

## 1. Announcement bar

32px, `--brand-900`, `--gold-300` text, 12px label type, centred, dismissible.

> توصيل لكل السعودية · دفع عند الاستلام

---

## 2. Hero

**Layout.** Mobile: image (4:5) then copy stacked beneath. Desktop: 6/6 split, **copy on the
right (start)**, image on the left — this is alternation index 1, and it puts the headline
exactly where an RTL reader's eye lands first.

**Content**

- Eyebrow (`label`, `--gold-600`): من الأصل، وبالدليل
- H1 (`display`): **شعرك يتساقط… وما تدرين وش السبب؟**
- Sub (`body-lg`, max-w 38rem): التساقط عند النساء له ثلاثة أسباب — البصيلة، مخزون الحديد، وصحة الفروة. أصول تشتغل على الثلاثة، بمكوّنات مسمّاة وتراكيز مكتوبة.
- Primary CTA (`xl`): **وش سبب تساقطك؟** → scrolls to `#causes`
- Secondary CTA (`ghost`): شوفي المنتجات → `/collection`
- Below the CTAs, a single line of inline proof: ⭐⭐⭐⭐⭐ <LTR>4.8</LTR> · أكثر من <LTR>{n}</LTR> امرأة سعودية بدأت مع أصول
  *(real numbers only — if we do not have them yet, omit this line entirely rather than invent it)*

**Image:** `hero-home.jpg`, 4:5 mobile / 16:9 desktop. Placeholder per `31`. `priority`,
`fetchPriority="high"`. Subject facing toward the copy column.

**Engineering notes**

- This is the LCP element. No animation, no scroll reveal, no client-side data fetch.
- Reserve exact space with `aspect-ratio` to hold CLS at 0.
- Headline uses `text-wrap: balance`.
- The hero CTA is the primary conversion action of this page — make it 56px tall and full-width on mobile.

---

## 3. Trust strip

Immediately below the hero, `--brand-50` background, 4 items. Horizontal scroll on mobile
(with the 4th item partially visible to signal scrollability), 4-up grid on desktop.

| Icon | Label | Sub |
|---|---|---|
| `banknote` | دفع عند الاستلام | ولا ريال قبل ما يوصلك |
| `truck` | توصيل لكل السعودية | <LTR>2–4</LTR> أيام عمل |
| `package` | تغليف مقفل | ما فيه أي تفاصيل من الخارج |
| `message-circle` | دعم واتساب | نرد خلال ساعة |

---

## 4. Recognition

Centred, narrow (`max-w-[38rem]`), `--ivory`. This is message-hierarchy step 1 (`04` §6) — the
"she stays" moment. No product, no price, no CTA. Pure recognition.

- H2: **لو هذا وضعك، أنتِ في المكان الصح**
- Three short lines, each with a small `check` glyph in `--gold-500`:
  - كل يوم تشوفين شعر في المصفاة، وفي المخدة، وعلى الأرض
  - المفرق صار أوسع — وأنتِ أول واحدة لاحظت
  - جرّبتِ زيوت وفيتامينات وشامبوهات، وما بان شي
- Closing line, `body-lg`, `--ink-soft`: المشكلة ما كانت فيك. كانت في السبب اللي ما أحد كلّمك عنه.

---

## 5. The three causes — `#causes`

**The most important section on the page.** This is the category-design asset from `04` §2. It
must feel like received medical knowledge, not marketing.

Background `--brand-900`, so it reads as the page's centre of gravity.

- Eyebrow: الأسباب الثلاثة
- H2 (`--ivory`): **التساقط ما له سبب واحد. له ثلاثة.**
- Sub (`--gold-200`): وأغلب المنتجات تشتغل على واحد بس — وهذا سبب إن النتيجة ما تكتمل.

Three cards, `--brand-800` surface, `1px solid rgba(194,161,91,.25)` border, gold numeral:

| # | Title | Body | Links to |
|---|---|---|---|
| ١ | **البصيلة نامت** | إشارات النمو ضعفت، فالشعرة تدخل مرحلة السقوط بدري وما تكمل دورتها. | Serum |
| ٢ | **المخزون فاضي** | نقص مخزون الحديد شائع جداً عند النساء. الجسم يوقف "الكماليات" أول — والشعر أول واحد يتأثر. | Tonic |
| ٣ | **الفروة مخنوقة** | تراكمات وقشور وزيوت تسدّ مسار الشعرة وتضعف البصيلة. | Exfoliant |

Each card ends with a `ghost` link in `--gold-300`: `المنتج اللي يشتغل على هذا السبب ←`
(chevron RTL-flipped) that deep-links to the product page.

Below the cards, a single centred line: **كل منتج من أصول يشتغل على سبب. النظام الكامل يشتغل على الثلاثة.**

---

## 6. Product ↔ cause matcher — `#products`

Three `ProductCard`s (anatomy in `13` §3), `--ivory` background, each visually tagged with its
cause number so the mapping from §5 is unmistakable.

- Eyebrow: المنتجات
- H2: **ثلاث خطوات. اختاري اللي يشبه وضعك.**
- Cards in canonical order: Serum (سبب ١) · Tonic (سبب ٢) · Exfoliant (سبب ٣)
- Below the grid, a bundle nudge card, `--gold-100` background:
  - **ما تدرين وش سببك؟** ابدئي بالنظام الكامل — يغطي الأسباب الثلاثة.
  - CTA: شوفي النظام الكامل → `/collection`

---

## 7. Why what she tried failed  `[S]` reverse=false (text at start/right)

Message-hierarchy step 2. Validates her past failures without insulting her.

- Eyebrow: ليش ما نفع اللي جرّبتيه
- H2: **ما كانت غلطتك. كانت مشكلة سبب.**
- Four rows, each `avoided → why` (use a compact two-column list, not a table, on mobile):

| جرّبتِ | ليش ما نفع |
|---|---|
| زيوت الشعر | تلمّع الشعرة، بس ما توصل للبصيلة — وأغلبها يزيد التراكمات |
| بيوتين وفيتامينات | البيوتين ينفع لو عندك نقص بيوتين، وهذا نادر. أغلب النساء ناقصهم حديد. |
| شامبو ضد التساقط | يبقى على الفروة دقيقتين. المشكلة تحتاج شي يبقى ويشتغل. |
| سيروم من متجر كبير | ما مكتوب لا مكوّن ولا تركيز. ما تعرفين وش تحطين. |

- Media: comparison illustration or lifestyle image, 4:5.

---

## 8. The system / routine  `[S]` reverse=true (image at start/right) — `#how`

- Eyebrow: النظام الكامل
- H2: **ثلاث خطوات، وما تاخذ من وقتك دقيقتين**
- Three numbered steps from `06` §"Cross-product routine": nightly serum, morning tonic, weekly exfoliant
- Each step: number in a gold circle, bold title, one line of detail
- CTA: `secondary` → شوفي النظام الكامل

---

## 9. Evidence & authority — `#proof`

`--sand-100` background, centred.

- Eyebrow: بالدليل
- H2: **مكوّنات مسمّاة، بتراكيز مكتوبة، ودراسات نقدر نشير لها**
- Three evidence cards, one per key active — each with the headline number, the source, **and
  the honest limit**:

| Active | Number | Source line | Limit line |
|---|---|---|---|
| <LTR>Redensyl 3%</LTR> | <LTR>+9%</LTR> شعر في مرحلة النمو، <LTR>−17%</LTR> في مرحلة السقوط بعد <LTR>84</LTR> يوم | دراسة الشركة المصنّعة للمادة الفعالة | عدد مشاركين محدود، ودراسة على المادة مو على منتجنا |
| <LTR>Salicylic 2% + Zinc</LTR> | فعالية مثبتة في تقليل القشور والحكة | دراسات محكّمة على شامبوهات بتراكيز مشابهة | الدراسات على تركيبات ثانية، والنتائج تختلف |
| الحديد والفيريتين | أكثر من <LTR>80%</LTR> من حالات تساقط الشعر النسائي في إحدى الدراسات كان مخزون الحديد عندهم أقل من <LTR>70</LTR> | دراسات منشورة محكّمة | الأدلة متباينة — فيه دراسات ما لقت فرق واضح |

- Then the standard evidence footer, verbatim from `07` §5, in `body-sm` `--muted`.
- A distinct gold callout box: **تبغين تعرفين وضعك بالضبط؟** اطلبي تحليل **فيريتين** من أي مختبر. ما نبيعه، بس ننصح به بصدق.

This last callout is the single strongest authority signal on the page — advice that costs us
nothing and gains us everything. Give it real visual weight.

---

## 10. Reviews — `#reviews`

- Eyebrow: تجارب حقيقية
- H2: **وش قالت اللي جرّبت**
- Aggregate row: big `4.8`, gold stars, «من <LTR>{n}</LTR> تقييم» — real numbers only
- Grid of 6 `ReviewCard`s (2-col mobile is too cramped — use 1-col mobile, 3-col desktop)
- Each card: stars, name + city, **week marker** («أسبوع ٦»), 2–3 lines of specific text, verified badge, optional 1:1 photo
- Below: UGC strip — 4–6 square video/photo thumbnails, horizontally scrollable, tapping opens a lightbox
- CTA: `ghost` → شوفي كل التقييمات

> **Compliance:** all launch-time review content is seeded placeholder and must be flagged
> `is_seed = true` and replaced with real reviews before launch (`07` §6, `33`).

---

## 11. Founder / brand story teaser  `[S]` reverse=false

- Eyebrow: من نحن
- H2: **بدأنا أصول لأن الجواب اللي تدورين عليه ما كان موجود**
- 3 short paragraphs, first person plural, warm and specific. No corporate language.
- CTA: `ghost` → اقرأي قصتنا → `/about`
- Media: brand/lifestyle image, 4:5

---

## 12. Honest expectations

`--ivory`, centred, narrow. Message-hierarchy step 6.

- Eyebrow: بصراحة
- H2: **وش نوعدك فيه — ووش ما نوعدك فيه**
- Two columns (stacked on mobile):
  - **نوعدك:** مكوّنات مسمّاة بتراكيز واضحة · نقول لك المدة الحقيقية · دفع عند الاستلام · دعم واتساب حقيقي
  - **ما نوعدك:** نتائج في أسبوع · إنه ينفع لكل الحالات · إنه بديل عن الطبيبة لو التساقط شديد
- Timeline strip: أسبوع <LTR>1–2</LTR> لا فرق ظاهر → <LTR>4–8</LTR> التساقط يقل → <LTR>8–12</LTR> الكثافة تبان

---

## 13. FAQ — `#faq`

8 questions max on the home page (product-specific ones live on product pages). `FAQPage`
JSON-LD required (see `28`).

1. كم ياخذ التوصيل؟
2. الدفع كيف؟
3. لو ما عجبني، أرجّعه؟
4. أي منتج أبدأ فيه؟
5. متى أشوف نتيجة؟
6. آمن للحامل والمرضّعة؟
7. المنتجات أصلية؟ وش يضمن لي؟
8. أقدر أستخدم الثلاثة مع بعض؟

---

## 14. Final CTA

Full-bleed `--brand-900`, centred, generous padding (80px mobile / 120px desktop).

- H2 (`--ivory`): **ابدئي من الأصل**
- Sub (`--gold-200`): اختاري السبب اللي يشبه وضعك — وإذا ما تدرين، ابدئي بالنظام الكامل.
- Primary CTA (`gold` on dark, `xl`): شوفي المنتجات → `/collection`
- Beneath: دفع عند الاستلام · توصيل لكل السعودية · تغليف مقفل

---

## Engineering notes for this page

- Rendering: static with ISR, `revalidate: 300`. Product data comes from `/api/products` at build/revalidate time — the home page must never block on a client fetch.
- Fires `PageView` (deferred, see `23`).
- Scroll-depth tracking at the anchors in `09` §9 → custom event `ScrollDepth` with the section id.
- CTA click tracking: every CTA carries a stable `data-cta` attribute (e.g. `data-cta="home-hero-primary"`) so CRO experiments in `18` can be measured without code changes.
- All sections below the fold use the once-only scroll reveal from `10` §6. The hero and trust strip do not animate.
- Total home page JS budget: ≤ 120KB gzipped (see `28`).
