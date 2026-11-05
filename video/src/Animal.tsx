import React from 'react';
import * as THREE from 'three';

export type Species = 'dog' | 'cat' | 'lion';

export interface Pose {
  x: number; y: number; z: number;
  yaw: number; pitch: number; roll: number;
  walk: number; amp: number;      // walk phase (rad) and leg swing amplitude 0..1
  stand: number;                  // 0 quadruped .. 1 biped
  arm: number;                    // front-leg raise (rad)
  headYaw: number; headPitch: number; headRoll: number;
  jaw: number; eye: number; brow: number; ear: number; blink: number;
  tail: number;                   // tail wag phase
  sx: number; sy: number;         // squash & stretch
  shake: number;
  costume: boolean;
  lookX: number; lookY: number;
  sweat: number;
}

export const defaultPose: Pose = {
  x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, walk: 0, amp: 0, stand: 0, arm: 0,
  headYaw: 0, headPitch: 0, headRoll: 0, jaw: 0, eye: 0, brow: 0, ear: 0, blink: 0, tail: 0,
  sx: 1, sy: 1, shake: 0, costume: true, lookX: 0, lookY: 0, sweat: 0,
};
export const P = (o: Partial<Pose>): Pose => ({...defaultPose, ...o});

export interface Look {
  fur: string; belly: string; accent: string; inner: string; stripe?: string; nose: string;
  iris?: string; skin?: string;
}

export const LOOKS: Record<string, Look> = {
  dog: {fur: '#f7f2ea', belly: '#ffffff', accent: '#b8702f', inner: '#e8a0a0', nose: '#1b1b1b', skin: '#f2c3b0'},
  lion: {fur: '#dca05a', belly: '#f0d4a0', accent: '#8f4a14', inner: '#e8a0a0', nose: '#2b1a14', skin: '#f2bba4'},
  tabby: {fur: '#9a9080', belly: '#d9cfbb', accent: '#3a342c', inner: '#f0a6a6', stripe: '#3a342c', nose: '#e58a8a', iris: '#f2cf2a'},
  orange: {fur: '#e8903c', belly: '#f6dcb4', accent: '#b8601c', inner: '#f0a6a6', stripe: '#b8601c', nose: '#e58a8a', iris: '#8ed12a'},
  black: {fur: '#2b2b32', belly: '#3c3c46', accent: '#16161a', inner: '#c88a9a', nose: '#c88a9a', iris: '#f2cf2a'},
  tux: {fur: '#26262c', belly: '#f4f4f4', accent: '#f4f4f4', inner: '#f0a6a6', nose: '#e58a8a', iris: '#6fd12a'},
  grey: {fur: '#b4b8c0', belly: '#e6e8ec', accent: '#7c808a', inner: '#f0a6a6', stripe: '#7c808a', nose: '#e58a8a', iris: '#f2cf2a'},
  calico: {fur: '#f4f0ea', belly: '#ffffff', accent: '#d9822c', inner: '#f0a6a6', stripe: '#2e2e34', nose: '#e58a8a', iris: '#6fd12a'},
};

interface Cfg {
  bodyR: [number, number, number]; bodyZ: number; hipY: number; headR: number;
  headPos: [number, number, number]; legR: number; hx: number;
}
const CFG: Record<Species, Cfg> = {
  dog: {bodyR: [0.17, 0.165, 0.30], bodyZ: 0.17, hipY: 0.30, headR: 0.165, headPos: [0, 0.21, 0.50], legR: 0.045, hx: 0.105},
  cat: {bodyR: [0.125, 0.125, 0.25], bodyZ: 0.16, hipY: 0.25, headR: 0.15, headPos: [0, 0.17, 0.42], legR: 0.036, hx: 0.08},
  lion: {bodyR: [0.20, 0.19, 0.34], bodyZ: 0.20, hipY: 0.34, headR: 0.17, headPos: [0, 0.25, 0.57], legR: 0.065, hx: 0.125},
};

type V3 = [number, number, number];

