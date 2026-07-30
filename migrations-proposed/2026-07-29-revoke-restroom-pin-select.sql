-- =============================================================================
-- PROPOSAL ONLY — DO NOT APPLY until explicitly approved
-- =============================================================================
-- Filename: migrations-proposed/2026-07-29-revoke-restroom-pin-select.sql
-- Project:  ygpsgolbxyychdnzeorj (FlushPin production Supabase)
-- Purpose:  Block direct PostgREST SELECT of restroom PIN columns for
--           anon/authenticated while preserving:
--             - restroom_public (safe view)
--             - get_nearby_restrooms (no PIN columns)
--             - get_restroom_access_code for authenticated users
--             - service_role full access (admin / server)
--             - pin_views analytics insert inside the access-code RPC
--
-- Expected legacy iOS impact (NOT modified by this migration):
--   - Map/list via restroom_public / get_nearby_restrooms / nearby API: keep working
--   - Detail PIN reveal that SELECTs restroom.pin: fails; UI unlocks without code
--   - Account admin lists that SELECT restroom.pin: fail/empty
--
-- Residual bypass closed by companion (apply second):
--   migrations-proposed/2026-07-29-lock-down-pin-submissions.sql
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) Revoke broad table SELECT from client roles; re-grant safe columns only
-- ---------------------------------------------------------------------------
REVOKE SELECT ON TABLE public.restroom FROM anon, authenticated;

GRANT SELECT (
  id,
  created_at,
  name,
  address,
  lat,
  lng,
  score,
  stars,
  status,
  verified,
  type,
  accessible,
  added_by,
  has_baby_changing,
  access_type,
  out_of_order,
  opt_out,
  pin_updated_at,
  has_code,
  source,
  external_id,
  verified_note,
  status_note,
  city,
  state,
  last_verified_at,
  place_id
) ON public.restroom TO anon, authenticated;

-- Explicitly deny client SELECT on PIN columns (idempotent / belt-and-suspenders).
REVOKE SELECT (pin, pin_male, pin_female) ON public.restroom FROM anon, authenticated;

-- Anon must not write PIN columns directly.
REVOKE INSERT (pin, pin_male, pin_female) ON public.restroom FROM anon;
REVOKE UPDATE (pin, pin_male, pin_female) ON public.restroom FROM anon;

-- Preserve service_role table privileges (already granted in current catalog).
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.restroom TO service_role;

-- ---------------------------------------------------------------------------
-- 2) Harden get_restroom_access_code
--    - Keep authenticated-only reveal
--    - Preserve pin_views analytics insert
--    - Fix missing search_path on SECURITY DEFINER
--    - Return existing shape: (pin text, access_type text)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_restroom_access_code(restroom_id bigint)
RETURNS TABLE(pin text, access_type text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO pin_views (user_id, restroom_id, viewed_at)
  VALUES (auth.uid(), restroom_id::text, now());

  RETURN QUERY
  SELECT r.pin, r.access_type
  FROM public.restroom r
  WHERE r.id = restroom_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_restroom_access_code(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_restroom_access_code(bigint) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_restroom_access_code(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_restroom_access_code(bigint) TO service_role;

-- ---------------------------------------------------------------------------
-- 3) Fix search_path on related SECURITY DEFINER helpers/triggers (no behavior change)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  -- Trigger functions: recreate with fixed search_path via ALTER if supported.
  BEGIN
    EXECUTE 'ALTER FUNCTION public.auto_approve_pin() SET search_path = public';
  EXCEPTION WHEN undefined_function THEN
    NULL;
  END;
  BEGIN
    EXECUTE 'ALTER FUNCTION public.auto_approve_access_type() SET search_path = public';
  EXCEPTION WHEN undefined_function THEN
    NULL;
  END;
  BEGIN
    EXECUTE 'ALTER FUNCTION public.ensure_restroom_for_publish(text, text, double precision, double precision, text, text) SET search_path = public';
  EXCEPTION WHEN undefined_function THEN
    NULL;
  END;
END $$;

-- ---------------------------------------------------------------------------
-- 4) Ensure restroom_public remains selectable (safe columns only; no PINs)
-- ---------------------------------------------------------------------------
GRANT SELECT ON TABLE public.restroom_public TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 5) Keep analytics / nearby RPCs executable for clients
-- ---------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.get_nearby_restrooms(double precision, double precision, double precision, text, boolean)
  TO anon, authenticated, service_role;

COMMIT;

-- Reload PostgREST schema cache (harmless if unsupported in SQL editor).
NOTIFY pgrst, 'reload schema';

-- =============================================================================
-- ROLLBACK SQL (run manually if needed — NOT part of the forward migration)
-- =============================================================================
-- BEGIN;
--
-- GRANT SELECT ON TABLE public.restroom TO anon, authenticated;
-- -- Restores full-column SELECT including pin / pin_male / pin_female
--
-- CREATE OR REPLACE FUNCTION public.get_restroom_access_code(restroom_id bigint)
-- RETURNS TABLE(pin text, access_type text)
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $function$
-- BEGIN
--   IF auth.uid() IS NULL THEN
--     RAISE EXCEPTION 'Authentication required';
--   END IF;
--
--   INSERT INTO pin_views (user_id, restroom_id, viewed_at)
--   VALUES (auth.uid(), restroom_id::text, now());
--
--   RETURN QUERY
--   SELECT r.pin, r.access_type
--   FROM restroom r
--   WHERE r.id = restroom_id;
-- END;
-- $function$;
--
-- GRANT EXECUTE ON FUNCTION public.get_restroom_access_code(bigint) TO PUBLIC;
-- GRANT EXECUTE ON FUNCTION public.get_restroom_access_code(bigint) TO anon, authenticated, service_role;
--
-- COMMIT;
-- NOTIFY pgrst, 'reload schema';
--
-- =============================================================================
-- POST-APPLY VERIFICATION (read-only probes)
-- =============================================================================
-- -- Expect FALSE:
-- SELECT has_column_privilege('anon', 'public.restroom', 'pin', 'SELECT');
-- SELECT has_column_privilege('authenticated', 'public.restroom', 'pin', 'SELECT');
--
-- -- Expect TRUE:
-- SELECT has_column_privilege('service_role', 'public.restroom', 'pin', 'SELECT');
-- SELECT has_table_privilege('anon', 'public.restroom_public', 'SELECT');
--
-- -- Anon PostgREST: GET /restroom?select=id,pin → permission/column error
-- -- Authenticated RPC: POST /rpc/get_restroom_access_code {"restroom_id":N} → ok
-- -- Anon RPC: same → Authentication required / execute denied
