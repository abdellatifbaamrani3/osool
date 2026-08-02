# 17 — Thank-You Page and Post-Purchase

**Route:** `/thank-you/[orderId]` — `noindex, nofollow`

**Job:** three things, in priority order:

1. **Protect the confirmation call.** A submitted COD order is only revenue once she answers the
   phone. This page is our only chance to set that expectation. It is the highest-ROI page on
   the site that nobody optimises.
2. Reassure and reduce buyer's remorse (which shows up as refused deliveries).
3. Seed the next purchase and the review.

**KPI it moves:** confirmation rate (target ≥ 65%, see `01` §4) — worth more per point than
almost any conversion-rate optimisation elsewhere.

---

## 1. Section stack

| # | Section | Priority |
|---|---|---|
| 1 | Confirmation header | — |
| 2 | **"وش يصير الآن؟"** — 3 steps | **Highest** |
| 3 | **The save-our-number ask** | **Highest** |
| 4 | Order summary | — |
| 5 | How to use it correctly | High |
| 6 | Honest expectations reminder | High |
| 7 | Cross-sell / next step | Medium |
| 8 | Support | — |
| 9 | Review request seed | Low |

---

## 2. Confirmation header

`--brand-50` background, centred, generous padding.

- Large `check-circle` in `--brand-600` (a single 400ms scale-in; no confetti)
- H1: **تم — طلبك وصلنا**
- Sub: رقم طلبك <LTR>#{orderNumber}</LTR>
- Line: «حفظنا طلبك على الرقم <LTR>{phone masked: 055 *** 4567}</LTR>»

---

## 3. "وش يصير الآن؟" — the three steps

The most important block on the page. A numbered vertical timeline with gold numerals.

| # | Title | Body |
|---|---|---|
| ١ | **نكلّمك للتأكيد** | نتواصل معك على <LTR>{phone}</LTR> خلال <LTR>24</LTR> ساعة نأكد الطلب ونأخذ عنوانك بالتفصيل. |
| ٢ | **نشحنه** | بعد التأكيد نجهّز طلبك ويوصلك خلال <LTR>2–4</LTR> أيام عمل. التغليف مقفل وما فيه أي تفاصيل من الخارج. |
| ٣ | **تدفعين عند الاستلام** | <LTR>{total}</LTR> ريال كاش للمندوب. ولا ريال قبل. |

Note step 1 explicitly says we will take her **address** on the call. That is why the checkout
form did not ask for it (`16` §2), and saying so here closes the loop so the omission reads as
considerate rather than broken.

---

## 4. The save-our-number ask

Set apart in a bordered `--urgent-bg` callout with a `phone` glyph. This single block is the
highest-leverage element on the page.

- H3: **مهم — احفظي رقمنا**
- Body: كثير من الطلبات ما تُشحن لأن المكالمة ما تجاوب عليها. احفظي رقمنا الآن، وإذا شفتِ مكالمة منه ردّي عليها.
- The phone number displayed large, tappable (`tel:` link), in `<bdi dir="ltr">`
- **Two buttons:**
  - `primary` — «كلّميني على واتساب بدل المكالمة» → `wa.me` link with a prefilled message:
    «مرحباً، طلبي رقم <LTR>#{orderNumber}</LTR> — أفضّل التأكيد على واتساب» . Offering WhatsApp
    as an alternative to the call meaningfully lifts confirmation rates, because many women will
    not answer an unknown voice call but will reply to a message.
  - `secondary` — «احفظي الرقم» → downloads a `.vcf` contact card (generated client-side; a data
    URI is enough, no backend needed)

---

## 5. Order summary

Collapsed by default on mobile, expanded on desktop.

- Per line: thumb, name, offer label, quantity, line total
- Upsell item shown as a separate line with its 99 price, if accepted
- Delivery row, total row, «شامل الضريبة»
- «الدفع كاش عند الاستلام» reminder

---

## 6. How to use it correctly

Reduces refunds and improves the outcome she will eventually review. Show the routine for **the
products she actually bought**, not a generic block.

