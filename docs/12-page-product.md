# 12 — Product Page Blueprint (the money page)

**Route:** `/products/[slug]`
**Job:** take a cold, sceptical, problem-aware Saudi woman from a Snapchat/TikTok tap to an
add-to-cart, in one scroll, on a phone.

**This is where the money is made.** Build it first, build it best, and spend
disproportionate effort here. The other pages support it.

**Primary KPI:** product page → add-to-cart ≥ 12%
**Secondary:** offer tier B or C selected on ≥ 65% of add-to-carts; scroll past `#evidence` ≥ 40%

---

## 1. Two audiences, one page

The page must serve both without penalising either:

| Audience | Share | Need | Served by |
|---|---|---|---|
| **Ready buyer** | ~15% | Buy in 10 seconds | Offer block above the fold + sticky ATC present from the start |
| **Sceptic** | ~85% | Understand, then trust, then buy | The full 16-section stack below |

The resolution is: **the offer is always one tap away** (sticky bar), and **the education is
always available** (long scroll). Never force the sceptic to scroll past a wall of sell, and
never make the ready buyer hunt for the button.

---

## 2. Section stack

`[S]` = alternating split section (`10` §3.1). Note how `reverse` alternates so the page has
visual rhythm rather than a repeating template feel.

| # | Section | Layout | Anchor | Message-hierarchy step (`04` §6) |
|---|---|---|---|---|
| 1 | Breadcrumbs | inline | — | — |
| 2 | Product hero: gallery + offer block | 2-col / stacked | `#offer` | 1 + 7 |
| 3 | Trust strip | 4-up | — | 8 |
| 4 | Recognition | centred | — | 1 |
| 5 | The three causes (this one highlighted) | 3-up | `#causes` | 2 |
| 6 | How it works / mechanism | `[S]` reverse=false | `#mechanism` | 3 |
| 7 | What's inside, and at what % | table + panel | `#ingredients` | 3 |
| 8 | The evidence | cards + footer | `#evidence` | 4 |
| 9 | Honest timeline | horizontal steps | `#timeline` | 6 |
| 10 | Reviews + UGC | grid + strip | `#reviews` | 5 |
| 11 | Why not the alternatives | comparison | `#comparison` | 2 |
| 12 | How to use | `[S]` reverse=true | `#howto` | — |
| 13 | Complete the system (cross-sell) | 2-up | `#system` | 7 |
| 14 | Safety & who it's not for | callout | `#safety` | 6 |
| 15 | FAQ | accordion | `#faq` | all objections |
| 16 | Final offer repeat | full-bleed dark | — | 7 + 8 + 9 |
| — | Sticky ATC bar | fixed bottom | — | 7 |

**Section order rationale.** Reviews (10) come *after* evidence (8) and timeline (9), not
before. On cold traffic, social proof lands much harder once she already believes the mechanism
— proof of *something she understands* is persuasive; proof of something she does not understand
reads as noise. Comparison (11) comes after reviews because by then she is choosing between
options rather than deciding whether to care.

---

## 3. Section 2 — Product hero

The single most important 600 pixels on the site.

**Layout.** Desktop: 2 columns, gallery `6` / offer block `6`, gallery on the **left (end)**,
offer block on the **right (start)** — so the RTL reader hits the name, rating, price, and offer
selector first. Mobile: gallery, then everything else stacked.

### 3.1 Gallery (left / first on mobile)

- Main image 1:1, 4 thumbnails beneath (5 total assets — see `31` for the placeholder spec)
- Swipeable on mobile with dot indicators; **RTL swipe direction must be configured explicitly**
- Thumbnails: 4-up row, 64px, selected thumb has a `--gold-500` 2px ring
- Tap main image → lightbox with pinch-zoom
- Asset plan per product: (1) product on ivory, (2) product in hand / lifestyle, (3) texture macro, (4) ingredient/mechanism graphic, (5) before/after **only if** we hold documented consent — otherwise a routine graphic
- Overlay badge, top-start corner of the main image: `--gold-500` pill with the cause number, e.g. «يشتغل على السبب ①»
- LCP element on this page. `priority`, `fetchPriority="high"`, exact reserved dimensions.

