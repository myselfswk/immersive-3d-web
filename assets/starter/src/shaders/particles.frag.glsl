uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vAlpha;
varying float vMix;

void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vAlpha;
  if (a < 0.01) discard;
  vec3 col = mix(uColorA, uColorB, vMix);
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}
