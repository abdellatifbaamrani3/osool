# 13 — Collection Page + Product Card Anatomy

**Route:** `/collection`
**Job:** route her to the right product page fast, and make the full system the obvious choice
when she does not know which cause is hers.

**Primary KPI:** collection → product page click-through ≥ 70%

With only three products, this page is a **diagnostic router**, not a catalogue. There is no
filtering, no sorting, no pagination, and no faceted search. Adding those would be
sophistication that costs conversions.

---

## 1. Section stack

| # | Section | Notes |
|---|---|---|
| 1 | Page header | Title + positioning line |
| 2 | Trust strip | Same component as elsewhere |
| 3 | The diagnostic router | "وش السبب اللي يشبه وضعك؟" — 3 tappable cause cards |
| 4 | Product grid | 3 `ProductCard`s in canonical cause order |
| 5 | The full system bundle | Highlighted card, the "I don't know" answer |
| 6 | The three causes explainer | Same block as home `#causes`, for those who scrolled past |
| 7 | Routine strip | The 3-step daily/weekly routine |
| 8 | Reviews | Aggregate + 3 cards |
| 9 | FAQ | 6 questions, shipping/payment/returns focused |
| 10 | Final CTA | Dark full-bleed |

---

## 2. Sections in detail

### 2.1 Page header

`--ivory`, centred, generous padding.

- Breadcrumb: الرئيسية / المنتجات
- H1: **ثلاث منتجات. ثلاث أسباب.**
- Sub (`body-lg`, max-w 38rem): كل منتج من أصول يشتغل على سبب من أسباب التساقط الثلاثة. اختاري اللي يشبه وضعك — وإذا ما تدرين، ابدئي بالنظام الكامل.

### 2.2 The diagnostic router — the key section

Three horizontal cards, each phrased as **her own words**, not as a product feature. Tapping
one scrolls to (and briefly highlights) the matching product card.

| Card copy | Routes to |
|---|---|
| «شعري يتساقط وفراغات بدت تظهر» | Serum |
| «تعبانة على طول وشعري ينسدح» | Tonic |
| «فروتي تحكّني وفيها قشور وتراكمات» | Exfoliant |

Styling: `--white` cards, `--sand-200` border, a gold cause numeral at the start edge, chevron
at the end edge (RTL-flipped). 56px min height, comfortable tap targets.

Fourth card, visually distinct (`--gold-100`): «ما أدري وش سببي» → scrolls to the bundle section.

This section is the entire reason this page exists. It converts a browsing decision into a
self-diagnosis, which is a much easier decision to make and a much more committed one.

### 2.3 Product grid

3-up on desktop, **1-up on mobile** (not 2-up — at 390px a 2-column card cannot carry the
heading, subheading, stars, price, and CTA that the card needs to do its job).

Canonical order always: Serum → Tonic → Exfoliant.

### 2.4 The full system bundle

`--brand-900` full-bleed card, gold border.

- Eyebrow (`--gold-300`): النظام الكامل
- H2 (`--ivory`): **ما تدرين وش سببك؟ غطّي الثلاثة.**
- Body: السيروم يوقظ البصيلة، التونك يعمّر المخزون، والمقشّر يفتح الطريق.
- The three product thumbnails in a row with `+` between them
- Primary CTA (`gold`): ابدئي بالسيروم → serum product page

**Why the CTA goes to the serum page rather than adding a bundle SKU to the cart:** there is no
bundle product in the data model, and inventing one would fork the offer ladder. The path we
want is serum page → offer tier → cart → cross-sell → checkout → upsell, which naturally
assembles the full system while passing through every AOV mechanism. Do not add a bundle SKU
in v1.

### 2.5 Remaining sections

Reuse the shared components: `CausesSection`, routine strip, `ReviewCard` grid, `FaqAccordion`,
final dark CTA. No new components needed.

---

## 3. ProductCard anatomy

Used on: collection grid, home `#products`, product page `#system`, cart cross-sell (compact
variant), and the upsell modal (compact variant).

