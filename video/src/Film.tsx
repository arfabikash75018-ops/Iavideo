import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import T from './timeline.json';
import {Animal, LOOKS, P, Pose} from './Animal';
import {World} from './World';
import {kf, lin, outQuad, inQuad, pulse, decay, jit, rnd, mix, clamp} from './util';

const PI = Math.PI;
const CENTER: [number, number] = [0, 0];

/* ------------------------------------------------------------------ */
/* DOG                                                                  */
/* ------------------------------------------------------------------ */
function dogPose(t: number): Pose {
  const scared = t >= T.hit;
  // ---- scene 1
  if (t < 8) {
    const hop = pulse(t, T.hit + 0.05, 0.55) * 0.4;
    const sq = kf(t, [[T.hit - 0.1, 1], [T.hit, 0.62], [T.hit + 0.18, 1.18], [T.hit + 0.4, 1]]);
    const sh = scared ? 0.9 : 0;
    return P({
      x: kf(t, [[0, 0.7], [2.7, 0.7], [4.2, 0.95], [5.9, 0.95], [6.75, 1.0], [8, 1.0]]) + sh * jit(t, 55) * 0.012,
      y: hop,
      yaw: kf(t, [[0, -PI / 2], [6.7, -PI / 2], [7.1, -1.2], [8, -1.0]]),
      sy: sq, sx: 1 + (1 - sq) * 0.35,
      headYaw: t < 2.7 ? 0.25 * Math.sin(t * 2) : 0,
      headRoll: t < 2.7 ? 0.18 * Math.sin(t * 2 + 1) : 0,
      eye: kf(t, [[0, 0], [2.7, 0.15], [4.5, 0.45], [5.9, 0.85], [6.75, 1], [8, 0.9]]),
      jaw: scared ? kf(t, [[T.hit, 1], [7.6, 0.8], [8, 0.45]]) * (0.8 + 0.2 * Math.sin(t * 30)) : 0,
      brow: scared ? -0.9 : kf(t, [[0, 0], [4, -0.3], [5.9, -0.6]]),
      ear: scared ? 1 : kf(t, [[0, 0], [5, 0.4]]),
      tail: t * 8,
      sweat: kf(t, [[5.5, 0], [6.9, 0.4], [8, 1]]),
      blink: !scared && Math.sin(t * 2.3) > 0.97 ? 1 : 0,
      lookX: -0.8,
    });
  }
  // ---- scene 2
  if (t < 16) {
    const happy = t > T.catFlee + 0.9;
    return P({
      x: 1.15, z: 0.0,
      y: happy ? Math.abs(Math.sin((t - T.catFlee - 0.9) * 7.5)) * 0.32 : 0,
      yaw: t < T.roar ? kf(t, [[8, -1.2], [9.5, -1.4], [10.6, -0.6], [11.4, -1.57]]) : happy ? kf(t, [[T.catFlee + 0.9, -1.57], [T.catFlee + 1.5, -0.4], [15, 0.0]]) : -1.57,
      eye: happy ? 0 : kf(t, [[8, 0.9], [9, 0.5], [11, 0.8], [12, 1]]),
      jaw: happy ? 0.5 + 0.4 * Math.sin(t * 6) : 0.0,
      brow: happy ? 0.3 : -0.8,
      ear: happy ? 0 : 1,
      tail: t * (happy ? 18 : 5),
      sweat: happy ? 0 : 0.7,
      sy: happy ? 1 + 0.08 * Math.cos((t - T.catFlee - 0.9) * 15) : 1,
      headYaw: happy ? 0 : 0.3 * Math.sin(t * 3),
      shake: 0,
    });
  }
  // ---- scene 3
  if (t < 27) {
    return P({
      x: 0.5, z: 0.1,
      yaw: -0.5 + 0.7 * Math.sin(t * 0.55 + 1),
      headYaw: 0.5 * Math.sin(t * 1.4),
      eye: 1, jaw: 0.35 + 0.15 * Math.sin(t * 9), brow: -1, ear: 1,
      tail: t * 3, sweat: 1, shake: 1,
    });
  }
  // ---- scene 4
  if (t < 40) {
    const bare = t > 28.4;
    return P({
      x: 0.5, z: 0.1,
      yaw: t < 27.6 ? 0 : kf(t, [[27.6, 0], [30.4, 0], [31.2, -0.3], [33, 0.2], [36, 0.0]]),
      stand: bare ? kf(t, [[28.4, 0], [28.9, 1]]) : 0,
      arm: bare ? kf(t, [[28.9, 0], [30.5, -0.4], [31.5, -0.55]]) : 0,
      costume: !bare,
      eye: bare ? kf(t, [[28.4, 1], [31, 1], [33, 0.7]]) : 1,
      jaw: bare ? 0.25 * Math.max(0, Math.sin(t * 5)) : 0.9,
      brow: -1, ear: 1,
      headPitch: bare ? kf(t, [[30, 0], [32, 0.5]]) : 0,
      headYaw: bare ? 0.4 * Math.sin(t * 1.2) : 0,
      blink: bare && Math.sin(t * 2.1) > 0.8 ? 1 : 0,
      tail: t * 4,
      sweat: 1,
      sy: bare ? 1 : 1,
      shake: t < 28.4 ? 1 : 0.2,
    });
  }
  // ---- scene 5
  const fly = t >= T.sneeze;
  return P({
    x: 0.32, z: 0.15,
    stand: 1, arm: -0.5, costume: false,
    yaw: kf(t, [[40, 0], [42.4, 0], [43.4, PI]]),
    headYaw: kf(t, [[40, 0], [40.6, -0.9], [41.6, -0.9], [42.2, 0.2], [43.4, 0]]),
    eye: 1,
    jaw: t < T.scream ? kf(t, [[40.5, 0.1], [41, 0.6]]) : 1,
    brow: -1, sweat: 1, tail: t * 3, ear: 1,
    blink: 0,
    shake: t > T.scream ? 1 : 0.3,
    ...(fly ? {} : {}),
  });
}

