# 31 — Images, Placeholders, and Asset Specification

Real photography will be supplied later. Until then every image slot is filled by a **branded
placeholder** that reserves the exact final dimensions, so swapping in the real asset requires no
layout change and produces zero CLS.

---

## 1. The `PlaceholderImage` component

Not a grey box, and not an external service like `placehold.co` (an extra DNS lookup, a network
dependency, and it looks broken in screenshots shown to the client).

```tsx
// src/components/shared/PlaceholderImage.tsx
type Props = {
  ratio: '1:1' | '4:5' | '16:9' | '3:2';
  label: string;              // Arabic description of the intended shot
  variant?: 'product' | 'lifestyle' | 'diagram' | 'ugc';
  className?: string;
  priority?: boolean;
};
```

**Rendering:** an inline SVG (zero network cost) with

- a background of `--sand-100` (`lifestyle`), `--ivory` (`product`), `--brand-50` (`diagram`), or `--gold-100` (`ugc`)
- a centred gold `أصول` monogram at 12% opacity
- the `label` text centred beneath it in `--muted`, 13px
- the intended dimensions in the corner, e.g. `1200×1200`
- a 1px dashed `--sand-200` border so it is unmistakably a placeholder in review

Wrapped in a container with the correct `aspect-ratio` so the reserved box matches the final image
exactly.

```tsx
<PlaceholderImage ratio="1:1" variant="product"
  label="سيروم أصول على خلفية عاجية — إضاءة طبيعية من الجانب" />
```

**Swap rule:** when the real asset arrives, replace the `<PlaceholderImage>` with `<Image>` at the
same ratio and reuse the `label` as the `alt`. Nothing else changes.

---

## 2. Complete asset manifest

Every image the site needs, with its slot, ratio, and brief. **19 unique assets** for a complete
v1 (plus review avatars, which can remain monogram fallbacks indefinitely).

### 2.1 Home page

| # | File | Slot | Ratio | Brief |
|---|---|---|---|---|
| 1 | `hero-home.jpg` | Hero | 4:5 mobile / 16:9 desktop | Saudi woman, 30s, modest styling, soft warm side light, running fingers through hair, calm and confident. She faces toward the copy column. Ivory/sand/green palette in frame. |
| 2 | `home-why-failed.jpg` | "ليش ما نفع" section | 4:5 | Flat-lay of the *alternatives*: generic oil bottle, vitamin jar, shampoo — deliberately anonymous, no readable brands. Cool, slightly flat light to contrast with our warm product shots. |
| 3 | `home-routine.jpg` | System/routine section | 4:5 | All three أصول products together on a sand surface with a linen texture, brushed-gold tray, sprig of greenery. Top-down at a slight angle, one soft shadow. |
| 4 | `home-founder.jpg` | Brand story teaser | 4:5 | Hands holding a product, or a warm workspace detail. Human but not a posed corporate portrait. |

### 2.2 Per product — 5 assets each (15 total)

Repeat for `serum`, `tonic`, `exfoliant`:

| # | File | Slot | Ratio | Brief |
|---|---|---|---|---|
| 1 | `{key}-1-product.jpg` | Gallery main — **LCP** | 1:1 | Product on ivory, slight top-down angle, real soft shadow, label fully legible. This is the most important image on the site. |
| 2 | `{key}-2-lifestyle.jpg` | Gallery | 1:1 | In hand or on a bathroom shelf, in use context, warm natural light |
| 3 | `{key}-3-texture.jpg` | Gallery | 1:1 | Macro of the texture — a serum droplet, the tonic's colour in a glass, the exfoliant's consistency. Communicates quality faster than any copy. |
| 4 | `{key}-4-mechanism.svg` | Mechanism section | 4:5 | **Illustration, not a photo.** Simple diagram in brand colours. Serum: follicle in growth vs shedding phase. Tonic: iron reaching the follicle. Exfoliant: blocked vs clear follicular path. **Maximum three labels** — it must be legible at 390px. |
| 5 | `{key}-5-howto.jpg` | How-to-use section | 4:5 | Application demonstration: dropper on the scalp / tonic being measured / exfoliant being massaged in |

### 2.3 Shared

| # | File | Slot | Ratio | Brief |
|---|---|---|---|---|
| — | `og-default.png` | Open Graph | 1200×630 | `--brand-900` background, gold monogram, `أصول` wordmark, tagline. Can be generated at build time with `next/og` — no photographer needed. |
| — | `favicon` set | Browser | multiple | From the monogram tile (`02` §2.2) |
| — | `review-{n}.jpg` | Review cards | 1:1 | Real UGC only. Until then, use the monogram avatar fallback — never a stock portrait. |
| — | `ugc-{n}.jpg` | UGC strip | 1:1 | Video stills from real customer content. Placeholder variant `ugc` until then. |

---

## 3. Naming and organisation

