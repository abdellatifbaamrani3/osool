# 02 — Brand Identity

## 1. Name

- **Arabic:** أصول
- **Latin:** OSOOL
- **Domain:** osool.shop

**Meaning and why it works.** أصول carries three senses at once, all of them on-strategy:

1. **Roots** (أصل الشعر) — literally the hair root, which is exactly what we treat. Our
   entire category story is "treat the root, not the strand".
2. **Origins / authenticity** — something with a known provenance, not a knock-off. This
   directly counters the biggest objection to a new online brand in KSA.
3. **Principles / fundamentals** (الأصول) — doing things properly, by the book. This is the
   authority register we write in.

**Tagline (primary):** العناية تبدأ من الأصل
*(Care starts at the root.)*

**Tagline (alternates, for ads and packaging):**
- من الأصل، وبالدليل — *From the root, and with proof.*
- شعرك يبدأ من فروة سليمة — *Your hair starts with a healthy scalp.*

**Pronunciation note for voiceover/UGC briefs:** "أُصول" (uṣūl), not "أَصول".

## 2. Logo

A text-only wordmark plus a monogram tile. No illustrated icon, no leaf, no hair strand
graphic — those read cheap and generic.

### 2.1 Header lockup (as specified)

In RTL, the lockup sits at the **start of the header line, which is the right edge**.

```
[ ⃝O ]  أصول
        OSOOL
```

Reading right-to-left the user sees: monogram tile, then the wordmark stack.

- **Monogram tile:** a circle filled with `--brand-700` containing a Latin capital **O** in
  `--gold-500`. Circle 40px on mobile, 44px on desktop. The O is optically centred (Latin
  caps sit slightly high in most fonts — nudge down 1px, do not trust `align-items` alone).
- **Wordmark:** `أصول` on the first line, `OSOOL` beneath it.
  - `أصول` — font `Aref Ruqaa`, weight 700, 22px mobile / 26px desktop, colour `--brand-900`
  - `OSOOL` — font `Readex Pro`, weight 400, 10px mobile / 11px desktop, `letter-spacing: 0.22em`, uppercase, colour `--muted`
  - The Latin line is optically aligned to the same edge as the Arabic line.
- **Gap:** 10px between tile and wordmark. Do not let them touch.

### 2.2 Rules

- Minimum clear space around the full lockup: the height of the monogram circle ÷ 2.
- On dark backgrounds: circle becomes `--gold-500`, the O becomes `--brand-900`, `أصول` becomes `--ivory`, `OSOOL` becomes `--gold-200`.
- Never stretch, rotate, outline, add a shadow to, or re-colour the wordmark outside these two variants.
- Favicon / app icon: the monogram tile alone, square-cropped with the circle inset 12%.
- The monogram may be used alone as a watermark, a section divider ornament, a review-card avatar fallback, and the loading indicator.

### 2.3 Deliverable

Build the logo as a React component `<Logo variant="default" | "inverse" | "mark" />` using
live text and CSS, **not** an image file. It stays crisp, it is translatable, and it costs
zero bytes.

## 3. Colour palette

The palette is deep green + champagne gold on warm ivory. Rationale:

- Green is the single most culturally positive colour in Saudi Arabia and simultaneously
  reads botanical-clinical — exactly our "science-backed but not pharmaceutical" position.
- Champagne gold delivers premium signalling without the tackiness of bright yellow-gold.
- Warm ivory (not pure white) is the fastest way to make a page look expensive rather than
  templated.
- It is also *differentiated*: the KSA women's-beauty DTC space is saturated with blush pink,
  beige, and lilac. Green-gold stands out in a Snapchat feed.

### 3.1 Tokens

