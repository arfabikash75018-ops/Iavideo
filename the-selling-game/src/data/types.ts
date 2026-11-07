import lines from './lines.json';
import meta from './audioMeta.json';
import {FPS} from '../theme';

export type Expr = 'neutral' | 'smirk' | 'happy' | 'skeptical' | 'surprised';
export type Speaker = 'jordan' | 'client';
export interface Line {id: string; speaker: Speaker; expr: Expr; text: string}
export interface WordT {w: string; start: number; end: number}
export interface Meta {file: string; duration: number; speechStart: number; speechEnd: number; words: WordT[]; env: number[]}
export interface Placed extends Line {startF: number; endF: number; meta: Meta}

/** Place les répliques bout à bout selon les durées réelles des audios. */
export function layout(episode: keyof typeof lines, gapSec = 0.22, leadSec = 0.5): {placed: Placed[]; total: number} {
  let t = Math.round(leadSec * FPS);
  const placed: Placed[] = [];
  for (const l of (lines as Record<string, Line[]>)[episode]) {
    const m = (meta as Record<string, Meta>)[l.id];
    if (!m) throw new Error(`Audio manquant pour ${l.id} (lancer npm run audio:analyze)`);
    const len = Math.ceil(m.duration * FPS);
    placed.push({...l, startF: t, endF: t + len, meta: m});
    t += len + Math.round(gapSec * FPS);
  }
  return {placed, total: t + Math.round(0.8 * FPS)};
}
