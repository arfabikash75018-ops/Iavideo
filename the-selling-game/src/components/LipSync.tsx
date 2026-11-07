import React from 'react';
import {C, FPS} from '../theme';
import type {Placed} from '../data/types';

export type Viseme = 'rest' | 'A' | 'E' | 'I' | 'O' | 'U' | 'MBP' | 'FV';

const map = (ch: string): Viseme | null => {
  if ('aàâä'.includes(ch)) return 'A';
  if ('eéèêë'.includes(ch)) return 'E';
  if ('iîïy'.includes(ch)) return 'I';
  if ('oôö'.includes(ch)) return 'O';
  if ('uùûü'.includes(ch)) return 'U';
  if ('mbp'.includes(ch)) return 'MBP';
  if ('fv'.includes(ch)) return 'FV';
  return null; // consonne neutre
};

/**
 * Visème APPROXIMATIF : lettres du mot en cours (minutage estimé) + énergie audio réelle.
 * Ce n'est pas une synchronisation phonétique : voir README.
 */
export function visemeAt(line: Placed, frame: number): {v: Viseme; open: number} {
  const lf = frame - line.startF;
  if (lf < 0 || lf > line.endF - line.startF) return {v: 'rest', open: 0};
  const open = line.meta.env[Math.min(lf, line.meta.env.length - 1)] ?? 0;
  if (open < 0.12) return {v: 'rest', open: 0};
  const t = lf / FPS;
  const w = line.meta.words.find((x) => t >= x.start && t < x.end + 0.03);
  if (!w) return {v: open > 0.5 ? 'E' : 'rest', open};
  const letters = w.w.toLowerCase().replace(/[^a-zàâäéèêëîïôöùûüç]/g, '').replace(/ou/g, 'u').split('');
  if (!letters.length) return {v: 'E', open};
  const idx = Math.min(letters.length - 1, Math.floor(((t - w.start) / Math.max(0.01, w.end - w.start)) * letters.length));
  const v = map(letters[idx]);
  return {v: v ?? (open > 0.45 ? 'E' : 'I'), open};
}

export const Mouth: React.FC<{v: Viseme; open: number; smile: number; tilt?: number}> = ({v, open, smile, tilt = 0}) => {
  const k = 0.55 + open * 0.6;
  const ink = C.navy;
  const shape = (() => {
    switch (v) {
      case 'A': return <><ellipse cx={0} cy={4} rx={24} ry={18 * k} fill={ink} /><ellipse cx={0} cy={4 + 11 * k} rx={14} ry={6 * k} fill={C.orange} /></>;
      case 'E': return <><rect x={-28} y={-6} width={56} height={14 * k + 4} rx={9} fill={ink} /><rect x={-24} y={-5} width={48} height={7} rx={3} fill={C.cream} /></>;
      case 'I': return <><rect x={-27} y={-3} width={54} height={8 * k + 2} rx={5} fill={ink} /><rect x={-23} y={-2} width={46} height={5} rx={2} fill={C.cream} /></>;
      case 'O': return <ellipse cx={0} cy={5} rx={13} ry={15 * k} fill={ink} />;
      case 'U': return <ellipse cx={0} cy={3} rx={9} ry={9 * k + 2} fill={ink} />;
      case 'MBP': return <path d="M -24 2 Q 0 6 24 2" stroke={ink} strokeWidth={9} strokeLinecap="round" fill="none" />;
      case 'FV': return <><path d="M -22 -2 Q 0 3 22 -2 L 20 8 Q 0 12 -20 8 Z" fill={ink} /><rect x={-17} y={-2} width={34} height={8} rx={3} fill={C.cream} /><path d="M -18 8 Q 0 15 18 8" stroke={C.orange2} strokeWidth={6} strokeLinecap="round" fill="none" /></>;
      default: {
        const s = smile * 18;
        return <path d={`M -28 ${2 - s * 0.2} Q 0 ${2 + s} 28 ${2 - s * 0.2 - tilt}`} stroke={ink} strokeWidth={8} strokeLinecap="round" fill="none" />;
      }
    }
  })();
  return <g>{shape}</g>;
};
