#!/usr/bin/env bash
# Usage: bash scripts/download-car-model.sh [target-public-dir]
# Downloads an official, royalty-free, production-optimized sports car GLB (1.68 MB)
# and its contact ambient-occlusion shadow map from Three.js into public/models/.
set -euo pipefail

PUBLIC_DIR="${1:-public}"
TARGET_DIR="$PUBLIC_DIR/models"
mkdir -p "$TARGET_DIR"

echo "Downloading production 3D car model into $TARGET_DIR/car.glb..."
curl -sL "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/ferrari.glb" -o "$TARGET_DIR/car.glb"

echo "Downloading contact shadow map into $TARGET_DIR/car_ao.png..."
curl -sL "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/ferrari_ao.png" -o "$TARGET_DIR/car_ao.png"

echo "Verified assets:"
ls -lh "$TARGET_DIR/car.glb" "$TARGET_DIR/car_ao.png"
echo
echo "Done! The car model has named components for PBR customization:"
echo " - 'body'      -> MeshPhysicalMaterial with clearcoat for metallic car paint"
echo " - 'rim_fl/fr/rl/rr', 'trim' -> MeshStandardMaterial for wheels & chrome trim"
echo " - 'glass'     -> MeshPhysicalMaterial with transmission for tinted glass"
echo " - 'wheel_fl/fr/rl/rr' -> Rotatable for driving/steering animations"
echo " - car_ao.png  -> Contact shadow plane under the vehicle"
