-- =============================================================================
-- PROPOSAL ONLY — DO NOT APPLY until explicitly approved
-- =============================================================================
-- Filename: migrations-proposed/2026-07-29-lock-down-pin-submissions.sql
-- Project:  ygpsgolbxyychdnzeorj (FlushPin production Supabase)
-- Companion: migrations-proposed/2026-07-29-revoke-restroom-pin-select.sql
-- Apply AFTER the restroom PIN-column migration.
--
-- Purpose:
--   Close residual exposure where ordinary authenticated users can SELECT
--   other users' pin_submissions.submitted_pin via policy
--   "Anyone can read submissions" USING (true).
--
-- Preserves:
--   - Authenticated INSERT of own rows (add-restroom + product flows)
--   - apply_restroom_access SECURITY DEFINER INSERT (bypasses RLS as owner)
--   - auto_approve_* trigger functions (SECURITY DEFINER)
--   - Authenticated SELECT of own submissions (iOS account history)
--   - Authenticated SELECT/UPDATE/DELETE for flushpin admins
--     (is_flushpin_admin) — legacy iOS in-app admin
--   - service_role full access — web admin moderation routes
--
-- Accepted legacy iOS impact for non-admin users:
--   - Can no longer browse other users' pending submitted_pin values
--   - Own submission history still works
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) Table privileges: strip anon; keep authenticated + service_role
-- ---------------------------------------------------------------------------
REVOKE ALL ON TABLE public.pin_submissions FROM PUBLIC;
REVOKE ALL ON TABLE public.pin_submissions FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pin_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pin_submissions TO service_role;

-- Belt-and-suspenders: anon must not read submitted_pin even if a policy is added later.
REVOKE SELECT (submitted_pin) ON public.pin_submissions FROM anon;
REVOKE INSERT (submitted_pin) ON public.pin_submissions FROM anon;
REVOKE UPDATE (submitted_pin) ON public.pin_submissions FROM anon;

-- ---------------------------------------------------------------------------
-- 2) Replace permissive SELECT policy with least-privilege policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read submissions" ON public.pin_submissions;
DROP POLICY IF EXISTS "Users can insert own submissions" ON public.pin_submissions;
DROP POLICY IF EXISTS pin_submissions_select_own ON public.pin_submissions;
DROP POLICY IF EXISTS pin_submissions_select_admin ON public.pin_submissions;
DROP POLICY IF EXISTS pin_submissions_insert_own ON public.pin_submissions;
DROP POLICY IF EXISTS pin_submissions_update_own ON public.pin_submissions;
DROP POLICY IF EXISTS pin_submissions_update_admin ON public.pin_submissions;
DROP POLICY IF EXISTS pin_submissions_delete_own ON public.pin_submissions;
DROP POLICY IF EXISTS pin_submissions_delete_admin ON public.pin_submissions;

-- Own-row read (account submission history; may include own submitted_pin).
CREATE POLICY pin_submissions_select_own
  ON public.pin_submissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admin read (legacy iOS account admin + any authenticated admin tooling).
CREATE POLICY pin_submissions_select_admin
  ON public.pin_submissions
  FOR SELECT
  TO authenticated
  USING (public.is_flushpin_admin());

-- Own-row insert (add-restroom direct insert; RPC inserts bypass RLS).
CREATE POLICY pin_submissions_insert_own
  ON public.pin_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Own-row update/delete (account delete-submission / account cleanup).
CREATE POLICY pin_submissions_update_own
  ON public.pin_submissions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY pin_submissions_delete_own
  ON public.pin_submissions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admin update/delete (legacy iOS approve/reject/delete pending).
CREATE POLICY pin_submissions_update_admin
  ON public.pin_submissions
  FOR UPDATE
  TO authenticated
  USING (public.is_flushpin_admin())
  WITH CHECK (public.is_flushpin_admin());

CREATE POLICY pin_submissions_delete_admin
  ON public.pin_submissions
  FOR DELETE
  TO authenticated
  USING (public.is_flushpin_admin());

-- Ensure RLS remains enabled (idempotent).
ALTER TABLE public.pin_submissions ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3) Harden SECURITY DEFINER trigger functions (search_path)
--    Behavior unchanged; owner postgres continues to bypass RLS.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_approve_pin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  matching_submission RECORD;
BEGIN
  SELECT ps.*
  INTO matching_submission
  FROM pin_submissions ps
  WHERE ps.restroom_id = NEW.restroom_id
    AND ps.submitted_pin = NEW.submitted_pin
    AND ps.status = 'pending'
    AND ps.id != NEW.id
  ORDER BY ps.created_at ASC
  LIMIT 1;

  IF matching_submission.id IS NOT NULL THEN
    UPDATE pin_submissions
    SET status = 'approved'
    WHERE id IN (matching_submission.id, NEW.id);

    UPDATE restroom
    SET
      pin = NEW.submitted_pin,
      access_type = NEW.access_type,
      pin_updated_at = NOW(),
      status = 'green'
    WHERE id::text = NEW.restroom_id;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_approve_access_type()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  matching_submission RECORD;
