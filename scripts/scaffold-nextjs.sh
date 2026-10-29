#!/usr/bin/env bash
# Usage: bash scripts/scaffold-nextjs.sh <target-project-dir>
# Injects the Awwwards-tier 3D showroom into an existing or new Next.js project.
# NEVER wipes out package.json or Next.js configurations.
set -euo pipefail

TARGET="${1:?Usage: scaffold-nextjs.sh <target-project-dir>}"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "$TARGET/components" "$TARGET/app" "$TARGET/public/models"

echo "Copying luxury 3D components into Next.js App Router..."
cp -R "$SKILL_DIR/assets/nextjs-starter/components/." "$TARGET/components/"
cp "$SKILL_DIR/assets/nextjs-starter/app/page.tsx" "$TARGET/app/page.tsx"

cd "$TARGET"

echo "Installing essential 3D dependencies (three, @types/three)..."
npm install three @types/three

echo "Downloading production car model and contact shadow map..."
bash "$SKILL_DIR/scripts/download-car-model.sh" "$TARGET/public"

echo
echo "✓ Success! Next.js Luxury 3D Showroom injected."
echo "Run 'npm run dev' to see your Awwwards-caliber 3D vehicle experience."
