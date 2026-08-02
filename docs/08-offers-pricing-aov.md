# 08 — Offers, Pricing, and AOV Architecture

The whole revenue model lives here. Four stacked mechanisms, each with a different job.

```
1. OFFER LADDER      per product, 199 / 279 / 349     → raises units per line
2. CART CROSS-SELL   other products in the system      → raises lines per order
3. POST-CHECKOUT     one product at 99 SAR, timed      → raises order value after commitment
4. COD FRAMING       pay nothing now                   → raises conversion on all of the above
```

---

## 1. The offer ladder

Identical for all three products. Same prices, same structure, same copy pattern — this
consistency is itself a trust signal and makes the cross-sell arithmetic obvious to her.

| Tier | Qty | Price | Per unit | Saving vs 1× | Duration | Label |
|---|---|---|---|---|---|---|
| A | 1 | **199 SAR** | 199 | — | ~1 month | تجربة شهر |
| B | 2 | **279 SAR** | 139.5 | 119 SAR (30%) | ~2 months | الأكثر طلباً |
| C | 3 | **349 SAR** | 116.33 | 248 SAR (42%) | ~3 months | أفضل قيمة |

### Why this ladder works

- **Tier B is the intended default.** The jump from 199 → 279 costs only 80 SAR for a second
  unit — an obviously good deal — while Tier C at 349 anchors the whole set and makes B look
  moderate. Classic decoy structure, and the middle option carries the social-proof label.
- **The duration framing does the persuading, not the discount.** The honest timeline in `06`
  says results need 8–12 weeks. So Tier A is *self-evidently insufficient* — and we say so
  plainly rather than hiding it. «النتيجة تحتاج شهرين على الأقل» converts to Tier B or C
  without a single manipulative word.
- **No fake struck-through prices.** The only comparison shown is against *our own* single-unit
  price, which is genuinely true. Inventing a "was 499 SAR" violates E-Commerce Law Article 11
  and Saudi buyers spot it.

### Selection behaviour (see `12` for full spec)

- Tier **B is pre-selected on page load**. Never leave nothing selected.
- Tiers are large tappable cards, stacked vertically on mobile, in a 3-across row on desktop.
- Selected tier: 2px `--gold-500` ring, `--gold-100` background, radio filled.
- Each card shows: quantity title, duration subtitle, total price (large, tabular), per-unit
  price, saving badge, and — on B and C — the label badge.
- Changing tier updates the sticky ATC price with a 150ms count animation. No page reload,
  no layout shift.

### Per-day reframe

Place directly beneath the selector. This is the single highest-leverage price-objection
handler on the page.

| Tier | Maths | Copy |
|---|---|---|
| A | 199 ÷ 30 | يعني أقل من ٧ ريال باليوم |
| B | 279 ÷ 60 | يعني أقل من ٥ ريال باليوم |
| C | 349 ÷ 90 | يعني أقل من ٤ ريال باليوم |

Supporting comparison line: «جلسة واحدة في العيادة تكلّف أكثر من نظام أصول كامل.»
Never mention competitor brands or their prices by name.

---

## 2. Cart cross-sell

**Job:** convert a one-product order into a system order. This is where the three-cause model
pays for itself.

### Logic

```
in_cart = set of product_ids in cart
missing = [serum, tonic, exfoliant] - in_cart   (kept in canonical cause order)

if len(missing) == 0:  show routine reassurance block, no cross-sell
else:                  show up to 2 cross-sell cards, ordered by the pairing table below
```

### Pairing priority

| She has | Show first | Show second | Reason line shown on the card |
|---|---|---|---|
| Serum | **Tonic** | Exfoliant | «السيروم يوقظ البصيلة — بس لو المخزون فاضي، النتيجة تكون أبطأ» |
| Tonic | **Serum** | Exfoliant | «التونك يعمّر المخزون من جوّه — والسيروم يشتغل على البصيلة من فوق» |
| Exfoliant | **Serum** | Tonic | «فتحتِ الطريق. الآن السيروم يوصل للبصيلة فعلياً» |
| Serum + Tonic | **Exfoliant** | — | «باقي خطوة: فروة نظيفة عشان السيروم يوصل» |
| Serum + Exfoliant | **Tonic** | — | «باقي سبب واحد: المخزون من الداخل» |
| Tonic + Exfoliant | **Serum** | — | «باقي القطعة اللي تشتغل على البصيلة نفسها» |

### Cross-sell card price

Cross-sell adds at **single-unit price, 199 SAR** — not discounted. The 99 SAR discount is
reserved exclusively for the post-checkout upsell, so it retains its power. Keeping the cart
cross-sell at full price also protects the perceived value of the products.

