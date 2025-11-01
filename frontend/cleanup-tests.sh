#!/bin/bash

# Cleanup script for broken Playwright tests

echo "🧹 Cleaning up broken test files..."
echo ""

cd "$(dirname "$0")/tests"

# Files to remove (with wrong selectors)
FILES_TO_REMOVE=(
  "auth.spec.ts"
  "example.spec.ts"
  "onboarding-wizard.spec.ts"
  "onboarding-step1-business-profile.spec.ts"
  "onboarding-step2-service-area.spec.ts"
  "onboarding-step3-operating-hours.spec.ts"
  "onboarding-step4-services.spec.ts"
  "onboarding-complete-flow.spec.ts"
  "onboarding-with-mocks.spec.ts"
)

# Check which files exist
EXISTING_FILES=()
for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    EXISTING_FILES+=("$file")
  fi
done

if [ ${#EXISTING_FILES[@]} -eq 0 ]; then
  echo "✅ No broken files found. Already clean!"
  exit 0
fi

echo "Found ${#EXISTING_FILES[@]} broken test files:"
for file in "${EXISTING_FILES[@]}"; do
  echo "  ❌ $file"
done
echo ""

# Ask for confirmation
read -p "Delete these files? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  for file in "${EXISTING_FILES[@]}"; do
    rm "$file"
    echo "  🗑️  Deleted $file"
  done
  echo ""
  echo "✅ Cleanup complete!"
  echo ""
  echo "Remaining test files:"
  ls -1 *.spec.ts 2>/dev/null || echo "  (no spec files)"
else
  echo "❌ Cleanup cancelled"
fi
