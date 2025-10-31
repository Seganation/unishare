#!/bin/bash

# Quick development test - runs type check and lint only
# Use this during development iterations

echo "⚡ Quick Development Test"
echo "========================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "🔍 TypeScript Type Check..."
if npm run typecheck; then
    echo -e "${GREEN}✓ TypeScript OK${NC}"
else
    echo -e "${RED}✗ TypeScript errors found${NC}"
    exit 1
fi

echo ""
echo "📏 ESLint Check..."
if npm run lint; then
    echo -e "${GREEN}✓ Lint OK${NC}"
else
    echo -e "${RED}✗ Lint errors found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Quick tests passed!${NC}"
