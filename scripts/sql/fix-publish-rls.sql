-- Fix publish flow: admin_users RLS recursion, combo access_type, ensure restroom exists
-- Copy of flushpin-mobile/supabase/migrations/20250616_fix_publish_rls.sql

CREATE OR REPLACE FUNCTION public.is_flushpin_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au WHERE au.user_id = p_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_flushpin_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_flushpin_admin(uuid) TO anon, authenticated;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_users', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY admin_users_select_own ON public.admin_users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.normalize_pin(raw_pin text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN raw_pin IS NULL OR trim(raw_pin) = '' THEN NULL
    ELSE left(regexp_replace(raw_pin, '\D', '', 'g'), 10)
  END;
$$;

GRANT EXECUTE ON FUNCTION public.normalize_pin(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_valid_access_type(p_access_type text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_access_type IN (
    'keypad_code', 'no_code_needed', 'ask_staff',
    'customers_only', 'locked', 'unknown'
  )
  OR p_access_type ~ '^customers_only\+(keypad_code|no_code_needed|ask_staff)$';
$$;

CREATE OR REPLACE FUNCTION public.ensure_restroom_for_publish(
  p_name text,
  p_address text,
  p_lat double precision,
  p_lng double precision,
  p_type text DEFAULT 'other',
  p_place_id text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id bigint;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_place_id IS NOT NULL AND p_place_id <> '' THEN
    SELECT id INTO v_id FROM public.restroom WHERE place_id = p_place_id LIMIT 1;
    IF v_id IS NOT NULL THEN
      RETURN v_id::text;
    END IF;
  END IF;

  SELECT r.id INTO v_id
  FROM public.restroom r
  WHERE lower(r.name) = lower(p_name)
    AND abs(r.lat - p_lat) < 0.0005
    AND abs(r.lng - p_lng) < 0.0005
  ORDER BY r.pin_updated_at DESC NULLS LAST, r.id DESC
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    RETURN v_id::text;
  END IF;

  INSERT INTO public.restroom (
    name, address, lat, lng, type, source, added_by, place_id
  )
  VALUES (
    p_name,
    p_address,
    p_lat,
    p_lng,
    COALESCE(NULLIF(p_type, ''), 'other'),
    'google',
    v_user_id,
    NULLIF(p_place_id, '')
  )
  RETURNING id INTO v_id;

  RETURN v_id::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_restroom_for_publish(text, text, double precision, double precision, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.apply_restroom_access(
  p_restroom_id text,
  p_access_type text,
  p_submitted_pin text DEFAULT NULL,
  p_accessible boolean DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_status text;
  v_submission_id bigint;
  v_normalized_pin text;
  v_restroom_exists boolean;
  v_verified text;
  v_needs_pin boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_valid_access_type(p_access_type) THEN
    RAISE EXCEPTION 'Invalid access_type: %', p_access_type;
  END IF;

  v_needs_pin := p_access_type = 'keypad_code'
    OR p_access_type = 'customers_only+keypad_code';

  v_normalized_pin := public.normalize_pin(p_submitted_pin);

  IF v_needs_pin AND (v_normalized_pin IS NULL OR v_normalized_pin = '') THEN
    RAISE EXCEPTION 'PIN required for keypad_code';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.restroom WHERE id::text = p_restroom_id
  ) INTO v_restroom_exists;

  IF NOT v_restroom_exists THEN
    RAISE EXCEPTION 'Restroom not found';
  END IF;

  v_status := 'approved';

  INSERT INTO public.pin_submissions (
    restroom_id, user_id, submitted_pin, access_type, status
  )
  VALUES (
    p_restroom_id, v_user_id, v_normalized_pin, p_access_type, v_status
  )
  RETURNING id INTO v_submission_id;

  v_verified := CASE
    WHEN p_access_type LIKE 'customers_only+%' OR p_access_type = 'customers_only' THEN 'Customers only'
    WHEN p_access_type IN ('keypad_code', 'customers_only+keypad_code') THEN 'Access code shared'
    WHEN p_access_type IN ('no_code_needed', 'customers_only+no_code_needed') THEN 'Open access'
    WHEN p_access_type IN ('ask_staff', 'customers_only+ask_staff') THEN 'Ask staff'
    WHEN p_access_type = 'locked' THEN 'Locked'
    ELSE 'Access info shared'
  END || ' · Updated ' || to_char(now(), 'Mon DD, FMHH12:MI AM');

  UPDATE public.restroom
     SET access_type = p_access_type,
         pin = CASE
           WHEN v_needs_pin THEN v_normalized_pin
           WHEN p_access_type IN ('no_code_needed', 'customers_only+no_code_needed') THEN 'open'
           ELSE NULL
         END,
         pin_updated_at = now(),
         verified = v_verified,
         status = 'green',
         accessible = COALESCE(p_accessible, accessible)
   WHERE id::text = p_restroom_id;

  RETURN jsonb_build_object(
    'auto_approved', true,
    'status', v_status,
    'submission_id', v_submission_id,
    'match_day', false,
    'restroom_id', p_restroom_id,
    'access_type', p_access_type
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_restroom_access(text, text, text, boolean) TO authenticated;

DROP POLICY IF EXISTS restroom_community_insert ON public.restroom;
CREATE POLICY restroom_community_insert ON public.restroom
  FOR INSERT TO authenticated
  WITH CHECK (added_by = auth.uid());

DROP POLICY IF EXISTS restroom_community_update ON public.restroom;
CREATE POLICY restroom_community_update ON public.restroom
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);