```
public/images/
├── hero/          hero-home.jpg
├── products/      serum-1-product.jpg … exfoliant-5-howto.jpg
├── diagrams/      serum-4-mechanism.svg …
├── lifestyle/     home-why-failed.jpg, home-routine.jpg, home-founder.jpg
├── reviews/       review-1.jpg …
└── ugc/           ugc-1.jpg …
```

Convention: `{context}-{n}-{descriptor}.{ext}`, lowercase, hyphens, no Arabic in filenames (they
percent-encode badly and break in some in-app browsers).

---

## 4. Alt text

Alt text is both an accessibility requirement and an SEO asset — and it is content, so **the
banned-words list in `07` §3 applies to it**.

| Type | Rule | Example |
|---|---|---|
| Product | Product name + context | `سيروم أصول ريدنسل ٣٪ على خلفية عاجية` |
| Lifestyle | What is happening | `امرأة تضع سيروم أصول على فروة الرأس` |
| Diagram | What it explains | `رسم توضيحي: البصيلة في مرحلة النمو مقابل مرحلة السقوط` |
| Decorative | Empty | `alt=""` |
| Review photo | Neutral | `صورة من تجربة نورة مع سيروم أصول` |

Never write `alt="صورة"` or `alt="سيروم يعالج التساقط"` — the first is useless, the second is a
banned claim in a place people forget to audit.

---

## 5. Technical specification

| Property | Value |
|---|---|
| Source format | JPEG for photos, SVG for diagrams, PNG only when transparency is required |
| Source max dimension | 2000px — larger is wasted |
| Source compression | Compress **before** committing. `next/image` optimises delivery, not the source file. |
| Delivery | AVIF with WebP fallback, `quality={80}`, via `next/image` |
| Product images | 1200×1200 source |
| Hero | 1080×1350 (4:5) and 1920×1080 (16:9) |
| Split-section media | 900×1125 (4:5) |
| Review photos | 400×400 |
| Colour profile | sRGB (Adobe RGB will look desaturated in browsers) |
| `sizes` | Always specified — a missing `sizes` makes Next.js serve the largest variant to a phone |

---

## 6. Photography brief (for when real shooting happens)

Give this to the photographer or use it as the AI-image prompt basis.

**Do**

- One soft, warm, directional light source (window light, late afternoon quality)
- Real shadows with soft edges — flat lighting looks cheap
- Palette in frame: ivory, sand, deep green, brushed gold, real greenery, linen and stone textures
- Modest styling, Saudi/Gulf women aged 25–45, warm and confident expressions
- Product labels legible and sharp
- Negative space on the side that will face the copy column
- Shoot both 1:1 and 4:5 crops of every scene — the site needs both

**Do not**

- Recognisable western stock photography
- Laboratory props: beakers, microscopes, men in white coats (these also imply medical claims — `07` §3)
- Distressed "before" faces or anything that shames the viewer (also against ad-platform policy — `07` §9)
- Marble-and-rose-gold clichés, pink or lilac palettes
- Before/after transformation imagery **unless** we hold documented written consent, with matched lighting/angle and the elapsed time stated (`07` §6)
- Anything a Saudi woman would not be comfortable sharing

**If using AI-generated imagery:** check every frame for mangled Arabic text on labels, extra
fingers, and impossible product geometry. A single visible artefact undoes the premium positioning
the entire site is built to support. Real product photography of the actual bottles is strongly
preferred for the gallery — AI is acceptable for lifestyle and background scenes.

---

## 7. Video (for later)

The client plans AI video, UGC, and edited video for Snapchat and TikTok. Site-side considerations:

- No autoplay video above the fold — it destroys LCP and mobile data budgets
- Product-page UGC strip: poster images that open a lightbox player on tap; the video itself loads only on interaction
- Self-host short clips as MP4/WebM, or use a CDN. **Do not embed YouTube** — the iframe costs ~500KB and adds three third-party domains (`28` §5)
- Always `muted` + `playsInline`, with captions burned in (most viewers watch without sound)
- Vertical 9:16 for anything sourced from the ad creative

---

## 8. Checklist

- [ ] `PlaceholderImage` implemented, with all four variants
- [ ] Every image slot in §2 filled with a placeholder carrying a real Arabic brief as its `label`
- [ ] Every placeholder reserves the exact final aspect ratio
- [ ] LCP images marked `priority` (home hero, first product gallery image)
- [ ] All `alt` text written in Arabic, audited against the `07` §3 banned list
- [ ] `sizes` set on every `next/image`
- [ ] Mechanism diagrams legible at 390px with ≤ 3 labels
- [ ] OG image generated and rendering correctly in a WhatsApp/Twitter link preview
- [ ] No stock portraits used as review avatars — monogram fallback instead
- [ ] Asset manifest handed to the owner as the shot list for the real photo session
