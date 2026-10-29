uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uProgress;
uniform float uVelocity;

attribute float aRand;
attribute float aScale;

varying float vAlpha;
varying float vMix;

void main(){
  vec3 p = position;
  float t = uTime * (0.05 + aRand * 0.08);
  p.x += sin(t * 6.0 + aRand * 40.0) * 0.18;
  p.y += cos(t * 5.0 + aRand * 31.0) * 0.18 + uProgress * 1.2 * (aRand - 0.5);
  p.z += sin(t * 4.0 + aRand * 17.0) * 0.18 + uVelocity * 1.5 * aRand;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(uSize * aScale * uPixelRatio * (1.0 / -mv.z), 1.0, 64.0);

  vAlpha = smoothstep(26.0, 3.0, -mv.z) * (0.35 + 0.65 * aRand);
  vMix = aRand;
}
