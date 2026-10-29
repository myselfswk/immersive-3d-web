uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uHue;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;

vec3 palette(float t){
  // cosine palette (iq), tinted by the three brand colors
  vec3 base = 0.5 + 0.5 * cos(6.28318 * (vec3(1.0) * t + vec3(0.0, 0.33, 0.67)));
  vec3 brand = mix(mix(uColorA, uColorB, smoothstep(0.0, 0.5, t)), uColorC, smoothstep(0.5, 1.0, t));
  return mix(base, brand, 0.72);
}

void main(){
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);

  float t = fract(uHue + vNoise * 1.6 + fres * 0.25 + uTime * 0.02);
  vec3 col = palette(t);

  // soft key light + rim
  vec3 L = normalize(vec3(0.5, 0.8, 0.6));
  float diff = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);
  col *= 0.35 + 0.85 * diff;
  col += fres * mix(uColorB, vec3(1.0), 0.4) * 0.9;

  // specular glint
  vec3 H = normalize(L + V);
  col += pow(max(dot(N, H), 0.0), 60.0) * 0.5;

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
