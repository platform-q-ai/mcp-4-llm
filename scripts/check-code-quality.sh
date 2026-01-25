#!/bin/bash

# Code Quality Check Script for create-open-mcp generator
# This script runs BEFORE lint/format to catch issues that shouldn't exist
#
# NOTE: This generator contains templates that generate code quality checks.
# The templates themselves contain patterns like "as any" as strings to search for.
# We need to be careful not to flag those false positives.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Running code quality checks..."
echo ""

ERRORS=0

# Check for TODO/FIXME/XXX/HACK/BUG comments in main generator file only
# Templates are allowed to contain these as documentation
echo "Checking for incomplete work markers (TODO, FIXME, XXX, HACK, BUG)..."
if grep -n -E "(TODO|FIXME|XXX|HACK|BUG):" create-open-mcp.ts 2>/dev/null; then
    echo -e "${RED}❌ Found incomplete work markers. Complete the work or create an issue.${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ No incomplete work markers in generator${NC}"
fi

# Check for 'any' type in actual TypeScript code (not string literals)
# The main generator file should not use 'any'
echo ""
echo "Checking for 'as any' type assertions in generator..."
# Look for 'as any' that's NOT inside a string (not preceded by quote)
if grep -n "as any" create-open-mcp.ts 2>/dev/null | grep -v "'" | grep -v '"'; then
    echo -e "${RED}❌ Found 'as any' type assertions. Use proper types or 'unknown'.${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ No 'as any' type assertions in generator${NC}"
fi

# Check for @ts-ignore in main generator only
echo ""
echo "Checking for @ts-ignore comments in generator..."
if grep -n "@ts-ignore" create-open-mcp.ts 2>/dev/null; then
    echo -e "${RED}❌ Found @ts-ignore comments. Fix the type error instead.${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ No @ts-ignore comments in generator${NC}"
fi

# Check for @ts-expect-error in main generator only
echo ""
echo "Checking for @ts-expect-error in generator..."
if grep -n "@ts-expect-error" create-open-mcp.ts 2>/dev/null; then
    echo -e "${RED}❌ Found @ts-expect-error in generator. Fix the type error instead.${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ No @ts-expect-error in generator${NC}"
fi

# Check for eslint-disable in main generator only
echo ""
echo "Checking for eslint-disable comments in generator..."
if grep -n "eslint-disable" create-open-mcp.ts 2>/dev/null; then
    echo -e "${RED}❌ Found eslint-disable comments. Fix the lint error instead.${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ No eslint-disable comments in generator${NC}"
fi

# Check for stub implementations in main generator only
echo ""
echo "Checking for stub implementations in generator..."
if grep -n -E "throw new Error\(.*not.*implement" create-open-mcp.ts 2>/dev/null; then
    echo -e "${RED}❌ Found stub implementations. Complete the implementation.${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ No stub implementations in generator${NC}"
fi

# Check for focused/skipped tests
# This one is safe to check in all test files
echo ""
echo "Checking for focused or skipped tests..."
# Look for actual test modifiers, not just mentions in test descriptions
if grep -rn --include="*.ts" -E "(describe|it|test)\.(only|skip)\(" tests/ 2>/dev/null; then
    echo -e "${RED}❌ Found focused (.only) or skipped (.skip) tests. Remove before committing.${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ No focused or skipped tests${NC}"
fi

# Check that CLAUDE.md and agents.md are identical
echo ""
echo "Checking that CLAUDE.md and agents.md are identical..."
if [ ! -f "CLAUDE.md" ]; then
    echo -e "${RED}❌ CLAUDE.md is missing. Copy agents.md to CLAUDE.md.${NC}"
    ERRORS=$((ERRORS + 1))
elif [ ! -f "agents.md" ]; then
    echo -e "${RED}❌ agents.md is missing.${NC}"
    ERRORS=$((ERRORS + 1))
elif ! diff -q CLAUDE.md agents.md > /dev/null 2>&1; then
    echo -e "${RED}❌ CLAUDE.md and agents.md are not identical. Keep them in sync.${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ CLAUDE.md and agents.md are identical${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Code quality check failed with $ERRORS error(s)${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All code quality checks passed${NC}"
fi
