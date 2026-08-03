# FlushPin Design Bible

**Status:** Draft v0.1 — single source of truth for web + mobile visual system  
**Audience:** Product, design, web (`flushpin`), mobile (`flushpin-mobile`)  
**North-star visual:** [`flushpin-north-star-mockup.png`](./flushpin-north-star-mockup.png)  
**Last updated:** 2026-08-02

---

## 0. Product truth

FlushPin is a **travel utility**. People open it under stress: they need a restroom, a code, or a clear next step.

| Optimize for | Never optimize for |
|---|---|
| Immediate trust | Awards / “cool startup” polish |
| Clarity under stress | Agency showreel energy |
| Fast find → understand → act | Dashboard density |
| Honest states (auth, location, empty) | Fake social proof or fake readiness |

**Primary emotional outcome:** *“I immediately trust this product.”*  
**Anti-outcome:** *“This looks like a cool startup.”*

---

## 1. Brand principles

1. **Trust first** — Every screen should reduce doubt (location honesty, auth clarity, access status).
2. **Light and calm** — Bright, airy surfaces. Stress is already high; UI must not add noise.
3. **Utility over spectacle** — One job per section. No showreel, case studies, award walls.
4. **Brand-loyal turquoise** — FlushPin logo teal is the only primary accent.
5. **Premium restraint** — Strong type, generous space, few motions, tight alignment.
6. **Honest providers** — Google/Apple/etc. only when truly wired; never fake readiness.
7. **Cross-device natural** — iPhone, iPad, MacBook; Safari and Chrome.

### Inspiration (qualities only)

| Brand | Borrow | Do not borrow |
|---|---|---|
| **Apple** | Simplicity, white space, product quality | Product-category aesthetic, dark marketing excess |
| **Airbnb** | Human discovery cards, map-adjacent clarity | Marketplace clutter |
| **Patagonia / Columbia** | Outdoor durability, journey confidence | Heavy outdoor camouflage looks |
| **National Park Service** | Wayfinding clarity, functional labels | Government form density |
| **Phenomenon Studio** | Type hierarchy, spacing discipline, calm rhythm, clean header, intentional motion | Dark theme, agency layout, showreel, cases, awards, purple/neon |

---

## 2. Color system

### 2.1 Core tokens (canonical)

| Token | Hex | Role |
|---|---|---|
| `--fp-white` | `#FFFFFF` | Default page / card surface |
| `--fp-ink` | `#1B1B21` | Primary text (charcoal) |
| `--fp-gray-600` | `#52525B` | Secondary text |
| `--fp-gray-400` | `#A1A1AA` | Tertiary / placeholders |
| `--fp-border` | `#E5E7EB` | Hairlines, input borders |
| `--fp-teal` | `#00A886` | **Brand primary** (logo turquoise) |
| `--fp-teal-dark` | `#0F6E56` | Hover / pressed primary |
| `--fp-teal-tint` | `#F0FAF7` | Soft aqua helper surface |
| `--fp-surface` | `#F7FAF9` | Very light section / page wash |
| `--fp-surface-muted` | `#F3F4F6` | Quiet gray section / card tint |
| `--fp-footer` | `#1B1B21` | Footer chrome only |

### 2.2 Semantic status

| Token | Hex | Use |
|---|---|---|
| `--fp-success` | `#059669` | Success text / icons |
| `--fp-success-bg` | `#ECFDF5` | Success banners |
| `--fp-error` | `#DC2626` | Errors |
| `--fp-error-bg` | `#FEF2F2` | Error banners |
| `--fp-warning` | `#D97706` | Caution (access unknown / stale) |
| `--fp-warning-bg` | `#FFFBEB` | Warning banners |
| `--fp-info` | `#0284C7` | Neutral info (rare) |
| `--fp-info-bg` | `#F0F9FF` | Info banners |

### 2.3 Access-state colors (product)

