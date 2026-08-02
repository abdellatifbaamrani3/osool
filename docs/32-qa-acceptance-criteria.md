# 32 — QA and Acceptance Criteria

Definition of done for the whole build. Nothing ships until every box in this document is ticked.

**Primary test device:** a real mid-tier Android phone at 390px width, on cellular, **inside the
Snapchat and TikTok in-app browsers**. Desktop Chrome DevTools will not surface the bugs that
actually cost money here.

---

## 1. Critical path — must be perfect

Run this end to end after every deploy. If any step fails, the site is not shippable.

1. Load a product page from a URL with `?fbclid=test&ttclid=test&ScCid=test&utm_source=snapchat`
2. Confirm the offer selector shows three tiers with **tier 2 pre-selected**
3. Change to tier 3 → the sticky ATC price updates to `349`, no layout shift
4. Add to cart → the drawer opens automatically
5. Confirm the cross-sell is visible **without scrolling** inside the drawer
6. Add a cross-sell item → it adds at 199 without closing the drawer, and the total updates
7. Tap «أكملي الطلب» → the checkout modal opens over the drawer
8. Type an invalid phone (`0521234567`) → an error appears **only after 9 digits**, submit stays disabled
9. Type `٠٥٥١٢٣٤٥٦٧` in Arabic-Indic digits → it is accepted and normalised
10. Submit → the order saves, the upsell appears with a **server-driven** countdown
11. Refresh during the upsell → the timer does **not** reset
12. Accept the upsell → the total increases by 99 → the thank-you page loads
13. Confirm the Google Sheet has **exactly one row** for this order, with the upsell reflected
14. Confirm all three Events Managers show **exactly one** Purchase, plus one 99 SAR delta
15. Refresh the thank-you page → **no** additional Purchase event fires

---

## 2. RTL and Arabic

- [ ] `<html lang="ar" dir="rtl">` present in the server-rendered HTML (view source, not DevTools)
- [ ] Zero occurrences of `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right` in `src/`
- [ ] Directional icons (chevrons, arrows) are mirrored
- [ ] Non-directional icons (cart, star, check, WhatsApp, phone, truck) are **not** mirrored
- [ ] All prices and Latin runs wrapped in `<bdi dir="ltr">` and render in the correct order
- [ ] No letter-spacing, italics, or uppercase applied to Arabic text
- [ ] Body line-height ≥ 1.5; long-form ≥ 1.7
- [ ] Every CTA and verb is feminine singular — grep for `اطلب`, `اشتر`, `أضف`, `اختر`, `أكمل`, `سجل` as standalone strings
- [ ] Carousels swipe in the natural RTL direction
- [ ] No text overflow or truncation at 390px on any page
- [ ] No Arabic string literals inside components — all from `content/ar.ts`
- [ ] Copy checklist in `05` §7 passes for every visible string

## 3. Responsive

Test at **390, 414, 768, 1024, 1440**.

- [ ] Mobile-first: split sections put media **first** on mobile regardless of `reverse`
- [ ] Desktop split sections alternate text-right / text-left correctly (`10` §3.1)
- [ ] Tables become stacked cards on mobile — **no horizontal scroll**
- [ ] Sticky ATC does not cover the last section (page has bottom padding)
- [ ] Sticky ATC and the WhatsApp FAB do not overlap
- [ ] Cart drawer and checkout modal use `100dvh`, not `100vh`
- [ ] `env(safe-area-inset-bottom)` respected on iOS
- [ ] All tap targets ≥ 44×44px with ≥ 8px separation
- [ ] Header does not overlap any sticky element

## 4. Offer selector and cart

- [ ] Tier 2 pre-selected from `offers.is_default`, not hardcoded
- [ ] Selection reflected in the URL (`?offer=2`) and survives a refresh
- [ ] Hero selector and final selector share state
- [ ] Sticky ATC price matches the selected tier everywhere
- [ ] Per-unit price and savings are correct: 279→139/unit/save 119, 349→116/unit/save 248
- [ ] Keyboard operable as a radio group (arrow keys + Space)
- [ ] Adding the same product with a **different** offer creates a separate cart line
- [ ] Adding the same product with the **same** offer increments quantity
- [ ] Quantity semantics correct: 2 bundles of the 2-piece offer = 4 units, 558 SAR (`15` §3.1)
- [ ] Cart persists across a page reload
- [ ] Empty cart shows the three cause cards, not a dead end
- [ ] Cross-sell shows the right products in the right priority per `08` §2
- [ ] Cross-sell reason lines present and correct
- [ ] Cross-sell adds at the **default tier**, not tier 1
- [ ] When all three products are in the cart, the reassurance panel replaces the cross-sell
- [ ] Cart clears only after the upsell resolves

