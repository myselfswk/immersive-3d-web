#!/usr/bin/env bash
# Usage: bash scripts/copy-decoders.sh [project-dir]
# Copies Draco + Basis/KTX2 decoders from three into public/ so loaders work offline & in production.
set -euo pipefail
DIR="${1:-.}"
SRC="$DIR/node_modules/three/examples/jsm/libs"
mkdir -p "$DIR/public/draco" "$DIR/public/basis" "$DIR/public/models"
if [ -d "$SRC/draco/gltf" ]; then cp -R "$SRC/draco/gltf/." "$DIR/public/draco/"; else echo "Draco decoder not found at $SRC/draco/gltf" >&2; fi
if [ -d "$SRC/basis" ]; then cp -R "$SRC/basis/." "$DIR/public/basis/"; else echo "Basis transcoder not found at $SRC/basis" >&2; fi
echo "Decoders copied to $DIR/public/{draco,basis}"
