# FlushPin Place Intelligence — audit and Phase 1

Date: 29 July 2026
Scope: web/PWA only
Production schema/data changes: none

## Decision summary

FlushPin now checks its own restroom and EV coverage before making paid place
discovery calls. Google calls are guarded by server-only feature flags, request
budgets, per-session limits, field masks, timeouts, a circuit breaker, and
in-flight promise deduplication.

Provider response payloads are not persisted. The earlier proposed
`google_nearby_cache` migration is deprecated because storing complete Places
payloads is not compatible with the conservative reading of the current Google
Maps Platform terms.

## Production baseline observed during the audit

- `restroom`: 34,192 rows; all have coordinates.
- `source=overture`: 31,290.
- `source=seed`: 2,853.
- `source=google`: 20.
- Rows with a populated `place_id`: 21.
- Rows with `source + external_id`: 34,144.
- `ev_stations`: 18,235 rows; 18,219 marked operational.
- `restroom_reports`: 15 rows.
- `places_cache`: 12 legacy rows; no current web code uses this table.
- Production does not contain `google_nearby_cache` or `google_places_seen`.
- No PostGIS query is used by the current web nearby or Trip Stops paths.

The imported freshness timestamps do not necessarily represent independent
restroom verification. Coverage qualification therefore also requires useful
restroom evidence: a public-restroom type, code/access metadata, green status,
or a non-placeholder verification record.

## Current provider-call inventory

- `lib/nearby.ts` / `runGoogleNearbySearch`: server-side Places Nearby Search,
  triggered by `/api/nearby` after a user location/search request. It makes
  zero calls when internal coverage passes and otherwise one to three
  progressively wider requests. The field mask contains ID, name, address,
  coordinates, types, and primary type. Responses are not persisted.
- `app/api/places/route.ts` / `GET`: server-side Places Nearby Search or Text
  Search after an explicit map keyword/category request. It makes zero calls
  when internal coverage passes and otherwise one request. Responses are
  returned for the current request and are not persisted.
- `app/api/geocode/route.ts` / `forwardWithPlaces`: server-side Places Text
  Search after an explicit destination submit. It first attempts an exact
  `restroom_public` match, then makes at most one request using only ID, name,
  address, and coordinates. The resolution is not persisted.
- `app/api/geocode/route.ts` / reverse branch: server-side Google Geocoding
  after explicit geolocation/coordinate use. It makes at most one request.
  Public Nominatim fallback is opt-in and disabled by default.
- `lib/tripStopsServer.ts` / `geocodeTripStopAnchor`: server-side Places Text
  Search for each endpoint not resolved internally: zero to one call in
  destination mode and zero to two in route mode.
- `lib/tripStopsServer.ts` / `fetchDrivingRoute`: one Routes `computeRoutes`
  request per route-mode submit; no route request in destination mode.
- `lib/tripStopsServer.ts` / `fetchGoogleNearby`: zero to one Places Nearby
  request in destination mode, or zero to four uncovered route segments by
  default. Internal restroom coverage is assessed first.
- `lib/moderation.ts` / `geocodeAddress`: legacy direct Geocoding helper with
  no current call site. It remains dead code and creates no current spend.
- `app/map/page.tsx`, `lib/restroomAccess.ts`, and
  `components/trip-stops/TripStopsPage.tsx`: Google Maps URLs opened only after
  explicit user action; these are outbound links, not billable API requests.
- No current web call site uses Place Details or Autocomplete. Search happens
  on submit, not per keystroke.

The only legacy storage observed is `places_cache` (12 rows) and retained
qualified IDs on `restroom`. Current web code neither reads nor writes the
legacy cache. Phase 1 removed the attempted full Places-payload cache path.

## Highest-cost flows before Phase 1

1. Trip Stops route mode: two text resolutions, one Routes request, and up to
   eight Nearby Search requests — up to eleven paid calls per search.
2. `/api/nearby`: one to three tiered Nearby Search requests for a cache miss.
3. `/api/places`: a separate Text/Nearby fallback stack.
4. `/api/geocode`: unrate-limited forward and reverse Google requests.

