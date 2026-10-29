#!/usr/bin/env bash
# Usage: bash scripts/optimize-model.sh input.glb output.glb [--mobile]
# Shrinks a GLB 10-50x using glTF-Transform (needs network for npx on first run).
set -euo pipefail
IN="${1:?input.glb}"; OUT="${2:?output.glb}"; MODE="${3:-}"
TEX=2048; [ "$MODE" = "--mobile" ] && TEX=1024
CLI="npx --yes @gltf-transform/cli"

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
$CLI dedup   "$IN"          "$TMP/a.glb"
$CLI prune   "$TMP/a.glb"   "$TMP/b.glb"
$CLI weld    "$TMP/b.glb"   "$TMP/c.glb"
$CLI resize  "$TMP/c.glb"   "$TMP/d.glb" --width $TEX --height $TEX

if command -v toktx >/dev/null 2>&1; then
  echo "toktx found: using KTX2 (UASTC for normals, ETC1S for color)"
  $CLI etc1s "$TMP/d.glb" "$TMP/e.glb" --slots "{baseColorTexture,emissiveTexture}" || cp "$TMP/d.glb" "$TMP/e.glb"
  $CLI uastc "$TMP/e.glb" "$TMP/f.glb" --slots "{normalTexture,metallicRoughnessTexture,occlusionTexture}" || cp "$TMP/e.glb" "$TMP/f.glb"
else
  echo "toktx not found: using WebP textures (install KTX-Software for KTX2)"
  $CLI webp "$TMP/d.glb" "$TMP/f.glb" --quality 85
fi

# Meshopt is simplest and decodes fast; swap for 'draco' if you prefer smaller geometry.
$CLI meshopt "$TMP/f.glb" "$OUT" --level medium
ls -lh "$IN" "$OUT"
echo "Tip: for very heavy models also run: npx @gltf-transform/cli simplify in.glb out.glb --ratio 0.5 --error 0.001"
