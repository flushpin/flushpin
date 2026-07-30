# Restroom attribute persistence audit — 2026-07-30

**Status:** Audit complete. Smallest safe code fix implemented locally. **No commit / push / deploy. No migration applied.**

## North Star

FlushPin is not building a restroom directory.

FlushPin is building the world's most trusted **Restroom Intelligence** platform.

Every restroom data point should become more trustworthy over time through community contributions, business participation, and verification.

The value of FlushPin is not only helping people find a restroom today.

Its long-term value is the continuously improving knowledge graph that enables better consumer experiences, enterprise analytics, accessibility planning, family-friendly infrastructure, retail decision making, and future APIs.

**Every product decision should increase the quality, confidence, and usefulness of this knowledge graph.**

## 1. Root cause of disappearing attributes

Multiple independent failures stacked:

1. **Live `apply_restroom_access` does not accept amenity params.** Production OpenAPI args are only `p_restroom_id`, `p_access_type`, `p_submitted_pin`, `p_pin_gender`. Local SQL proposal had `p_accessible`, but it was never applied (or was overwritten).
2. **Web publish path never passed amenities into the RPC** (`lib/publishAccess.ts` → `publishViaRpc`).
3. **`has_baby_changing` had no web write path at all.** Map edit form only had an Accessible checkbox.
4. **Optimistic success UI** returned `accessible` from the request body even when the DB was unchanged.
5. **Map card mapper hard-coded `accessible: false`** and omitted `has_baby_changing` (`mapNearbyToCard` in `app/map/page.tsx`), so filters could not work even when DB values were true.
6. **Nearby/places selects omitted amenity columns** for overlay / known FlushPin rows.

Detail-page attribute tiles were display-only before this fix (not tappable submit controls). Field reports of “tap → success” likely came from map edit / mobile; web still showed success for access publish while amenities were dropped.

## 2. Tables / columns / RPCs involved

| Asset | Role |
| --- | --- |
| `restroom.accessible` | Canonical accessible flag (exists) |
| `restroom.has_baby_changing` | Canonical baby-changing flag (exists) |
| `restroom.access_type` | Access method / customers_only combos |
| `restroom_public` | Exposes both amenity columns (confirmed live) |
| `pin_submissions` | Access/PIN submissions only — no amenity columns |
| `restroom_reports` | Code/report log; accepts free-form `report_type` (no CHECK blocking new types) |
| `apply_restroom_access` | Persists access/PIN; **not** amenities in prod |
| `submit_restroom_report` | Code-oriented reports (`new_code`, `temporarily_unavailable`, …) |
| `get_nearby_restrooms` | Legacy RPC with `baby_filter`; web map uses `/api/nearby` instead |

Live counts (approx): baby=true **3**, accessible=true **9**, both false ~31k, null ~2.8k. Most rows are explicit `false`, not unknown.

## 3. Naming mismatches

| UI / product | DB / API |
| --- | --- |
| Baby Changing Station | `has_baby_changing` (not `baby_changing`) |
| Accessible / ADA / wheelchair | `accessible` (not `is_accessible` / `ada`) |
| Customers only | `access_type` containing `customers_only` |
| Family / all-gender / single-user / men / women | **No columns** |
| `no_restroom_exists` / `no_public_restroom` | No canonical column; report types proposed |

## 4. Do values persist today?

| Attribute | Persist before fix | After code fix (pending deploy) |
| --- | --- | --- |
| Accessible | No via web publish RPC | Yes via `/api/report-amenity` + map share-access amenity write |
| Baby changing | No web write | Yes via same paths |
| Customer-only | Yes (`access_type`) | Unchanged |
| Keypad / ask staff / open / locked | Yes (`access_type`) | Unchanged |
| Availability distinctions | Partial (`temporarily_unavailable` report only) | Reports recorded; discovery exclusion not yet enforced |

## 5. Does `restroom_public` expose them?

**Yes** for `accessible` and `has_baby_changing` (anon read confirmed on live samples).

## 6. Do nearby/search APIs expose them?

**Before:** No (selects + overlay omitted them; map forced `accessible: false`).  
**After code fix:** `/api/nearby` and `/api/places` include and forward both fields.

## 7. Do filters use them?

Map client filters:
- Accessible → `r.accessible === true`
- Baby → `r.has_baby_changing === true`
- No code → `access_type` includes `no_code_needed` and not customers_only

Unknown/null/false do not pass positive filters.

Family / all-gender filters **cannot** work until schema exists.

## 8. Proposed smallest safe fix (implemented in working tree)

1. New server helper `persistRestroomAmenities` — authenticated user → service-role update of **amenity columns only** + `restroom_reports` audit rows. Never touches PIN.
2. New `POST /api/report-amenity` for amenity + availability reports; confirmation required for `no_restroom_exists` / `no_public_restroom`.
3. Map share-access writes amenities only when `hasBabyChanging` is present (map form); code-only submits do not wipe amenities.
4. Publish payload amenities come from DB re-read, not request optimism.
5. Nearby/places/map card plumbing for amenity fields.
6. Detail page: prominent Baby Changing + Accessible confirm/correct + Restroom Availability reporter.

## 9. Migration requirement (proposal only — not applied)

See `migrations-proposed/2026-07-30-amenity-availability.sql`.

Needed for durable product model:
- Extend `apply_restroom_access` with `p_accessible` / `p_has_baby_changing` (COALESCE)
- `restroom.availability_status` enum column
- Optional aggregation view / confidence counts
- Admin surfacing for `no_restroom_exists`
- Nearby exclusion after confidence threshold

**Do not apply until approved.**

## 10. Files that would change / changed

