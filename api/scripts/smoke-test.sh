#!/usr/bin/env bash
set -e

API_URL="${API_URL:-http://localhost:5000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
EXPECTED_VERSION="${EXPECTED_VERSION:-1.0.0}"

echo "=================================================="
echo "    FixMyHostel Smoke Test Runner"
echo "=================================================="
echo "API URL:      $API_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "Expected Ver: $EXPECTED_VERSION"
echo "=================================================="

echo "Waiting for API to become ready..."
ATTEMPTS=0
MAX_ATTEMPTS=30
HEALTH_OK=0

while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
  ATTEMPTS=$((ATTEMPTS+1))
  HTTP_CODE=$(curl -s -o /tmp/api_health_resp.txt -w "%{http_code}" "$API_URL/api/ops/health" || echo "000")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "API is responsive (Attempt $ATTEMPTS/30)"
    HEALTH_OK=1
    break
  else
    echo "Attempt $ATTEMPTS/30: API returned HTTP $HTTP_CODE, waiting 2s..."
    sleep 2
  fi
done

if [ $HEALTH_OK -ne 1 ]; then
  echo "ERROR: API failed to become ready after $((MAX_ATTEMPTS * 2)) seconds."
  exit 1
fi

echo "Verifying /api/ops/health payload..."
HEALTH_BODY=$(cat /tmp/api_health_resp.txt)
echo "Health Response: $HEALTH_BODY"

# Check for UP status
if echo "$HEALTH_BODY" | grep -q '"status":"UP"'; then
  echo "PASS: API reports status UP"
else
  echo "FAIL: API status is not UP"
  exit 1
fi

# Check version
if echo "$HEALTH_BODY" | grep -q "\"version\":\"$EXPECTED_VERSION\""; then
  echo "PASS: Version matches expected ($EXPECTED_VERSION)"
else
  echo "FAIL: Version does not match $EXPECTED_VERSION"
  exit 1
fi

# Check frontend if reachable
echo "Checking frontend availability at $FRONTEND_URL..."
FRONTEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" || echo "000")
if [ "$FRONTEND_CODE" = "200" ]; then
  echo "PASS: Frontend returned HTTP 200 OK"
else
  echo "WARNING/NOTE: Frontend returned HTTP $FRONTEND_CODE (Frontend service might not be running concurrently, continuing)."
fi

echo "=================================================="
echo " FixMyHostel Smoke Tests Completed Successfully! "
echo "=================================================="
exit 0
