#!/bin/bash

# Update dependencies to latest minor/patch versions in all subdirectories
# Usage: ./update-deps.sh [--dry-run]

set -e

DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
  DRY_RUN=true
  echo "🔍 DRY RUN MODE - No changes will be made"
  echo ""
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

update_deps() {
  local dir=$1

  if [ ! -f "$dir/package.json" ]; then
    echo -e "${BLUE}Skipping $dir (no package.json)${NC}"
    return
  fi

  echo -e "${GREEN}Updating $dir${NC}"

  if [ "$DRY_RUN" = true ]; then
    (cd "$dir" && ncu -t minor)
  else
    (cd "$dir" && ncu -t minor -u)
  fi

  echo ""
}

# Check if ncu is installed
if ! command -v ncu &> /dev/null; then
  echo "❌ Error: ncu (npm-check-updates) is not installed"
  echo "Install it with: npm install -g npm-check-updates"
  exit 1
fi

echo "🚀 Starting dependency updates..."
echo ""

# Update examples/* subdirectories
echo "📦 Processing examples/*..."
for dir in examples/*/; do
  if [ -d "$dir" ]; then
    update_deps "$dir"
  fi
done

# Update packages/* subdirectories
echo "📦 Processing packages/*..."
for dir in packages/*/; do
  if [ -d "$dir" ]; then
    update_deps "$dir"
  fi
done

# Update server/node if exists
if [ -d "server/node" ]; then
  echo "📦 Processing server/node..."
  update_deps "server/node"
fi

echo -e "${GREEN}✨ Done!${NC}"

if [ "$DRY_RUN" = true ]; then
  echo ""
  echo "💡 Run without --dry-run to apply changes"
fi