# 10 — Design System

Brand colours, fonts, and voice live in `02-brand-identity.md`. This document is the
implementation layer: tokens, scales, component inventory, and behaviour.

**Governing principle:** every visual decision either builds trust or reduces friction. If it
does neither, delete it. Decoration is not a goal; the store looks expensive because it is
*disciplined*, not because it is busy.

---

## 1. Token implementation

Define once in `globals.css` as CSS custom properties, then map into the Tailwind theme so both
utility classes and arbitrary CSS can use them. Never hardcode a hex value in a component.

```css
/* frontend/src/app/globals.css */
@theme {
  /* colours — see 02-brand-identity.md §3.1 for the full palette and rationale */
  --color-brand-900: #0E2E27;
  --color-brand-800: #103A31;
  --color-brand-700: #14483C;
  --color-brand-600: #1C6B55;
  --color-brand-500: #2A8A6E;
  --color-brand-100: #D6E7E0;
  --color-brand-50:  #EAF3EF;
  --color-gold-600:  #A9873F;
  --color-gold-500:  #C2A15B;
  --color-gold-300:  #DFCB9B;
  --color-gold-200:  #EFE3C8;
  --color-gold-100:  #F7F0E1;
  --color-ivory:     #FBF8F3;
  --color-sand-100:  #F3EEE6;
  --color-sand-200:  #E7DFD3;
  --color-ink:       #101A17;
  --color-ink-soft:  #33413C;
  --color-muted:     #6B7A74;
  --color-urgent:    #B3402F;
  --color-urgent-bg: #FBEEEB;

  /* radii */
  --radius-sm:  8px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-xl:  24px;
  --radius-pill: 999px;

  /* elevation — warm-tinted, never pure black */
  --shadow-sm: 0 1px 2px rgba(16,26,23,.06), 0 1px 3px rgba(16,26,23,.04);
  --shadow-md: 0 4px 12px rgba(16,26,23,.07), 0 2px 4px rgba(16,26,23,.04);
  --shadow-lg: 0 12px 32px rgba(16,26,23,.10), 0 4px 8px rgba(16,26,23,.05);
  --shadow-cta: 0 6px 18px rgba(20,72,60,.28);

  /* motion */
  --ease-out: cubic-bezier(.22,1,.36,1);
  --dur-fast: 150ms;
  --dur-base: 250ms;
  --dur-slow: 400ms;

  /* layout */
  --container: 1200px;
  --gutter-mobile: 20px;
  --gutter-desktop: 40px;
  --header-h-mobile: 60px;
  --header-h-desktop: 72px;
  --sticky-atc-h: 68px;
}
```

## 2. Spacing scale

4px base. Use only these steps: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120`.

**Section vertical rhythm** — the single most important spacing decision for a premium feel.
Generous whitespace is what separates a 199 SAR store from a 39 SAR store.

| Context | Mobile | Desktop |
|---|---|---|
| Section padding block | 56px | 96px |
| Hero padding block | 40px | 80px |
| Gap between section heading and content | 24px | 32px |
| Gap between cards in a grid | 16px | 24px |
| Inner card padding | 16px | 24px |
| Gap between paragraphs | 16px | 16px |

## 3. Layout

- Container: `max-width: 1200px`, centred, gutters 20px mobile / 40px desktop.
- Narrow content (long-form prose): `max-width: 38rem` — mandatory for Arabic readability.
- Grid: 12 columns desktop, 4 columns mobile.
- **Breakpoints:** `sm 640` · `md 768` · `lg 1024` · `xl 1280`. Design at **390px** first.
- Full-bleed sections break the container for their background but keep content inside it.

### 3.1 Alternating split sections (as requested)

The workhorse layout for product and home pages.

**Desktop (≥1024px):** two columns, `6/6` or `7/5`, `align-items: center`, gap 64px.
**Mobile:** single column, **image first, then text** — always. A wall of text before any image
is the highest-bounce pattern on mobile.

**Alternation rule in RTL.** Because RTL reading starts at the right, the "default" arrangement
is *text on the right, image on the left*. Alternate every consecutive split section:

| Section index | Desktop arrangement |
|---|---|
| 1 | text **right** (start) · image **left** (end) |
| 2 | image **right** (start) · text **left** (end) |
| 3 | text right · image left |
| … | continue alternating |

Implement with a single prop, not duplicated markup:

```tsx
<SplitSection reverse={index % 2 === 1}>
  <SplitSection.Media>…</SplitSection.Media>
  <SplitSection.Content>…</SplitSection.Content>