### 3.2 Offer block (right / second on mobile)

Order of elements is deliberate — do not rearrange:

1. **Cause tag** (`label`, `--gold-600`): السبب ① — البصيلة النائمة
2. **H1** (`h1`): سيروم ريدنسل ٣٪ وببتيدات النحاس
3. **Subheading** (`body-lg`, `--ink-soft`): لفراغات وتساقط الشعر — يشتغل على البصيلة نفسها، مو على الشعرة
4. **Rating row:** gold stars + `4.8` + «<LTR>{n}</LTR> تقييم» (links to `#reviews`) + a `check-circle` «تقييمات موثّقة» badge
5. **Benefit bullets** — exactly 3, each one line, each with a gold `check`:
   - يستهدف البصيلة النائمة ويساعدها ترجع لمرحلة النمو
   - <LTR>Redensyl 3%</LTR> + ببتيدات النحاس — التركيز مكتوب، ما فيه شي مخفي
   - أول فرق يبان من <LTR>4</LTR> إلى <LTR>8</LTR> أسابيع بالاستخدام اليومي
6. **`OfferSelector`** — the 3-tier ladder (§5)
7. **Per-day reframe** (`body-sm`, `--muted`): يعني أقل من <LTR>5</LTR> ريال باليوم
8. **Primary CTA** (`xl`, full width, 56px): **أضيفي للسلة — <LTR>{price}</LTR> ريال**
9. **Under-CTA reassurance row** (3 items, `body-sm`, icons in `--brand-600`):
   دفع عند الاستلام · توصيل <LTR>2–4</LTR> أيام · تغليف مقفل
10. **Honest scarcity line** — only if real (see `18` §honest urgency): «باقي <LTR>{n}</LTR> علبة من هذي الدفعة»
11. **Accordion trio** (collapsed by default): المكوّنات كاملة · طريقة الاستخدام · التوصيل والإرجاع

### 3.3 What must NOT be in the hero

- Quantity steppers (the offer tiers *are* the quantity choice — two competing quantity controls confuse and depress AOV)
- A wishlist / heart icon (no accounts in v1; it is a dead end)
- Size or variant selectors (single SKU per product)
- A second CTA competing with add-to-cart (no "buy now" bypass; everything routes through the cart drawer so cross-sell always gets its shot)
- Long paragraphs — the hero is scannable only

---

## 4. Sticky add-to-cart bar

Appears when `#offer` scrolls out of the viewport (IntersectionObserver, not a scroll listener).

**Mobile** — fixed bottom, 68px, `--white` background, top border `--sand-200`, `--shadow-lg`:

```
[right]  [ 48px product thumb ]  السيروم · قطعتين          [ أضيفي — 279 ريال ]  [left]
```

**Desktop** — same, but include the compact offer selector inline so the tier can be changed
without scrolling back up.

Rules:

- Slides up 250ms `--ease-out` on first appearance; no animation on subsequent toggles.
- Shifts the WhatsApp FAB up by 68px while visible.
- Respects `env(safe-area-inset-bottom)` on iOS.
- Price updates live with the selected tier.
- Hidden while the cart drawer, checkout modal, or upsell is open.
- `data-cta="pdp-sticky-atc"`.

---

## 5. OfferSelector spec

The highest-AOV-leverage component on the site.

### 5.1 Markup and behaviour

- Semantic radio group: `role="radiogroup"` with `aria-label="اختاري العرض"`, each tier a `role="radio"`, arrow keys navigate, `Space`/`Enter` selects.
- **Tier B pre-selected on mount**, driven by `offers.is_default` from the API (`08` §7) — not hardcoded in the component.
- Mobile: vertical stack, full width, 12px gaps. Desktop: 3-across grid, equal heights.
- Selection change → update sticky ATC price with a 150ms count-up, no layout shift.
- URL reflects the selection (`?offer=2`) so tier choice survives a refresh and can be deep-linked from ads.

