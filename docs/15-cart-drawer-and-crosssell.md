# 15 — Cart Drawer and Cross-Sell

**Job:** confirm the add, raise order value with a cause-based cross-sell, and hand off to
checkout without leaking. The cart drawer is the highest-leverage AOV surface after the offer
selector.

**KPIs:** add-to-cart → checkout opened ≥ 55% · cross-sell attach rate ≥ 15%

**Never use a full cart page.** A route change loses context, adds a page load on a slow
connection, and measurably drops the checkout rate. The drawer is the only cart surface.

---

## 1. Opening behaviour

The drawer opens automatically after **every** add-to-cart, from every surface (product hero,
sticky bar, final CTA, collection card, product-page `#system`, cross-sell card). This is
explicitly what the client asked for, and it is correct: the drawer is where the cross-sell
lives, so every add must pass through it.

- Slides in 250ms `--ease-out` from the same edge as the cart icon (see `10` §4.3)
- Backdrop: `rgba(16,26,23,.45)`, fades in 200ms, click closes
- Body scroll locked while open; focus trapped; `Esc` closes; focus returns to the trigger
- URL gains `?cart=open` so it survives a refresh and is trackable
- Hides the sticky ATC bar and the WhatsApp FAB while open
- On mobile it is a **full-height sheet** (100dvh, not 100vh — `100vh` is wrong under mobile browser chrome and causes the checkout button to sit below the fold)
- On desktop, a 420px-wide side panel

---

## 2. Layout

Three regions: a fixed header, a scrollable body, and a **fixed footer that is always
visible**. The checkout button must never require scrolling to reach.

```
┌──────────────────────────────────────┐
│  سلّتك (2)                        ✕   │  ← fixed header
├──────────────────────────────────────┤
│                                      │
│  [thumb]  سيروم الأصول                │
│           قطعتين · شهرين              │  ← line items (scrollable)
│           279 ريال          [ − 1 + ] │
│                                    🗑 │
│  ─────────────────────────────────   │
│                                      │
│  كمّلي النظام                          │  ← CROSS-SELL (above the fold)
│  أنتِ غطيتِ سبب واحد. باقي سببين.        │
│  ┌────────────────────────────────┐  │
│  │ [80px] تونك الأصول              │  │
│  │        السبب ② — المخزون        │  │
│  │        «السيروم يوقظ البصيلة —  │  │
│  │        بس لو المخزون فاضي،      │  │
│  │        النتيجة تكون أبطأ»        │  │
│  │        199 ريال    [ أضيفي ]    │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ [80px] مقشّر الأصول   [ أضيفي ]  │  │
│  └────────────────────────────────┘  │
│                                      │
│  ✓ دفع عند الاستلام                   │  ← trust mini-strip
│  ✓ توصيل 2–4 أيام عمل                 │
│  ✓ تغليف مقفل                         │
├──────────────────────────────────────┤
│  الإجمالي            279 ريال          │  ← fixed footer
│  التوصيل مجاني · شامل الضريبة          │
│  [      أكملي الطلب      ]            │
│  الدفع كاش عند الاستلام                 │
└──────────────────────────────────────┘
```

---

## 3. Line items

| Element | Spec |
|---|---|
| Thumb | 64px, 1:1, `--radius-md` |
| Title | Product short name, `h3` scale, 1 line, clamped |
| Offer label | «قطعتين · شهرين» — the tier title and duration, `body-sm`, `--muted` |
| Price | Tier total, `price` scale, tabular-nums |
| Qty stepper | − / value / + . Min 1. Increments the **number of offer bundles**, not loose units (see §3.1) |
| Remove | Trash icon, 44px tap target, with an undo toast for 5s |

### 3.1 Quantity semantics — get this right

A line item is **an offer, not a unit**. If she selects the 2-piece offer at 279 and taps `+`,
she gets 2 bundles = 4 units at 558 SAR. The line must display this unambiguously:

> قطعتين · شهرين
> <LTR>2</LTR> × <LTR>279</LTR> = <LTR>558</LTR> ريال

The cart key is `(product_id, offer_id)`. Adding the same product with a *different* offer
creates a **separate line**, it does not merge — merging would silently change what she chose.
Adding the same product with the same offer increments the existing line's quantity and shows
a brief highlight flash on that line.

### 3.2 Empty state

- `shopping-bag` icon, `--sand-200`
- «سلّتك فاضية»
- «ابدئي من هنا — اختاري السبب اللي يشبه وضعك»
- The three cause cards from `13` §2.2, compact, each linking to its product page
- Primary CTA: شوفي المنتجات → `/collection`

An empty cart drawer is a routing opportunity, not a dead end.

---

## 4. Cross-sell block

The core AOV mechanism in this surface. Full logic and copy in `08` §2.

**Placement is critical.** The cross-sell sits **immediately after the line items and above the
trust strip**, inside the scroll area but positioned so that on a 390×844 viewport with one
line item, **at least the first cross-sell card is visible without scrolling.** If it falls
below the fold, the attach rate collapses. Verify this in QA (`32`).

**Content per card** (`ProductCard` `compact` variant):