| State | Accent | Background |
|---|---|---|
| Code / open / known good | `--fp-teal` | `--fp-teal-tint` |
| Customers-only | `#0F766E` (teal-leaning, not indigo) | `#F0FDFA` |
| Locked / key | `--fp-ink` | `--fp-surface-muted` |
| Unknown / needs update | `--fp-warning` | `--fp-warning-bg` |
| Closed / failed | `--fp-error` | `--fp-error-bg` |

**Deprecated hard-codes (must migrate):** `#1D9E75`, `#0A2E1F` (map), `#0a0f0e` / `#121816` (dark hero shells), legacy business `#0eb5ab` / `#d9f76f` / `#ff6f4a`.

### 2.4 Rules

- White / soft aqua / light gray only for primary surfaces.
- One accent: logo turquoise. No rainbow CTAs.
- No purple gradients, neon, crypto glow, glassmorphism stacks.
- Footer may stay charcoal; it is chrome, not a dark product theme.

---

## 3. Typography

### 3.1 Families

| Role | Web | Mobile (Expo) |
|---|---|---|
| UI / body | **Inter** (or SF Pro on iOS where system) | System / Inter |
| Display (optional later) | Same family, heavier weight — avoid loading a second face until needed | Same |

**Retire from public product surfaces:** orphaned Space Grotesk references, Manrope in legacy business pages.

### 3.2 Scale (web)

| Name | Size | Weight | Line height | Use |
|---|---|---|---|---|
| Display | clamp(36px, 5vw, 56px) | 700 | 1.1 | Hero only |
| H1 | 28–32px | 700 | 1.15 | Page titles |
| H2 | 22–24px | 700 | 1.2 | Section titles |
| H3 | 18–20px | 600 | 1.3 | Card titles |
| Body | 16px | 400–500 | 1.5 | Default |
| Small | 14px | 500 | 1.4 | Meta, captions |
| Micro | 12px | 600 | 1.3 | Labels, uppercase eyebrows (sparingly) |

### 3.3 Rules

- Charcoal on white/aqua only for body.
- Max ~2 type sizes competing in a viewport.
- Hero: brand + one headline + one support line + one CTA group (north-star mockup).
- No decorative all-caps walls.

---

## 4. Spacing scale

