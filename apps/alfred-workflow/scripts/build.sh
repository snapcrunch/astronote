#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKFLOW_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$WORKFLOW_DIR/dist"
STAGING_DIR="$DIST_DIR/_staging"
OUTPUT_FILE="$DIST_DIR/Astronote.alfredworkflow"

rm -rf "$DIST_DIR"
mkdir -p "$STAGING_DIR"

# Copy workflow files into staging
cp "$WORKFLOW_DIR/info.plist" "$STAGING_DIR/"
cp -r "$WORKFLOW_DIR/src" "$STAGING_DIR/src"

# Copy icon if it exists
if [ -f "$WORKFLOW_DIR/icon.png" ]; then
  cp "$WORKFLOW_DIR/icon.png" "$STAGING_DIR/"
fi

# Create a minimal package.json with only production deps
node -e "
  const pkg = require('$WORKFLOW_DIR/package.json');
  const out = { name: pkg.name, version: pkg.version, type: pkg.type, dependencies: pkg.dependencies };
  process.stdout.write(JSON.stringify(out, null, 2));
" > "$STAGING_DIR/package.json"

# Install production dependencies only
cd "$STAGING_DIR"
npm install --production --ignore-scripts

# Package as .alfredworkflow (zip with files at root)
cd "$STAGING_DIR"
zip -r "$OUTPUT_FILE" . -x '.*' > /dev/null

# Clean up staging
rm -rf "$STAGING_DIR"

echo "Built: $OUTPUT_FILE"
