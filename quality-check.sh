#!/usr/bin/env bash
set -euo pipefail

echo "Running code formatting..."
npm run format
echo "Code formatting completed!"

echo ""

echo "Checking code formatting..."
npm run format:check
echo "Code formatting check passed!"

echo "Running ESLint..."
npm run lint
echo "ESLint passed!"

echo ""

echo "Running TypeScript typecheck..."
npm run typecheck
echo "Typecheck passed!"

echo ""

echo "Running tests..."
npm test
echo "All tests passed!"

echo ""