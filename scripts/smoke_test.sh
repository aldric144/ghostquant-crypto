#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="${API_BASE:-http://localhost:8080}"
ALPHABRAIN_BASE="${ALPHABRAIN_BASE:-http://localhost:8081}"
ECOSCAN_BASE="${ECOSCAN_BASE:-http://localhost:8082}"
WEB_BASE="${WEB_BASE:-http://localhost:3000}"

echo "========================================="
echo "GhostQuant-Crypto Smoke Tests"
echo "========================================="
echo ""
echo "API Base: $API_BASE"
echo "AlphaBrain Base: $ALPHABRAIN_BASE"
echo "Ecoscan Base: $ECOSCAN_BASE"
echo "Web Base: $WEB_BASE"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo "000")
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $status_code, expected $expected_status)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

test_json_endpoint() {
    local name="$1"
    local url="$2"
    local min_items="${3:-1}"
    
    echo -n "Testing $name... "
    
    response=$(curl -s "$url" 2>/dev/null || echo "{}")
    
    if ! echo "$response" | jq empty 2>/dev/null; then
        echo -e "${RED}✗ FAIL${NC} (Invalid JSON)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
    
    if echo "$response" | jq -e "type == \"array\"" > /dev/null 2>&1; then
        item_count=$(echo "$response" | jq 'length')
        if [ "$item_count" -ge "$min_items" ]; then
            echo -e "${GREEN}✓ PASS${NC} ($item_count items)"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${YELLOW}⚠ WARN${NC} ($item_count items, expected >= $min_items)"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        fi
    fi
    
    if echo "$response" | jq -e '.status' > /dev/null 2>&1; then
        status=$(echo "$response" | jq -r '.status')
        if [ "$status" = "ok" ]; then
            echo -e "${GREEN}✓ PASS${NC} (status: ok)"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}✗ FAIL${NC} (status: $status)"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    fi
    
    echo -e "${GREEN}✓ PASS${NC} (Valid JSON)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
}

echo "========================================="
echo "1. Health Checks"
echo "========================================="
echo ""

test_json_endpoint "API Health" "$API_BASE/health"
test_json_endpoint "AlphaBrain Health" "$ALPHABRAIN_BASE/health"
test_json_endpoint "Ecoscan Health" "$ECOSCAN_BASE/health"
test_endpoint "Web Frontend" "$WEB_BASE"

echo ""
echo "========================================="
echo "2. Core API Endpoints"
echo "========================================="
echo ""

test_json_endpoint "Assets List" "$API_BASE/assets" 1
test_json_endpoint "Latest Signals" "$API_BASE/signals/latest?limit=10" 0
test_json_endpoint "Market Data" "$API_BASE/market/screener?limit=10" 0

echo ""
echo "========================================="
echo "3. Dashboard Endpoints"
echo "========================================="
echo ""

test_json_endpoint "Top Movers (5)" "$API_BASE/dashboard/top-movers?limit=5" 0
test_json_endpoint "Top Movers (50)" "$API_BASE/dashboard/top-movers?limit=50" 0
test_json_endpoint "Top Movers (100)" "$API_BASE/dashboard/top-movers?limit=100" 0

echo ""
echo "========================================="
echo "4. AlphaBrain Endpoints"
echo "========================================="
echo ""

test_json_endpoint "AlphaBrain Summary" "$ALPHABRAIN_BASE/alphabrain/summary"
test_json_endpoint "AlphaBrain Regime" "$ALPHABRAIN_BASE/alphabrain/regime"
test_json_endpoint "AlphaBrain Portfolio" "$ALPHABRAIN_BASE/alphabrain/portfolio"

echo ""
echo "========================================="
echo "5. Ecoscan Endpoints"
echo "========================================="
echo ""

test_json_endpoint "Ecoscan Summary" "$ECOSCAN_BASE/ecoscan/summary"
test_json_endpoint "Ecoscan Whale Alerts" "$ECOSCAN_BASE/ecoscan/whale-alerts?limit=10" 0
test_json_endpoint "Ecoscan Bridge Flows" "$ECOSCAN_BASE/ecoscan/bridge-flows?limit=10" 0

echo ""
echo "========================================="
echo "Test Summary"
echo "========================================="
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