## Phase 1 request order

### Nearby

1. Query safe, non-PIN FlushPin fields.
2. Keep only rows with useful restroom evidence.
3. Assess count, proximity, and freshness.
4. Return internal results immediately when coverage is sufficient.
5. Otherwise invoke the guarded external fallback.
6. Merge internal and provider results conservatively.
7. Return internal results if the provider is disabled or fails.

### Destination

1. Try an exact case-insensitive match against `restroom_public`.
2. Use external text resolution only when no exact internal match exists.
3. Query internal restroom and EV candidates.
4. Invoke paid place discovery only when internal coverage is insufficient.
5. Never merge a destination anchor into a recommendation.

### Trip Stops route

1. Resolve endpoints.
2. Compute the route only when route mode requires it.
3. Query FlushPin restrooms and EV stations across all sampled points.
4. Identify uncovered route points.
5. Search at most `MAX_GOOGLE_CALLS_PER_TRIP` uncovered points.
6. Return partial internal results on provider failure.

The default maximum has been reduced from eight corridor searches to four.

## Coverage defaults

All values can be overridden through environment variables.

- Nearby minimum results: 8.
- Nearby minimum fresh results: 1.
- Nearby maximum closest-result distance: 300 m.
- Destination minimum results: 4.
- Destination maximum closest-result distance: 1,500 m.
- Maximum stale age: 90 days.
- Trip minimum internal candidates per segment: 2.
- Trip maximum external place calls: 4.

These are conservative starting values, not permanent product truths. They
should be calibrated using production coverage and provider-usage telemetry.

## Feature and budget controls

- `EXTERNAL_PLACE_FALLBACK_ENABLED`
- `GOOGLE_PLACES_ENABLED`
- `GOOGLE_ROUTES_ENABLED`
- `MAX_GOOGLE_CALLS_PER_TRIP`
- `MAX_GOOGLE_CALLS_PER_SESSION`
- `DAILY_GOOGLE_REQUEST_BUDGET`
- `EXTERNAL_PROVIDER_TIMEOUT_MS`
- `EXTERNAL_PROVIDER_CIRCUIT_FAILURES`
- `EXTERNAL_PROVIDER_CIRCUIT_COOLDOWN_MS`
- `PLACE_COVERAGE_MIN_RESULTS`
- `PLACE_COVERAGE_MIN_FRESH_RESULTS`
- `PLACE_COVERAGE_MAX_CLOSEST_METERS`
- `PLACE_COVERAGE_MAX_STALE_DAYS`
- `DESTINATION_COVERAGE_MIN_RESULTS`
- `DESTINATION_COVERAGE_MIN_FRESH_RESULTS`
- `DESTINATION_COVERAGE_MAX_CLOSEST_METERS`
- `TRIP_COVERAGE_MIN_RESULTS_PER_SEGMENT`
- `GOOGLE_PLACES_ESTIMATED_COST_USD`
- `GOOGLE_ROUTES_ESTIMATED_COST_USD`
- `NOMINATIM_FALLBACK_ENABLED`

All controls are read server-side. Google keys remain server-only.

The daily/session counters are process-local in Phase 1. They reduce accidental
bursts but are not a globally durable billing limit in a serverless deployment.
Global accounting requires the proposed `provider_usage` table or an external
rate-limit/counter service.

## Identity and deduplication

The resolver applies these rules in order:

1. Exact source-qualified provider ID.
2. Exact normalized name plus exact normalized address and compatible category.
3. Exact normalized name, compatible category, and at most 25 m distance only
   when one address is absent.

It does not merge on name alone or coordinates alone. Destination anchors and
recommendations are different identity kinds and cannot merge. Every accepted
match returns a reason and confidence for future audit logging.

## Data ownership and retention

### FlushPin-owned

Internal IDs, independently submitted restroom availability/access facts,
verification, accessibility, baby-changing reports, business claims, community
reports, internal confidence, and independently calculated quality signals.

### Open/public

OSM records may be retained with source-qualified OSM IDs, ODbL obligations,
and visible attribution. Municipal, transit, park, and Open Charge Map records
must be evaluated per dataset/provider; “publicly accessible” does not
automatically mean unrestricted.

