# FlushPin database PIN security — production runbook

**Status:** Proposal only — do not apply until explicitly approved.  
**Project:** `ygpsgolbxyychdnzeorj`  
**Date:** 2026-07-29  

## Release unit

| Order | File | Purpose |
|------:|------|---------|
| 1 | `migrations-proposed/2026-07-29-revoke-restroom-pin-select.sql` | Block direct `restroom.pin` / `pin_male` / `pin_female` SELECT for anon/authenticated; harden `get_restroom_access_code` |
| 2 | `migrations-proposed/2026-07-29-lock-down-pin-submissions.sql` | Replace permissive `pin_submissions` SELECT; stop cross-user `submitted_pin` reads |

Do not apply #2 before #1. Do not apply only #2 if #1 is intended for the same release window (leaves restroom PIN columns exposed).

---

## 1. Pre-migration checks

Run in Supabase SQL editor (read-only):

```sql
-- Project sanity
SELECT current_database(), current_user;

-- Restroom PIN exposure (expect TRUE before migration 1)
SELECT
  has_column_privilege('anon', 'public.restroom', 'pin', 'SELECT') AS anon_pin,
  has_column_privilege('authenticated', 'public.restroom', 'pin', 'SELECT') AS auth_pin,
  has_column_privilege('service_role', 'public.restroom', 'pin', 'SELECT') AS service_pin;

-- pin_submissions permissive policy (expect present before migration 2)
SELECT policyname, roles::text, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'pin_submissions'
ORDER BY policyname;

-- RPC exists
SELECT pg_get_function_identity_arguments(p.oid) AS args,
       p.prosecdef,
       p.proconfig
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'get_restroom_access_code';

-- Admin helper
SELECT public.is_flushpin_admin(NULL);
```

PostgREST probes (before):

- Anon: `GET /restroom?select=id,pin&limit=1` → **succeeds** (bad)
- Authenticated non-admin: `GET /pin_submissions?select=id,submitted_pin&limit=10` → **other users’ pins** (bad)
- Authenticated: `POST /rpc/get_restroom_access_code` `{"restroom_id":N}` → **succeeds**

Confirm web branch uses:

- `restroom_public` + `PUBLIC_RESTROOM_ACCESS_FIELDS` for map/list
- `get_restroom_access_code` for PIN reveal
- Admin moderation via **service_role** only

Confirm stakeholders accept legacy iOS impact:

- Direct `restroom.pin` reveal breaks
- Non-admin users lose ability to read other users’ `submitted_pin` (intended)

---

## 2. Backup / export recommendations

Before applying either migration:

1. Supabase Dashboard → **Database** → take a **manual backup** / note PITR window.
2. Optional schema export (grants + policies only):

```bash
# Example — requires DB password / linked project; do not commit dump output
supabase db dump --linked --schema public -f /tmp/flushpin-pre-pin-lockdown.sql
```

3. Snapshot these catalogs to a private note (not git):

```sql
SELECT * FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name IN ('restroom', 'pin_submissions');

SELECT * FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('restroom', 'pin_submissions');

SELECT pg_get_functiondef(p.oid)
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'get_restroom_access_code',
    'auto_approve_pin',
    'auto_approve_access_type',
    'apply_restroom_access'
  );
```

No row-data export of PIN columns is required for this grant/policy change.

---

## 3. Exact migration order

1. Open Supabase SQL editor on production project `ygpsgolbxyychdnzeorj`.
2. Paste and run **entire** contents of  
   `2026-07-29-revoke-restroom-pin-select.sql`  
   (includes `BEGIN`/`COMMIT` + trailing `NOTIFY`).
3. Run post-migration-1 verification (section 4A). **Stop if any check fails.**
4. Paste and run **entire** contents of  
   `2026-07-29-lock-down-pin-submissions.sql`.
5. Run post-migration-2 verification (section 4B) and end-to-end tests (sections 5–9).
6. Confirm `NOTIFY pgrst, 'reload schema'` executed (re-run manually if schema cache looks stale).

Do not interleave other DDL. Do not run rollback SQL unless aborting.

---

## 4. Exact SQL verification queries

### 4A — After migration 1 only

```sql
-- Expect FALSE, FALSE, TRUE
SELECT
  has_column_privilege('anon', 'public.restroom', 'pin', 'SELECT') AS anon_pin,
  has_column_privilege('authenticated', 'public.restroom', 'pin', 'SELECT') AS auth_pin,
  has_column_privilege('service_role', 'public.restroom', 'pin', 'SELECT') AS service_pin;

-- Expect FALSE for gendered columns too
SELECT
  has_column_privilege('anon', 'public.restroom', 'pin_male', 'SELECT') AS anon_male,
  has_column_privilege('authenticated', 'public.restroom', 'pin_female', 'SELECT') AS auth_female;

-- Safe columns still readable
SELECT has_column_privilege('anon', 'public.restroom', 'name', 'SELECT') AS anon_name,
       has_table_privilege('anon', 'public.restroom_public', 'SELECT') AS anon_public;

-- Access-code RPC hardened
SELECT
  has_function_privilege('anon', 'public.get_restroom_access_code(bigint)', 'EXECUTE') AS anon_exec,
  has_function_privilege('authenticated', 'public.get_restroom_access_code(bigint)', 'EXECUTE') AS auth_exec;

SELECT proconfig
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'get_restroom_access_code';
-- Expect {search_path=public}
```

### 4B — After migration 2