```css
/* Brand — deep green */
--brand-900: #0E2E27;  /* darkest: hero backgrounds, footer, wordmark */
--brand-800: #103A31;
--brand-700: #14483C;  /* primary CTA background, monogram tile */
--brand-600: #1C6B55;  /* links, active states, success */
--brand-500: #2A8A6E;
--brand-100: #D6E7E0;
--brand-50:  #EAF3EF;  /* tinted section backgrounds */

/* Accent — champagne gold */
--gold-600:  #A9873F;  /* gold text on light backgrounds (contrast-safe) */
--gold-500:  #C2A15B;  /* the accent: monogram O, rules, badges, stars */
--gold-300:  #DFCB9B;
--gold-200:  #EFE3C8;
--gold-100:  #F7F0E1;

/* Neutrals — warm */
--ivory:     #FBF8F3;  /* page background */
--sand-100:  #F3EEE6;  /* alternating section background */
--sand-200:  #E7DFD3;  /* borders, dividers */
--ink:       #101A17;  /* body text */
--ink-soft:  #33413C;  /* secondary text */
--muted:     #6B7A74;  /* tertiary text, labels */
--white:     #FFFFFF;  /* cards on ivory */

/* Functional */
--urgent:    #B3402F;  /* terracotta: low stock, countdown. Use sparingly. */
--urgent-bg: #FBEEEB;
--success:   #1C6B55;
--warning:   #9A6B1F;
--error:     #B3402F;
```

### 3.2 Usage rules

| Use | Token |
|---|---|
| Page background | `--ivory` |
| Alternating section background | `--sand-100` or `--brand-50` |
| Full-bleed emphasis section (hero, proof, footer) | `--brand-900` |
| Card surface | `--white` with `1px solid --sand-200` |
| Body text | `--ink` |
| Primary CTA | bg `--brand-700`, text `--white`. **Every primary CTA on the site is this.** |
| Primary CTA on dark | bg `--gold-500`, text `--brand-900` |
| Secondary CTA | transparent bg, `1.5px solid --brand-700`, text `--brand-700` |
| Stars, badges, ornamental rules, selected-offer ring | `--gold-500` |
| Gold text on light background | `--gold-600` (never `--gold-500`; it fails contrast) |
| Low stock, countdown, "last chance" | `--urgent` on `--urgent-bg` |

**Hard rules**

- **One primary CTA colour across the entire site.** Users learn "green = buy" in three
  seconds and then it is free. Do not introduce a second CTA colour for variety.
- `--urgent` appears at most **twice per screenful**. Urgency everywhere reads as a scam and
  Saudi buyers are unusually sensitive to this.
- All text must pass WCAG AA (4.5:1 body, 3:1 for ≥24px). `--gold-500` on `--ivory` does
  **not** pass — that is what `--gold-600` is for.
- Gradients: allowed only as a subtle `--brand-900 → --brand-800` on large dark sections.
  No colourful gradients, no glassmorphism.

## 4. Typography

### 4.1 Families

| Role | Family | Why | Load |
|---|---|---|---|
| Logo wordmark `أصول` only | **Aref Ruqaa** 700 | Calligraphic, heritage, signals "أصول" literally. Used for ~5 characters, so its poor UI legibility does not matter. | subset to just the glyphs in "أصول" |
| Headings + UI + body | **Readex Pro** 300/400/500/600/700 | Purpose-built for Arabic *and* Latin with matched proportions, excellent at small sizes on Android, modern-premium without being trendy. Solves the usual Arabic/Latin mismatch in one family. | variable font, `swap` |
| Numerals in prices/timers | **Readex Pro**, `font-variant-numeric: tabular-nums` | Stops price and countdown digits from jittering. | — |

Use **Western Arabic numerals (199, 279, 349)**, not Eastern Arabic-Indic (١٩٩). Saudi
e-commerce convention is Western digits and they scan faster in a price context.

Do not add a third family. If a display face is ever needed, use Readex Pro 700 at a large
size with tightened tracking.

### 4.2 Type scale

Mobile-first. Arabic needs slightly more line-height than Latin because of ascenders,
descenders, and diacritic clearance — never go below 1.5 for body Arabic.

| Token | Mobile | Desktop | Weight | Line-height | Use |
|---|---|---|---|---|---|
| `display` | 30px | 52px | 700 | 1.25 | Hero headline |
| `h1` | 26px | 40px | 700 | 1.3 | Page title |
| `h2` | 22px | 32px | 600 | 1.35 | Section heading |
| `h3` | 18px | 24px | 600 | 1.4 | Sub-section, card title |
| `body-lg` | 17px | 18px | 400 | 1.75 | Lead paragraph, hero sub |
| `body` | 15px | 16px | 400 | 1.7 | Default |
| `body-sm` | 13px | 14px | 400 | 1.6 | Helper, meta |
| `label` | 12px | 12px | 500 | 1.4 | Eyebrows, badges, `letter-spacing: 0.06em` |
| `price` | 24px | 28px | 700 | 1.2 | tabular-nums |