const Mat: React.FC<{c: string; r?: number; o?: number; e?: string}> = ({c, r = 0.88, o = 1, e}) => (
  <meshStandardMaterial color={c} roughness={r} metalness={0} transparent={o < 1} opacity={o} emissive={e ?? '#000000'} />
);

const Ell: React.FC<{p?: V3; s: V3 | number; c: string; rot?: V3; r?: number; o?: number}> = ({p = [0, 0, 0], s, c, rot = [0, 0, 0], r, o}) => (
  <mesh position={p} rotation={rot} scale={typeof s === 'number' ? [s, s, s] : s}>
    <sphereGeometry args={[1, 28, 20]} />
    <Mat c={c} r={r} o={o} />
  </mesh>
);

const Leg: React.FC<{p: V3; rot: number; len: number; r: number; c: string; paw: string; foot?: number}> = ({p, rot, len, r, c, paw, foot = 1.5}) => (
  <group position={p} rotation={[rot, 0, 0]}>
    <mesh position={[0, -len / 2, 0]}>
      <capsuleGeometry args={[r, len - r, 6, 14]} />
      <Mat c={c} />
    </mesh>
    <Ell p={[0, -len + r * 0.6, r * 0.5]} s={[r * 1.25, r * 0.85, r * foot]} c={paw} />
  </group>
);

const Tail: React.FC<{n: number; len: number; r: number; c: string; tip: string; phase: number; curl: number; wag: number}> = ({n, len, r, c, tip, phase, curl, wag}) => {
  if (n === 0) return <Ell s={r * 1.25} c={tip} />;
  return (
    <group rotation={[curl, Math.sin(phase) * wag, 0]}>
      <mesh position={[0, len / 2, 0]}>
        <capsuleGeometry args={[r, len, 6, 10]} />
        <Mat c={c} />
      </mesh>
      <group position={[0, len, 0]}>
        <Tail n={n - 1} len={len} r={r * 0.92} c={c} tip={tip} phase={phase - 0.7} curl={curl} wag={wag * 1.05} />
      </group>
    </group>
  );
};

const Eye: React.FC<{side: number; p: V3; r: number; wide: number; blink: number; base: string; slit: boolean; lx: number; ly: number; brow: number}> = ({side, p, r, wide, blink, base, slit, lx, ly, brow}) => {
  const R = r * (1 + 0.55 * wide);
  const pup = R * (slit ? 0.55 : 0.5) * (1 - 0.4 * wide);
  return (
    <group position={[side * p[0], p[1], p[2]]}>
      <group scale={[1, Math.max(0.08, 1 - blink * 0.92), 1]}>
        <Ell s={R} c={base} r={0.35} />
        <Ell p={[lx * R * 0.3, ly * R * 0.3, R * 0.8]} s={slit ? [pup * 0.45, pup * 1.25, pup * 0.6] : [pup, pup, pup * 0.8]} c="#0c0c10" r={0.25} />
        <Ell p={[lx * R * 0.3 + pup * 0.3, ly * R * 0.3 + pup * 0.35, R * 0.8 + pup * 0.55]} s={pup * 0.28} c="#ffffff" r={0.1} />
      </group>
      <mesh visible={Math.abs(brow) > 0.05} position={[0, R * 1.05, R * 0.35]} rotation={[0, 0, side * brow * 0.55]}>
        <boxGeometry args={[R * 1.25, R * 0.28, R * 0.3]} />
        <Mat c="#1d1712" />
      </mesh>
    </group>
  );
};

