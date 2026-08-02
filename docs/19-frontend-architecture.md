# 19 — Frontend Architecture

## 1. Stack decision

| Concern | Choice | Why this and not the alternative |
|---|---|---|
| Framework | **Next.js 15+, App Router** | Static + ISR gives us near-instant product pages (critical for paid mobile traffic), server components keep the JS bundle small, and image optimisation is built in. Vite/CRA would mean shipping a client-only SPA — unacceptable LCP for this traffic source. |
| Language | **TypeScript**, `strict: true` | Prices, offer ids, and phone formats are exactly the things that break silently in JS. |
| Styling | **Tailwind CSS v4** | Logical properties (`ms/me/ps/pe/start/end`) make RTL correct by default, and utility CSS keeps us from shipping unused stylesheet weight. |
| Components | **shadcn/ui** (copy-in, selectively) | We own the code, so we can make Dialog/Drawer/Accordion RTL-correct. Do **not** pull in a whole component library (MUI/Chakra) — the bundle cost and the RTL fights are not worth it. |
| Primitives | **Radix UI** (via shadcn) | Accessible dialog/drawer/radio-group/accordion with real focus management. Hand-rolling a focus trap is a bug factory. |
| State | **Zustand** + `persist` | The only real global state is the cart. Redux is overkill; Context re-renders the tree on every cart change. |
| Server data | **Server components + `fetch`** with ISR | No React Query needed — there is almost no client-side data fetching. Add it only if the review filters need it. |
| Forms | **react-hook-form** + **zod** | Uncontrolled inputs mean fewer re-renders on the checkout field, and the zod schema is shared conceptually with the backend's Pydantic model. |
| Icons | **lucide-react** | Tree-shakable, consistent grid. |
| Animation | **CSS transitions first**; `framer-motion` **only** for the drawer/modal | Framer is ~35KB gzipped. Do not import it for hover effects. |
| Fonts | `next/font` | Self-hosted, zero layout shift, Arabic subsetting. |
| Carousel | **embla-carousel-react** | Tiny, real RTL support (`direction: 'rtl'`), no jQuery-era baggage. |
| Analytics/pixels | **Hand-rolled deferred loader** | See `23`. No GTM — it is a large, render-blocking dependency for a use case we can do in 3KB. |

### Explicitly rejected

- **GTM / Tag Manager** — 100KB+ and a competing execution context for something we control precisely (`23`).
- **A UI kit with its own design language** — our design system is the pricing power (`10`).
- **Redux / Recoil / Jotai** — one store with three actions.
- **i18n framework** — one language, one direction (`09` §5).
- **A CMS** — three products; content lives in the database and in typed content files.

---

