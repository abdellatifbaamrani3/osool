# 30 — COD Operations: Confirmation, Delivery, and Margin

The website's job ends at "order submitted". The **money** arrives at "order delivered". Between
those two points sits a phone call, and that call is where most COD businesses lose 30–45% of
their revenue.

This document is for the owner and the confirmation team, but the coder needs it too — several
features on the site exist purely to protect the numbers below.

---

## 1. The funnel that actually matters

```
100 orders submitted on the site
 ↓  confirmation rate 65%
 65 confirmed and shipped
 ↓  delivery rate 85%
 55 delivered and paid
```

**Effective revenue = AOV × confirmation rate × delivery rate.**

At AOV 300 SAR, 100 submitted orders yield roughly 16,500 SAR — not 30,000. Every point of
confirmation rate is worth about 250 SAR per 100 orders. Ten points of confirmation rate is worth
more than a 20% lift in site conversion rate, and it is usually far easier to get.

---

## 2. Where the site protects these numbers

| Site feature | Which number it protects | Doc |
|---|---|---|
| Strict KSA phone validation + Arabic-Indic digit handling | Confirmation (a mistyped number is unreachable) | `16` §4 |
| "نتواصل معك على هذا الرقم لتأكيد الطلب" helper text | Confirmation (she gives a real number knowing we will call) | `16` §3.2 |
| Thank-you page "احفظي رقمنا" block | Confirmation (she recognises the incoming call) | `17` §4 |
| WhatsApp-instead-of-call option | Confirmation (many women will not answer an unknown voice call but will reply to a message) | `17` §4 |
| Explicit "we will take your address on the call" | Confirmation (the call is expected, not a surprise) | `17` §3 |
| Honest timeline everywhere | Delivery (she is not disappointed at the door) | `12` §10, `17` §7 |
| Discreet packaging promise | Delivery (privacy is a real refusal reason) | `18` §4 |
| No dark patterns | Delivery (a customer who feels tricked refuses the parcel) | `18` §9 |
| Partial-lead capture | Recovers orders never submitted | `16` §7.1 |
| `risk_flag` on suspicious orders | Prioritises ops effort | `29` §3 |

---

## 3. Confirmation call playbook

### Timing

| Attempt | When |
|---|---|
| 1 | Within **2 hours** of the order, during working hours. Speed is the single biggest factor — intent decays fast. |
| 2 | Same day, 4–6 hours later, at a different time of day |
| 3 | Next day, at a different time again |
| 4 (WhatsApp) | A message with the order details and a one-tap confirm |
| Close | After attempt 4, mark `ما رد` |

Respect prayer times and the Saudi weekend (Friday–Saturday). Sunday–Thursday, roughly 10:00–13:00
and 16:00–21:00, are the highest answer-rate windows.

### Script skeleton

1. **Identify quickly and warmly.** «هلا [name]، معك [agent] من أصول — بخصوص طلبك رقم [x]»
2. **Confirm the order, do not re-sell it.** Read the items and the total. She already bought.
3. **Take the address in structured pieces:** city → district → street/landmark → nearest
   landmark. A landmark matters more than a street name in much of Saudi Arabia.
4. **Confirm the total and that payment is cash on delivery.**
5. **Set the delivery expectation:** 2–4 business days.
6. **One useful sentence about usage.** «تذكّري: السيروم على الفروة، مو على الشعر» — this small
   touch measurably reduces returns and improves the review she will eventually leave.
7. **Close with the WhatsApp promise:** «نرسل لك تفاصيل الشحن على واتساب.»

### Rules

- **Never up-sell on the confirmation call.** It creates hesitation and raises refusal rates. The
  AOV work is done on the site, where it belongs.
