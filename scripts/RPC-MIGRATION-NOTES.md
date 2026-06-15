# apply_restroom_access RPC — migration notes (DO NOT CHANGE YET)

**Status:** Unchanged per Phase A approval. Web-only updates shipped first.

## What we know

- Web calls `supabase.rpc('apply_restroom_access', { p_restroom_id, p_access_type, p_submitted_pin })` from `lib/publishAccess.ts`.
- On RPC failure, web falls back to direct `restroom` UPDATE via `publishViaDirectUpdate`.
- RPC lives in Supabase (not in this repo) — likely still writes the legacy `verified` TEXT column.

## Risk if RPC is updated later

| Action | Mobile impact | Web impact |
|--------|---------------|------------|
| RPC writes `verified` TEXT only | Mobile OK | Web reads via `verified_note \|\| status_note \|\| verified` fallback |
| RPC renamed/dropped `verified` | Mobile breaks until app update | Web OK if RPC writes `verified_note` |
| RPC adds `verified_note` dual-write | Best transition path | Web OK |

## Recommended Phase B (after mobile v1.2)

1. Inspect RPC body in Supabase Dashboard → Database → Functions.
2. Dual-write: set `verified_note` + keep `verified` TEXT in sync temporarily.
3. After mobile ships `verified_note` reads, stop writing `verified` TEXT.
4. Later: add `verified BOOLEAN` under a **new** name (e.g. `is_verified`) — never collide with TEXT `verified`.

## Phase A (current)

- RPC: **no changes**
- Web direct updates: write `verified_note` + `last_verified_at`, avoid writing `verified` TEXT
- Schema: `verified` TEXT preserved; `verified_note` added and backfilled via SQL migration
