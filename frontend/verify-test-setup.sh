#!/bin/bash

# Verify Playwright test setup

echo "🔍 Verifying Playwright Test Setup..."
echo ""

cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0

# Check 1: Node modules
echo -n "Checking node_modules... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "  Run: npm install"
    ((errors++))
fi

# Check 2: Playwright installed
echo -n "Checking @playwright/test... "
if [ -d "node_modules/@playwright/test" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "  Run: npm install"
    ((errors++))
fi

# Check 3: Playwright config
echo -n "Checking playwright.config.ts... "
if [ -f "playwright.config.ts" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ((errors++))
fi

# Check 4: Auth setup file
echo -n "Checking auth setup... "
if [ -f "tests/setup/auth.setup.ts" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ((errors++))
fi

# Check 5: Working test files
echo -n "Checking onboarding-FIXED.spec.ts... "
if [ -f "tests/onboarding-FIXED.spec.ts" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ((errors++))
fi

# Check 6: Helpers
echo -n "Checking test helpers... "
if [ -f "tests/helpers.ts" ] && [ -f "tests/onboarding-helpers.ts" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ((errors++))
fi

# Check 7: Fixtures
echo -n "Checking test fixtures... "
if [ -f "tests/fixtures/onboarding.ts" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ((errors++))
fi

# Check 8: Playwright browsers
echo -n "Checking Playwright browsers... "
if npx playwright --version > /dev/null 2>&1; then
    # Try to check if browsers are installed
    if [ -d "$HOME/Library/Caches/ms-playwright" ] || [ -d "$HOME/.cache/ms-playwright" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}?${NC}"
        echo "  Browsers may not be installed. Run: npx playwright install"
    fi
else
    echo -e "${RED}✗${NC}"
    echo "  Run: npx playwright install"
    ((errors++))
fi

echo ""
echo "📁 File Structure:"
echo ""

# Show test directory structure
if command -v tree > /dev/null 2>&1; then
    tree -L 2 tests/ -I 'node_modules|.auth' --dirsfirst
else
    echo "tests/"
    ls -1 tests/ | sed 's/^/  /'
fi

echo ""
echo "📊 Test File Count:"
echo ""

# Count test files
working_tests=$(ls tests/*FIXED*.spec.ts tests/*working*.spec.ts 2>/dev/null | wc -l | xargs)
broken_tests=$(ls tests/auth.spec.ts tests/example.spec.ts tests/onboarding-wizard.spec.ts tests/onboarding-step*.spec.ts tests/onboarding-complete-flow.spec.ts tests/onboarding-with-mocks.spec.ts 2>/dev/null | wc -l | xargs)

echo "  Working tests: ${GREEN}$working_tests${NC}"
if [ "$broken_tests" -gt 0 ]; then
    echo "  Broken tests:  ${RED}$broken_tests${NC} (should delete)"
else
    echo "  Broken tests:  ${GREEN}0${NC} (cleaned up!)"
fi

echo ""
echo "📋 Summary:"
echo ""

if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Ready to run tests:"
    echo "  npm test                    # Run all tests"
    echo "  npm run test:ui             # Interactive UI mode"
    echo "  npm run test:headed         # Watch in browser"
    echo ""

    if [ "$broken_tests" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Clean up broken test files:${NC}"
        echo "  ./cleanup-tests.sh"
        echo ""
    fi
else
    echo -e "${RED}❌ $errors errors found${NC}"
    echo ""
    echo "Fix the issues above, then run this script again."
    echo ""
fi

# Check if dev server might be needed
echo "💡 Tips:"
echo "  - Make sure dev server is running: npm run dev"
echo "  - First run will create test user automatically"
echo "  - Check AUTH_AND_TESTS_READY.md for details"
echo ""

exit $errors