Base unit: **4px**. Preferred steps:

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96`

| Context | Guidance |
|---|---|
| Component padding | 12–24 |
| Card padding | 16–24 (mobile), 24–32 (desktop) |
| Section vertical | 64–96 desktop, 48–64 mobile |
| Stack gap inside forms | 16–20 |
| Page horizontal gutter | 16 (375), 24 (tablet), 32 (desktop) |

**Principle:** Prefer empty space over extra widgets.

---

## 5. Grid

- Content max width: **1120–1200px** (`max-w-6xl` ≈ 1152).
- Auth cards: **max 420px**, centered.
- Marketing: 1 column mobile → 2–3 columns desktop for feature rows only (not hero).
- Map: list + optional map pane; never a dense admin dashboard grid.

---

## 6. Breakpoints

| Name | Width | Intent |
|---|---|---|
| `xs` | 375 | iPhone baseline |
| `sm` | 640 | Large phones |
| `md` | 768 | iPad portrait |
| `lg` | 1024 | iPad landscape / small laptop |
| `xl` | 1280 | MacBook |
| `2xl` | 1440+ | Wide desktop |

Header: full nav from `lg` up; hamburger below.

---

## 7. Border radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 8px | Chips, small controls |
| `--radius-md` | 12px | Default cards (`.fp-card`) |
| `--radius-lg` | 16–20px | Result cards, form groups |
| `--radius-xl` | 24–28px | Auth shell, hero media |
| `--radius-pill` | 999px | Primary CTAs, filters |

Prefer **modern rounded** cards; avoid sharp newspaper edges and over-pill everything.

---

## 8. Shadow system

Minimal, quality shadows — depth without glow:

| Level | CSS | Use |
|---|---|---|
| None | — | Flat sections |
| Soft | `0 1px 2px rgba(27,27,33,0.05)` | Default card |
| Lift | `0 8px 24px rgba(27,27,33,0.08)` | Floating nearest-restroom card, modals |
| Teal CTA (optional) | `0 10px 28px rgba(0,168,134,0.28)` | Primary button only — keep subtle |

No multi-layer neon glows. No heavy drop shadows on every element.

---

## 9. Buttons

| Variant | Surface | Text | Use |
|---|---|---|---|
| **Primary** | `--fp-teal` → hover `--fp-teal-dark` | White | Main action |
| **Secondary** | White / tint + border | Ink | Alternate |
| **Ghost** | Transparent | Teal or ink | Tertiary links |
| **Danger** | Error bg + border | Error | Destructive rare |
| **Provider Google** | White + border + official G | Ink | Only when OAuth live |
| **Provider Apple** | Black Apple style | White | Only when Sign in with Apple live; else disabled “coming soon” |

Rules:

- Min height **44–52px** touch targets.
- Primary = pill or large rounded (`radius-pill` / `radius-lg`).
- One primary CTA per viewport region.
- Loading: disable + spinner or “…” label; never silent.

---

## 10. Forms

- Label above field, 14px semibold ink.
- Input: white bg, `--fp-border`, focus ring teal 20% + border teal.
- Radius: `radius-lg` (auth) or `radius-md` (compact product forms) — pick one family and stick to it.
- Helper text: gray-600; errors: error banner + field border.
- Never rely on color alone for errors.

---

## 11. Cards

Default: **interaction containers**, not decoration.

| Type | Style |
|---|---|
| Content card | White, border, soft shadow, `radius-md/lg` |
| Soft aqua card | `--fp-teal-tint` for download / trust callouts |
| Result card | White, clear hierarchy: name → distance → access chips → actions |
| Hero | Prefer full-bleed soft photo or light wash — **not** dark shell |

**Hero rule:** No cards in the first viewport except the essential search/CTA control. Stats belong below the fold (north-star mockup: floating stats under hero is OK as transition, not inside the hero headline block).

---

## 12. Navigation

### Header (light-first default)

- White / translucent white bar, border `--fp-border`.
- Official teal logo (image), left.
- Links: ink, hover teal.
- Signed out: Log in (ghost) + Sign up (primary pill).
- Signed in: color avatar + display name + Sign out.
- Sign-out failure: keep signed-in chrome + visible error banner.

### Mobile

- Logo + hamburger; optional compact Sign In.
- Sheet/menu uses same light surfaces.

### Footer

- Charcoal footer OK; keep sparse links; teal accent on wordmark only.

---

## 13. Icon rules

- Stroke icons (Lucide-style), 20–24px default.
- Color: ink or teal; never rainbow icon rows as decoration.
- Prefer one icon + label for wayfinding.
- Avoid emoji as primary UI chrome on marketing pages; product map may use sparingly until replaced with icons.

---

## 14. Map markers

- Default pin fill: `--fp-teal`, white ring, soft shadow.
- Selected: larger + darker ink or teal-dark outline.
- Cluster: teal with count.
- User location: distinct (e.g. blue accuracy ring) — not teal pin confusion.
- Match `trip-map-marker` spirit but tokenize colors (no ad-hoc greens).

---

## 15. Restroom result cards

Required hierarchy:

1. **Name**
2. **Distance / walk time**
3. **Access status chip** (code / customers-only / unknown / locked)
4. **Secondary chips** (cleanliness, accessible, free) — max ~3 visible
5. **Actions:** View details · Directions · Share access (auth-aware)

States must be obvious: selected border teal, loading on “opening…”, empty list with contribute CTA.

---

## 16. Empty / loading / error / success

| State | Pattern |
|---|---|
| **Empty** | Short honest copy + one CTA (e.g. “Add access”, “Try another area”) |
| **Loading** | Spinner or skeleton; teal accent; never blank white flash |
| **Error** | `--fp-error-bg` banner + recoverable action |
| **Success** | `--fp-success-bg` banner; auto-dismiss only when safe |

Shared component target: extend `AuthStatus` → site-wide `StatusBanner`.

---

## 17. Auth states

Every auth surface must make these unmistakable:

| State | Visual |
|---|---|
| Signed out | Log in / Sign up chrome |
| Signed in | Avatar + name + Sign out |
| Loading | Spinner + verb (“Signing in…”, “Updating password…”) |
| Success | Green banner / confirm screen |
| Error | Red banner; form remains |
| Password recovery | Dedicated update-password screen after reset link |
| Provider unavailable | Disabled control + “coming soon” (Apple until verified) |

Auth layout: light aqua page wash + white `AuthShell` + official logo.

---

## 18. Logo usage

- Official asset: `/public/flushpin-logo-teal.png` (and approved variants).
- Prefer **image logo** on light surfaces; do not invent new wordmarks.
- Clear space ≈ half logo height around mark.
- Never recolor the pin to purple/neon; never place low-contrast logo on busy photos without scrim.
- Dark text wordmark only if approved; default is teal logo lockup on light.

---

## 19. Motion rules

- **Allowed:** 150–250ms fades/slides; soft press `scale(0.99)` on buttons; page section enter once.
- **Cap:** 2–3 intentional motions per marketing page.
- **Forbidden:** parallax noise, continuous glow pulses, scroll-jacking, award-site theatrical reveals.
- Respect `prefers-reduced-motion`.

---

## 20. Accessibility

- Body text contrast ≥ WCAG AA on white/aqua.
- Focus rings: visible teal outline, 2px offset.
- Touch targets ≥ 44px.
- Don’t convey state by color alone (pair with text/icon).
- Auth errors: `role="alert"`.
- Language toggle must remain keyboard accessible.

---

## 21. Responsive behavior

- **375:** Single column; titles wrap (`text-balance`); no truncated brand names; bottom-safe areas.
- **768:** Auth card centered; header still compact; 2-col feature rows OK.
- **1024+:** Full nav; wider hero type; map may split list/map.
- **1440:** Constrain content width; don’t stretch cards edge-to-edge endlessly.

Test Safari + Chrome on iOS/macOS.

---

## 22. Dark mode policy

- **Default: light-first. No product-wide dark theme.**
- Dark footer / rare modal scrims are chrome, not “dark mode.”
- Future dark mode = explicit user preference only, with a separate token set — not homepage default.
- Current dark hero / restroom shells are **debt**, not policy.

---

## 23. Homepage information architecture

Target structure (sparse, strong):

1. **Hero** — brand, one headline, one support line, primary “Find nearby”, secondary “How it works”
2. **Nearest restroom / product demonstration** — live or honest demo card
3. **How FlushPin works**
4. **Trust** — restrained; no fabricated metrics
5. **Business QR solution**
6. **App download**
7. **Footer**

No award strips, no agency case grids, no hero card clutter.

### Metrics policy

- Do **not** invent customer, user, download, or rating numbers.
- The only volume number allowed on marketing surfaces is a live **restroom / location count** from Supabase (table `restroom` / view `restroom_public`).
- Snapshot at Design Bible draft time (2026-08-02): **34,196** restrooms. Prefer querying live at render time over hard-coding.

---

## 24. Priority surfaces (coverage checklist)

| Surface | Bible status |
|---|---|
| Signup / sign in | Defined (AuthShell system) |
| Auth modal | Same as signup |
| Header authenticated | Defined |
| Password recovery / update | Defined |
| Auth callback / error | Status banners + invalid-link copy |
| Homepage | Defined IA + light hero |
| Map / nearby | Tokens + result cards |
| Restroom detail | Light product surface (migrate off dark) |
| Contact | Align forms to shared fields |
| Business | Light marketing; reduce card sprawl |

---

## 25. Implementation notes (non-code)

- Promote `authPrimaryButtonClass` / inputs into shared `Button` / `FormField`.
- Collapse map `#1D9E75` into `--fp-teal`.
- One font story: Inter + system.
- North-star mockup is directional; live data and honest location messaging override decorative stats.

---

## Document control

| Version | Date | Notes |
|---|---|---|
| 0.1 | 2026-08-02 | Initial draft from brand brief + codebase audit + north-star mockup |

**Next:** Approve tokens → finish auth production readiness → migrate chrome → homepage light hero → map/detail token unification.