## 2. Project structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # <html lang="ar" dir="rtl">, fonts, providers
│   │   ├── page.tsx                   # home
│   │   ├── globals.css                # @theme tokens (see 10 §1)
│   │   ├── collection/page.tsx
│   │   ├── products/[slug]/page.tsx   # generateStaticParams for 3 slugs
│   │   ├── thank-you/[orderId]/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── (legal)/
│   │   │   ├── terms/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   ├── returns/page.tsx
│   │   │   └── shipping/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── not-found.tsx
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   └── opengraph-image.tsx
│   ├── components/
│   │   ├── ui/                        # primitives: Button, Input, Badge, Card, Modal, Drawer…
│   │   ├── layout/                    # Header, Footer, AnnouncementBar, WhatsAppFab, Logo
│   │   ├── commerce/                  # OfferSelector, ProductCard, CartDrawer, CheckoutModal,
│   │   │                              # UpsellModal, StickyAddToCart, PhoneField, CartLineItem
│   │   ├── sections/                  # Hero, CausesSection, MechanismSection, IngredientPanel,
│   │   │                              # EvidenceBlock, TimelineSection, ReviewsSection,
│   │   │                              # ComparisonTable, FaqAccordion, TrustStrip, SplitSection
│   │   └── shared/                    # LTR, PriceTag, PlaceholderImage, SectionHeading, Rating
│   ├── content/
│   │   ├── ar.ts                      # ALL UI strings (see 05 §5)
│   │   ├── products/
│   │   │   ├── serum.ts
│   │   │   ├── tonic.ts
│   │   │   └── exfoliant.ts
│   │   ├── faq.ts
│   │   └── legal/*.mdx
│   ├── lib/
│   │   ├── api.ts                     # typed backend client
│   │   ├── phone.ts                   # KSA normalise + validate (16 §4)
│   │   ├── money.ts                   # SAR formatting
│   │   ├── attribution.ts             # click-id capture cookie (09 §6)
│   │   ├── event-id.ts                # uuid minting for dedup
│   │   ├── utils.ts                   # cn(), clamp, etc.
│   │   └── tracking/
│   │       ├── index.ts               # track() facade
│   │       ├── loader.ts              # deferred pixel loading (23 §3)
│   │       ├── meta.ts
│   │       ├── tiktok.ts
│   │       ├── snap.ts
│   │       └── events.ts              # the canonical event map
│   ├── store/
│   │   └── cart.ts                    # Zustand + persist (15 §7)
│   ├── hooks/
│   │   ├── use-cart.ts
│   │   ├── use-countdown.ts           # server-timestamp based
│   │   ├── use-sticky-visible.ts      # IntersectionObserver
│   │   └── use-scroll-depth.ts
│   └── types/
│       ├── product.ts
│       ├── order.ts
│       └── tracking.ts
├── public/
│   ├── images/                        # placeholders (31)
│   ├── fonts/                         # if self-hosting locally
│   ├── favicon.ico
│   └── site.webmanifest
├── .env.example
├── Dockerfile
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Rule:** no Arabic string literals inside components. Everything comes from `content/`. This is
what makes the copy auditable against `05` §7 and lets copy be revised without touching JSX.

---

## 3. Rendering strategy

| Route | Strategy | Revalidate |
|---|---|---|
| `/` | Static + ISR | 300s |
| `/collection` | Static + ISR | 300s |
| `/products/[slug]` | Static + ISR, `generateStaticParams` | 300s |
| `/about`, `/contact`, legal, `/faq` | Fully static | — |
| `/thank-you/[orderId]` | Dynamic (SSR), `noindex` | — |

- Product data is fetched **server-side** at build/revalidate time. No client fetch on any
  critical path.
- Client components are islands: `CartDrawer`, `CheckoutModal`, `UpsellModal`, `OfferSelector`,
  `StickyAddToCart`, `Header` cart badge, review filters, and the tracking loader. Everything
  else is a server component.
- `next/dynamic` for the gallery lightbox, comparison table, and review filters — below-the-fold
  and rarely used.

---

## 4. Fonts

```ts
// src/app/fonts.ts
import { Readex_Pro, Aref_Ruqaa } from 'next/font/google';

export const readex = Readex_Pro({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-readex',
  display: 'swap',
  adjustFontFallback: true,   // holds CLS at 0
});

// Logo wordmark only — 4 glyphs. Subsetting keeps this ~2KB.
export const arefRuqaa = Aref_Ruqaa({
  subsets: ['arabic'],
  weight: ['700'],
  variable: '--font-aref',
  display: 'swap',
});
```

Apply both variables on `<body>`; `--font-readex` is the default family, `--font-aref` is used
only by `<Logo />`. If the deployment environment cannot reach Google Fonts at build time,
switch to `next/font/local` with the WOFF2 files in `public/fonts` — decide this early, because
it affects the Dockerfile's network requirements (`26`).

---

## 5. Cart store

Full type and rules in `15` §7. Key implementation notes:

- `persist` middleware, key `osool_cart`, `localStorage`
- Hydrate in an effect, not during render, or Next.js throws a hydration mismatch. Render the
  header badge as empty until `hasHydrated` is true.
- Prices are denormalised for instant render, but the **server recomputes every price from the
  `offers` table at order creation** and ignores anything the client sends (`22`, `29`).
- Cap per-line quantity at 10.
- `clear()` only after the upsell resolves (`17` §11).

---

## 6. API client

```ts
// src/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_URL!;   // https://api.osool.shop

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/api/products`, { next: { revalidate: 300 } });
  if (!res.ok) throw new ApiError(res.status, 'products');
  return res.json();
}

export async function createOrder(input: CreateOrderInput, idempotencyKey: string) {
  const res = await fetch(`${BASE}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(input),
  });
  // ... typed error handling, see 22 §errors
}
```

- One typed function per endpoint. No `fetch` calls scattered in components.
- Server-side calls use the **internal** URL if the backend is reachable on the EasyPanel
  network; browser calls must use the public `https://api.osool.shop` (`27`).
- Never expose a secret in a `NEXT_PUBLIC_*` variable. Pixel **IDs** are public and fine; CAPI
  **access tokens** are backend-only. Getting this wrong leaks a token that can write events to
  the ad accounts (`29`).
- Every mutating request carries an `Idempotency-Key`.
- Errors surface as typed `ApiError` and always have a user-facing Arabic message plus a
  WhatsApp fallback (`05` §5).

---

## 7. RTL implementation

Non-negotiable rules (full list in `05` §8):

- `<html lang="ar" dir="rtl">` server-rendered in the root layout
- **Logical properties only.** `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`,
  `text-start`, `text-end`, `border-s`, `border-e`
- Add a lint guard against `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`,
  `text-right` in `src/` — an ESLint `no-restricted-syntax` rule on Tailwind class strings, or a
  simple CI grep. This one rule prevents the most common category of bug in this project.
- Directional icons: `rtl:-scale-x-100`. Non-directional icons: never.
- Embla carousels: `{ direction: 'rtl' }` explicitly.
- Numbers and Latin runs wrapped in `<LTR>` (`05` §4).

---

## 8. Performance rules

Budgets and measurement in `28`. Implementation-level rules:

- Server components by default; `'use client'` only where interactivity demands it
- No barrel-file imports from large packages (import `lucide-react/icons/x` style paths or rely on the package's own tree-shaking, and verify with the bundle analyser)
- `next/image` everywhere, `sizes` always specified, LCP image `priority`
- Fonts: `display: swap`, `adjustFontFallback`
- Pixels deferred until first interaction or `requestIdleCallback` (`23` §3)
- `@next/bundle-analyzer` wired up; fail the build if the route JS exceeds the budget
- No `useEffect` data fetching on any critical path

---

## 9. Error handling

| Layer | Approach |
|---|---|
| Route | `error.tsx` per segment, with an Arabic message and a WhatsApp CTA |
| Not found | Custom `not-found.tsx` — links to home, collection, all 3 products, WhatsApp (`09` §7) |
| API failure on a static page | ISR serves the last good render; log the failure |
| API failure at checkout | Never lose form state; show `errNetwork` + WhatsApp fallback (`16` §7.1) |
| Client exception | Error boundary around each interactive island so a crash in the review filter cannot take down the offer selector |

---

## 10. Code conventions

- Component files: `PascalCase.tsx`, one component per file, named exports
- Hooks: `use-kebab-case.ts`
- Utilities: `kebab-case.ts`
- Types in `types/`, colocated only if used by exactly one component
- No default exports except Next.js `page.tsx` / `layout.tsx` (which require them)
- Props typed with explicit interfaces, never `any`
- `cn()` (clsx + tailwind-merge) for conditional classes
- No inline styles except genuinely dynamic values (a countdown progress width)
- Comments only for non-obvious constraints — never to narrate what the code does
- Prettier + ESLint (`next/core-web-vitals`), plus the RTL lint guard from §7