BEGIN
  IF NEW.submitted_pin IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT ps.*
  INTO matching_submission
  FROM pin_submissions ps
  WHERE ps.restroom_id = NEW.restroom_id
    AND ps.access_type = NEW.access_type
    AND ps.submitted_pin IS NULL
    AND ps.status = 'pending'
    AND ps.id != NEW.id
  ORDER BY ps.created_at ASC
  LIMIT 1;

  IF matching_submission.id IS NOT NULL THEN
    UPDATE pin_submissions
    SET status = 'approved'
    WHERE id IN (matching_submission.id, NEW.id);

    UPDATE restroom
    SET
      access_type = NEW.access_type,
      pin = NULL,
      pin_updated_at = NOW(),
      status = 'green'
    WHERE id::text = NEW.restroom_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Recreate triggers idempotently (same names / timing as production).
DROP TRIGGER IF EXISTS trigger_auto_approve_pin ON public.pin_submissions;
DROP TRIGGER IF EXISTS trigger_auto_approve_access_type ON public.pin_submissions;

CREATE TRIGGER trigger_auto_approve_pin
  AFTER INSERT ON public.pin_submissions
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_pin();

CREATE TRIGGER trigger_auto_approve_access_type
  AFTER INSERT ON public.pin_submissions
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_access_type();

-- Keep apply_restroom_access executable for authenticated (write path).
-- Do not grant to anon.
REVOKE ALL ON FUNCTION public.apply_restroom_access(text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_restroom_access(text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.apply_restroom_access(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_restroom_access(text, text, text, text) TO service_role;

COMMIT;

NOTIFY pgrst, 'reload schema';

-- =============================================================================
-- ROLLBACK SQL (run manually if needed — NOT part of the forward migration)
-- =============================================================================
-- BEGIN;
--
-- DROP POLICY IF EXISTS pin_submissions_select_own ON public.pin_submissions;
-- DROP POLICY IF EXISTS pin_submissions_select_admin ON public.pin_submissions;
-- DROP POLICY IF EXISTS pin_submissions_insert_own ON public.pin_submissions;
-- DROP POLICY IF EXISTS pin_submissions_update_own ON public.pin_submissions;
-- DROP POLICY IF EXISTS pin_submissions_update_admin ON public.pin_submissions;
-- DROP POLICY IF EXISTS pin_submissions_delete_own ON public.pin_submissions;
-- DROP POLICY IF EXISTS pin_submissions_delete_admin ON public.pin_submissions;
--
-- CREATE POLICY "Anyone can read submissions"
--   ON public.pin_submissions
--   FOR SELECT
--   TO authenticated
--   USING (true);
--
-- CREATE POLICY "Users can insert own submissions"
--   ON public.pin_submissions
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.uid() = user_id);
--
-- GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, TRUNCATE
--   ON TABLE public.pin_submissions TO anon, authenticated, service_role;
--
-- GRANT EXECUTE ON FUNCTION public.apply_restroom_access(text, text, text, text)
--   TO anon, authenticated, service_role;
--
-- COMMIT;
-- NOTIFY pgrst, 'reload schema';
--
-- NOTE: Rollback restores the insecure cross-user submitted_pin SELECT.
-- Trigger function bodies remain with search_path=public (safe to keep).
--
-- =============================================================================
-- POST-APPLY VERIFICATION
-- =============================================================================
-- SELECT policyname, roles::text, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'pin_submissions'
-- ORDER BY policyname;
--
-- -- Expect FALSE:
-- SELECT has_table_privilege('anon', 'public.pin_submissions', 'SELECT');
--
-- -- Expect TRUE:
-- SELECT has_table_privilege('authenticated', 'public.pin_submissions', 'SELECT');
-- SELECT has_table_privilege('service_role', 'public.pin_submissions', 'SELECT');
--
-- -- Authenticated non-admin PostgREST:
-- --   SELECT without user_id filter → only own rows (or empty)
-- --   Must NOT return other users' submitted_pin
-- -- service_role:
-- --   SELECT submitted_pin across rows → still works
