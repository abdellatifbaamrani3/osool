# 09 — Information Architecture

## 1. Sitemap

```
/                          الرئيسية              Home
/collection                كل المنتجات           Collection (all 3 products)
/products/[slug]           صفحة المنتج            Product / landing page  ×3
/about                     من نحن                About
/contact                   تواصلي معنا            Contact
/thank-you/[orderId]       شكراً                  Thank-you (post-order)
/terms                     الشروط والأحكام        Terms
/privacy                   سياسة الخصوصية         Privacy
/returns                   الاستبدال والإرجاع     Returns
/shipping                  سياسة التوصيل          Shipping
/faq                       الأسئلة الشائعة        FAQ (optional v1, recommended)
/404                       —                     Not found
```

Overlays (not routes, but URL-addressable via query param so they survive refresh and are
trackable):

```
?cart=open        cart drawer
?checkout=open    checkout modal
```

The upsell is **not** URL-addressable — it is a one-time state after order creation, gated by
a server timestamp. Making it linkable would let it be replayed.

## 2. Product slugs

Latin slugs (Arabic slugs cause percent-encoding ugliness in ad links, break some in-app
browsers, and are painful in analytics).

| Product | Slug | Full URL |
|---|---|---|
| Redensyl + copper peptides serum | `redensyl-copper-peptide-serum` | `osool.shop/products/redensyl-copper-peptide-serum` |
| Iron bisglycinate + Vitamin C tonic | `iron-bisglycinate-vitamin-c-tonic` | `osool.shop/products/iron-bisglycinate-vitamin-c-tonic` |
| Salicylic 2% + zinc exfoliant | `salicylic-2-zinc-scalp-exfoliant` | `osool.shop/products/salicylic-2-zinc-scalp-exfoliant` |

Slugs are stored in the `products` table and resolved at runtime — not hardcoded in the router.
Add permanent redirects for any slug change (`products.slug_history` or a redirect map).

## 3. Route → data → tracking map

| Route | Rendering | Data source | Fires on view |
|---|---|---|---|
| `/` | Static + ISR (revalidate 300s) | `/api/products` | `PageView` |
| `/collection` | Static + ISR | `/api/products` | `PageView`, `ViewContentList` |
| `/products/[slug]` | Static + ISR, `generateStaticParams` for all 3 | `/api/products/{slug}` | `PageView`, `ViewContent` |
| `/thank-you/[orderId]` | Dynamic, `noindex` | `/api/orders/{id}/summary` (public-safe fields only) | `Purchase` is fired at order creation, **not** here — see below |
| Legal pages | Fully static | MDX/local content | `PageView` |
| `/contact` | Static shell, client form | `POST /api/contact` | `PageView`, `Contact` on submit |

> **Purchase-event placement.** Fire `Purchase` from the client at the moment the order-create
> response returns (before navigating to thank-you), and from the server in the same request.
> **Do not** fire it on the thank-you page mount — she can refresh or bookmark that page and
> you will double-count. The `event_id` is minted by the server and returned with the order.
> See `23` §5 and `24` §7.

## 4. Navigation

### 4.1 Header

RTL layout. Reading right-to-left: logo → menu → cart.

**Desktop (≥1024px)** — single row, 72px tall, sticky with a subtle shadow after 40px scroll:

```
[right edge]  Logo lockup    الرئيسية · المنتجات · من نحن · تواصلي معنا    [ 🛒 badge ]  [left edge]
```

**Mobile (<1024px)** — 60px tall, sticky:

```
[right edge]  Logo    ·spacer·    [ 🛒 badge ]  [ ☰ ]  [left edge]
```

- Menu opens as a full-height drawer sliding in from the **right** (the start edge in RTL).
- Cart icon shows a badge with the item count in `--gold-500`; badge animates a single scale
  pulse when an item is added.
- Above the header on all pages: a 32px announcement bar, `--brand-900` background,
  `--gold-300` text: «توصيل لكل السعودية · دفع عند الاستلام». Dismissible, remembered in
  `localStorage`.
- The header must **never** cover the sticky add-to-cart bar on product pages. Sticky ATC is
  bottom-anchored; the header is top-anchored. Verify no z-index conflict.

### 4.2 Menu items

| Label | Route |
|---|---|
| الرئيسية | `/` |
| المنتجات | `/collection` |
| من نحن | `/about` |
| تواصلي معنا | `/contact` |

Keep it to four. Every additional header link measurably dilutes clicks on the ones that
matter. The mobile drawer additionally shows the three products by name (with thumbnails) and
a WhatsApp CTA at the bottom.

### 4.3 Footer

Four columns on desktop, stacked accordions on mobile. `--brand-900` background.