**Arabic-specific typography rules**

- Never `text-transform: uppercase` on Arabic (no case) — it is a no-op that will silently
  break any Latin mixed in.
- Never letter-space Arabic. It severs the cursive joins and looks broken. `letter-spacing`
  is Latin-only, applied via a `.latin` utility class.
- Never italicise Arabic. Use weight or colour for emphasis.
- Body copy max width: 62–68 characters (`max-w-[38rem]`). Arabic at full desktop width is
  unreadable.
- Headline balance: use `text-wrap: balance` on h1/h2 to avoid one orphan word.
- Latin/number runs inside Arabic text need `dir="ltr"` wrappers or they reorder — see `05`.

## 5. Voice and tone

We are the **knowledgeable, warm, straight-talking specialist**. Think of the most competent
pharmacist you know, who happens to be a woman your age, who will tell you honestly that
this will take eight weeks.

**We are:** specific, calm, evidence-led, warm, respectful of the reader's intelligence.
**We are not:** hyped, salesy, medical-scary, patronising, jokey, or coy about pricing.

| Instead of | Write |
|---|---|
| "منتج سحري للشعر" (magic product) | "سيروم بتركيز ٣٪ ريدنسل، يشتغل على البصيلة" |
| "نتائج فورية!" (instant results) | "أول فرق يبان من ٤ إلى ٨ أسابيع بالاستخدام اليومي" |
| "الأفضل في العالم" (best in the world) | "مكوّنات مدروسة وبتركيز واضح — كل شي مكتوب على العلبة" |
| "يعالج التساقط" (treats hair loss — a banned medical claim) | "يدعم كثافة الشعر ويقلل الشعرة الضعيفة" |

Five voice rules:

1. **Lead with the specific.** A number, a percentage, a timeline, a named molecule. Specificity is the cheapest form of credibility.
2. **Name the limit.** "ما ينفع لو التساقط سببه نقص حديد — وهذي وظيفة التونك." Admitting what a product does *not* do makes every other claim believable.
3. **Talk to one woman.** Second person singular feminine throughout. Never "عملاءنا الكرام".
4. **Short sentences.** Arabic tempts long subordinate clauses. Resist. One idea per sentence.
5. **Never apologise for the price.** State it plainly next to the value. Hedging signals it is not worth it.

Full dialect rules, banned words, and ready-made copy blocks: `05-copy-guide-ar-ksa.md`.

## 6. Photography and art direction

Until real assets arrive, all imagery is a placeholder per `31-images-and-assets.md`. The
final direction, which briefs and placeholders should anticipate:

- **Light:** soft, warm, directional daylight. One light source. Gentle shadows, never flat.
- **Palette in-frame:** ivory, sand, deep green props, brushed gold, real greenery. No pink, no neon, no marble-and-gold cliché.
- **Product shots:** clean, on ivory or sand, slight top-down angle, real shadow. Bottle label legible. Macro texture shots of droplet/serum.
- **People:** Saudi/Gulf women, 25–45, modest styling, hair visible where relevant, real scalps and real hair textures. Warm and confident, never distressed "before" faces.
- **Do not use:** obvious western stock photography, laboratory stock photos with beakers, men in white coats, or AI images with mangled Arabic text or extra fingers.
- **Composition for alternating sections:** subject placed toward the frame edge that faces the text, so the composition points at the copy.

## 7. Brand assets checklist for the coder

- [ ] `<Logo />` component, three variants, live text
- [ ] Favicon set + `apple-touch-icon` + `manifest.json` from the monogram
- [ ] OG/Twitter share image: `--brand-900` background, gold monogram, `أصول` wordmark, tagline (1200×630)
- [ ] Colour tokens in `globals.css` as CSS custom properties **and** mapped into the Tailwind theme
- [ ] Fonts self-hosted via `next/font/local` or `next/font/google` with `display: swap`, Arabic subset, and `Aref Ruqaa` subset to the four wordmark glyphs
