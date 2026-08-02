# 18 — CRO Playbook

The client asked for "CRO 12/10". That does not mean more badges, more timers, and more popups.
Past a certain point those *reduce* conversions in this market, because Saudi buyers are highly
scam-sensitive and COD lets them punish a bad feeling by simply refusing the parcel.

**12/10 CRO here means:** every objection pre-empted in the right order, zero unnecessary
friction, dense honest proof, and a checkout that cannot leak. That is the whole playbook.

---

## 1. The eight principles

### P1 — Speed is the first conversion feature
A 1-second delay on mobile costs roughly 7% of conversions, and Snapchat/TikTok traffic arrives
on in-app browsers on cellular. No amount of persuasion recovers a user who bounced at 4
seconds. Budgets in `28`. Pixels are deferred (`23`).

### P2 — Answer objections in the order they arise
Not the order that is convenient for us. The sequence is in `03` §5 and it drives the section
order in `12`. An objection answered too late has already caused the bounce.

### P3 — Specificity beats intensity
`Redensyl 3%` outperforms "powerful advanced formula". `4 إلى 8 أسابيع` outperforms "fast
results". Every vague superlative you delete and replace with a number raises conversions.

### P4 — Honest limits increase conversions
Counter-intuitive but reliable, and especially strong in a market saturated with over-promising.
Saying «أول أسبوعين ما تتوقعين فرق» makes the rest of the page credible. This is our moat
(`04` §5, P5) and it is also what keeps the ad accounts alive (`07` §9).

### P5 — Reduce decisions, not information
A long page is fine. A page with many *choices* is not. One CTA colour, one pre-selected offer,
one upsell product, two form fields. Information reassures; choice paralyses.

### P6 — Never lose a phone number
Partial-lead capture on phone-field validity (`16` §7.1), order persisted before the upsell,
form state preserved on error, WhatsApp fallback on every failure. In COD, a captured number is
recoverable revenue.

### P7 — Momentum: never let her stop moving
Every surface has exactly one obvious next action. Cart drawer opens automatically after add.
Checkout opens over the cart. Upsell follows submit. Thank-you routes onward. No dead ends,
including the 404 and the empty cart.

### P8 — Trust is cumulative and fragile
Twenty small trust signals compound. One fake timer destroys all twenty. Audit for anti-trust
signals (`03` §6) more aggressively than you add trust signals.

---

## 2. Honest urgency — the rules

Scarcity works. Fake scarcity works once and then poisons everything. In a COD market the
punishment is immediate: she accepts the order, then refuses the parcel, and we pay shipping
both ways.

### Allowed

| Device | Requirement |
|---|---|
| Stock counter | Backed by a real `products.stock_count`. Shown only below a real threshold (e.g. < 30). Decrements on real orders. |
| Upsell countdown | Server-authoritative `upsell_expires_at`. Genuinely expires. Does not reset on refresh. (`16` §8) |
| Live activity count | Real count of checkout-opened events in the last 30 minutes, from `GET /api/stats/live`. **Hidden when the real number is below 3.** |
| Order-count proof | Real cumulative order count. |
| Batch framing | «باقي <LTR>{n}</LTR> علبة من هذي الدفعة» — only if batches are real. |
| Delivery-cutoff framing | «اطلبي اليوم قبل <LTR>4</LTR> العصر ويطلع طلبك بكرة» — only if operationally true. |

### Forbidden

- Any timer that resets on refresh or on a new session
- "Only 3 left" when stock is 500
- Fake struck-through "original" prices that were never charged
- Fabricated visitor counters or invented "12 people are viewing this"
- Countdowns to a permanently rolling "end of sale"
- Fake "someone in Riyadh just bought" toasts with invented names

These also violate E-Commerce Law Article 11 on misleading statements (`07` §7).

### Density limit
**Maximum one urgency device visible per screenful, two per page.** More than that and the page
reads as a scam regardless of the truth of each individual element.

---

## 3. Friction audit — remove all of these

| Friction | Verdict |
|---|---|
| Account creation | ❌ Removed — no accounts in v1 |
| Email field | ❌ Removed |
| Address fields at checkout | ❌ Removed — collected on the confirmation call (`16` §2) |
| Coupon code field | ❌ Removed — sends her to Google, half never return |
| Multi-step checkout | ❌ Removed — one modal, two fields |
| Cart page (separate route) | ❌ Removed — drawer only |
| Newsletter popup | ❌ Never |
| Exit-intent popup | ❌ Not in v1. On mobile (our traffic) exit intent barely works, and it reads desperate. |
| Age gate / cookie wall | ❌ Not required in KSA; use a non-blocking notice (`23` §consent) |
| Required "notes" field | ❌ Removed |
| Quantity stepper in the product hero | ❌ Removed — the offer tiers *are* the quantity choice |
| Shipping cost revealed late | ❌ Never — shown in cart, checkout, and thank-you |
| Any field with a format she can get wrong | ⚠️ Only the phone, and it self-formats and self-validates |

---

## 4. Trust-signal placement map

| Signal | Home | Collection | Product | Cart | Checkout | Thank-you |
|---|---|---|---|---|---|---|
| Trust strip (4 items) | ✅ | ✅ | ✅ | mini | — | — |
| COD promise | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Discreet packaging | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| Delivery window | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| WhatsApp support | FAB | FAB | FAB | — | — | ✅ primary |
| Reviews + rating | ✅ | ✅ | ✅ | — | 1 micro | — |
| UGC / real faces | ✅ | — | ✅ | — | — | — |
| Ingredient transparency | ✅ | — | ✅ | — | — | — |
| Cited evidence + limits | ✅ | — | ✅ | — | — | — |
| 7-day return right | footer | footer | ✅ | — | ✅ | ✅ |
| Legal entity + CR number | footer | footer | footer | — | — | footer |
| VAT-inclusive statement | footer | footer | ✅ | ✅ | ✅ | ✅ |
| Dermatologist referral | — | — | ✅ | — | — | — |