**Column 1 — Brand**
Logo (inverse variant) · tagline «العناية تبدأ من الأصل» · one-sentence brand line · social icons (Instagram, TikTok, Snapchat, WhatsApp)

**Column 2 — المنتجات**
سيروم الأصول · تونك الأصول · مقشّر الأصول · كل المنتجات

**Column 3 — أصول**
من نحن · الأسباب الثلاثة للتساقط · الأسئلة الشائعة · تواصلي معنا

**Column 4 — المساعدة والسياسات**
سياسة التوصيل · الاستبدال والإرجاع · سياسة الخصوصية · الشروط والأحكام

**Footer bottom bar**
- Payment/trust row: «الدفع عند الاستلام» badge, «توصيل لكل السعودية» badge
- Legal line: `© 2026 أصول` · legal entity name · CR number · VAT number · address
  *(all marked `TODO: owner to supply` until provided — required by KSA E-Commerce Law, see `07` §7)*
- «الأسعار شاملة ضريبة القيمة المضافة»
- WhatsApp number as a tappable `https://wa.me/...` link

### 4.4 Floating elements

| Element | Position | Behaviour |
|---|---|---|
| WhatsApp button | bottom-**start** (right in RTL), 16px inset | Always visible except when the cart drawer, checkout modal, or upsell is open. 52px circle, brand green, white glyph. Never mirror the WhatsApp glyph. |
| Sticky ATC bar | bottom, full width | Product pages only. Appears once the main offer block scrolls out of view. Contains: selected tier price + `أضيفي للسلة`. Sits **above** the WhatsApp button in z-order and shifts it up by 68px while visible. |
| Social-proof toast | bottom-**end**, above WhatsApp | Optional. Only with real data (see `18`). Max one every 45s, dismissible, never on the checkout modal. |

## 5. Locale, direction, and metadata

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

- No i18n routing, no locale prefix, no `/ar` path. One language, one direction. If English is
  ever added, do it with `next-intl` and an `/en` prefix — but not in v1.
- `metadataBase: new URL('https://osool.shop')`
- Every page exports `metadata` with an Arabic `title` and `description`. See `28` for the
  exact per-page strings and Open Graph setup.
- `<html lang="ar">` and `dir="rtl"` must be server-rendered. Setting direction in a client
  effect causes a visible layout flip on first paint and wrecks LCP.

## 6. URL parameters to preserve

Ad platforms append click identifiers that the tracking layer depends on. These must survive
navigation and be readable at order-create time.

| Param | Source | Used for |
|---|---|---|
| `fbclid` | Meta | Constructing `fbc` for Meta CAPI |
| `ttclid` | TikTok | `user.ttclid` for TikTok Events API |
| `ScCid` | Snapchat | `sc_click_id` for Snap CAPI |
| `utm_*` | All | Attribution reporting in the order record and the Sheet |

Implementation: on first load, capture all of the above plus `document.referrer` and the
landing path into a first-party cookie `osool_attr` (JSON, 90-day expiry, `SameSite=Lax`,
`Secure`). Read it at order creation and persist it on the order row **and** send it to the
Sheet. Never rely on the URL still having the params at checkout time — she will have navigated
several times. See `23` §7.

## 7. Internal linking strategy

Every page must offer a path deeper into the funnel. No dead ends.

| From | Must link to |
|---|---|
| Home | All 3 products (via the three-cause section), collection, about |
| Collection | All 3 products, and the three-cause explainer |
| Product | The other 2 products (in the "النظام الكامل" section), FAQ, shipping/returns |
| About | Collection + the founder-story CTA to the hero product |
| Contact | WhatsApp, FAQ, collection |
| Thank-you | The other products ("تجهّزي للخطوة الثانية"), WhatsApp, how-to-use content |
| 404 | Home, collection, all 3 products, WhatsApp |
| Legal pages | Collection, contact |

## 8. Breadcrumbs

Render on product pages only, with `BreadcrumbList` JSON-LD (see `28`).

`الرئيسية / المنتجات / سيروم الأصول`

Visually small, `--muted`, above the H1. Chevron separators must be RTL-flipped.

## 9. Anchor IDs (stable, used by in-page links and analytics scroll tracking)

Product page: `#offer` · `#causes` · `#mechanism` · `#ingredients` · `#evidence` · `#timeline`
· `#reviews` · `#comparison` · `#howto` · `#system` · `#faq` · `#safety`

Home page: `#causes` · `#products` · `#proof` · `#how` · `#reviews` · `#faq`

These IDs are contractual: `18` (CRO experiments) and `32` (QA) reference them, and scroll-depth
tracking keys off them.