export const Animal: React.FC<{species: Species; look: Look; pose: Pose; size?: number; shadow?: boolean}> = ({species, look, pose, size = 1, shadow = true}) => {
  const c = CFG[species];
  const o = pose;
  const costume = o.costume;
  const bare = (species === 'dog' || species === 'lion') && !costume;
  const fur = bare ? look.skin! : look.fur;
  const belly = bare ? look.skin! : look.belly;
  const accent = bare ? look.skin! : look.accent;
  const [bx, by, bz] = c.bodyR;
  const w = o.walk;
  const sw = Math.sin(w) * o.amp * 0.75;
  const swB = Math.sin(w + Math.PI) * o.amp * 0.75;
  const bob = Math.abs(Math.sin(w)) * 0.035 * o.amp;
  const torsoRot = -o.stand * 1.45;
  const armBase = o.stand * 1.45 - o.arm;
  const sc = size;
  const jawOpen = o.jaw;
  const headR = c.headR;
  const eyeR = species === 'cat' ? headR * 0.4 : headR * 0.36;
  const eyeP: V3 = [headR * 0.46, headR * 0.28, headR * 0.82];
  const slit = species === 'cat';
  const eyeBase = species === 'cat' ? look.iris! : '#ffffff';
  const tailKind = species;
  const shadowR = (bx + bz) * 1.0;

  return (
    <group position={[o.x, o.y + bob * sc, o.z]} rotation={new THREE.Euler(o.pitch, o.yaw, o.roll, 'YXZ')} scale={[sc * o.sx, sc * o.sy, sc * o.sx]}>
      {shadow && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004 / sc - o.y / sc, 0.1]} scale={[shadowR * 1.25, shadowR * 1.6, 1]}>
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial color="#1a1208" transparent opacity={Math.max(0.1, 0.34 - o.y * 0.35)} depthWrite={false} />
        </mesh>
      )}
      <group>
        {/* hind legs */}
        <Leg p={[-c.hx, c.hipY, -0.02]} rot={sw} len={c.hipY} r={c.legR} c={fur} paw={species === 'dog' ? look.belly : fur} />
        <Leg p={[c.hx, c.hipY, -0.02]} rot={swB} len={c.hipY} r={c.legR} c={fur} paw={species === 'dog' ? look.belly : fur} />

        {/* shorts for the bare characters */}
        {bare && (
          <mesh position={[0, c.hipY - 0.01, 0.02]}>
            <cylinderGeometry args={[bx * 1.0, bx * 1.12, 0.17, 20]} />
            <Mat c={species === 'lion' ? '#e8344c' : '#ffd23c'} />
          </mesh>
        )}

        {/* torso */}
        <group position={[0, c.hipY, 0]} rotation={[torsoRot, 0, 0]}>
          <Ell p={[0, 0, c.bodyZ]} s={c.bodyR} c={fur} />
          <Ell p={[0, -by * 0.45, c.bodyZ + 0.02]} s={[bx * 0.8, by * 0.65, bz * 0.85]} c={belly} />
          {/* stripes / patches */}
          {species === 'cat' && look.stripe && [0, 1, 2, 3, 4].map((i) => (
            <Ell key={i} p={[0, by * 0.88, c.bodyZ - bz * 0.55 + i * bz * 0.3]} s={[bx * 0.78, 0.018, 0.034]} c={look.stripe!} />
          ))}
          {species === 'dog' && <Ell p={[bx * 0.55, by * 0.55, c.bodyZ - 0.06]} s={[0.1, 0.1, 0.13]} c={look.accent} />}
          {species === 'lion' && !bare && <Ell p={[0, by * 0.3, c.bodyZ + bz * 0.55]} s={[bx * 0.95, by * 0.9, 0.12]} c={look.belly} />}

          {/* front legs / arms */}
          <Leg p={[-c.hx, 0.02, c.bodyZ + bz * 0.55]} rot={swB * (1 - o.stand) + armBase} len={c.hipY} r={c.legR} c={fur} paw={species === 'dog' ? look.belly : fur} />
          <Leg p={[c.hx, 0.02, c.bodyZ + bz * 0.55]} rot={sw * (1 - o.stand) + armBase} len={c.hipY} r={c.legR} c={fur} paw={species === 'dog' ? look.belly : fur} />

          {/* tail */}
          <group position={[0, by * 0.2, c.bodyZ - bz * 0.92]}>
            {tailKind === 'cat' && (
              <group rotation={[-2.2, 0, 0]}>
                <Tail n={5} len={0.1} r={0.032} c={look.fur} tip={look.accent} phase={o.tail} curl={0.28} wag={0.5} />
              </group>
            )}
            {tailKind === 'dog' && (
              <group rotation={[-1.1, Math.sin(o.tail) * 0.7, 0]}>
                <Tail n={2} len={0.09} r={0.032} c={fur} tip={bare ? fur : look.accent} phase={0} curl={0.12} wag={0} />
              </group>
            )}
            {tailKind === 'lion' && (
              <group rotation={[-1.9, Math.sin(o.tail) * 0.4, 0]}>
                <Tail n={4} len={0.11} r={0.026} c={fur} tip={bare ? fur : look.accent} phase={0} curl={0.2} wag={0} />
              </group>
            )}
          </group>

          {/* costume cape (dog) */}
          {species === 'dog' && costume && (
            <group position={[0, by * 0.85, c.bodyZ + bz * 0.45]} rotation={[-0.45 + 0.12 * Math.sin(w * 2) * o.amp + 0.08 * Math.sin(o.tail * 0.5), 0, 0]}>
              <mesh position={[0, 0, -0.24]}>
                <boxGeometry args={[0.38, 0.02, 0.5]} />
                <Mat c="#d92b2b" />
              </mesh>
            </group>
          )}

          {/* head */}
          <group position={c.headPos} rotation={[o.headPitch + o.stand * 1.38, o.headYaw, o.headRoll]}>
            {/* neck/collar */}
            {species === 'dog' && costume && (
              <mesh position={[0, -headR * 0.62, -headR * 0.35]} rotation={[-0.45, 0, 0]}>
                <torusGeometry args={[headR * 0.7, 0.03, 10, 24]} />
                <Mat c="#1c1c1c" />
              </mesh>
            )}
            {/* lion mane */}
            {species === 'lion' && costume && (
              <group position={[0, -0.01, -0.07]}>
                <Ell s={[0.34, 0.34, 0.22]} c={look.accent} />
                {Array.from({length: 14}).map((_, i) => {
                  const a = (i / 14) * Math.PI * 2;
                  return <Ell key={i} p={[Math.sin(a) * 0.3, Math.cos(a) * 0.3, -0.02]} s={[0.1, 0.1, 0.1]} c={i % 2 ? '#a85a1a' : '#8a4410'} />;
                })}
              </group>
            )}
            <Ell s={[headR * 1.08, headR * 0.98, headR * 1.0]} c={fur} />
            {/* muzzle */}
            {species === 'dog' && (
              <>
                <Ell p={[0, -headR * 0.3, headR * 0.82]} s={[headR * 0.55, headR * 0.42, headR * 0.62]} c={look.belly} />
                <Ell p={[0, -headR * 0.08, headR * 1.38]} s={[headR * 0.2, headR * 0.15, headR * 0.15]} c={look.nose} r={0.3} />
                {look.accent && !bare && <Ell p={[headR * 0.5, headR * 0.22, headR * 0.35]} s={[headR * 0.5, headR * 0.55, headR * 0.5]} c={look.accent} />}
              </>
            )}
            {species === 'cat' && (
              <>
                <Ell p={[0, -headR * 0.38, headR * 0.82]} s={[headR * 0.42, headR * 0.32, headR * 0.3]} c={look.belly} />
                <Ell p={[0, -headR * 0.18, headR * 1.05]} s={[headR * 0.15, headR * 0.1, headR * 0.1]} c={look.nose} r={0.4} />
                {[-1, 1].map((sd) => [0, 1, 2].map((k) => (
                  <mesh key={sd * 10 + k} position={[sd * headR * 0.62, -headR * 0.28 + (k - 1) * 0.02, headR * 0.95]} rotation={[0, 0, sd * (-0.25 + (k - 1) * 0.28) + (sd > 0 ? 0 : 0) + Math.PI / 2]}>
                    <cylinderGeometry args={[0.0035, 0.0035, 0.15, 5]} />
                    <Mat c="#f4f4f4" />
                  </mesh>
                )))}
              </>
            )}
            {species === 'lion' && (
              <>
                <Ell p={[0, -headR * 0.3, headR * 0.8]} s={[headR * 0.62, headR * 0.45, headR * 0.58]} c={bare ? look.skin! : look.belly} />
                <Ell p={[0, -headR * 0.02, headR * 1.3]} s={[headR * 0.26, headR * 0.17, headR * 0.15]} c={look.nose} r={0.3} />
              </>
            )}

            {/* mouth */}
            <Ell p={[0, -headR * 0.5, headR * (species === 'dog' ? 0.95 : 0.82)]} s={[headR * 0.42 * (0.4 + jawOpen), headR * (0.04 + 0.4 * jawOpen), headR * 0.4]} c="#6e1020" r={0.6} />
            {jawOpen > 0.15 && (
              <Ell p={[0, -headR * (0.55 + 0.2 * jawOpen), headR * 0.85]} s={[headR * 0.22, headR * 0.1, headR * 0.26]} c="#f06a7a" r={0.5} />
            )}
            <group position={[0, -headR * 0.45, headR * 0.45]} rotation={[jawOpen * 0.6, 0, 0]}>
              <Ell p={[0, -headR * 0.18, headR * 0.35]} s={[headR * 0.5, headR * 0.2, headR * 0.55]} c={species === 'dog' ? look.belly : (bare ? look.skin! : look.belly)} />
            </group>
            {species !== 'dog' && jawOpen > 0.1 && [-1, 1].map((sd) => (
              <mesh key={sd} position={[sd * headR * 0.28, -headR * 0.42, headR * 0.98]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[headR * 0.07, headR * 0.28 * Math.min(1, jawOpen * 1.6), 8]} />
                <Mat c="#ffffff" r={0.3} />
              </mesh>
            ))}

            {/* eyes */}
            {[-1, 1].map((sd) => (
              <Eye key={sd} side={sd} p={eyeP} r={eyeR} wide={o.eye} blink={o.blink} base={eyeBase} slit={slit} lx={o.lookX} ly={o.lookY} brow={o.brow} />
            ))}

            {/* ears */}
            {species === 'dog' && [-1, 1].map((sd) => (
              <group key={sd} position={[sd * headR * 0.78, headR * 0.55, 0]} rotation={[0, 0, sd * (0.75 + o.ear * 0.5)]}>
                <Ell p={[sd * 0.05, -0.08, -0.01]} s={[0.05, 0.12, 0.085]} c={bare ? look.skin! : look.accent} />
              </group>
            ))}
            {species === 'cat' && [-1, 1].map((sd) => (
              <group key={sd} position={[sd * headR * 0.62, headR * 0.74, -headR * 0.05]} rotation={[-o.ear * 0.7, 0, -sd * (0.3 + o.ear * 0.9)]}>
                <mesh position={[0, 0.06, 0]}>
                  <coneGeometry args={[headR * 0.42, headR * 0.95, 4]} />
                  <Mat c={look.fur} />
                </mesh>
                <mesh position={[0, 0.05, 0.012]} scale={[0.6, 0.65, 0.6]}>
                  <coneGeometry args={[headR * 0.42, headR * 0.95, 4]} />
                  <Mat c={look.inner} />
                </mesh>
              </group>
            ))}
            {species === 'lion' && [-1, 1].map((sd) => (
              <Ell key={sd} p={[sd * headR * (bare ? 0.85 : 0.95), headR * 0.85, -0.02]} s={bare ? [0.06, 0.08, 0.04] : [0.05, 0.05, 0.035]} c={bare ? look.skin! : look.fur} />
            ))}
            {/* superhero mask (dog) */}
            {species === 'dog' && costume && (
              <mesh position={[0, headR * 0.26, headR * 0.8]}>
                <boxGeometry args={[headR * 1.7, headR * 0.34, headR * 0.45]} />
                <Mat c="#d92b2b" />
              </mesh>
            )}
            {/* sweat drops */}
            {o.sweat > 0.01 && [-1, 1].map((sd, k) => (
              <Ell key={sd} p={[sd * headR * 1.2, headR * (0.5 + 0.4 * ((o.sweat * 3 + k * 0.5) % 1)), headR * 0.2]} s={[0.018, 0.03, 0.018]} c="#7fd0ff" r={0.1} />
            ))}
          </group>
        </group>
      </group>
    </group>
  );
};
