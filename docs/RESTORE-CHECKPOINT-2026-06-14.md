# FlushPin Restore Checkpoint — 14 June 2026

**Trigger phrases (tell the agent):** `bugüne dön` · `restore checkpoint` · `2026-06-14 checkpoint`

Known-good web codebase state after enrichment rebase + build fix. Use when the site breaks or a bad deploy needs rollback.

## Git anchor

| Field | Value |
|-------|-------|
| Tag | `restore-2026-06-14` |
| Commit | `2537103f7911fc74c83315276cc76e20fdcb6baf` |
| Short SHA | `2537103` |
| Branch | `main` |
| Remote | `origin` → `https://github.com/34johnertan-flushpin/flushpin.git` |

### Recent commit stack

```
2537103 Fix build after enrichment rebase
0a52268 Add mobile-safe restroom enrichment
768ff4e Split map access form into restriction and method layers.
```

## Production

- **Site:** https://www.flushpin.com
- **Host:** Vercel (Next.js 16.2.6)
- **Working tree at checkpoint:** clean, `main` synced with `origin/main`

## What this checkpoint includes

- Mobile-safe Phase A enrichment (web code only; `verified` TEXT column untouched)
- Map access form (restriction + method layers) from `768ff4e`
- SEO/canonical routes, OC city landing pages, business claim flow
- Build passing (`npm run build`)

### Critical files — do not delete on restore

- `scripts/sql/enrich-restroom-schema.sql`
- `scripts/enrich-restrooms.ts`
- `scripts/seed-restrooms.ts`
- `lib/restroomVerified.ts`
- `lib/publishAccess.ts`

### Intentionally excluded from repo (do not re-add)

- `*.backup_20260614_*` junk files
- `public/logo.png` (app uses `components/Logo` → `/flushpin-logo.png`)

## Database (Supabase) — not in git

At checkpoint time:

- Shared `restroom` table ~69,795 rows
- Phase A SQL migration may be applied in Supabase (user ran verification query)
- Live enrichment `--apply` may still be pending (needs real `SUPABASE_SERVICE_ROLE_KEY`)
- **Never** rename/drop/change type of legacy `verified` TEXT until mobile v1.2+

## Restore playbook

### A. Bad Vercel deploy (code on GitHub still good)

1. Vercel → Project → Deployments
2. Find deployment for commit `2537103` (or tag `restore-2026-06-14`)
3. **Redeploy** → Production

### B. Local / repo drift

```bash
cd ~/flushpin
git fetch origin
git checkout main
git reset --hard restore-2026-06-14   # or 2537103
npm ci
npm run build
```

### C. Bad commits pushed to `main` after checkpoint

Prefer **revert** (no force push):

```bash
git revert <bad-commit-sha>..HEAD
git push origin main
```

Force push only if user explicitly approves emergency rollback:

```bash
git reset --hard restore-2026-06-14
git push --force-with-lease origin main
```

### D. Agent instructions when user says "bugüne dön"

1. Confirm goal: rollback web deploy vs DB vs both
2. Restore git to `restore-2026-06-14` / `2537103`
3. Redeploy Vercel from that commit
4. Do **not** touch mobile app repo
5. Do **not** re-add backup junk files
6. Preserve enrichment scripts listed above
7. Run `npm run build` before declaring success

## Out of scope for this checkpoint

- Mobile app (separate repo, Apple review)
- Live OSM seed insert (`npm run seed:restrooms -- --apply`)
- RPC changes (`scripts/RPC-MIGRATION-NOTES.md` — report only)