/* ------------------------------------------------------------------ */
/* LION                                                                 */
/* ------------------------------------------------------------------ */
function lionPose(t: number): Pose | null {
  if (t < T.lionAppear) return null;
  if (t < 16) {
    const w = (t - T.stepStart) * 5.1;
    const walking = t < 11.0;
    const roar = pulse(t, T.roar, 1.1) > 0 || (t >= T.roar && t < T.roar + 1.1);
    const roarU = kf(t, [[T.roar - 0.4, 0], [T.roar, 1], [T.roar + 1.0, 1], [T.roar + 1.4, 0]]);
    return P({
      x: 0.15, z: kf(t, [[T.lionAppear, -4.2], [11.0, 0.15]], lin),
      yaw: t < 11 ? 0 : kf(t, [[11.0, 0], [11.55, -0.85]]),
      walk: walking ? w : 0, amp: walking ? 0.9 : 0,
      jaw: roarU, headPitch: -0.5 * roarU + (t > T.roar + 1.4 ? 0.1 : 0), brow: roar ? 1 : 0.6,
      eye: roarU * 0.1, ear: 0,
      sy: 1 + 0.06 * kf(t, [[11.5, 0], [11.9, 1], [12.0, 0.6], [13.2, 0.2], [14, 0]]), sx: 1,
      pitch: -0.06 * roarU,
      tail: t * 3,
      lookX: -0.5,
    });
  }
  if (t < 27) {
    return P({
      x: -0.45, z: 0.0, yaw: 0.55 * Math.sin(t * 0.5),
      eye: 0.9, jaw: 0.3 + 0.2 * Math.sin(t * 6), brow: -0.3, ear: 1,
      headYaw: 0.5 * Math.sin(t * 1.1 + 2),
      tail: t * 3, sweat: 1, shake: 1,
      lookX: Math.sin(t * 1.1 + 2),
    });
  }
  if (t < 40) {
    const bare = t > 28.4;
    return P({
      x: -0.45, z: 0.0,
      yaw: t < 27.6 ? 0.2 : kf(t, [[27.6, 0.2], [30.4, 0.0], [31.5, 0.3], [34, -0.2], [36, 0.0]]),
      costume: !bare,
      stand: bare ? kf(t, [[28.4, 0], [28.9, 1]]) : 0,
      arm: bare ? kf(t, [[28.9, 0], [31, -0.5]]) : 0,
      eye: 1, jaw: bare ? 0.2 * Math.max(0, Math.sin(t * 4)) : 0.9, brow: -1, ear: 1,
      headPitch: bare ? kf(t, [[30, 0], [32, 0.5]]) : 0,
      headYaw: bare ? 0.4 * Math.sin(t * 1.0 + 1) : 0,
      blink: bare && Math.sin(t * 1.7 + 1) > 0.8 ? 1 : 0,
      sweat: 1, tail: t * 4, shake: t < 28.4 ? 1 : 0.2,
    });
  }
  return P({
    x: -0.4, z: 0.0, stand: 1, arm: -0.5, costume: false,
    yaw: kf(t, [[40, 0], [42.4, 0], [43.4, PI]]),
    headYaw: kf(t, [[40, 0], [40.6, 0.9], [41.6, 0.9], [42.2, -0.2], [43.4, 0]]),
    eye: 1, jaw: t < T.scream ? kf(t, [[40.5, 0.1], [41, 0.6]]) : 1, brow: -1, sweat: 1, ear: 1,
    shake: t > T.scream ? 1 : 0.3, tail: t * 3,
  });
}
const lionSize = (t: number) => (t > 28.4 ? 1.12 : 1.9);

