-- FlushPin Phase A schema enrichment (MOBILE-SAFE)
-- Run once in Supabase SQL Editor before: npm run enrich:restrooms
--
-- SAFE RULES:
--   ✓ Does NOT rename verified
--   ✓ Does NOT drop verified
--   ✓ Does NOT change verified column type
--   ✓ Does NOT add verified BOOLEAN (name collision with existing TEXT)
--   ✓ No DELETE, no TRUNCATE
--
-- Idempotent — safe to re-run.

ALTER TABLE public.restroom ADD COLUMN IF NOT EXISTS verified_note TEXT;
ALTER TABLE public.restroom ADD COLUMN IF NOT EXISTS status_note TEXT;
ALTER TABLE public.restroom ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.restroom ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.restroom ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

-- Copy legacy verified TEXT into verified_note (only when note is empty)
UPDATE public.restroom
SET verified_note = verified
WHERE verified_note IS NULL
  AND verified IS NOT NULL
  AND btrim(verified::text) <> '';

-- access_type may already exist; normalize null/blank only
UPDATE public.restroom
SET access_type = 'unknown'
WHERE access_type IS NULL OR btrim(access_type) = '';

COMMENT ON COLUMN public.restroom.verified IS 'Legacy TEXT column — kept for mobile app compatibility; do not rename until mobile v1.2+';
COMMENT ON COLUMN public.restroom.verified_note IS 'Web-preferred human-readable verification label';
COMMENT ON COLUMN public.restroom.status_note IS 'Optional access/status context';
COMMENT ON COLUMN public.restroom.last_verified_at IS 'When access info was last community-verified';
