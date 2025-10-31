#!/bin/bash

# UNIShare - Production Readiness Test Script
# Runs before and after each implementation phase

echo "🧪 UNIShare - Production Readiness Check"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name=$1
    local test_command=$2

    echo -n "Running: $test_name... "

    if eval $test_command > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to run test with output
run_test_with_output() {
    local test_name=$1
    local test_command=$2

    echo ""
    echo "========================================"
    echo "Running: $test_name"
    echo "========================================"

    if eval $test_command; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "📦 1. Dependency Check"
echo "----------------------------------------"
run_test "Node.js installed" "node --version"
run_test "npm installed" "npm --version"
run_test "Dependencies installed" "test -d node_modules"
echo ""

echo "🔍 2. TypeScript Type Check"
echo "----------------------------------------"
run_test_with_output "TypeScript compilation" "npm run typecheck"
echo ""

echo "📏 3. Linting Check"
echo "----------------------------------------"
run_test_with_output "ESLint" "npm run lint"
echo ""

echo "🎨 4. Format Check"
echo "----------------------------------------"
run_test_with_output "Prettier format check" "npm run format:check"
echo ""

echo "🗄️  5. Database Check"
echo "----------------------------------------"
run_test "Prisma schema valid" "npx prisma validate"
run_test "Prisma client generated" "test -d node_modules/.prisma/client"
echo ""

echo "🏗️  6. Build Check"
echo "----------------------------------------"
run_test_with_output "Next.js build" "npm run build"
echo ""

echo ""
echo "========================================"
echo "📊 Test Summary"
echo "========================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Ready for production.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix before proceeding.${NC}"
    exit 1
fi