- If she hesitates, do not push — resolve the actual objection (usually delivery time or "did I
  order too much"). A hesitant confirm becomes a refused parcel.
- If she wants to change quantity, allow it. A smaller delivered order beats a larger refused one.
- Log every attempt and the outcome in the Sheet's notes column.
- Handle `risk_flag = 'suspicious_phone'` orders first if capacity is limited — they are the most
  likely to be junk, and knowing early keeps the shipping cost down.

---

## 4. Improving confirmation rate

Ranked by impact per unit of effort:

1. **Call within 2 hours.** Larger effect than everything else on this list combined.
2. **WhatsApp first, then call.** A message from a business number that names her order arrives
   with context; a cold voice call does not. Many customers confirm entirely over WhatsApp.
3. **Use a consistent, recognisable business number** with a WhatsApp Business profile showing the
   أصول name and logo, so the incoming call is identifiable.
4. **The thank-you page save-our-number block** (`17` §4).
5. **Multiple attempts at different times of day** — not three calls in one hour.
6. **A friendly, brief script.** Long calls lose people.
7. **Filter obvious junk before shipping**, not before calling.

## 5. Improving delivery rate

1. **Accurate address capture** on the call, including a landmark
2. **Set the delivery window honestly** and notify on delay — the statutory 15-day rule also means
   silence is a legal risk (`29`)
3. **Discreet packaging**, stated on the site and honoured
4. **A WhatsApp message the day before delivery** so she is home and expecting it
5. **Give the courier the right phone number** and any access notes
6. **Manage expectations about results** — the honest-timeline content exists so nobody refuses a
   parcel because they expected a miracle
7. **Choose the courier on delivery rate, not price.** A 5% better delivery rate outweighs a few
   riyals per parcel.

## 6. Metrics to track weekly

| Metric | Target | Source |
|---|---|---|
| Confirmation rate | ≥ 65% | Sheet: confirmed+shipped+delivered ÷ total |
| Time to first call | < 2 hours median | Ops log |
| Delivery rate (of confirmed) | ≥ 85% | Sheet |
| Refusal rate at the door | < 8% | Sheet: مرتجع |
| Invalid/unreachable phone rate | < 3% | Sheet: ما رد with a bad-number note |
| AOV of delivered orders | ≥ 270 SAR | Sheet |
| **Effective revenue per 100 submitted** | ≥ 15,000 SAR | Computed |
| Lead → order recovery rate | ≥ 10% | Sheet `Leads` tab |

The Dashboard tab in the Google Sheet (`25` §2.5) should compute all of these automatically. If a
number is off, the diagnostic tree in `18` §8 covers the site-side causes; this document covers the
ops-side ones.

## 7. Lead recovery

The `Leads` tab holds abandoned checkouts that already have a valid phone number (`16` §7.1). These
are warm, cheap, and usually ignored.

- Call or WhatsApp within **1 hour** of abandonment for the best result
- Approach as help, not pursuit: «لاحظنا إنك بدأتِ طلب من أصول — تبغين مساعدة في اختيار المنتج
  المناسب؟»
- Never mention that we can see her cart in a way that feels surveilling
- Expect roughly 10–20% recovery. On 100 abandoned leads at 280 SAR that is 2,800–5,600 SAR of
  otherwise-lost revenue
- Mark the outcome in the `حالة المتابعة` column so the same lead is not worked twice

## 8. Handling returns and refusals

- A refusal at the door costs shipping both ways and is unavoidable at some rate — target under 8%
- Log the **reason** every time. Patterns here are the most valuable product feedback available:
  changed her mind, delivery took too long, husband/family objection, expected different results,
  no longer reachable
- Feed those reasons back into site copy. If "delivery took too long" is the top reason, the
  delivery window on the site is wrong and should be changed to the truth
- The 7-day statutory return right applies after delivery (`29`); handle it graciously and quickly,
  because a well-handled return produces a customer who buys again

## 9. Scaling notes

| Volume | Setup |
|---|---|
| < 30 orders/day | One person, Google Sheet, WhatsApp Business app |
| 30–100/day | Two or three agents, Sheet with an assignment column, WhatsApp Business API |
| 100+/day | Replace the Sheet with a real admin panel or an order-management tool. The `orders` schema (`21` §4) already carries the status lifecycle, notes, and timestamps needed, so this is a UI project rather than a migration. |

Build the site as specified for v1; the Sheet is genuinely adequate to a level of volume most
stores never reach, and the data model does not have to change when it stops being adequate.