---

## 5. Mobile-specific rules

Over 90% of traffic. Design and QA at **390×844** first.

- Sticky ATC always within thumb reach; primary CTAs 56px tall and full width
- Bottom 25% of the screen is the thumb zone — put actions there, not at the top
- `100dvh`, never `100vh`, for sheets and drawers
- Respect `env(safe-area-inset-bottom)`
- Form inputs ≥ 16px font (iOS zoom)
- `inputMode="numeric"` on the phone field so the numeric keypad appears
- No hover-dependent interactions anywhere
- Tables become stacked cards, never horizontal scroll
- Test inside the **Snapchat and TikTok in-app browsers specifically** — they have quirks around
  cookies, `localStorage` persistence, and viewport height that desktop Chrome DevTools will not
  reveal. This is a mandatory QA step (`32`).

---

## 6. Copy-level CRO levers

| Lever | Implementation |
|---|---|
| Benefit-first headings | Headings make claims, not labels (`05` §6) |
| Numbers everywhere | Percentages, weeks, prices, counts |
| Second person singular feminine | Every string (`05` §3) |
| Loss framing, used once | «كل شهر يمر، الشعرة الضعيفة تسقط وما ترجع بنفس الكثافة» — once per page, never more |
| Per-day price reframe | Under every offer selector (`08` §1) |
| Duration-anchored tiers | «شهرين»، «٣ شهور» tie price to the honest timeline |
| Objection pre-emption in FAQ | Ordered by when the objection arises |
| Micro-commitment | The diagnostic router (`13` §2.2) converts browsing into self-diagnosis |
| Reason-why for every offer | Never a bare discount; always «ليش هذا العرض منطقي» |

---

## 7. Experiment backlog

Ship v1 as specified, then test in this order. Each has a clear metric and a clear
implementation surface.

| # | Hypothesis | Metric | Surface |
|---|---|---|---|
| 1 | Tier C pre-selected instead of Tier B raises AOV more than it costs in CVR | AOV, CVR | `OfferSelector` `is_default` |
| 2 | Upsell at 15s beats 10s (more read time) | Take rate | `upsell_window_seconds` |
| 3 | Two upsell options beat one | Take rate, AOV | `16` §8 |
| 4 | Video hero beats static image | ATC rate | `12` §3.1 |
| 5 | Reviews above evidence beats evidence above reviews | ATC rate | `12` §2 |
| 6 | Quiz-first home page beats the current router | Home → PDP CTR | `/` |
| 7 | WhatsApp-first confirmation offer on thank-you raises confirmation rate | Confirmation rate | `17` §4 |
| 8 | Showing the 3-star review raises ATC (credibility) vs 5-star only | ATC rate | `12` §11 |
| 9 | Cross-sell at a small discount beats full price | AOV, attach rate | `15` §4 |
| 10 | Exit-intent on desktop only | CVR | — |

**Discipline:** one variable at a time, minimum 300 conversions per arm before reading a
result, and never run a test that requires a dishonest variant.

---

## 8. Diagnostic tree

When a number is below target, check in this order. Do not guess.

**Low product-page → ATC (< 12%)**
1. LCP over 2.5s? → `28`
2. Is the offer block above the fold on 390px?
3. Is Tier B actually pre-selected and visually dominant?
4. Is the sticky ATC appearing at all?
5. Does the hero headline match the ad creative's promise? (Message-match is the most common cause.)
6. Scroll-depth data: where exactly do they stop? Fix that section.

**Low ATC → checkout opened (< 55%)**
1. Does the drawer open automatically on every add, from every surface?
2. Is the checkout CTA visible without scrolling inside the drawer?
3. Is the cross-sell pushing the CTA below the fold? (It must not — see `15` §4.)
4. Is the total unexpectedly high because of a quantity-semantics bug? (`15` §3.1)

**Low checkout → submitted (< 45%)**
1. Is the phone validation rejecting valid numbers? Check Arabic-Indic digit handling first — it is the most common cause (`16` §4.1).
2. Does the submit button ever get stuck disabled?
3. Is the error appearing while she is still typing?
4. Is the input font < 16px causing an iOS zoom mid-entry?
5. Any console error inside the Snapchat/TikTok in-app browser?

**Low upsell take (< 18%)**
1. Is it firing at all? Check `upsellExpiresAt` is returned and the modal mounts.
2. Is the offered product relevant per `08` §3.1?
3. Is the reason line present?
4. Is the timer honest and visible?

**Low confirmation rate (< 65%)** → this is mostly ops, see `30`
1. Is the save-our-number block on the thank-you page prominent?
2. Is the WhatsApp confirmation alternative offered?
3. Call attempt timing and number of attempts (`30`)
4. Are suspicious-phone flags being triaged?

---

## 9. What we deliberately do not do

Documented so nobody "improves" the site by adding them later:

- Fake urgency of any kind
- Hidden or greyed-out decline buttons
- Pre-checked add-ons or hidden subscriptions
- Roadblock interstitials before the content
- Auto-playing audio
- Confirmshaming («لا، أنا ما أحب شعري»)
- Fake reviews at launch (all seeds are flagged and removed — `07` §6, `33`)
- Countdown timers on the product page (reserved for the upsell only)
- More than one popup in a session
- Any dark pattern that raises AOV at the cost of delivery rate. In COD, a customer who feels
  tricked does not charge back — she simply refuses the parcel, and we pay for the round trip.
  **Trickery is not just unethical here; it is unprofitable.**