## 5. Phone validation

Every vector in `16` §4.4 must pass, on the client **and** on the server.

- [ ] `0551234567`, `551234567`, `966551234567`, `+966551234567`, `00966551234567` all accepted
- [ ] `+966 55 123 4567`, `055-123-4567`, `(055) 123 4567` all accepted
- [ ] `٠٥٥١٢٣٤٥٦٧` (Arabic-Indic) accepted ← **most commonly missed**
- [ ] `0521234567` rejected (unassigned prefix)
- [ ] `0112345678` rejected (landline)
- [ ] Too short, too long, non-numeric, and non-Saudi numbers rejected
- [ ] No error shown while typing before 9 digits
- [ ] Green check appears at 9 valid digits, submit enables
- [ ] Field font ≥ 16px (no iOS zoom) — verify on a real iPhone
- [ ] `inputMode="numeric"` shows the numeric keypad
- [ ] Field is `dir="ltr"` with right alignment
- [ ] The three canonical forms are produced correctly: `5…`, `+966…`, `966…`

## 6. Checkout and upsell

- [ ] Only two fields; no email, address, coupon, or notes
- [ ] Order summary visible and correct
- [ ] Submit is idempotent — double-tap creates **one** order
- [ ] `Idempotency-Key` sent and honoured (repeat POST returns 200 with the same order)
- [ ] **The order is persisted before the upsell renders** — verify by killing the tab during the upsell and confirming the order exists in the database and the Sheet
- [ ] Network failure preserves form state and shows the WhatsApp fallback
- [ ] Partial lead captured when the phone becomes valid, and appears in the `Leads` tab
- [ ] Upsell shows the correct product for all seven cart compositions (`08` §3.1)
- [ ] Countdown driven by the server `expires_at`; a refresh does not extend it
- [ ] Accept after expiry returns **410**; the UI advances to thank-you
- [ ] Double accept returns **409**
- [ ] Decline is clearly visible, not a hidden grey link
- [ ] Backdrop click and `Esc` both count as decline
- [ ] Upsell price is 99, struck price is 199, total increases by exactly 99

## 7. Security

- [ ] Posting a tampered price has no effect — the request contains no price field at all
- [ ] Posting an `offer_id` belonging to a different product → 422
- [ ] `qty: 999` → 422
- [ ] Honeypot filled → 422
- [ ] Rate limits enforced (6th order in an hour from one IP → 429 with `Retry-After`)
- [ ] `/api/orders/{id}/summary` returns **no** full phone, IP, user agent, attribution, or `event_id`
- [ ] `orders.id` is a UUID; changing a digit in the thank-you URL yields the friendly not-found page
- [ ] `/docs` and `/redoc` return 404 in production
- [ ] CORS rejects an unknown origin
- [ ] No token appears in any browser-visible bundle — grep the built JS for `EAAG`, `access_token`, and the admin token
- [ ] No PII in the application logs
- [ ] `tracking_events.request_payload` contains hashed values only

## 8. Tracking

- [ ] No pixel network request before the first interaction (check the waterfall)
- [ ] Events queued before load are flushed in order
- [ ] Site works with **all** pixel IDs absent
- [ ] One `event_id` per action, identical on browser and server
- [ ] Meta `eventID`, TikTok `event_id`, Snap `client_dedup_id` all present
- [ ] TikTok purchase is `CompletePayment` on both sides
- [ ] Snap event names are UPPER_SNAKE_CASE; purchases carry `transaction_id`
- [ ] **`hash_phone_meta(x) != hash_phone_tiktok(x)`** — the `+` handling is correct (`24` §3.4)
- [ ] Published hash vectors in `24` §3.4 reproduce exactly
- [ ] `client_ip_address` is the customer's IP, not the EasyPanel proxy's
- [ ] `osool_attr` cookie captured on landing and **survives navigation inside the Snapchat and TikTok in-app browsers**
- [ ] `fbp` / `ttp` / `scid` re-read at checkout time
- [ ] Purchase fires from the order response, **not** on thank-you mount
- [ ] Upsell delta uses the server-provided `upsell.event_id`
- [ ] Each Events Manager shows exactly one Purchase for one test order, with dedup visible
- [ ] `test_event_code` removed from production config

