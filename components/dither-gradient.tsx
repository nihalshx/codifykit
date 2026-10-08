"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Stepped, Bayer-dithered diagonal gradient (dark top-left → light bottom-right),
// in the same spirit as the Codifykit logo artwork.
const fragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uC4;
varying vec2 vUv;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float bayer4(vec2 p) {
  int x = int(mod(p.x, 4.0));
  int y = int(mod(p.y, 4.0));
  int i = y * 4 + x;
  float m[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
  return m[i] / 16.0;
}

vec3 band(int i) {
  if (i <= 0) return uC0;
  if (i == 1) return uC1;
  if (i == 2) return uC2;
  if (i == 3) return uC3;
  return uC4;
}

void main() {
  vec2 uv = vUv;
  float noise = snoise(uv * 1.5 + vec2(uTime * 0.05, uTime * 0.03)) * 0.18;

  // 0 at top-left, 1 at bottom-right, eased so most of the screen stays deep.
  float diagonal = (uv.x + (1.0 - uv.y)) * 0.5;
  float g = clamp(pow(diagonal, 1.6) * 1.15 + noise, 0.0, 0.999);

  float steps = 5.0;
  float scaled = g * steps;
  int idx = int(floor(scaled));
  float frac = fract(scaled);

  // Dither the top of each band into the next one.
  float d = bayer4(gl_FragCoord.xy / 2.0);
  if (frac > 0.55 && (frac - 0.55) / 0.45 > d) idx += 1;

  vec3 color = band(idx);

  // Soften the darkest corner to pure ink.
  float corner = smoothstep(0.0, 0.45, length(vec2(uv.x, 1.0 - uv.y)));
  color = mix(uC0 * 0.6, color, corner);

  gl_FragColor = vec4(color, 1.0);
}
`;

function Plane({ colors, speed }: { colors: string[]; speed: number }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uC0: { value: new THREE.Color(colors[0]) },
      uC1: { value: new THREE.Color(colors[1]) },
      uC2: { value: new THREE.Color(colors[2]) },
      uC3: { value: new THREE.Color(colors[3]) },
      uC4: { value: new THREE.Color(colors[4]) },
    }),
    [colors],
  );

  const material = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = clock.getElapsedTime() * speed;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

const BRAND = ["#05051c", "#0b0b5c", "#1d1a9a", "#5a4fcf", "#a7a6ec"];

export default function DitherGradient({
  colors = BRAND,
  speed = 1,
  className,
}: {
  colors?: string[];
  speed?: number;
  className?: string;
}) {
  const reduce =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1]}
        frameloop={reduce ? "demand" : "always"}
        gl={{ antialias: false, alpha: false, powerPreference: "low-power" }}
      >
        <Plane colors={colors} speed={speed} />
      </Canvas>
    </div>
  );
}
