-- =============================================================================
-- FlushPin: optimize public.get_nearby_restrooms (API-compatible rewrite)
-- =============================================================================
-- Strategy (safe rollout):
--   A) Create public.get_nearby_restrooms_opt (optimized twin)
--   B) Compare opt vs live get_nearby_restrooms on representative calls
--   C) Only if identical id-order, swap into public.get_nearby_restrooms
--
-- Contract preserved:
--   Inputs:  user_lat, user_lng, radius_miles, search_text, baby_filter
--   Outputs: id, name, address, score, pin_updated_at, status, verified,
--            accessible, has_baby_changing, access_type, has_code, lat, lng,
--            distance_miles, is_public
--   LIMIT 50, nearest-first
--   search_text ''  → ILIKE '%%' (all names) — mobile uses this
--   search_text NULL → 0 rows (legacy NULL ILIKE semantics)
--
-- Optional index (run OUTSIDE a transaction if desired):
--   CREATE INDEX CONCURRENTLY IF NOT EXISTS restroom_lat_lng_not_opted_out_idx
--     ON public.restroom (lat, lng)
--     WHERE opt_out IS NOT TRUE;
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A) Optimized twin (does not replace production RPC yet)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_nearby_restrooms_opt(
  user_lat double precision,
  user_lng double precision,
  radius_miles double precision,
  search_text text,
  baby_filter boolean
)
RETURNS TABLE (
  id bigint,
  name text,
  address text,
  score double precision,
  pin_updated_at timestamptz,
  status text,
  verified text,
  accessible boolean,
  has_baby_changing boolean,
  access_type text,
  has_code boolean,
  lat double precision,
  lng double precision,
  distance_miles double precision,
  is_public boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  /*
    Why these optimizations improve time:

    1) Lat/lng bounding-box prefilter
       BETWEEN predicates are sargable and can use a (lat,lng) index. They
       discard most of ~34k rows before any trig work. Cache-hit rate is
       already ~100%, so the win is CPU (fewer Haversine evaluations), not I/O.

    2) Haversine computed once per boxed row
       Distance is projected once in `boxed` and reused for the radius check
       and ORDER BY. Avoids re-evaluating acos/cos/sin 2–3× per row (common
       when the same expression is copied into SELECT + WHERE + ORDER BY).

    3) True radius filter after the box
       The box is a superset of the circle; `distance_miles <= radius` restores
       circular semantics without scanning the whole table.

    4) ORDER BY distance LIMIT 50 unchanged
       Same API: nearest 50 only — sort volume is the boxed∩circle set, not
       the full table.
  */
  WITH params AS (
    SELECT
      user_lat AS ulat,
      user_lng AS ulng,
      GREATEST(COALESCE(radius_miles, 0), 0)::double precision AS radius,
      search_text AS q,
      COALESCE(baby_filter, false) AS baby,
      GREATEST(COALESCE(radius_miles, 0), 0)::double precision / 69.0 AS lat_delta,
      GREATEST(COALESCE(radius_miles, 0), 0)::double precision
        / (69.0 * GREATEST(ABS(COS(RADIANS(user_lat))), 0.01)) AS lng_delta
  ),
  boxed AS (
    SELECT
      r.id,
      r.name,
      r.address,
      r.score::double precision AS score,
      r.pin_updated_at,
      r.status,
      r.verified,
      r.accessible,
      r.has_baby_changing,
      r.access_type,
      COALESCE(r.has_code, false) AS has_code,
      r.lat,
      r.lng,
      (
        3959.0 * ACOS(
          LEAST(
            1.0,
            GREATEST(
              -1.0,
              COS(RADIANS(p.ulat)) * COS(RADIANS(r.lat))
                * COS(RADIANS(r.lng) - RADIANS(p.ulng))
                + SIN(RADIANS(p.ulat)) * SIN(RADIANS(r.lat))
            )
          )
        )
      ) AS distance_miles,
      (
        LOWER(COALESCE(r.type, '')) IN (
          'library', 'park', 'toilets', 'public', 'public_restroom'
        )
      ) AS is_public
    FROM public.restroom r
    CROSS JOIN params p
    WHERE r.lat IS NOT NULL
      AND r.lng IS NOT NULL
      AND r.opt_out IS NOT TRUE
      AND r.lat BETWEEN (p.ulat - p.lat_delta) AND (p.ulat + p.lat_delta)
      AND r.lng BETWEEN (p.ulng - p.lng_delta) AND (p.ulng + p.lng_delta)
      AND (NOT p.baby OR r.has_baby_changing IS TRUE)
      -- Legacy parity: do NOT nullif(search_text,'').
      -- '' → '%%' (all); NULL → no rows.
      AND r.name ILIKE ('%' || p.q || '%')
  )
  SELECT
    b.id,
    b.name,
    b.address,
    b.score,
    b.pin_updated_at,
    b.status,
    b.verified,
    b.accessible,
    b.has_baby_changing,
    b.access_type,
    b.has_code,
    b.lat,
    b.lng,
    b.distance_miles,
    b.is_public
  FROM boxed b
  CROSS JOIN params p
  WHERE b.distance_miles <= p.radius
  ORDER BY b.distance_miles ASC NULLS LAST, b.id ASC
  LIMIT 50;
$$;

REVOKE ALL ON FUNCTION public.get_nearby_restrooms_opt(
  double precision, double precision, double precision, text, boolean
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_nearby_restrooms_opt(
  double precision, double precision, double precision, text, boolean
) TO service_role;

-- -----------------------------------------------------------------------------
-- B) VERIFICATION — must return zero mismatches before swap
-- -----------------------------------------------------------------------------
-- Compare id sequence (order) for representative calls. Float distance may
-- differ at ULP level; we require identical id order.

-- Expect: all mismatch counts = 0; null_opt_count = 0; null_live_count = 0
WITH
live_r10 AS (
  SELECT id, row_number() OVER (ORDER BY distance_miles, id) AS rn
  FROM public.get_nearby_restrooms(33.6846, -117.8265, 10, '', false)
),
opt_r10 AS (
  SELECT id, row_number() OVER (ORDER BY distance_miles, id) AS rn
  FROM public.get_nearby_restrooms_opt(33.6846, -117.8265, 10, '', false)
),
live_r3 AS (
  SELECT id, row_number() OVER (ORDER BY distance_miles, id) AS rn
  FROM public.get_nearby_restrooms(33.6846, -117.8265, 3, '', false)
),
opt_r3 AS (
  SELECT id, row_number() OVER (ORDER BY distance_miles, id) AS rn
  FROM public.get_nearby_restrooms_opt(33.6846, -117.8265, 3, '', false)
),
live_baby AS (
  SELECT id, row_number() OVER (ORDER BY distance_miles, id) AS rn
  FROM public.get_nearby_restrooms(33.6846, -117.8265, 3, '', true)
),
opt_baby AS (
  SELECT id, row_number() OVER (ORDER BY distance_miles, id) AS rn
  FROM public.get_nearby_restrooms_opt(33.6846, -117.8265, 3, '', true)
),
live_q AS (
  SELECT id, row_number() OVER (ORDER BY distance_miles, id) AS rn
  FROM public.get_nearby_restrooms(33.6846, -117.8265, 3, 'starbucks', false)
),
opt_q AS (
  SELECT id, row_number() OVER (ORDER BY distance_miles, id) AS rn
  FROM public.get_nearby_restrooms_opt(33.6846, -117.8265, 3, 'starbucks', false)
)
SELECT
  (SELECT count(*) FROM live_r10) AS live_r10_n,
  (SELECT count(*) FROM opt_r10) AS opt_r10_n,
  (SELECT count(*) FROM live_r10 l FULL OUTER JOIN opt_r10 o ON l.rn = o.rn AND l.id = o.id
     WHERE l.id IS NULL OR o.id IS NULL) AS mismatch_r10,
  (SELECT count(*) FROM live_r3 l FULL OUTER JOIN opt_r3 o ON l.rn = o.rn AND l.id = o.id
     WHERE l.id IS NULL OR o.id IS NULL) AS mismatch_r3,
  (SELECT count(*) FROM live_baby l FULL OUTER JOIN opt_baby o ON l.rn = o.rn AND l.id = o.id
     WHERE l.id IS NULL OR o.id IS NULL) AS mismatch_baby,
  (SELECT count(*) FROM live_q l FULL OUTER JOIN opt_q o ON l.rn = o.rn AND l.id = o.id
     WHERE l.id IS NULL OR o.id IS NULL) AS mismatch_starbucks,
  (SELECT count(*) FROM public.get_nearby_restrooms(33.6846, -117.8265, 3, NULL, false)) AS null_live_n,
  (SELECT count(*) FROM public.get_nearby_restrooms_opt(33.6846, -117.8265, 3, NULL, false)) AS null_opt_n;

-- Timing smoke (optional):
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM public.get_nearby_restrooms_opt(33.6846, -117.8265, 10, '', false);

-- -----------------------------------------------------------------------------
-- C) SWAP — run ONLY after section B mismatches are all 0
-- -----------------------------------------------------------------------------
-- BEGIN;
--
-- DROP FUNCTION IF EXISTS public.get_nearby_restrooms(
--   double precision, double precision, double precision, text, boolean
-- );
--
-- ALTER FUNCTION public.get_nearby_restrooms_opt(
--   double precision, double precision, double precision, text, boolean
-- ) RENAME TO get_nearby_restrooms;
--
-- REVOKE ALL ON FUNCTION public.get_nearby_restrooms(
--   double precision, double precision, double precision, text, boolean
-- ) FROM PUBLIC;
--
-- GRANT EXECUTE ON FUNCTION public.get_nearby_restrooms(
--   double precision, double precision, double precision, text, boolean
-- ) TO anon, authenticated, service_role;
--
-- COMMENT ON FUNCTION public.get_nearby_restrooms(
--   double precision, double precision, double precision, text, boolean
-- ) IS 'Nearby restrooms; bbox prefilter + single Haversine; LIMIT 50 by distance.';
--
-- COMMIT;