- 80px 1:1 thumb
- Product short name
- Cause tag: «السبب ② — المخزون»
- **The reason line** — the cause-based sentence from the pairing table in `08` §2. This is what
  makes the cross-sell persuasive rather than a random "you may also like". It is the single
  most important string in the component.
- Price: `199 ريال` (full price — the discount is reserved for the post-checkout upsell)
- `أضيفي` button, one tap

**Behaviour**

- Adds the product's **default offer (tier B)** — not tier A. This is worth roughly 80 SAR per attach.
- Adds **without closing the drawer**. The button becomes a `check` + «تم» for 1.5s, the new line item slides into the list, and the total animates.
- Maximum 2 cross-sell cards. Three is clutter and reduces action.
- Header copy pluralises correctly: 2 missing → «باقي سببين»; 1 missing → «باقي سبب واحد».
- When nothing is missing, replace the block with a reassurance panel: «النظام كامل ✓ — السيروم للبصيلة، التونك للمخزون، والمقشّر للفروة. هذي أفضل تركيبة.» plus the routine strip. Never show an empty section.

---

## 5. Footer

Always visible, `--white`, top border `--sand-200`, `--shadow-lg` upward.

| Row | Content |
|---|---|
| Subtotal | «الإجمالي» + total, `price` scale, tabular-nums |
| Notes | «التوصيل مجاني» *(only if true)* · «الأسعار شاملة ضريبة القيمة المضافة» |
| CTA | `Button primary xl fullWidth` → «أكملي الطلب» — opens the checkout modal |
| Under-CTA | «الدفع كاش عند الاستلام» with a `banknote` glyph |

- Respects `env(safe-area-inset-bottom)`.
- The CTA is disabled with a `--muted` style when the cart is empty.
- On tap, the checkout modal opens **over** the drawer (the drawer stays mounted behind it) so
  closing checkout returns her to the cart rather than to the page — this alone recovers a
  meaningful share of abandonments.

---

## 6. Optional: free-shipping progress bar

Only if the business actually has a free-shipping threshold. If shipping is free on everything,
**omit this entirely** — a progress bar that is always complete is noise.

If a threshold exists (say 199): a thin `--gold-500` bar with «باقي <LTR>{n}</LTR> ريال ويصير
التوصيل مجاني», turning green with «التوصيل مجاني ✓» when met. Confirm the real policy with the
owner before building (`27`).

---

## 7. State management

Zustand store, persisted to `localStorage` under `osool_cart` (`19` §5).

```ts
type CartLine = {
  productId: string;
  offerId: string;
  qty: number;          // number of offer bundles
  // denormalised for instant render without a refetch
  slug: string;
  nameAr: string;
  image: string;
  offerQty: number;     // units per bundle
  offerLabelAr: string;
  durationLabelAr: string;
  priceSar: number;     // price of ONE bundle
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, 'qty'>, qty?: number) => void;  // opens drawer
  setQty: (productId: string, offerId: string, qty: number) => void;
  remove: (productId: string, offerId: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  // selectors
  total: () => number;
  itemCount: () => number;      // sum of bundle quantities
  unitCount: () => number;      // sum of qty * offerQty
  productIds: () => string[];
  missingProductIds: () => string[];
};
```

**Rules**

- Prices are denormalised into the cart for instant rendering, but **the server recomputes every
  price from the `offers` table at order creation and ignores client prices entirely** (`22`, `29`).
  A stale `localStorage` cart from before a price change must never be honoured.
- Hydration: read `localStorage` in an effect, not during render, or Next.js will produce a
  hydration mismatch. Render the badge as empty until hydrated.
- Cap total quantity per line at 10 to blunt fat-finger and abuse cases.
- On successful order creation, `clear()` the cart **after** the upsell step resolves, not before
  — if she declines the upsell and something fails, we still want her cart intact.

---

## 8. Tracking

Full spec in `23`. Events originating in this surface:

| Trigger | Event | Notes |
|---|---|---|
| Drawer opens | `ViewCart` (custom) | Include total value and `content_ids` |
| Cross-sell add | `AddToCart` | New `event_id`, plus `data-cta="cart-crosssell-add-{slug}"` |
| Qty change | `AddToCart` on increase only — never on decrease | Avoid inflating events |
| Remove | `RemoveFromCart` (custom) | Useful for diagnosing cart friction |
| «أكملي الطلب» tap | `InitiateCheckout` | Value = cart total, `event_id` minted here and reused for the server-side call |

`data-cta` values: `cart-checkout`, `cart-crosssell-add-{slug}`, `cart-qty-inc`, `cart-qty-dec`,
`cart-remove`, `cart-empty-shop`.

---

## 9. Accessibility

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the «سلّتك» heading
- Focus moves to the close button on open; returns to the trigger on close
- Qty steppers are real `<button>`s with `aria-label="زيادة الكمية"` / `"تقليل الكمية"`
- Total changes announced via `aria-live="polite"`
- The cross-sell "تم" confirmation is announced, not conveyed by colour alone
- Fully keyboard operable with a visible focus ring throughout