### 5.2 Card anatomy

```
┌──────────────────────────────────────────────┐
│  ◉  قطعتين                    [ الأكثر طلباً ] │  ← badge, gold pill, top-end
│     شهرين — المدة اللي الفرق يبان فيها          │
│                                              │
│     279 ريال            139 ريال للقطعة       │  ← total large tabular / per-unit muted
│     ─────────                                │
│     توفير 119 ريال                            │  ← gold-600
└──────────────────────────────────────────────┘
```

| State | Styling |
|---|---|
| Default | `--white` bg, `1px solid --sand-200`, `--radius-lg` |
| Hover (desktop) | border `--brand-100`, `--shadow-sm` |
| **Selected** | `2px solid --gold-500`, bg `--gold-100`, filled radio, `--shadow-md` |
| Focus-visible | `outline: 2px solid --brand-600`, offset 2px |

### 5.3 Content per tier

| Tier | Title | Subtitle | Badge |
|---|---|---|---|
| 1 | قطعة واحدة | تجربة شهر | — |
| 2 | قطعتين | شهرين — المدة اللي الفرق يبان فيها | الأكثر طلباً |
| 3 | ٣ قطع | ٣ شهور — النتيجة الكاملة | أفضل قيمة |

Tier 3 also shows a small gold `crown`/`sparkle` glyph. Do not add a fourth tier.

---

## 6. Section 5 — The three causes (product-page variant)

Same content as `11` §5, with one critical difference: **this product's cause is visually
elevated** and the other two are dimmed but clickable.

- The active cause card: `--gold-500` border, full opacity, a «هذا اللي يشتغل عليه هذا المنتج» tag
- The other two: 70% opacity, and each links to its product page
- Below the three cards: «تبغين تغطين الأسباب الثلاثة؟» → jumps to `#system`

This single treatment does two jobs at once: it positions the current product precisely, and it
plants the bundle idea early enough that the cart cross-sell later feels like a conclusion she
reached herself.

---

## 7. Section 6 — Mechanism `[S]` reverse=false

- Eyebrow: كيف يشتغل
- H2: **يشتغل على البصيلة، مو على الشعرة**
- The three-panel mechanism story from the product's dossier (`06`), as numbered steps with a
  small illustration each
- Media: mechanism diagram, 4:5. Must be legible at 390px — if the diagram needs more than
  three labels, simplify it.

---

## 8. Section 7 — What's inside — `#ingredients`

- Eyebrow: المكوّنات
- H2: **وش فيه بالضبط، وبأي تركيز**
- Sub: كل مكوّن فعّال مكتوب بنسبته. ما فيه "خلاصات طبيعية" مجهولة.
- Table (cards stacked on mobile), one row per active from the dossier: name (Latin, `<LTR>`),
  concentration, role in plain Arabic
- Below: an accordion «القائمة الكاملة (<LTR>INCI</LTR>)» with the full ingredient list
- And a "what's deliberately not in it" row — parabens, sulfates, silicones, artificial
  fragrance, as applicable. Confirm against the actual supplier INCI before claiming any of
  these (`33`).

---

## 9. Section 8 — The evidence — `#evidence`

`--sand-100` background. This section is what justifies 199 SAR.

- Eyebrow: بالدليل
- H2: **الأرقام، ومن وين جت**
- 2–3 evidence cards. Each card has three mandatory parts:
  1. **The number** (large, gold): e.g. <LTR>+9%</LTR> شعر في مرحلة النمو
  2. **The source** (`body-sm`): who ran it, on what, for how long, with how many people
  3. **The limit** (`body-sm`, `--muted`, in a bordered box): sample size, in-vitro vs clinical, different formulation