```
┌─────────────────────────────────────────┐
│ [ السبب ① ]                              │  ← gold pill, top-start over image
│                                         │
│           1:1 product image             │
│                                         │
├─────────────────────────────────────────┤
│ ⭐⭐⭐⭐⭐ 4.8 · 132 تقييم                  │  ← rating row
│                                         │
│ سيروم ريدنسل ٣٪ وببتيدات النحاس           │  ← heading (h3)
│ لفراغات وتساقط الشعر — يشتغل على البصيلة   │  ← subheading, 2 lines max, clamped
│                                         │
│ ✓ Redensyl 3% + ببتيدات النحاس            │  ← 2 benefit bullets, gold checks
│ ✓ فرق يبان من 4 إلى 8 أسابيع              │
│                                         │
│ من 199 ريال      [ باقي 23 علبة ]         │  ← price + honest scarcity (only if real)
│                                         │
│ [      تفاصيل المنتج      ]              │  ← primary CTA, full width
│ [      أضيفي للسلة        ]              │  ← secondary, adds default tier
└─────────────────────────────────────────┘
```

### 3.1 Element rules

| Element | Rule |
|---|---|
| Cause pill | `--gold-500` bg, `--brand-900` text, top-start over the image. Always present. |
| Image | 1:1, `next/image`, `sizes` set. First card on the collection page gets `priority`. |
| Rating row | Gold stars + numeric value + count, links to the product page `#reviews`. Omit entirely if there are no real reviews yet — never show `0 تقييم`. |
| Heading | `h3`, 2 lines max, `line-clamp-2`, product short name |
| Subheading | `body-sm`, `--ink-soft`, 2 lines max, the benefit-oriented sub from `12` §19 |
| Benefit bullets | Exactly 2, one line each, gold `check` glyph |
| Price | «من <LTR>199</LTR> ريال» — "من" (from) is important: it signals the ladder starts here without implying 199 is the only price |
| Scarcity chip | Only if `stock_count` is real and below the threshold. Omit otherwise. See `18`. |
| Primary CTA | تفاصيل المنتج → product page. **This is the primary action on a collection card**, because the product page converts far better than a blind add. |
| Secondary CTA | أضيفي للسلة → adds the **default (tier B)** offer and opens the cart drawer |

### 3.2 Why "details" is primary and "add" is secondary

On cold traffic, an add-to-cart from a collection card skips the entire education stack and
produces a materially lower checkout completion rate and lower AOV. We still offer the fast
path for returning buyers, but we make the educated path the default. On the **cart cross-sell**
and **upsell** variants this inverts: there, adding is primary because she is already committed.

### 3.3 Variants

| Variant | Where | Differences |
|---|---|---|
| `default` | Collection, home | Full anatomy as above |
| `compact` | Cart cross-sell, product page `#system` | Horizontal layout, 80px thumb, no benefit bullets, single `أضيفي — 199 ريال` primary button, plus the cause-based reason line from `08` §2 |
| `upsell` | Upsell modal | Large image, `99` price with real `199` struck through, the "why this one" reason, no secondary CTA |

### 3.4 States

- Loading: skeleton with exact reserved dimensions (image box, 2 text lines, button)
- Out of stock: image at 60% opacity, «نفدت الكمية» pill, CTA becomes a disabled `secondary`, and a «خبّريني لما ترجع» WhatsApp link replaces it
- Just added (cross-sell/compact): button becomes a `check` + «تم» for 1.5s before reverting

---

## 4. Engineering notes

- Static + ISR, `revalidate: 300`. Data from `/api/products`.
- Fires `PageView` and `ViewContentList` (Meta `ViewContent` with `content_type: 'product_group'`, TikTok `ViewContent`, Snap `LIST_VIEW`) with all three `content_ids`.
- `ItemList` JSON-LD listing the three products (see `28`).
- The diagnostic router cards use smooth `scrollIntoView` plus a 1.2s `--gold-100` background flash on the target card so the connection is unmistakable.
- `data-cta` values: `collection-router-{cause}`, `collection-card-details-{slug}`, `collection-card-add-{slug}`, `collection-bundle-cta`.
- Adding from a card fires `AddToCart` with a fresh `event_id` shared with the server CAPI call (`23`, `24`).