### Provider identifiers

Google Place IDs may generally be retained indefinitely as source-qualified
identifiers. They must not be treated as FlushPin-owned.

### Temporary provider data

Google Places latitude/longitude may be cached for no more than 30 consecutive
days under the current service-specific terms. Phase 1 does not persist them.

### Unsafe to retain

Google display names, addresses, categories/types, hours, ratings, reviews,
photos, rankings, and result lists are not copied into the Place Intelligence
database unless FlushPin obtains the same fact independently under separate
rights.

## Google display limitation

The current non-EEA service-specific terms permit Places and Routes content
without a map, but prohibit Routes content with a non-Google map and require
Places results mapped on a map to use a Google map. FlushPin uses MapLibre.
Phase 1 therefore marks provider-sourced Trip Stops results as
`mapDisplay=external_only`, does not render the Google route or Google-derived
markers on MapLibre, and directs users to explicit Google Maps links. Internal-
only destination results can still use MapLibre. Google attribution is shown
adjacent to provider-derived list content.

The emergency `GOOGLE_PLACES_ENABLED` and `GOOGLE_ROUTES_ENABLED` switches can
stop either provider flow without redeploying application code.

Relevant official sources:

- https://cloud.google.com/maps-platform/terms
- https://cloud.google.com/maps-platform/terms/maps-service-terms
- https://developers.google.com/maps/documentation/places/web-service/policies

This document is a technical policy assessment, not legal advice.

## Open-data recommendation

- OSM regional extracts are the recommended MVP foundation. They provide broad
  global place/toilet coverage and can be updated from minutely replication or
  periodic regional snapshots, but restroom tags are uneven and not proof that
  a business permits public access. ODbL attribution and share-alike analysis
  are mandatory. Engineering burden is medium: asynchronous import, normalized
  tags, source-qualified element IDs, and incremental updates.
- Public Overpass is suitable for bounded QA, prototypes, and small enrichment
  jobs. The main instance gives fair-use guidance rather than an SLA, can return
  429 under load, and should not serve the critical request path. Existing
  `scripts/seed-restrooms.ts` is appropriate as an operator-run importer, not a
  live user-request dependency. A managed extract pipeline or private instance
  is required if volume becomes material.
- Public Nominatim is suitable only for modest explicit user searches/reverse
  lookups. Its public policy sets an absolute maximum of one request per second,
  requires identifying headers and caching, forbids client-side autocomplete,
  and can change or withdraw access. It remains disabled by default. Use a
  managed provider or self-hosted instance for production-critical traffic.
- Photon provides OSM-backed forward/reverse search and autocomplete. The
  public Komoot endpoint is a demo with no uptime guarantee and may throttle or
  ban extensive use. Self-hosted Photon is a future option with medium
  operational burden (JVM/OpenSearch data and update operations).
- Pelias or a managed Pelias provider such as Geocode Earth is the pragmatic
  managed-geocoder candidate for Phase 2. It can combine OSM and open address
  sources, but quality, contract, data licensing, and regional costs must be
  validated before adoption. Self-hosting has high operational burden.
- Open Charge Map is useful for EV enrichment and currently feeds the local
  `ev_stations` table. User-contributed OCM data is CC BY 4.0, but imported
  third-party records retain the source provider's license. Persist only after
  recording record-level provider/license metadata and show visible
  attribution. Treat it as enrichment, not proof of restroom access.
- Government, municipal, NPS, parks, transit, and public-toilet datasets are
  high-value targeted enrichment because they can provide authoritative
  facility facts. Coverage, update frequency, format, and license vary by
  publisher. Build one scheduled adapter per approved dataset with a source
  URL, license, retrieval time, checksum, and last-known-good snapshot.
- First-party business claims and community verification are the best sources
  for FlushPin-specific access facts. They have narrower initial coverage but
  provide independently retainable restroom access, code-required,
  accessibility, baby-changing, and freshness signals. They should be the
  long-term acquisition-quality layer.

Official policy references:

- https://www.openstreetmap.org/copyright
- https://operations.osmfoundation.org/policies/nominatim/
- https://wiki.openstreetmap.org/wiki/Overpass_API
- https://www.openchargemap.io/about/terms
- https://github.com/komoot/photon

## Schema evolution

No schema was changed. The exact unexecuted proposal is:

`migrations-proposed/place-intelligence-v1.sql`

It adds canonical place identity, source links, provenance-aware facts, aliases,
merge history, provider usage, and nullable compatibility links. It deliberately
does not move or alter `pin`, `pin_male`, `pin_female`, the existing authorized
RPC, or legacy IDs.

Backfill must be source-specific. Google-derived names/addresses/coordinates
must not be copied. Overture, OSM, OCM, and municipal records require their
applicable release/provider licenses to be recorded before import.

## Remaining dependencies

- Google Routes remains necessary for Trip Stops route geometry until another
  route provider is selected.
- Google Places remains an optional guarded fallback for unresolved destination
  and uncovered place searches.
- Reverse geocoding can use Google; public Nominatim is disabled by default.
- The web has no local aliases table yet, so exact internal destination reuse is
  intentionally conservative.
- Durable global budgets, merge auditing, and a cost dashboard require the
  proposed schema or an external telemetry service.

## Expected cost reduction

No percentage saving is claimed before production telemetry exists. The
request-reduction mechanisms are measurable:

- Sufficient nearby coverage changes one-to-three Places calls to zero.
- An exact internal destination changes one Text Search call to zero.
- A covered destination area changes one Nearby Search call to zero.
- Covered route segments change up to eight corridor requests to at most four,
  often fewer.
- Concurrent identical provider requests share one in-flight promise.
- Process-local daily and session limits prevent accidental runaway calls.
- Strict field masks avoid moving a request into a more expensive field tier
  merely to collect unused ratings, reviews, or photos.

Cost estimates are logged only when deployment supplies current per-call
values. FlushPin must not hard-code a price because Google SKU rates and free
usage rules can change by region and contract.

## Proposed backfill and rollback

The unexecuted migration must be tested on a clone first. Recommended backfill:

1. Create canonical identities only from FlushPin-owned or license-reviewed
   open/public records.
2. Preserve every legacy `restroom.id`, `place_id`, `external_id`, and source.
3. Link Google records by qualified Place ID only; do not copy Google names,
   addresses, categories, or coordinates into canonical fields.
4. Record source dataset, license, attribution, and retrieval timestamp before
   importing OSM, Overture, Open Charge Map, or government records.
5. Run candidate matching in report-only mode; manually review ambiguous mall,
   highway, and chain-branch matches before setting `canonical_place_id`.

Rollback SQL is included at the bottom of the proposal. It drops only the new
objects and nullable compatibility link; it does not alter the existing PIN
columns or access RPC. Because rollback is data-destructive for newly collected
place facts, export those records before rollback.

## Validation completed

- Focused strict TypeScript compilation passed for the provider gateway,
  nearby, Trip Stops, geocode/places routes, map, and Trip Stops UI.
- `lib/placeIntelligence.test.ts` passed.
- `scripts/test-nearby.ts` passed 50 checks.
- `lib/tripStops.test.ts` passed, including the non-Google-map display guard.
- `lib/restroomAccessSecurity.test.ts` passed.
- Next.js 16.2.6 production build passed; `/trip-stops` and
  `/api/trip-stops` were emitted successfully.
- No production migration, data write, deployment, commit, or push occurred.

## Recommended Phase 2

1. Review and approve the proposed schema independently of the existing PIN
   exposure issue.
2. Move usage accounting and rate limits from process memory to durable,
   atomic server-side storage.
3. Build a read-only coverage report before tuning thresholds.
4. Add record-level licenses and visible attribution for all OCM/OSM imports.
5. Add scheduled, source-specific adapters for municipal, parks, and transit
   restroom datasets with last-known-good snapshots.
6. Evaluate a managed OSM geocoder first; self-host Photon/Pelias only when
   traffic and operational ownership justify it.
7. Evaluate a non-Google route provider only after its routing quality,
   license, and operating cost are validated.