</SplitSection>
```

Internally use CSS `order` (or `flex-direction: row-reverse`) on the desktop breakpoint only,
so mobile order stays media-first regardless of `reverse`. Do **not** use `float`, and do not
use `left`/`right` positioning — logical properties only (see `05` §8).

Composition note for the media side: the subject should face toward the text column, so the
image points at the copy rather than out of the page.

## 4. Component inventory

Build these as the complete set. Anything not on this list needs a reason to exist.

### 4.1 Primitives

| Component | Variants / props | Notes |
|---|---|---|
| `Button` | `primary`, `secondary`, `ghost`, `urgent`; sizes `sm/md/lg/xl`; `fullWidth`, `loading`, `disabled` | Min height 48px (mobile tap target). `xl` = 56px for main CTAs. Loading shows a spinner and keeps the label width to avoid layout shift. |
| `Badge` | `gold`, `green`, `urgent`, `neutral` | Pill, 12px label, uppercase Latin only |
| `Card` | `default`, `interactive`, `selected` | White surface, `--sand-200` border, `--radius-lg` |
| `Input` | `text`, `tel`; `error`, `success` states | 52px tall, 16px font (**never smaller — iOS zooms the viewport below 16px**) |
| `Rating` | value 0–5, `count`, `size` | Gold stars, half-star support, `aria-label` with the numeric value |
| `Accordion` | single or multi-open | Chevron RTL-flipped, animated height, keyboard accessible |
| `Modal` | `sheet` (mobile bottom sheet) / `centered` (desktop) | Focus trap, `Esc` to close, scroll lock, `aria-modal` |
| `Drawer` | side `start`/`end` | Cart uses `end` visually (slides from the left edge in RTL — see §4.3) |
| `Tabs` | — | For ingredient / evidence switching |
| `Countdown` | `expiresAt: Date` | Server-authoritative, tabular-nums, thin progress bar |
| `PriceTag` | `amount`, `compareAt?`, `size` | Handles `<bdi>`, tabular-nums, and the ريال suffix |
| `Skeleton` | text / image / card | Prevents layout shift on client-fetched content |
| `Toast` | `success`, `error`, `info` | Bottom-centre mobile, bottom-end desktop |
| `Logo` | `default`, `inverse`, `mark` | Live text, per `02` §2 |
| `SectionHeading` | `eyebrow?`, `title`, `sub?`, `align` | Enforces the type scale so headings never drift |
| `LTR` | — | `<bdi dir="ltr">` wrapper for numbers and Latin runs |
| `PlaceholderImage` | `ratio`, `label`, `variant` | See `31`. Every unshot image uses this. |

### 4.2 Commerce components

| Component | Notes |
|---|---|
| `ProductCard` | Collection + cross-sell + upsell. Anatomy in `13` §3. |
| `OfferSelector` | The 3-tier ladder. Radio-group semantics, keyboard navigable. Spec in `12` §5. |
| `StickyAddToCart` | Bottom bar, appears when `#offer` leaves the viewport |
| `CartDrawer` | Spec in `15` |
| `CartLineItem` | Qty stepper, remove, per-line price |
| `CrossSellCard` | Compact card + reason line + one-tap add |
| `CheckoutModal` | Spec in `16` |
| `PhoneField` | KSA normalisation + validation + live formatting. Spec in `16` §4. |
| `UpsellModal` | Spec in `16` §7 |
| `TrustStrip` | 4 icon+label pairs, horizontal scroll on mobile |
| `ReviewCard` | Name, city, week marker, stars, verified badge, optional photo |
| `CausesSection` | The three-cause model block, reused on home/product/collection |
| `TimelineSection` | Week-by-week honest expectations |
| `ComparisonTable` | Us vs oils/vitamins/generic serums. Card-stacked on mobile. |
| `IngredientPanel` | Active, %, role, evidence link |
| `EvidenceBlock` | Citation + honest-limit note + the standard footer from `07` §5 |
| `FaqAccordion` | With `FAQPage` JSON-LD |
| `SocialProofToast` | Optional, real data only |
| `WhatsAppFab` | Floating action button |

### 4.3 Cart drawer direction

Counter-intuitive but correct: in RTL the cart icon sits at the **left** end of the header, so
the drawer should slide in from the **left** (the `end` edge) to feel spatially connected to
the icon that opened it. Test with real users if possible; if in doubt, match the icon's edge.
The menu drawer, opened from the hamburger, slides from the same edge as its trigger.

## 5. Iconography

- Library: **Lucide** (tree-shakable, consistent 24px grid, `stroke-width: 1.75`).
- Brand-coloured glyphs use `--brand-700`; on dark, `--gold-300`.
- **Flip in RTL:** `chevron-*`, `arrow-*`, `chevrons-*`, `undo`, `redo`, `log-out`, `send`.
  Apply `rtl:-scale-x-100`.
- **Never flip:** `shopping-bag`, `star`, `check`, `shield-check`, `truck`, `phone`, `clock`,
  `heart`, `package`, `lock`, and the WhatsApp/Snapchat/TikTok/Instagram brand marks.