## 9. Backend

- [ ] `alembic upgrade head` runs on container start and the container fails loudly if it errors
- [ ] Seeding is idempotent — restart twice, still 3 products and 9 offers
- [ ] Seeding does **not** overwrite settings values changed in production
- [ ] `/health` returns 200 without touching the database
- [ ] `/health/ready` returns 503 when the migration revision is behind head
- [ ] `DATABASE_URL` with `?sslmode=disable` works (the asyncpg conversion — `20` §3)
- [ ] Sheets push failure does not fail the order
- [ ] CAPI failure does not fail the order
- [ ] One platform's CAPI failure does not prevent the other two
- [ ] `POST /api/admin/resync/{id}` replays a failed Sheets push
- [ ] All tests in `20` §10 pass

## 10. Compliance

- [ ] No banned word from `07` §3 anywhere — including alt text, meta descriptions, JSON-LD, and seeded reviews
- [ ] Every claim matches an approved phrasing in `07` §4
- [ ] Evidence footer from `07` §5 present on all three product pages
- [ ] Every cited study attributed to the **ingredient** with its stated limit
- [ ] Tonic page carries all supplement warnings, including keep-away-from-children
- [ ] Tonic is never described as a cosmetic or as treating anything
- [ ] Ferritin-test callout present on the tonic page
- [ ] Mixed-evidence disclosure present on the tonic page
- [ ] Dermatologist-referral line on every product page
- [ ] `aggregateRating` JSON-LD absent while reviews are seeded
- [ ] All four legal pages exist, are linked from the footer and the checkout modal
- [ ] VAT-inclusive statement present in cart, checkout, and footer
- [ ] No fake struck-through prices (only real 199-vs-per-unit and 199-vs-99 comparisons)
- [ ] All urgency devices backed by real data; density ≤ 1 per screen
- [ ] `should_display` from `/api/stats/live` respected

## 11. Performance

Full checklist in `28` §9. Gates:

- [ ] Lighthouse mobile ≥ 90 on home, collection, and all product pages
- [ ] LCP ≤ 2.0s on a real device on cellular
- [ ] CLS ≤ 0.02
- [ ] JS within budget on every route

## 12. Accessibility

- [ ] Full keyboard navigation with a visible focus ring throughout
- [ ] Modals and drawers trap focus, close on `Esc`, restore focus to the trigger
- [ ] Real `<label>` on every field
- [ ] Errors announced via `aria-live` and described in text, not colour alone
- [ ] Countdown does not spam screen readers (single halfway announcement)
- [ ] All contrast ratios pass AA — check gold text specifically (must be `--gold-600` on light)
- [ ] One `h1` per page, sequential heading levels
- [ ] `prefers-reduced-motion` honoured

## 13. Cross-browser and in-app

| Environment | Priority |
|---|---|
| **Snapchat in-app browser (Android + iOS)** | **Critical** — primary traffic |
| **TikTok in-app browser (Android + iOS)** | **Critical** |
| Chrome Android | Critical |
| Safari iOS | Critical |
| Instagram in-app | High |
| Chrome/Safari/Edge desktop | Medium |

In-app browsers specifically: verify `localStorage` cart persistence, the attribution cookie
surviving navigation, `100dvh` behaviour, and that the checkout modal is fully reachable without
the browser chrome covering the submit button.

## 14. Content

- [ ] All three product pages have every section in `12` §2
- [ ] Every objection in `03` §5 is answered somewhere on the relevant page
- [ ] Honest timeline present on all three product pages
- [ ] Three-cause section on home, collection, and all product pages, with the current product's cause highlighted
- [ ] Reviews include at least one 4-star and one 3-star
- [ ] Every `TODO: owner to supply` is visibly styled and listed in `33`
- [ ] No lorem ipsum, no English placeholder text, no `undefined` rendered anywhere