- For the tonic page, include the **mixed-evidence disclosure** from `06` verbatim, plus the
  ferritin-test callout. It converts better than a one-sided claim would.
- Section footer: the standard evidence footer from `07` §5, verbatim, on every product page.

**Compliance gate:** no number appears here that is not traceable to a real, named source in
`06`. Inventing a statistic here is the fastest way to lose the ad accounts and the store.

---

## 10. Section 9 — Honest timeline — `#timeline`

- Eyebrow: بصراحة
- H2: **متى تشوفين فرق؟ خلّينا نكون واضحين**
- Horizontal 4-step timeline (vertical on mobile), from the product's dossier table
- Deliberately include the "possible temporary increase in shedding weeks 2–3" step on the
  serum page. Setting this expectation prevents refund requests and confirmation-call
  cancellations *and* increases credibility.
- Closing line: الاستمرارية هي كل شي. لهذا عرض الشهرين والثلاث شهور هو الأنسب.
  → inline link back to `#offer`

---

## 11. Section 10 — Reviews — `#reviews`

- Aggregate row: `4.8`, stars, review count, and a distribution bar chart (5★ … 1★)
- **Include some 4-star and at least one 3-star review.** An all-5-star wall reads fake; a
  visible distribution with a mild criticism that we answer converts better.
- 6 `ReviewCard`s, 1-col mobile / 3-col desktop, each with name + city + **week marker** + stars + specific text + verified badge
- Filter chips: الكل · مع صور · ٥ نجوم · ٤ نجوم
- UGC strip: 4–6 square thumbnails, horizontal scroll, lightbox on tap
- CTA: `ghost` → شوفي كل التقييمات

> All launch content is seeded (`is_seed = true`) and must be replaced with real reviews before launch (`07` §6).

---

## 12. Section 11 — Comparison — `#comparison`

- H2: **ليش أصول ومو الخيارات الثانية؟**
- Comparison table, us vs three alternatives: زيوت · بيوتين/فيتامينات · سيروم مجهول من متجر كبير
- Rows: تركيز مكتوب · يوصل للبصيلة · دراسات على المكوّن · دفع عند الاستلام · دعم بعد الشراء · مدة واقعية معلنة
- **Never name a competitor brand.** Compare against product *categories* only — naming
  competitors invites legal exposure and violates the spirit of E-Commerce Law Art. 11.
- Mobile: transform into stacked cards, one per alternative. A horizontally scrolling table at
  390px is unusable.
- We do not mark ourselves ✓ on everything. Two honest ✗ or "—" rows (e.g. «نتيجة فورية: لا»)
  make the whole table believable.

---

## 13. Section 12 — How to use `[S]` reverse=true — `#howto`

- Eyebrow: طريقة الاستخدام
- H2: **دقيقة واحدة باليوم**
- Numbered steps from the dossier: dose, method, frequency, ordering relative to the other products
- A «متى ما تستخدمينه» warning box (`--urgent-bg`) for contraindications
- Media: application photo/graphic, 4:5

---

## 14. Section 13 — Complete the system — `#system`

Pre-frames the cart cross-sell so the drawer feels like a continuation, not an interruption.

- Eyebrow: النظام الكامل
- H2: **أنتِ تغطين سبب واحد. باقي سببين.**
- Two compact `ProductCard`s for the other products, each with its cause number and the reason
  line from the pairing table in `08` §2
- Each has an inline `أضيفي — 199 ريال` button that adds directly to the cart and opens the drawer
- Below: a full-system nudge — «الثلاثة مع بعض» with the combined routine graphic

---

## 15. Section 14 — Safety — `#safety`

Callout box, `--brand-50` background, `shield-check` icon.

- H3: **الأمان والاستخدام**
- The full safety list from the product dossier
- Patch-test instruction
- Pregnancy/breastfeeding line
- Dermatologist-referral line: لو التساقط شديد أو مفاجئ أو مع أعراض ثانية، راجعي طبيبة جلدية.
- **On the tonic page only:** all mandatory supplement warnings from `07` §4.2, including the
  keep-away-from-children iron warning, given visual prominence — not buried in small print.