```sql
-- Expect no policy named "Anyone can read submissions"
SELECT policyname, roles::text, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'pin_submissions'
ORDER BY policyname;
-- Expect: pin_submissions_select_own, pin_submissions_select_admin,
--         pin_submissions_insert_own, update/delete own+admin

-- Expect FALSE
SELECT has_table_privilege('anon', 'public.pin_submissions', 'SELECT') AS anon_sel;

-- Expect TRUE
SELECT has_table_privilege('authenticated', 'public.pin_submissions', 'SELECT') AS auth_sel,
       has_table_privilege('service_role', 'public.pin_submissions', 'SELECT') AS service_sel;

SELECT proconfig
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('auto_approve_pin', 'auto_approve_access_type');
-- Expect search_path=public
```

---

## 5. Tests for anonymous access

| Test | Method | Expected after both |
|------|--------|---------------------|
| Restroom PIN column | `GET /restroom?select=id,pin&limit=1` | Error / permission denied |
| Restroom safe cols | `GET /restroom?select=id,name,lat,lng&limit=1` | OK |
| `restroom_public` | `GET /restroom_public?select=id,name,has_code&limit=1` | OK (no pin fields) |
| Nearby RPC | `POST /rpc/get_nearby_restrooms` with lat/lng | OK; response keys exclude `pin*` |
| Access-code RPC | `POST /rpc/get_restroom_access_code` | Execute denied or auth error |
| pin_submissions | `GET /pin_submissions?select=id,submitted_pin&limit=1` | Permission denied / empty fail |

---

## 6. Tests for authenticated access (non-admin)

| Test | Expected |
|------|----------|
| `GET /restroom?select=id,pin` | Fail (no column privilege) |
| `POST /rpc/get_restroom_access_code` `{"restroom_id":<known>}` | Success; returns `{pin, access_type}`; `pin_views` row inserted |
| `GET /pin_submissions?select=id,submitted_pin,user_id&limit=50` | Only **own** rows (`user_id` = caller); never other users |
| `POST /rpc/apply_restroom_access` with valid args | Success (publish path) |
| Direct `INSERT` into `pin_submissions` with `user_id = auth.uid()` | Success |
| Direct `INSERT` with another user’s `user_id` | Fail (WITH CHECK) |

---

## 7. Tests for service_role / admin access

| Test | Expected |
|------|----------|
| service_role `SELECT pin, pin_male, pin_female FROM restroom` | Success |
| service_role `SELECT submitted_pin FROM pin_submissions` | Success (all rows) |
| Web `/admin/moderation` (when `ADMIN_DASHBOARD_ENABLED=true` + allowlist) | Pending list shows `submitted_pin` |
| Authenticated user in `admin_users` | Can SELECT/UPDATE pending submissions via RLS admin policies |
| Authenticated user **not** in `admin_users` | Cannot see others’ submissions |

---

## 8. Test for web PIN reveal RPC

1. Signed-in browser on web map or `/restroom/[id]`.
2. Complete reveal flow → must call `get_restroom_access_code` only.
3. Network: no `restroom?select=...pin...` from client.
4. Code displays; confirm a new `pin_views` row for that user/restroom.

---

## 9. Test for public map / list access

1. Signed-out `/map` and nearby/places APIs.
2. List/cards load from `restroom_public` / nearby / places (metadata only).
3. Responses must not contain `pin`, `pin_male`, `pin_female`.
4. Trip Stops remains disabled by default (`TRIP_STOPS_ENABLED` unset/false).

---

## 10. Expected legacy iOS behavior

| Surface | Expected |
|---------|----------|
| Nearby / home list | Continues (public view / nearby RPC) |
| Detail PIN reveal (`select ... pin ...`) | Fails; UI may unlock empty — **accepted** |
| Account “my submissions” | Continues (own-row SELECT) |
| In-app admin pending (admin_users only) | Continues via `is_flushpin_admin` policies |
| Non-admin peeking other submissions | **Blocked** (intended) |
| Publish via `apply_restroom_access` | Continues |

Do not modify the iOS project as part of this DB release.

---

## 11. Rollback triggers

Abort / roll back if any of:

- Authenticated web PIN reveal RPC fails for signed-in users
- `restroom_public` or nearby list empty/erroring for anon
- service_role cannot read `restroom.pin` or `pin_submissions.submitted_pin`
- `apply_restroom_access` publish fails for authenticated users
- Migration SQL errors mid-script (transaction rolled back — re-check catalog)

Do **not** roll back solely because legacy iOS PIN reveal broke (accepted).

---

## 12. Exact rollback order

Reverse of apply:

1. Run **rollback section** of `2026-07-29-lock-down-pin-submissions.sql` first.
2. Verify old policy `"Anyone can read submissions"` is restored (insecure but known).
3. Run **rollback section** of `2026-07-29-revoke-restroom-pin-select.sql`.
4. Verify anon/auth can SELECT `restroom.pin` again.
5. `NOTIFY pgrst, 'reload schema';`
6. Re-run smoke tests for map + iOS reveal if restoring compatibility.

---

## 13. Final GO / NO-GO

| Check | Result |
|-------|--------|
| Migration 1 audited | SAFE for web; iOS PIN reveal break accepted |
| Migration 2 closes cross-user `submitted_pin` | Yes, with own-row + admin + service_role preserved |
| Combined validation | Compatible; no conflicting grants |
| Applied to production yet? | **No** |
| **Decision** | **GO — SAFE TO APPLY TOGETHER** after explicit approval |

---

## Commit recommendation (do not commit until asked)

**Prefer one commit** containing:

- both migration SQL files
- this runbook

Rationale: one production release unit, one review, one revert point.

Acceptable alternative: one migrations commit + one docs commit (not three).
