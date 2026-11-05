export const sm = (x: number) => x * x * (3 - 2 * x);
export const lin = (x: number) => x;
export const outBack = (x: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const inQuad = (x: number) => x * x;
export const outQuad = (x: number) => 1 - (1 - x) * (1 - x);
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

/** Keyframes (seconds). Segments are eased; equal times create a jump. */
export function kf(t: number, k: [number, number][], ease: (x: number) => number = sm): number {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) {
      const [t0, v0] = k[i - 1];
      const [t1, v1] = k[i];
      const u = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * ease(u);
    }
  }
  return k[k.length - 1][1];
}

/** deterministic pseudo random in [0,1) */
export const rnd = (i: number, s = 0) => {
  const x = Math.sin(i * 127.1 + s * 311.7 + 17.13) * 43758.5453;
  return x - Math.floor(x);
};
export const mix = (a: number, b: number, u: number) => a + (b - a) * u;
export const pulse = (t: number, t0: number, dur: number) => (t < t0 || t > t0 + dur ? 0 : Math.sin(((t - t0) / dur) * Math.PI));
export const decay = (t: number, t0: number, k = 6) => (t < t0 ? 0 : Math.exp(-(t - t0) * k));
export const jit = (t: number, f = 40, s = 0) => Math.sin(t * f + s) * 0.6 + Math.sin(t * f * 1.73 + s * 2.1) * 0.4;
