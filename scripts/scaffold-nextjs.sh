#!/usr/bin/env bash
# Usage: bash scripts/scaffold-nextjs.sh <target-project-dir> [--car]
# Injects the Awwwards-caliber interactive 3D spatial experience (Lando Norris / Studio standard)
# into an existing or new Next.js project with Preloader, Fullscreen Menu, 3D Canvas & complete sections.
# NEVER wipes out package.json or Next.js configurations.
set -euo pipefail

TARGET="${1:?Usage: scaffold-nextjs.sh <target-project-dir>}"
OPT="${2:-}"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "$TARGET/components" "$TARGET/app" "$TARGET/public/models"

echo "Injecting universal Awwwards-tier 3D components into Next.js App Router..."
cp -R "$SKILL_DIR/assets/nextjs-starter/components/." "$TARGET/components/"
cp "$SKILL_DIR/assets/nextjs-starter/app/page.tsx" "$TARGET/app/page.tsx"

cd "$TARGET"

echo "Installing essential 3D dependencies (three, @types/three)..."
npm install three @types/three

if [ "$OPT" = "--car" ]; then
  echo "Downloading production automotive model..."
  bash "$SKILL_DIR/scripts/download-car-model.sh" "$TARGET/public"
fi

echo
echo "✓ Success! Universal Interactive 3D Website injected."
echo "Includes: Cinematic Preloader, Fullscreen Menu, 3D Spatial Inspector, Telemetry Bento, & Web Audio."
echo "Run 'npm run dev' to preview the complete experience."