Card contents: image, short name, the cause it covers, the reason line from the table, price,
and a one-tap `أضيفي` button that adds and animates without closing the drawer.

**Header copy:** كمّلي النظام
**Sub copy:** أنتِ غطيتِ سبب واحد. باقي سببين.  *(pluralised correctly based on `len(missing)`)*

---

## 3. Post-checkout upsell — 99 SAR

**Job:** capture incremental value at the single moment of maximum commitment — after she has
submitted her name and phone, before the thank-you page. She has already decided; the
psychological cost of adding one more item is at its lowest point of the entire funnel.

### Rules

- **This is the only place on the entire site where a product is discounted below 199.**
- **One product only.** A choice here re-opens deliberation and kills the take rate.
- Price: **99 SAR** (vs 199 normal) — presented honestly as a one-time post-order offer.
- Timer: **10–15 seconds** (use 15; 10 is too tight to read the value prop on a phone). Server
  authoritative — see §3.3.
- **The order is already saved before the upsell appears.** If she closes the tab, abandons, or
  her connection drops, we still have a complete order. This is non-negotiable.
- One tap to accept, one tap to decline. Decline is visible, not hidden, and not a tiny grey link — a hidden decline button reads as a scam and costs more in trust than it gains in take rate.
- Shipping does not increase. Say so: «نفس التوصيل، ولا ريال إضافي.»

### 3.1 Which product to offer

Pick the highest-priority product **not already in the order**, using the same canonical order:

| Order contains | Upsell | Why-this-one copy |
|---|---|---|
| Serum only | **Exfoliant** at 99 | «فروة نظيفة تخلّي السيروم يوصل للبصيلة. هذي الخطوة اللي تفرق.» |
| Tonic only | **Serum** at 99 | «التونك يشتغل من جوّه. السيروم يشتغل على البصيلة. مع بعض أسرع.» |
| Exfoliant only | **Serum** at 99 | «فتحتِ الطريق — الآن خلّي السيروم يستفيد منه.» |
| Serum + Tonic | **Exfoliant** at 99 | «باقي خطوة واحدة عشان النظام يكتمل.» |
| Serum + Exfoliant | **Tonic** at 99 | «باقي سبب واحد: المخزون من الداخل.» |
| Tonic + Exfoliant | **Serum** at 99 | «باقي القطعة اللي تشتغل على البصيلة.» |
| All three | **Serum** (a second unit) at 99 | «علبة إضافية من السيروم — الاستمرارية شهرين إضافية.» |

Fallback if the logic ever produces nothing: offer the Exfoliant. Never show an empty upsell.

### 3.2 Screen anatomy

Full-screen on mobile, centred modal on desktop. Contents in order:

1. Small green confirmation: «تم حفظ طلبك <LTR>#{id}</LTR>» — so she knows she is safe regardless of what she does next
2. Eyebrow: «عرض خاص — لهذي المرة فقط»
3. Countdown: «العرض ينتهي بعد <LTR>{s}</LTR> ثانية» with a thin depleting progress bar
4. Product image + name
5. Price: `99` prominent, `199` struck through beside it (this struck price is **real** — it is our actual single-unit price)
6. Two-line reason from the table in §3.1
7. Primary CTA: «أضيفيه بـ <LTR>99</LTR> ريال»
8. Secondary: «لا شكراً، أكملي طلبي»
9. Reassurance line: «نفس الطلب، نفس التوصيل، ولا ريال إضافي على التوصيل.»

### 3.3 Timer integrity

The timer must be honest, because a fake one that resets is one of the anti-trust signals in
`03` §6.

- The backend returns `upsell_expires_at` (ISO 8601) with the order-create response.
- The countdown renders against that server timestamp, not a client-side `setTimeout` counter.
- On expiry the upsell **actually expires**: the accept endpoint rejects with `410 Gone` after
  `upsell_expires_at`, and the UI auto-advances to the thank-you page.
- Refreshing does not grant a new window. The window belongs to the order.
- Copy is honest: it says *this offer*, for *this order*, ends in N seconds — which is true.

### 3.4 Accept flow

`POST /api/orders/{id}/upsell` → appends the item at 99, recalculates the total, re-pushes to
the Sheets webhook as an **update** (not a duplicate row — see `25`), re-fires the `Purchase`
event with the corrected value using **a new `event_id`** for the delta event, then redirects to
thank-you.

> **Tracking decision (important, do not improvise):** fire `Purchase` **once** at order
> creation with the pre-upsell value, then fire a separate `Purchase` for the upsell delta
> with its own `event_id` and `order_id = {id}-upsell`. Do *not* re-fire the original
> `event_id` with a new value — platforms deduplicate on `event_id` and will discard it,
> and you would lose the incremental revenue in reporting. See `24` §7.

