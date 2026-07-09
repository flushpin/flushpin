-- P1 RLS fix: restrict direct restroom community updates to rows owned by the user.
-- Keeps other existing restroom policies intact.

DROP POLICY IF EXISTS restroom_community_update ON public.restroom;

CREATE POLICY restroom_community_update ON public.restroom
  FOR UPDATE TO authenticated
  USING (added_by = auth.uid())
  WITH CHECK (added_by = auth.uid());