- Every decorative icon gets `aria-hidden="true"`. Every meaningful icon gets an accessible label.
- Trust-strip icons: `truck` (delivery), `banknote` (COD), `package` (discreet packaging),
  `message-circle` (WhatsApp support).

## 6. Motion

Restrained. Motion should confirm actions, never entertain.

| Interaction | Animation |
|---|---|
| Button press | `scale(.98)`, 100ms |
| Add to cart | Cart badge scale pulse 1 → 1.25 → 1, 300ms; drawer slides in 250ms `--ease-out` |
| Drawer / modal enter | Slide + fade, 250ms `--ease-out`; backdrop fade 200ms |
| Modal exit | 180ms (exits are faster than entrances) |
| Offer tier select | Ring + background transition 150ms; price count-up 150ms |
| Accordion | Height + opacity, 200ms |
| Section reveal on scroll | `opacity 0→1`, `translateY 12px→0`, 400ms, **once only**, threshold 0.15 |
| Countdown | No animation on the digits themselves; only the progress bar animates |

Rules:

- Respect `prefers-reduced-motion: reduce` — disable all transforms and scroll reveals, keep opacity changes.
- Never animate `width`, `height`, `top`, or `left`. Only `transform` and `opacity`.
- No parallax, no scroll-jacking, no auto-playing carousels with motion, no confetti.
- Scroll reveals must **never** delay LCP content. The hero renders immediately, unanimated.
- Total animation budget per screen: 2 concurrent animations maximum.

## 7. Imagery treatment

- Aspect ratios: hero `4:5` mobile / `16:9` desktop · product gallery `1:1` · split-section media `4:5` · review photo `1:1` · lifestyle `3:2`.
- Always reserve space with `aspect-ratio` + explicit `width`/`height` to hold CLS at 0.
- `next/image` everywhere, `sizes` always set, AVIF/WebP, `quality={80}`.
- LCP image: `priority`, `fetchPriority="high"`, and **never** lazy-loaded.
- Border radius on images: `--radius-lg`. Never a circle except review avatars.
- Subtle warm overlay on lifestyle photography for palette cohesion: `rgba(251,248,243,.04)`.
- Placeholders until real assets arrive: see `31-images-and-assets.md`.

## 8. Accessibility floor

Non-negotiable, and it overlaps heavily with conversion quality.

- Text contrast ≥ 4.5:1 (≥ 3:1 for ≥24px). `--gold-500` on light fails — use `--gold-600`.
- Tap targets ≥ 44×44px, with ≥ 8px between adjacent targets.
- Visible focus ring on every interactive element: `outline: 2px solid --brand-600; outline-offset: 2px`.
- Full keyboard operability: offer selector as a radio group, modals with focus trap and `Esc`, drawer returns focus to its trigger on close.
- Form fields have real `<label>` elements, not placeholder-only labels.
- Errors are announced via `aria-live="polite"` and are described in text, not by colour alone.
- Countdown timers have an `aria-live="off"` region (a screen reader announcing every second is torture) with a single announcement at the halfway point.
- All images have meaningful Arabic `alt`; decorative ones get `alt=""`.
- Heading order is sequential: one `h1` per page, no skipped levels.

## 9. States every component must define

Before a component is "done" it must handle all seven:

1. Default · 2. Hover (desktop only) · 3. Active/pressed · 4. Focus-visible ·
5. Disabled · 6. Loading · 7. Error/empty

The most commonly skipped, and the most costly on cold paid traffic: **loading** and **error**
on the checkout submit button, and **empty** on the cart drawer.

## 10. Anti-patterns — do not ship these

| Anti-pattern | Why |
|---|---|
| Pure white `#FFF` page background | Reads templated; ivory reads expensive |
| Pure black text `#000` | Harsh on warm backgrounds; use `--ink` |
| Purple/blue "SaaS" gradients, glassmorphism | Wrong category signal entirely |
| More than one primary CTA colour | Destroys the learned "green = buy" pattern |
| Auto-playing carousels for critical content | Users miss it; hurts LCP and CLS |
| `ml-*` / `mr-*` / `left-*` / `right-*` | Breaks RTL — logical properties only |
| Placeholder text used as the only label | Fails accessibility and increases form errors |
| Font size < 16px on form inputs | iOS Safari zooms the viewport, wrecking the layout mid-checkout |
| Countdown timers that reset on refresh | Destroys trust; see `18` §honest urgency |
| Icon-only buttons without labels | Ambiguous on mobile; add text |
| More than 2 fonts | Cheapens the design; two is the limit (`02` §4.1) |
| Letter-spaced or italicised Arabic | Visually broken (`05` §4) |
| Elements that shift after fonts/images load | CLS penalty and a cheap feel; reserve all space |
