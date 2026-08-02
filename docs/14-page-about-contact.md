# 14 — About and Contact Pages

These two pages are pure trust infrastructure. They convert almost nobody directly, and they
are checked by a large share of first-time Saudi buyers deciding whether we are a real business
or a drop-ship scam. Their job is to survive scrutiny.

---

# `/about` — من نحن

**Job:** prove a real company with a real reason to exist stands behind the products.

**What kills this page:** generic founder-story filler ("we believe in beauty for everyone"),
stock photos of a laughing team, invented history, or vague claims about "years of research".
Specificity is the whole game. If we do not have a fact, we leave it out rather than invent it.

## Section stack

### 1. Hero
- Eyebrow: من نحن
- H1: **بدأنا أصول لأن الجواب اللي تدورين عليه ما كان موجود**
- Sub: علامة سعودية للعناية بالفروة والجذور. مكوّنات مسمّاة، تراكيز مكتوبة، وكلام صادق عن المدة والنتيجة.
- Media: brand image, 16:9 desktop / 4:5 mobile

### 2. The origin story `[S]` reverse=false
Three short paragraphs. Written in first person plural, specific and human.

Structure to follow:
1. **The problem we kept running into.** Saudi women lose hair, buy product after product, and nobody explains the cause. Shelves full of vague "natural extracts" with no concentrations.
2. **What we decided to do differently.** Pick the actives with the best evidence for the three real drivers. State every concentration. Publish the timeline honestly, even when it is inconvenient.
3. **What we refuse to do.** No miracle claims, no fake reviews, no invented before-and-afters, no pretending a cosmetic is a medicine.

> `TODO: owner to supply` — the founder's real name, background, and the actual founding story.
> Until then, use the framing above without inventing biographical facts. A missing founder
> photo is far less damaging than a fabricated one.

### 3. What we stand for
Four principle cards, gold numerals:

| # | Principle | Body |
|---|---|---|
| ١ | **الشفافية في التركيز** | كل مكوّن فعّال مكتوب بنسبته. لو ما مكتوب، لا تثقين فيه — لا عندنا ولا عند غيرنا. |
| ٢ | **الصدق في المدة** | ما نقول "نتيجة في أسبوع". نقول ٤ إلى ٨ أسابيع، لأن هذي الحقيقة. |
| ٣ | **السبب مو العَرَض** | نشتغل على الأسباب الثلاثة للتساقط، مو على مظهر الشعرة. |
| ٤ | **نقول اللي ما ينفع** | لو منتجنا ما ينفع لحالتك، نقولها لك. |

### 4. The three causes explainer
Reuse `CausesSection`. Someone landing here from a footer link may not have seen it.

### 5. How we choose ingredients `[S]` reverse=true
- H2: **كيف نختار المكوّنات**
- Four criteria, each one line: published or supplier clinical data on the active · a concentration in the range the studies used · a safety profile suitable for daily home use · SFDA-compliant, with the full INCI published
- Honest closer: ما نخترع مكوّنات، ونستخدم مكوّنات مدروسة بتراكيز معروفة — وهذا اللي نقدر نثبته.

### 6. Compliance and quality
- SFDA compliance statement (factual, not an endorsement claim — see `07` §3 on false authority)
- Full ingredient lists published on every product page
- Batch number and expiry date on every unit
- Sealed packaging
- `TODO: owner to supply` — CR number, VAT number, registered address, SFDA notification numbers per product

### 7. Contact / final CTA
- H2: عندك سؤال؟ كلّمينا
- WhatsApp primary CTA + link to `/contact`
- Secondary CTA → `/collection`

---

# `/contact` — تواصلي معنا

**Job:** prove a human is reachable, and be genuinely useful. WhatsApp is the primary channel;
Saudi customers overwhelmingly prefer it and it converts support into sales.

## Layout

Two columns on desktop (contact methods at the start/right, form at the end/left), stacked on
mobile with **contact methods first** — most visitors want to message, not fill a form.

### 1. Header
- H1: **تواصلي معنا**
- Sub: نرد على واتساب خلال ساعة في أوقات العمل. وإذا كتبتِ لنا هنا، نرجع لك خلال <LTR>24</LTR> ساعة.

### 2. Contact methods (cards)

| Method | Details | CTA |
|---|---|---|
| **واتساب** (primary, gold border) | الأسرع — نرد خلال ساعة | `https://wa.me/{number}` with a prefilled message: «مرحباً، عندي سؤال عن منتجات أصول» |
| **الجوال** | `TODO: owner to supply` | `tel:` link |
| **الإيميل** | `TODO: owner to supply` | `mailto:` link |
| **أوقات العمل** | الأحد – الخميس، <LTR>9</LTR> صباحاً – <LTR>6</LTR> مساءً · الجمعة والسبت: ردود متأخرة | — |

Below the cards: registered business details (legal name, CR number, address) — required by the
KSA E-Commerce Law and one of the strongest anti-scam signals available. Mark clearly as
`TODO: owner to supply`.

### 3. Contact form

Four fields, all clearly labelled (no placeholder-only labels):

| Field | Type | Validation |
|---|---|---|
| الاسم | text | required, ≥ 2 chars |
| رقم الجوال | tel | required, same KSA validation as checkout (`16` §4) — reuse `PhoneField` |
| الموضوع | select | استفسار عن منتج · طلبي · إرجاع أو استبدال · شي ثاني |
| رسالتك | textarea | required, ≥ 10 chars, max 1000 |

- Submit → `POST /api/contact`
- Success: inline success panel (do not navigate away): «وصلتنا رسالتك. نرجع لك خلال <LTR>24</LTR> ساعة — وإذا مستعجلة، كلّمينا واتساب.» with the WhatsApp CTA
- Error: `errGeneric` from `05` §5 plus the WhatsApp fallback
- Honeypot field + rate limiting (`29`). No CAPTCHA in v1 — it depresses submissions and the honeypot plus rate limit is sufficient at this volume.
- Submitting fires a `Contact` / `SubmitForm` event (`23`).

### 4. Quick-answer FAQ

6 questions that pre-empt the most common contact reasons, reducing support volume:
وين طلبي؟ · كم ياخذ التوصيل؟ · كيف أرجّع؟ · كيف أدفع؟ · أي منتج أبدأ فيه؟ · آمن للحامل؟

### 5. Final CTA
`ghost` → `/collection`

---

## Engineering notes (both pages)

- Fully static. No client-side data fetching on `/about`; `/contact` is a static shell with a client form island.
- `metadata` per `28`. Both pages are indexable.
- JSON-LD: `Organization` on `/about` (with `contactPoint`), `ContactPage` on `/contact`.
- The contact form posts to the backend, which persists to a `contact_messages` table (`21`) **and** pushes to a `Messages` tab in the Google Sheet via the same webhook mechanism (`25`).
- WhatsApp number lives in `NEXT_PUBLIC_WHATSAPP_NUMBER` (`27`) — never hardcoded, it appears in a dozen places.
- Every `TODO: owner to supply` placeholder must be rendered as visible text in a distinctive style during development so it cannot ship unnoticed, and all of them are listed in `33`.