---

## 16. Section 15 — FAQ — `#faq`

10–12 questions from the product dossier's objections table plus delivery/payment/returns.
Ordered by how early the objection arises. `FAQPage` JSON-LD (`28`).

---

## 17. Section 16 — Final offer repeat

Full-bleed `--brand-900`. She has read 4,000 words; close her.

- H2 (`--ivory`): **جاهزة تبدأين من الأصل؟**
- Compact offer selector, same state as the top one (shared state — changing one changes the other)
- Primary CTA (`gold` on dark, `xl`): أضيفي للسلة — <LTR>{price}</LTR> ريال
- Reassurance row: دفع عند الاستلام · ولا ريال قبل ما يوصلك · تغليف مقفل
- One short testimonial pull-quote beneath, with name and city

---

## 18. Engineering notes

**Rendering**

- `generateStaticParams` for all three slugs, static + ISR `revalidate: 300`.
- Product data (including offers) from `/api/products/{slug}` at build/revalidate time. The page must render fully without any client fetch.
- Reviews may be client-fetched **below the fold only**, with skeletons that reserve exact height.

**State**

- Selected offer: local component state, mirrored to the URL (`?offer=2`), shared between the hero selector and the final selector via a small context or a Zustand slice.
- Cart: Zustand store persisted to `localStorage` (`19` §5).

**Tracking** (details in `23`)

- On mount: `PageView`, `ViewContent` with `content_ids`, `content_name`, `value` (selected tier price), `currency: 'SAR'`
- On tier change: custom `SelectOffer` with the tier and value
- On add-to-cart: `AddToCart` with the selected tier's value and quantity — **one `event_id` minted here and shared with the server-side CAPI call**
- Scroll depth at each anchor from `09` §9
- Every CTA carries `data-cta`: `pdp-hero-atc`, `pdp-sticky-atc`, `pdp-final-atc`, `pdp-system-add-{slug}`

**Performance** (budgets in `28`)

- LCP = the main gallery image. Preload it, do not lazy-load it, reserve its box.
- Below-the-fold sections: `next/dynamic` for the lightbox, review filters, and comparison table.
- No layout shift when fonts load — use `size-adjust`/fallback metrics in the font config.
- Page JS budget ≤ 160KB gzipped.

**Accessibility**

- One `h1` (the product name). Section headings are `h2`, sub-items `h3`.
- Offer selector fully keyboard operable as a radio group.
- Sticky ATC must not obscure the last section's content — add `padding-block-end: 88px` to the page on mobile.

---

## 19. Per-product content mapping

The page is one component tree; the content differs per product. All strings come from the
dossier in `06` and are stored in the database or in `content/products/*.ts` — never inline.

| Slot | Serum | Tonic | Exfoliant |
|---|---|---|---|
| Cause tag | السبب ① البصيلة النائمة | السبب ② المخزون الفاضي | السبب ③ الفروة المخنوقة |
| H1 | سيروم ريدنسل ٣٪ وببتيدات النحاس | تونك حديد بيسجليسينات وفيتامين <LTR>C</LTR> | مقشّر فروة ساليسيليك ٢٪ وزنك |
| Sub | لفراغات وتساقط الشعر | لدعم الشعر المتساقط والإرهاق | لتراكمات وحكة الفروة |
| Hook (mechanism H2) | يشتغل على البصيلة، مو على الشعرة | التساقط ما يوقف لو المخزون من جوّه فاضي | فروة نظيفة = بصيلة تتنفّس |
| Extra required section | — | **Supplement warnings + ferritin-test callout + mixed-evidence disclosure** | Frequency warning (max 2×/week) |
| Cross-sell priority | Tonic, then Exfoliant | Serum, then Exfoliant | Serum, then Tonic |