- `lib/restroomAmenities.ts` (+ test)
- `lib/persistRestroomAmenities.ts`
- `app/api/report-amenity/route.ts`
- `lib/publishAccess.ts`, `lib/shareAccessServer.ts`, `lib/accessType.ts`
- `lib/nearby.ts`, `app/api/places/route.ts`, `app/map/page.tsx`
- `app/restroom/[id]/AccessPanel.tsx`, `page.module.css`
- `scripts/test-nearby.ts`
- `migrations-proposed/2026-07-30-amenity-availability.sql`
- this audit doc

## 11. Tests to add / added

Added: `lib/restroomAmenities.test.ts` (persist patch, filters, unknown ≠ yes, availability distinctions).  
Also run existing: `lib/restroomDetailUx.test.ts`, `scripts/test-nearby.ts`.

Still recommended after deploy:
- Authenticated two-session browser repro on a non-production-critical restroom
- Assert PIN security unchanged (`get_restroom_access_code` / stripSensitivePinFields)

## 12. Risks to the live PWA

- Amenity writes currently use service role after auth check — correct columns only, but bypasses RLS; migration should move this into SECURITY DEFINER RPC.
- Single authenticated report can flip amenity booleans today (documented interim). Full aggregation/confidence is migration-gated.
- ~31k rows seeded `false` may under-represent unknown; future backfill to null should be considered carefully.
- Discovery exclusion for `no_restroom_exists` is **not** enforced until migration + nearby policy land.
- Family / all-gender still absent from schema.

## Canonical model recommendation

**Report + aggregate for amenities/availability; direct RPC for access codes.**

- Positive/negative amenity reports in `restroom_reports` (started)
- Canonical booleans on `restroom` for filter performance (kept)
- Threshold + admin override before hard discovery exclusion
- Never let optimistic UI claim success without DB re-read

## Architecture notes — next iteration (recommendation only)

**Status:** Current hard-coded web amenity pipeline (`accessible` / `has_baby_changing` + dedicated fields in `/api/report-amenity`) is **approved for release**. Do not block ship on the refactor below.

**Before adding further restroom attributes** (family restroom, all-gender, single-user, etc.), refactor the amenity pipeline to be **attribute-driven** rather than duplicating write/read logic per amenity.

### Target shape

1. **Attribute registry (config)**  
   Each attribute declared once with: id/key, storage column or JSON path, report_type prefixes, UI label keys (en/es), filter id, whether unknown is allowed, confirmation rules, and discovery impact.

2. **Generic report API**  
   One server path such as `POST /api/report-restroom-attribute` accepting `{ restroomId, attributeId, value, confirmed? }` validated against the registry — not new endpoint branches per amenity.

3. **Generic persistence**  
   Shared service: insert positive/negative report row → update canonical storage via registry mapping → re-read canonical value → return only confirmed persistence. No per-attribute copy of auth/rate-limit/PIN-safety checks.

4. **Confidence + aggregation**  
   Evolve from “one authenticated report flips the boolean” to report ledger + aggregation (counts, last confirmed, conflict handling, admin override). Filters and detail UI consume aggregated canonical state; unknown must never pass positive filters.

5. **UI generated from registry**  
   Detail amenity tiles, map edit checkboxes, and homepage/map filters should render from the same config so adding an attribute does not require parallel UI hard-coding.

### Explicit non-goals for the release fix

- Do not expand family / all-gender / etc. on the current hard-coded path.
- Do not treat the interim `accessible` / `has_baby_changing` helpers as the long-term extension model.
- Keep access-code / PIN flow separate (SECURITY DEFINER RPC); attribute reporting must never broaden PIN exposure.

## Restroom Intelligence — long-term product model

FlushPin should treat restroom information as a **continuously improving community knowledge graph**, not a flat collection of boolean columns.

The release fix correctly persists `accessible` and `has_baby_changing` as canonical filters. That is a necessary bootstrap. The durable model is richer: each restroom attribute (amenity, availability, access policy, and future facility traits) is a versioned, evidence-backed claim with provenance and confidence.

### Per-attribute metadata (eventual standard)

Every restroom attribute should support:

| Field | Purpose |
| --- | --- |
| Confidence score | How strongly FlushPin trusts the current value |
| Confirmation count | Independent positive corroborations |
| Dispute count | Negative / conflicting reports |
| Last confirmed timestamp | Freshness for discovery ranking |
| First reported timestamp | Origin of the claim |
| Source type | `community` · `business_owner` · `verified_partner` (extensible) |
| Verification level | Unverified → community → business → partner/admin |
| Historical changes | Append-only ledger of value transitions |
| Optional expiration / revalidation | Stale claims require reconfirmation |

Unknown remains first-class: absence of evidence must not be coerced to `false`.

### Outcomes this dataset should power

- Consumer discovery (map/filters, baby changing, accessibility, availability)
- Enterprise analytics
- Retail planning
- Accessibility reporting
- Family-friendly location insights
- Public infrastructure planning
- Future FlushPin public/partner APIs

### Relationship to the attribute-driven pipeline

The config registry and generic report API (above) are the engineering path into this model:

1. Reports append to an evidence ledger (not silent overwrites of high-confidence state).
2. Aggregation produces canonical values + confidence for filters and APIs.
3. Admin / business-owner / partner sources can raise verification level without erasing community history.
4. Discovery and enterprise surfaces read the same aggregated graph; PIN/code secrets stay on a separate, locked-down path.

**Release stance:** Ship the approved amenity persistence fix. Evolve toward Restroom Intelligence in subsequent iterations; do not block consumer reliability on the full knowledge-graph schema.