/* ------------------------------------------------------------------ */
/* LEADER CAT (scene 1, 2 and 3A)                                       */
/* ------------------------------------------------------------------ */
function leaderPose(t: number, dog: Pose): Pose | null {
  if (t < 8) {
    const walkT = kf(t, [[T.catEnter, 0], [2.6, 1]], lin);
    const walking = t < 2.7;
    const provoke = t >= 2.7 && t < 5.0;
    const crouch = t >= 5.0 && t < T.jump;
    const jumping = t >= T.jump && t < T.hit;
    const riding = t >= T.hit && t < T.shakeOff;
    const flung = t >= T.shakeOff;
    const x0 = -0.32;
    let x = mix(-2.4, x0, walkT);
    let y = 0, pitch = 0, arm = 0, jaw = 0, sy = 1, sx = 1, yaw = PI / 2, brow = 0.9, amp = 0, walk = 0, eye = 0.1, roll = 0;
    if (walking) { amp = 0.8; walk = t * 10; jaw = 0.0; }
    if (provoke) {
      const k = t - 2.7;
      y = Math.abs(Math.sin(k * 6.5)) * 0.1;
      jaw = 0.6 + 0.4 * Math.sin(k * 9);
      arm = 0.9 * Math.max(0, Math.sin(k * 5));
      x = x0 + 0.1 * Math.sin(k * 3) * 0.5;
      pitch = 0.1;
      yaw = PI / 2 + 0.2 * Math.sin(k * 2);
    }
    if (crouch) {
      const k = t - 5.0;
      sy = 0.78; sx = 1.08; pitch = 0.14; jaw = 0.3; x = x0 - 0.05 + (k < 0.6 ? 0 : 0);
      yaw = PI / 2 + 0.07 * Math.sin(k * 40);
    }
    if (jumping) {
      const u = (t - T.jump) / (T.hit - T.jump);
      const xe = dog.x - 0.3;
      x = mix(x0, xe, u);
      y = Math.sin(u * PI) * 0.75 + u * 0.28;
      pitch = mix(-0.4, 0.45, u);
      arm = 2.3; jaw = 1; sy = 1 + 0.2 * Math.sin(u * PI);
      eye = 0.4;
    }
    if (riding) {
      const k = t - T.hit;
      x = dog.x - 0.25 + 0.06 * Math.sin(k * 20);
      y = dog.y + 0.42 * (dog.sy);
      pitch = -0.3; arm = 1.3; jaw = 0.7; roll = 0.15 * Math.sin(k * 30);
    }
    if (flung) {
      const u = clamp((t - T.shakeOff) / 0.7);
      x = mix(dog.x - 0.25, dog.x - 1.4, u);
      y = Math.sin(u * PI) * 0.8;
      roll = u * 6.0;
      pitch = 0;
      eye = 0.8; jaw = 1; brow = 0.3;
      if (u >= 1) { y = 0; roll = 0; }
    }
    return P({x, y, z: 0, yaw, pitch, roll, arm, jaw, sy, sx, brow, eye, ear: 1, amp, walk, tail: t * 12, blink: 0});
  }
  if (t < 16) {
    const fleeT = T.catFlee;
    const k = t - fleeT;
    const fleeing = t >= fleeT;
    const scared = t > T.roar - 0.4;
    const x = fleeing ? mix(-1.5, -9, outQuad(clamp(k / 1.6)) * 0.4 + clamp(k / 1.6) * 0.6) : -1.5;
    if (t > fleeT + 1.7) return null;
    return P({
      x: fleeing ? x : -1.5, y: fleeing ? Math.abs(Math.sin(k * 14)) * 0.08 : pulse(t, T.roar, 0.4) * 0.3,
      z: 0.1,
      yaw: fleeing ? kf(t, [[fleeT, PI / 2], [fleeT + 0.25, -PI / 2]]) : PI / 2,
      walk: fleeing ? t * 26 : 0, amp: fleeing ? 1 : 0,
      pitch: fleeing ? -0.05 : 0,
      sx: scared && !fleeing ? 1.25 : 1, sy: scared && !fleeing ? 1.18 : 1,
      eye: scared ? 1 : 0.2, jaw: scared ? 0.9 : 0.4, brow: scared ? -0.6 : 0.9, ear: scared ? 1 : 0.6,
      tail: t * 20, shake: scared && !fleeing ? 1 : 0, sweat: scared ? 1 : 0,
    });
  }
  if (t < 17.6) {
    const walkT = clamp((t - T.catBack) / 1.0);
    const x = mix(-2.6, -1.15, walkT);
    const pose = t > T.evil;
    return P({
      x, z: 0.9, yaw: PI / 2 + 0.3,
      walk: walkT < 1 ? t * 9 : 0, amp: walkT < 1 ? 0.7 : 0,
      arm: pose ? kf(t, [[T.evil, 0], [T.evil + 0.25, 2.3]]) : 0,
      jaw: pose ? 0.6 + 0.4 * Math.sin(t * 10) : 0.3,
      brow: 1, eye: 0.1, ear: 1, tail: t * 8,
      y: pose ? Math.abs(Math.sin(t * 7)) * 0.04 : 0,
      pitch: pose ? -0.3 : 0,
    });
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* ARMY                                                                 */
/* ------------------------------------------------------------------ */
const NCATS = 20;
const catLook = (i: number) => ['tabby', 'orange', 'black', 'tux', 'grey', 'calico'][i % 6];
const catSize = (i: number) => (i === 0 ? 0.88 : 0.76 + 0.16 * rnd(i, 4));

function horseshoe(i: number): [number, number] {
  const row = i % 3;
  const per = [7, 7, 6][row];
  const idx = Math.floor(i / 3);
  const R = [1.55, 2.3, 3.0][row];
  const phi = -1.75 + (idx / Math.max(1, per - 1)) * 3.5 + (row % 2 ? 0.2 : 0);
  return [Math.sin(phi) * R, -Math.cos(phi) * R * 0.9 + 0.2];
}

function armyPose(i: number, t: number): Pose | null {
  const th0 = (i / NCATS) * PI * 2 + (rnd(i, 1) - 0.5) * 0.3;
  const ta = 17.4 + i * 0.13 + rnd(i, 2) * 0.25;   // arrival at circle
  const ts = ta - 1.9;                              // spawn
  const th = th0 + Math.max(0, t - ta) * 0.13;
  const jr = (rnd(i, 3) - 0.5) * 0.28;
  const ringXY = (R: number, a: number): [number, number] => [CENTER[0] + R * Math.sin(a), CENTER[1] + R * Math.cos(a)];
  if (t < ts) return null;
  if (t < 17.6 && i === 0) return null;
  // spawn & run in
  if (t < ta) {
    const u = (t - ts) / (ta - ts);
    const R = mix(8.5, 1.9 + jr, outQuad(u));
    const [x, z] = ringXY(R, th0);
    const grow = clamp((t - ts) / 0.12);
    return P({
      x, z, y: Math.abs(Math.sin(t * 13 + i)) * 0.08, yaw: th0 + PI,
      walk: t * 24 + i, amp: 1, jaw: 0.5, brow: 1, ear: 0.8, tail: t * 10, eye: 0.1,
      sy: grow, sx: grow, pitch: -0.05,
    });
  }
  // prowl in circle
  if (t < T.pounce) {
    const R = kf(t, [[ta, 1.9 + jr], [T.pounce - 0.1, 1.3 + jr * 0.5]]);
    const [x, z] = ringXY(R, th);
    return P({
      x, z, y: Math.abs(Math.sin(t * 5 + i)) * 0.02, yaw: th + PI / 2, headYaw: 1.0,
      walk: t * 7 + i, amp: 0.55, jaw: 0.35 + 0.35 * Math.max(0, Math.sin(t * 8 + i * 2)), brow: 1, ear: 0.9,
      tail: t * 9 + i, eye: 0.1, sx: 1, sy: 1 + 0.03 * Math.sin(t * 10 + i),
      shake: 0,
    });
  }
  // pounce
  if (t < 28.3) {
    const u = clamp((t - T.pounce) / 0.4);
    const R = mix(1.3 + jr * 0.5, 0.18, outQuad(u));
    const [x, z] = ringXY(R, th);
    const inside = t > T.dust + 0.2;
    return P({
      x: inside ? x + jit(t, 50, i) * 0.04 : x, z, y: Math.sin(u * PI) * 0.55, yaw: th + PI,
      pitch: mix(-0.5, 0.5, u), arm: 2.2, jaw: 1, brow: 1, walk: 0, amp: 0, tail: t * 14,
    });
  }
  // inside cloud -> horseshoe
  if (t < T.reveal) {
    const u = sm01((t - 28.3) / 1.4);
    const [hx, hz] = horseshoe(i);
    const [rx, rz] = ringXY(0.2, th);
    return P({x: mix(rx, hx, u), z: mix(rz, hz, u), yaw: 0, stand: 1, arm: 2.7, jaw: 1, y: Math.abs(Math.sin(t * 8 + i)) * 0.25 * u});
  }
  // celebrate / flee
  const [hx, hz] = horseshoe(i);
  if (t < 41.5) {
    const jump = Math.abs(Math.sin(t * 6.5 + i * 1.7));
    const phase = (t * 6.5 + i * 1.7) % PI;
    return P({
      x: hx, z: hz, y: jump * 0.3, yaw: (rnd(i, 5) - 0.5) * 0.6, stand: 1,
      arm: 2.7 + 0.35 * Math.sin(t * 9 + i), jaw: 0.6 + 0.4 * Math.sin(t * 12 + i),
      eye: 0, blink: 0.45, brow: -0.2, tail: t * 12 + i,
      sy: 1 + 0.08 * Math.cos(phase * 2) * (jump < 0.2 ? 1 : 0),
    });
  }
  const k = t - 41.5;
  const len = Math.hypot(hx, hz) || 1;
  const d = mix(0, 14, inQuad(clamp(k / 1.4)));
  if (k > 1.5) return null;
  return P({
    x: hx + (hx / len) * d, z: hz + (hz / len) * d, y: Math.abs(Math.sin(t * 16 + i)) * 0.06,
    yaw: Math.atan2(hx, hz), walk: t * 28 + i, amp: 1, eye: 1, jaw: 1, brow: -1, ear: 1, tail: t * 20,
  });
}
const sm01 = (x: number) => { const u = clamp(x); return u * u * (3 - 2 * u); };

/* ------------------------------------------------------------------ */
/* GIANT CAT (scene 5)                                                  */
/* ------------------------------------------------------------------ */
function giantPose(t: number): Pose | null {
  if (t < T.gRise - 0.2) return null;
  const rise = kf(t, [[T.gRise, -7], [T.gRise + 1.8, 0]]);
  const inhale = kf(t, [[T.inhale, 0], [T.sneeze - 0.1, 1], [T.sneeze, 0], [T.sneeze + 1, 0]]);
  const snap = t >= T.sneeze ? decay(t, T.sneeze, 2.2) : 0;
  return P({
    x: 0, y: rise, z: -8.6, yaw: 0,
    blink: t < T.gEyes ? 1 : t < T.inhale ? 0 : kf(t, [[T.inhale, 0], [T.sneeze - 0.3, 0.9], [T.sneeze + 1.4, 0.9], [T.sneeze + 1.8, 0.1]]),
    eye: 0.0, brow: t > T.scream ? 0.6 : 0, ear: 0,
    headPitch: -0.45 * inhale + 0.35 * snap + (t > T.gEyes && t < T.inhale ? 0.1 * Math.sin(t * 1.3) : 0),
    jaw: t >= T.sneeze && t < T.sneeze + 1.2 ? 1 : 0,
    sx: 1 + 0.07 * inhale, sy: 1 + 0.07 * inhale,
    tail: t * 1.5,
    lookX: 0, lookY: -0.4,
  });
}

/* ------------------------------------------------------------------ */
/* DEBRIS (costume pieces)                                              */
/* ------------------------------------------------------------------ */
interface Debris {kind: string; t0: number; p0: [number, number, number]; v: [number, number, number]; spin: [number, number, number]}
const DEBRIS: Debris[] = [
  {kind: 'mane', t0: T.pop1, p0: [-0.4, 1.0, 0], v: [-2.6, 5.2, 1.2], spin: [3, 5, 4]},
  {kind: 'cape', t0: T.pop2, p0: [0.5, 0.5, 0], v: [2.4, 5.8, 0.4], spin: [4, 2, 6]},
  {kind: 'mask', t0: T.pop3, p0: [0.5, 0.45, 0.2], v: [-1.0, 6.2, 2.0], spin: [6, 3, 2]},
  {kind: 'collar', t0: T.pop4, p0: [0.5, 0.4, 0.2], v: [1.8, 5.0, 2.4], spin: [2, 6, 7]},
  {kind: 'tuft', t0: T.pop5, p0: [-0.5, 0.5, -0.3], v: [-1.4, 5.5, -1.6], spin: [5, 5, 3]},
];
const debrisPos = (d: Debris, t: number): [number, number, number] | null => {
  if (t < d.t0) return null;
  const g = 9.8;
  const dt = t - d.t0;
  const tl = (d.v[1] + Math.sqrt(d.v[1] ** 2 + 2 * g * (d.p0[1] - 0.12))) / g;
  const te = Math.min(dt, tl);
  let y = d.p0[1] + d.v[1] * te - 0.5 * g * te * te;
  if (dt > tl) {
    const b = dt - tl;
    y = 0.12 + Math.abs(Math.sin(b * 9)) * 0.35 * Math.exp(-b * 4);
  }
  return [d.p0[0] + d.v[0] * te, Math.max(0.1, y), d.p0[2] + d.v[2] * te];
};
const DebrisMesh: React.FC<{d: Debris; t: number}> = ({d, t}) => {
  const p = debrisPos(d, t);
  if (!p) return null;
  const dt = t - d.t0;
  const grounded = p[1] < 0.2 && dt > 0.8;
  const rot: [number, number, number] = grounded ? [0, d.spin[1] * 0.3, 0] : [dt * d.spin[0], dt * d.spin[1], dt * d.spin[2]];
  const M = (c: string) => <meshStandardMaterial color={c} roughness={0.9} />;
  return (
    <group position={p} rotation={rot}>
      {d.kind === 'mane' && (
        <>
          <mesh scale={[0.34, 0.34, 0.2]}><sphereGeometry args={[1, 20, 14]} />{M('#8f4a14')}</mesh>
          {Array.from({length: 12}).map((_, i) => {
            const a = (i / 12) * PI * 2;
            return <mesh key={i} position={[Math.sin(a) * 0.3, Math.cos(a) * 0.3, 0]} scale={0.1}><sphereGeometry args={[1, 12, 10]} />{M(i % 2 ? '#a85a1a' : '#7a3c0e')}</mesh>;
          })}
        </>
      )}
      {d.kind === 'cape' && <mesh><boxGeometry args={[0.34, 0.012, 0.42]} />{M('#d92b2b')}</mesh>}
      {d.kind === 'mask' && <mesh><boxGeometry args={[0.28, 0.06, 0.07]} />{M('#d92b2b')}</mesh>}
      {d.kind === 'collar' && <mesh><torusGeometry args={[0.11, 0.026, 10, 24]} />{M('#1c1c1c')}</mesh>}
      {d.kind === 'tuft' && <mesh scale={0.09}><sphereGeometry args={[1, 14, 12]} />{M('#8f4a14')}</mesh>}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* DUST CLOUD                                                           */
/* ------------------------------------------------------------------ */
const Cloud: React.FC<{t: number}> = ({t}) => {
  if (t < T.dust - 0.1 || t > T.reveal + 0.9) return null;
  const grow = kf(t, [[T.dust - 0.1, 0], [T.dust + 0.45, 1], [T.reveal - 0.2, 1.08], [T.reveal + 0.9, 0.2]]);
  const op = kf(t, [[T.dust - 0.1, 0.0], [T.dust + 0.2, 0.96], [T.reveal - 0.3, 0.96], [T.reveal + 0.9, 0]]);
  return (
    <group position={[0, 0.5, 0]}>
      {Array.from({length: 22}).map((_, i) => {
        const a = rnd(i, 1) * PI * 2, r = 0.1 + rnd(i, 2) * 0.75, h = rnd(i, 3) * 0.9;
        const wob = 1 + 0.08 * Math.sin(t * 9 + i);
        const s = (0.4 + rnd(i, 4) * 0.35) * grow * wob;
        return (
          <mesh key={i} position={[Math.sin(a) * r, h - 0.1 + Math.sin(t * 4 + i) * 0.04, Math.cos(a) * r]} scale={s}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color={i % 3 ? '#f4efe8' : '#d9cdb8'} roughness={1} transparent opacity={op} depthWrite={false} />
          </mesh>
        );
      })}
      {t > T.dust && t < T.dust + 1.8 && Array.from({length: 6}).map((_, i) => {
        const a = (i / 6) * PI * 2 + t * 6;
        return <mesh key={'s' + i} position={[Math.sin(a) * 1.1, 1.2 + Math.sin(t * 8 + i) * 0.12, Math.cos(a) * 1.1]} rotation={[t * 4, t * 5, 0]} scale={0.09}><octahedronGeometry args={[1]} /><meshStandardMaterial color="#ffd400" emissive="#ffb000" emissiveIntensity={0.7} /></mesh>;
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* CONFETTI                                                             */
/* ------------------------------------------------------------------ */
const Confetti: React.FC<{t: number}> = ({t}) => {
  if (t < 30.6 || t > 41.8) return null;
  const cols = ['#ff4d6d', '#ffd23c', '#4dd2ff', '#7dff8a', '#c48cff'];
  return (
    <group>
      {Array.from({length: 70}).map((_, i) => {
        const x = (rnd(i, 1) - 0.5) * 5;
        const z = -2.5 + rnd(i, 2) * 4.5;
        const per = 3 + rnd(i, 3) * 2;
        const ph = ((t - 30.6) / per + rnd(i, 4)) % 1;
        const y = 4.2 - ph * 4.2;
        return (
          <mesh key={i} position={[x + Math.sin(t * 2 + i) * 0.2, y, z]} rotation={[t * 3 + i, t * 2 + i, 0]}>
            <boxGeometry args={[0.07, 0.01, 0.05]} />
            <meshStandardMaterial color={cols[i % 5]} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* CAMERA                                                               */
/* ------------------------------------------------------------------ */
type V3 = [number, number, number];
interface Cam {pos: V3; target: V3; fov: number; roll: number; shake: number}
const v = (a: number, b: number, c: number): V3 => [a, b, c];
const lerp3 = (t: number, ks: [number, V3][], e = kf) => [0, 1, 2].map((ax) => e(t, ks.map(([tt, vv]) => [tt, vv[ax]] as [number, number]))) as V3;

function camera(t: number): Cam {
  // scene 1
  if (t < 8) {
    const pos = lerp3(t, [[0, v(0.1, 0.8, 3.9)], [2.7, v(0.2, 0.6, 3.0)], [4.8, v(0.2, 0.45, 2.5)], [5.6, v(-0.2, 0.4, 2.4)], [T.jump, v(-0.2, 0.4, 2.4)], [T.hit - 0.05, v(0.5, 0.55, 2.7)], [T.hit, v(0.6, 0.45, 2.1)], [8, v(0.6, 0.45, 1.9)]]);
    const target = lerp3(t, [[0, v(0.1, 0.12, 0)], [2.7, v(0.1, 0.12, 0)], [5.6, v(-0.3, 0.15, 0)], [T.jump, v(-0.2, 0.2, 0)], [T.hit, v(0.6, 0.35, 0)], [8, v(0.9, 0.25, 0)]]);
    return {pos, target, fov: kf(t, [[0, 50], [5.6, 50], [T.hit, 58], [8, 52]]), roll: kf(t, [[T.hit - 0.05, 0], [T.hit + 0.1, 0.07], [8, 0.1]]), shake: 0.05 * decay(t, T.hit, 5) + 0.006 * (t > 5 ? 1 : 0) + (t > T.hit ? 0.012 : 0)};
  }
  if (t < 16) {
    const stepsW = ((t - T.stepStart) * 5.1) % PI;
    const step = t > T.stepStart && t < 11.0 ? Math.exp(-stepsW * 3.2) * (0.012 + 0.012 * clamp((t - 8.6) / 2.4)) : 0;
    const pos = lerp3(t, [[8, v(0.2, 0.62, 5.0)], [11, v(0.4, 0.5, 4.4)], [12, v(0.5, 0.5, 4.6)], [13.6, v(0.6, 0.5, 4.6)], [14.4, v(0.5, 0.7, 5.0)], [16, v(0.3, 0.8, 4.8)]]);
    const target = lerp3(t, [[8, v(0.2, 0.4, -1.5)], [11, v(0.0, 0.6, 0)], [11.8, v(-0.5, 0.95, 0)], [13.6, v(-0.55, 0.95, 0)], [14.4, v(0.2, 0.3, 0)], [16, v(0.2, 0.3, 0)]]);
    return {pos, target, fov: kf(t, [[8, 48], [11, 52], [12, 60], [13.6, 60], [14.4, 50]]), roll: kf(t, [[11.5, 0], [12.2, -0.06], [13.6, -0.06], [14.4, 0]]), shake: step + 0.03 * pulse(t, T.roar, 1.2) + 0.012 * decay(t, T.roar, 1) * 0};
  }
  if (t < 17.6) {
    return {pos: lerp3(t, [[16, v(-0.2, 0.8, 5.2)], [17.6, v(-0.1, 0.7, 4.4)]]), target: v(-0.45, 0.45, 0.3), fov: 48, roll: kf(t, [[16, 0], [17.4, -0.05]]), shake: 0.004};
  }
  if (t < 27.2) {
    const a = kf(t, [[17.6, 0.35], [27.2, 1.6]], lin);
    const R = kf(t, [[17.6, 10], [20.5, 7], [27.0, 4.4]]);
    const h = kf(t, [[17.6, 5.8], [21, 3.2], [27.0, 1.5]]);
    return {pos: v(Math.sin(a) * R, h, Math.cos(a) * R), target: v(0, 0.55, 0), fov: 46, roll: kf(t, [[17.6, 0], [23, 0.04], [27, 0.1]]), shake: 0.004 + 0.012 * clamp((t - 22) / 5)};
  }
  if (t < 29.9) {
    const a = kf(t, [[27.2, 1.6], [29.9, 2.0]], lin);
    const R = kf(t, [[27.2, 4.4], [27.7, 3.4], [28.6, 4.8], [29.9, 4.2]], outQuad);
    const h = kf(t, [[27.2, 1.5], [27.7, 1.1], [29.9, 1.5]]);
    return {pos: v(Math.sin(a) * R, h, Math.cos(a) * R), target: v(0, 0.6, 0), fov: kf(t, [[27.2, 46], [27.7, 62], [28.6, 50]]), roll: kf(t, [[27.2, 0.1], [27.7, 0.2], [29.9, 0]]), shake: 0.06 * (t < 28.4 ? 1 : 0.5) * (1 - clamp((t - 29.2) / 0.7))};
  }
  if (t < 40) {
    const pos = lerp3(t, [[29.9, v(0.2, 0.45, 4.0)], [34, v(0.1, 0.6, 3.3)], [38.5, v(0.0, 0.7, 2.7)], [40, v(0, 0.75, 2.6)]]);
    return {pos, target: v(0.05, 0.62, 0), fov: kf(t, [[29.9, 52], [38.5, 46], [40, 44]]), roll: kf(t, [[29.9, 0.04], [33, -0.03], [40, 0]]), shake: 0.004};
  }
  // scene 5
  const rumble = t > T.gRise && t < T.gRise + 2.2 ? 0.012 : 0;
  const pos = lerp3(t, [[40, v(0, 0.75, 2.6)], [T.gRise, v(0, 0.75, 2.6)], [43.4, v(0, 0.95, 3.6)], [T.scream, v(0, 1.0, 3.2)], [T.sneeze - 0.1, v(0, 1.05, 3.0)], [T.sneeze + 0.6, v(0, 1.0, 4.5)], [50, v(0, 1.0, 4.5)]]);
  const target = lerp3(t, [[40, v(0, 0.65, 0)], [T.gRise, v(0, 0.65, 0)], [43.4, v(0, 1.8, -2)], [T.scream, v(0, 1.8, -2)], [T.sneeze, v(0, 1.8, -2)], [50, v(0, 1.6, -2)]]);
  return {pos, target, fov: kf(t, [[40, 44], [T.gRise, 44], [43.4, 55], [T.sneeze, 50], [T.sneeze + 0.2, 70]]), roll: kf(t, [[44, 0], [T.sneeze, 0], [T.sneeze + 0.3, 0.12]]), shake: rumble + (t > T.scream ? 0.015 : 0) + 0.12 * decay(t, T.sneeze, 4)};
}

const Rig: React.FC<{c: Cam; t: number}> = ({c, t}) => {
  const {camera} = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const sx = jit(t, 61, 1) * c.shake, sy = jit(t, 47, 2) * c.shake, sz = jit(t, 53, 3) * c.shake * 0.5;
  cam.position.set(c.pos[0] + sx, c.pos[1] + sy, c.pos[2] + sz);
  cam.up.set(Math.sin(c.roll), Math.cos(c.roll), 0);
  cam.lookAt(c.target[0] + sx * 0.5, c.target[1] + sy * 0.5, c.target[2]);
  cam.fov = c.fov;
  cam.updateProjectionMatrix();
  return null;
};

/* ------------------------------------------------------------------ */
/* OVERLAYS                                                             */
/* ------------------------------------------------------------------ */
interface Word {text: string; t0: number; dur: number; x: number; y: number; rot: number; size: number; color: string; shake?: number}
const WORDS: Word[] = [
  {text: 'GRRR…', t0: T.hiss, dur: 1.6, x: 28, y: 22, rot: -8, size: 150, color: '#ff9f1c'},
  {text: 'HIIISS !', t0: T.jump - 0.15, dur: 0.9, x: 40, y: 18, rot: 6, size: 170, color: '#ff3d3d', shake: 8},
  {text: 'OUAF ?!', t0: T.hit + 0.05, dur: 1.3, x: 66, y: 20, rot: 7, size: 190, color: '#3dc6ff', shake: 10},
  {text: 'BOUM', t0: 9.2, dur: 0.5, x: 50, y: 20, rot: -4, size: 130, color: '#ffd23c', shake: 6},
  {text: 'ROOOAAAR !!', t0: T.roar + 0.1, dur: 1.7, x: 50, y: 17, rot: -5, size: 190, color: '#ff4d1f', shake: 14},
  {text: 'MIAAAOU !', t0: T.catFlee + 0.15, dur: 1.2, x: 38, y: 30, rot: -10, size: 140, color: '#ffffff', shake: 8},
  {text: 'ATTAQUEZ !', t0: T.evil + 0.1, dur: 1.5, x: 50, y: 20, rot: 4, size: 170, color: '#ff3d6e', shake: 8},
  {text: 'MIAOU MIAOU MIAOU', t0: 19.4, dur: 1.3, x: 50, y: 16, rot: -3, size: 100, color: '#ffffff', shake: 5},
  {text: 'GLOUPS…', t0: 22.6, dur: 1.6, x: 50, y: 20, rot: 3, size: 160, color: '#7fd0ff', shake: 4},
  {text: 'BAM !!', t0: T.dust - 0.1, dur: 1.0, x: 50, y: 18, rot: -7, size: 260, color: '#ffe14d', shake: 16},
  {text: 'POP !', t0: T.pop1, dur: 0.5, x: 28, y: 26, rot: -9, size: 150, color: '#ffffff', shake: 6},
  {text: 'POP !', t0: T.pop2, dur: 0.5, x: 72, y: 24, rot: 8, size: 150, color: '#ffffff', shake: 6},
  {text: 'POP !', t0: T.pop3, dur: 0.5, x: 36, y: 30, rot: -5, size: 150, color: '#ffffff', shake: 6},
  {text: 'VICTOIRE !', t0: 30.7, dur: 2.2, x: 50, y: 14, rot: -4, size: 190, color: '#ffd23c', shake: 5},
  {text: 'OUPS…', t0: 34.0, dur: 2.2, x: 50, y: 18, rot: 3, size: 190, color: '#ff8fb3', shake: 4},
  {text: '?!', t0: T.look, dur: 1.6, x: 50, y: 18, rot: 0, size: 300, color: '#ffe14d', shake: 8},
  {text: 'AAAAAH !!', t0: T.scream, dur: 1.9, x: 50, y: 16, rot: -3, size: 200, color: '#ff3d3d', shake: 14},
  {text: 'ATCHOUUUM !!', t0: T.sneeze + 0.05, dur: 1.5, x: 50, y: 22, rot: -6, size: 200, color: '#ffffff', shake: 18},
];

const ComicWord: React.FC<{w: Word; t: number}> = ({w, t}) => {
  const k = t - w.t0;
  if (k < 0 || k > w.dur) return null;
  const pop = kf(k, [[0, 0], [0.08, 1.3], [0.18, 0.92], [0.28, 1.0]], lin);
  const out = kf(k, [[w.dur - 0.2, 1], [w.dur, 0]], lin);
  const s = Math.min(pop, 1.4) * out;
  const sh = (w.shake ?? 0);
  return (
    <div style={{
      position: 'absolute', left: `${w.x}%`, top: `${w.y}%`,
      transform: `translate(-50%,-50%) translate(${jit(t, 33, 4) * sh}px, ${jit(t, 29, 5) * sh}px) rotate(${w.rot + jit(t, 25, 6) * sh * 0.2}deg) scale(${s})`,
      fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: w.size, lineHeight: 1, whiteSpace: 'nowrap',
      color: w.color, WebkitTextStroke: `${w.size * 0.07}px #1b1033`, paintOrder: 'stroke fill',
      textShadow: `0 ${w.size * 0.06}px 0 #1b1033, 0 ${w.size * 0.12}px ${w.size * 0.12}px rgba(0,0,0,.35)`, letterSpacing: -2,
    } as React.CSSProperties}>
      {w.text}
    </div>
  );
};

const SpeedLines: React.FC<{t: number; t0: number; dur: number}> = ({t, t0, dur}) => {
  const k = t - t0;
  if (k < 0 || k > dur) return null;
  const a = 1 - k / dur;
  return (
    <svg width="1080" height="1920" viewBox="-540 -960 1080 1920" style={{position: 'absolute', inset: 0, opacity: a * 0.8}}>
      {Array.from({length: 54}).map((_, i) => {
        const ang = (i / 54) * PI * 2 + rnd(i) * 0.1;
        const r0 = 520 + rnd(i, 1) * 260 + k * 400, r1 = r0 + 500 + rnd(i, 2) * 400;
        return <line key={i} x1={Math.cos(ang) * r0 * 0.75} y1={Math.sin(ang) * r0 * 1.3} x2={Math.cos(ang) * r1 * 0.75} y2={Math.sin(ang) * r1 * 1.3} stroke="#fff" strokeWidth={4 + rnd(i, 3) * 8} strokeLinecap="round" />;
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* FILM                                                                 */
/* ------------------------------------------------------------------ */
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const t = frame / fps;

  const dog = dogPose(t);
  const lion = lionPose(t);
  const leader = leaderPose(t, dog);
  const giant = giantPose(t);
  const cam = camera(t);
  const dim = t < 41.6 ? 1 : kf(t, [[41.6, 1], [43.6, 0.5], [T.sneeze + 0.5, 0.55], [T.sneeze + 1.5, 0.9]]);

  // shake as offsets
  const withShake = (p: Pose, seed: number): Pose => p.shake > 0 ? {...p, x: p.x + jit(t, 55, seed) * 0.012 * p.shake, y: p.y + Math.abs(jit(t, 47, seed + 1)) * 0.012 * p.shake} : p;

  // scene 5 blast for dog & lion
  const blast = (p: Pose, side: number): Pose => {
    if (t < T.sneeze) return p;
    const k = t - T.sneeze;
    return {...p, x: p.x + side * k * 1.6, y: p.y + k * 3.2 - 0.5 * k * k * 2, z: p.z + k * k * 11 + k * 6, roll: k * 7, pitch: k * 5, stand: 1, shake: 0, sx: 1, sy: 1};
  };

  const dogP = withShake(blast(dog, 1), 3);
  const lionP = lion ? withShake(blast(lion, -1), 7) : null;

  // flash / fade
  const flash = Math.max(
    kf(t, [[7.85, 0], [7.95, 1], [8.15, 0]], lin),
    kf(t, [[15.88, 0], [15.98, 1], [16.2, 0]], lin),
    kf(t, [[17.5, 0], [17.58, 1], [17.8, 0]], lin),
    kf(t, [[T.pounce + 0.28, 0], [T.pounce + 0.33, 0.9], [T.pounce + 0.5, 0]], lin),
    kf(t, [[T.reveal + 0.6, 0], [T.reveal + 0.7, 0.0]], lin),
    kf(t, [[39.88, 0], [39.96, 1], [40.2, 0]], lin),
    kf(t, [[T.sneeze + 0.2, 0], [T.sneeze + 0.5, 1], [T.sneeze + 1.0, 1], [T.sneeze + 1.7, 0.0]], lin) * (t < T.sneeze + 1.7 ? 1 : 0),
  );
  const black = Math.max(
    kf(t, [[0, 1], [0.4, 0]], lin),
    kf(t, [[T.sneeze + 1.7, 0], [T.sneeze + 2.0, 1]], lin),
  );
  const finK = t - T.fin;

  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #86c9ff 0%, #b7e0ff 45%, #e6f4ff 62%)', fontFamily: 'Inter, sans-serif'}}>
      <Audio src={staticFile('audio.wav')} />
      <ThreeCanvas width={width} height={height} camera={{position: [0, 1, 5], fov: 50, near: 0.1, far: 120}} gl={{alpha: true, antialias: true}}>
        <Rig c={cam} t={t} />
        <World dim={dim} />

        {leader && <Animal species="cat" look={LOOKS.tabby} pose={withShake(leader, 11)} size={0.88} />}
        <Animal species="dog" look={LOOKS.dog} pose={dogP} size={1} />
        {lionP && <Animal species="lion" look={LOOKS.lion} pose={lionP} size={lionSize(t)} />}

        {t >= 17.6 && Array.from({length: NCATS}).map((_, i) => {
          const p = armyPose(i, t);
          return p ? <Animal key={i} species="cat" look={LOOKS[catLook(i)]} pose={p} size={catSize(i)} /> : null;
        })}

        {giant && <Animal species="cat" look={LOOKS.tabby} pose={giant} size={8} shadow={false} />}

        <Cloud t={t} />
        {DEBRIS.map((d, i) => <DebrisMesh key={i} d={d} t={t} />)}
        <Confetti t={t} />
      </ThreeCanvas>

      {/* vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(10,6,30,0.45) 100%)', pointerEvents: 'none'}} />
      {t > 41.6 && t < T.sneeze + 1.5 && <AbsoluteFill style={{background: `rgba(20,10,60,${0.25 * clamp((t - 41.6) / 2)})`}} />}

      <SpeedLines t={t} t0={T.hit} dur={0.5} />
      <SpeedLines t={t} t0={T.roar} dur={0.7} />
      <SpeedLines t={t} t0={T.pounce + 0.2} dur={0.5} />
      <SpeedLines t={t} t0={T.sneeze} dur={0.9} />

      {WORDS.map((w, i) => <ComicWord key={i} w={w} t={t} />)}

      <AbsoluteFill style={{background: '#0d0820', opacity: black, pointerEvents: 'none'}} />
      {/* end card */}
      {finK > 0 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30}}>
          <div style={{fontWeight: 900, fontSize: 260, color: '#ffe14d', WebkitTextStroke: '16px #1b1033', paintOrder: 'stroke fill', transform: `scale(${kf(finK, [[0, 0], [0.25, 1.2], [0.4, 1]], lin)}) rotate(-4deg)`}}>FIN</div>
          <div style={{fontWeight: 800, fontSize: 64, color: '#fff', opacity: kf(finK, [[0.5, 0], [0.9, 1]], lin), textAlign: 'center', padding: '0 80px'}}>Le chat a toujours le dernier mot.</div>
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