---

## 4. COD as an offer mechanism

COD is not a limitation to apologise for. It is the strongest risk-reversal device available
and it must be sold as one, in these five places:

| Where | Copy |
|---|---|
| Trust strip (every page) | دفع عند الاستلام — ولا ريال قبل ما يوصلك |
| Offer block | ما تدفعين الآن. تدفعين للمندوب عند الاستلام. |
| Cart drawer footer | الدفع كاش عند الاستلام |
| Checkout modal, under the CTA | ما نطلب بطاقة ولا تحويل. اسمك ورقمك وبس. |
| Thank-you page | تدفعين كاش للمندوب عند الاستلام |

Related framings that reduce hesitation without over-promising:
- «تقدرين ترفضين الاستلام» — true under the statutory framework, and it collapses risk to zero
- «التغليف مقفل وما فيه أي تفاصيل عن المنتج من الخارج» — addresses the privacy concern
- «التوصيل مجاني لكل السعودية» — only if actually true; confirm with the owner (see `27`)

---

## 5. AOV model

### Scenario maths

| Scenario | Composition | Order value |
|---|---|---|
| Floor | 1 product, Tier A | 199 |
| Common | 1 product, Tier B | 279 |
| Good | 1 product, Tier B + upsell | 378 |
| Strong | 1 product Tier B + cross-sell 1 unit | 478 |
| Best | 1 product Tier C + cross-sell + upsell | 647 |

### Target mix at launch

| Tier | Share | Contribution |
|---|---|---|
| A (199) | 35% | 69.65 |
| B (279) | 45% | 125.55 |
| C (349) | 20% | 69.80 |
| **Base AOV** | | **265** |
| + cross-sell: 15% attach × 199 | | +29.85 |
| + upsell: 18% take × 99 | | +17.82 |
| **Blended AOV** | | **≈ 312 SAR** |

This comfortably clears the ≥270 target in `01`. If blended AOV comes in under 270, the
diagnosis order is: (1) is Tier B actually pre-selected and visually dominant, (2) does the
cart drawer actually show cross-sells above the fold, (3) is the upsell firing at all.

### Levers, ranked by impact per unit of effort

1. **Tier B pre-selected and labelled الأكثر طلباً** — largest single effect, near-zero effort
2. **Duration framing in tier subtitles** («شهرين»، «٣ شهور») — ties price to the honest timeline
3. **Cross-sell above the fold in the cart drawer**, with the cause-based reason line
4. **Upsell take rate** — one product, 15s, one tap, honest timer
5. **Per-day reframe** under the selector
6. **Free-shipping framing** at the order level (if true)

Levers we deliberately do **not** pull: fake urgency, hidden decline buttons, pre-checked
add-ons, forced quantity defaults above 1 in the cart, or any dark pattern. They raise
short-term AOV and destroy COD confirmation rates — a customer who feels tricked refuses the
parcel, and we eat the shipping both ways.

---

## 6. Price display rules

- Integers only. `199`, never `199.00` or `199.99`.
- Currency word after the number: `199 ريال`.
- Wrap every price in `<bdi dir="ltr">` (see `05` §4).
- `font-variant-numeric: tabular-nums` on all prices, totals, and timers.
- Struck-through prices are permitted **only** for: (a) the per-unit comparison against our own
  199 single-unit price, and (b) the 99 SAR upsell against 199. Both are true statements.
- «الأسعار شاملة ضريبة القيمة المضافة» appears in the cart drawer footer and the checkout modal.
- Never display SAR as `ر.س` in the UI; use `ريال`. `SAR` appears only in code, API payloads, and CSV exports.

---

## 7. Data model implications

Offers are **database rows, not hardcoded constants**, so pricing can change without a deploy.
See `21` for the schema.

```
offers
  id, product_id, qty, price_sar, per_unit_sar (computed),
  badge_ar ('الأكثر طلباً' | 'أفضل قيمة' | null),
  duration_label_ar ('تجربة شهر' | 'شهرين' | '٣ شهور'),
  is_default (bool — exactly one true per product),
  sort_order, is_active
```

Constraints the backend must enforce:

- Exactly one `is_default = true` per product (partial unique index)
- `price_sar > 0`, `qty >= 1`
- The upsell price (99) lives in `settings` as `upsell_price_sar`, not hardcoded
- The upsell window length lives in `settings` as `upsell_window_seconds` (default 15)
- **The server always recomputes the price from the offer row.** Never trust a client-supplied
  price. A client that posts `price: 1` must get the real 199. See `22` §validation and `29`.
