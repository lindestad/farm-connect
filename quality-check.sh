#!/usr/bin/env bash
set -euo pipefail

echo "Running code formatting..."
npm run format
echo "Code formatting completed!"

echo ""

echo "Checking code formatting..."
npm run format:check
echo "Code formatting check passed!"

echo ""

echo "Running ESLint..."
npm run lint
echo "ESLint passed!"

echo ""

echo "Running TypeScript typecheck..."
npm run typecheck
echo "Typecheck passed!"

echo ""

echo "Running tests..."
npm test -- --runInBand --coverage
echo "All tests passed!"

echo ""

echo "Running security audit..."
npm audit --audit-level=high
echo "Security audit passed!"

echo ""

echo "Checking for console.log calls..."
if git --no-pager grep -n -E 'console[[:space:]]*\.[[:space:]]*log[[:space:]]*\(' -- \
  '*.js' '*.jsx' '*.ts' '*.tsx' \
  ':(exclude).github/**' ':(exclude).expo/**' \
  ':(exclude)android/**' ':(exclude)ios/**' \
  ':(exclude)build/**' ':(exclude)coverage/**' \
  ':(exclude)dist/**' ':(exclude)node_modules/**' \
  ':(exclude)tests/**'; then
  echo "Remove console.log calls before merging."
  exit 1
fi
echo "No console.log calls found!"

echo ""