- H2: **كيف تستخدمينه صح — من أول يوم**
- The steps from the relevant dossiers in `06`
- The single most common mistake per product, called out:
  - Serum: «على الفروة، مو على الشعر»
  - Tonic: «بعيد عن القهوة والشاي بساعتين — وإلا الامتصاص يقل كثير»
  - Exfoliant: «مرة إلى مرتين بالأسبوع بس، مو يومي»

---

## 7. Honest expectations reminder

Prevents week-2 disappointment, which is when refused deliveries and refund requests cluster.

- H3: **وش تتوقعين، ومتى**
- Compact timeline: أسبوع <LTR>1–2</LTR> لا فرق ظاهر · <LTR>4–8</LTR> التساقط يقل · <LTR>8–12</LTR> الكثافة تبان
- On the serum: «ممكن تلاحظين تساقط بسيط زايد أول أسبوعين — طبيعي، الشعرات الضعيفة تخلّي مكانها»
- Closing line: الاستمرارية هي كل شي.

---

## 8. Cross-sell / next step

Only shows products **not** in this order. If the order contains all three, replace with the
full-routine graphic and a review request instead.

- H3: **جاهزة للخطوة اللي بعدها؟**
- Sub: طلبك يغطي سبب. باقي {n} سبب.
- 1–2 `ProductCard` `compact` cards at **full price (199)** — no discount here; the discount
  window closed with the upsell, and re-discounting immediately after would devalue it and
  irritate anyone who just paid 99.
- A note: «لو تبغين تضيفينه لنفس الطلب، كلّمينا واتساب قبل ما نشحنه» → this converts genuinely
  well and costs nothing, because the order has not shipped yet.

---

## 9. Support

- WhatsApp CTA with the order number prefilled
- Response-time expectation
- Links to `/shipping`, `/returns`, `/faq`

---

## 10. Review request seed

Low priority on this page (she has not used the product yet), but plant it:

- Small block: «بعد ٤ أسابيع، نبغى نسمع تجربتك» + a note that we will message her on WhatsApp
- Do not ask for a review now. Asking before use produces worthless reviews and trains her to
  ignore the real request later.

---

## 11. Engineering notes

### Rendering and access

- Dynamic route, server-rendered, `robots: { index: false, follow: false }`
- Data from `GET /api/orders/{id}/summary`
- **Access control:** the `orderId` in the URL must be an **unguessable UUID**, not a sequential
  integer. `orders.id` is a UUID (`21`); `orders.order_number` is the short human-readable value
  shown in the UI. The summary endpoint returns only display-safe fields: order number, items,
  totals, masked phone, status. Never the full phone, IP, user agent, or attribution data.
- Refresh-safe and shareable-safe: the page is idempotent and fires **no** conversion events.

### Tracking — read this carefully

> **`Purchase` is NOT fired on this page.** It is fired once at order creation (browser + server,
> shared `event_id`), and once more for the upsell delta if accepted. Firing on thank-you mount
> would double-count on every refresh, bookmark, or back-navigation. See `09` §3, `23` §5, `24` §7.

This page fires only:
- `PageView`
- `ThankYouView` (custom, for funnel analysis)
- `data-cta` clicks: `ty-whatsapp`, `ty-save-number`, `ty-crosssell-{slug}`, `ty-vcf`

### Cart

Clear the cart store here (not earlier), after confirming the order exists. If she navigates
back, she should not find a stale cart containing what she just bought.

### Edge cases

| Case | Behaviour |
|---|---|
| Unknown / invalid `orderId` | Friendly page: «ما لقينا هذا الطلب» + WhatsApp CTA + link home. Never a raw 404. |
| Order exists but upsell window still open | Redirect back to the upsell only if `now < upsell_expires_at` **and** the upsell has not been resolved; otherwise render normally. Never trap her in a loop. |
| Page opened weeks later | Renders normally with the current order status. It is a durable receipt. |
| JS disabled | Fully server-rendered content. The `.vcf` download and WhatsApp links are plain anchors and still work. |
