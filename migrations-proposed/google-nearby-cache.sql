-- PROPOSED ONLY — do not run automatically.
-- FlushPin nearby Google cache tables (Faz 1 web / future edge function).
--
-- Access model: service role only (Next.js /api/nearby via getServiceClient()).
-- RLS enabled with no client policies → anon/authenticated cannot read or write.
-- Service role bypasses RLS (Supabase default).

CREATE TABLE IF NOT EXISTS public.google_nearby_cache (
  cell_key TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS google_nearby_cache_fetched_at_idx
  ON public.google_nearby_cache (fetched_at DESC);

CREATE TABLE IF NOT EXISTS public.google_places_seen (
  place_id TEXT PRIMARY KEY,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS google_places_seen_last_seen_idx
  ON public.google_places_seen (last_seen DESC);

ALTER TABLE public.google_nearby_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_places_seen ENABLE ROW LEVEL SECURITY;

-- Intentionally no CREATE POLICY for anon or authenticated roles.
-- Only service_role (server) may access these tables.

COMMENT ON TABLE public.google_nearby_cache IS 'Grid-cell cache for Google Places searchNearby payloads; service role only';
COMMENT ON TABLE public.google_places_seen IS 'First/last seen timestamps for Google place IDs; service role only';

-- Upsert semantics (application layer — lib/nearby.ts upsertPlacesSeen):
--   INSERT: set both first_seen and last_seen to now()
--   UPDATE on existing place_id: preserve first_seen, refresh last_seen only

-- Rollback (manual, if needed after applying this migration):
--   DROP TABLE IF EXISTS public.google_places_seen;
--   DROP TABLE IF EXISTS public.google_nearby_cache;
