uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform float uVelocity;

varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;

vec3 displace(vec3 p){
  float n = snoise(p * uFreq + vec3(0.0, 0.0, uTime * 0.18));
  float n2 = snoise(p * uFreq * 2.1 - vec3(uTime * 0.12, 0.0, 0.0)) * 0.35;
  float d = (n + n2) * (uAmp + abs(uVelocity) * 0.12);
  return p * (1.0 + d);
}

void main(){
  vec3 up = abs(normal.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 tangent = normalize(cross(normal, up));
  vec3 bitangent = normalize(cross(normal, tangent));
  float e = 0.012;

  vec3 p0 = displace(position);
  vec3 p1 = displace(normalize(position + tangent * e));
  vec3 p2 = displace(normalize(position + bitangent * e));
  vec3 n = normalize(cross(p1 - p0, p2 - p0));
  if (dot(n, normal) < 0.0) n = -n;

  vNoise = length(p0) - 1.0;
  vNormal = normalize(normalMatrix * n);
  vec4 mv = modelViewMatrix * vec4(p0, 1.0);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
