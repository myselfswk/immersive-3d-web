#!/usr/bin/env bash
# Usage: bash scripts/scaffold.sh <target-dir>
# Copies the starter, installs deps, copies Draco/KTX2 decoders into public/.
set -euo pipefail
TARGET="${1:?Usage: scaffold.sh <target-dir>}"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -e "$TARGET" ] && [ -n "$(ls -A "$TARGET" 2>/dev/null)" ]; then
  echo "Target '$TARGET' exists and is not empty. Aborting." >&2; exit 1
fi
mkdir -p "$TARGET"
cp -R "$SKILL_DIR/assets/starter/." "$TARGET/"
cd "$TARGET"
echo "Installing dependencies (latest three, gsap, lenis, vite)..."
npm install
bash "$SKILL_DIR/scripts/copy-decoders.sh" "$TARGET"
echo
echo "Done. Next:  cd $TARGET && npm run dev   (add ?debug to the URL for stats)"
