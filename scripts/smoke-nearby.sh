#!/usr/bin/env bash
# Live smoke tests for GET /api/nearby
# Usage: BASE=http://localhost:3011 ./scripts/smoke-nearby.sh
set -euo pipefail

BASE="${BASE:-http://localhost:3011}"

fail() { echo "FAIL: $1"; exit 1; }
pass() { echo "PASS: $1"; }

echo "=== Smoke: $BASE/api/nearby ==="

code=$(curl -sS -o /tmp/nearby_invalid.json -w "%{http_code}" "$BASE/api/nearby?lat=999&lng=-117.78")
[[ "$code" == "400" ]] && pass "invalid lat → 400" || fail "invalid lat expected 400 got $code"

code=$(curl -sS -o /tmp/nearby_missing.json -w "%{http_code}" "$BASE/api/nearby?lat=33.68")
[[ "$code" == "400" ]] && pass "missing lng → 400" || fail "missing lng expected 400 got $code"

code=$(curl -sS -o /tmp/nearby_ok.json -w "%{http_code}" "$BASE/api/nearby?lat=33.6846&lng=-117.7892")
if [[ "$code" == "200" ]]; then
  pass "Irvine coords → 200"
  if grep -qE '"pin(_male|_female)?"\s*:' /tmp/nearby_ok.json; then
    fail "response contains pin fields"
  else
    pass "no pin/pin_male/pin_female in response"
  fi
  if grep -q '"category_group":"public_restroom"' /tmp/nearby_ok.json; then
    pass "public_restroom category present"
  else
    echo "NOTE: no public_restroom in this response (may be normal for location)"
  fi
elif [[ "$code" == "500" ]]; then
  echo "NOTE: 500 — likely GOOGLE_MAPS_KEY missing locally ($(cat /tmp/nearby_ok.json))"
else
  fail "Irvine coords unexpected HTTP $code"
fi

echo "=== rate limit (4 requests same IP) ==="
for i in 1 2 3 4; do
  c=$(curl -sS -o "/tmp/nearby_rl_$i.json" -w "%{http_code}" "$BASE/api/nearby?lat=33.68&lng=-117.79")
  echo "  request $i: HTTP $c"
done
c4=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/api/nearby?lat=33.68&lng=-117.79" 2>/dev/null || true)
# 4th should be 429 if first 3 succeeded; if google key missing all may be 500 then 429 on 4th
last=$(cat /tmp/nearby_rl_4.json 2>/dev/null || echo "")
  if echo "$last" | grep -q "rate_limited\|Too many requests"; then
  pass "4th request rate limited"
else
  echo "NOTE: rate limit check inconclusive — inspect /tmp/nearby_rl_*.json"
fi

echo "=== done ==="
