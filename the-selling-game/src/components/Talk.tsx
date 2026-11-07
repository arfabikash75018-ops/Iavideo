import {visemeAt, Viseme} from './LipSync';
import type {Placed, Expr} from '../data/types';
import {FPS} from '../theme';

export interface TalkState {jl?: Placed; cl?: Placed; jv: {v: Viseme; open: number}; cv: {v: Viseme; open: number}; jExpr: Expr; cExpr: Expr}
export function talk(lines: Placed[], frame: number): TalkState {
  const jl = lines.find((l) => l.speaker === 'jordan' && frame >= l.startF && frame <= l.endF);
  const cl = lines.find((l) => l.speaker === 'client' && frame >= l.startF && frame <= l.endF);
  const lastBy = (s: string) => [...lines].reverse().find((l) => l.speaker === s && frame >= l.startF);
  return {
    jl, cl,
    jv: jl ? visemeAt(jl, frame) : {v: 'rest', open: 0},
    cv: cl ? visemeAt(cl, frame) : {v: 'rest', open: 0},
    jExpr: jl?.expr ?? (cl ? 'skeptical' : lastBy('jordan')?.expr ?? 'smirk'),
    cExpr: cl?.expr ?? (jl ? 'neutral' : lastBy('client')?.expr ?? 'neutral'),
  };
}
/** Image où un mot (regex) est prononcé dans une réplique (minutage estimé). */
export function wordF(line: Placed, re: RegExp): number {
  const w = line.meta.words.find((x) => re.test(x.w));
  return line.startF + Math.round((w ? w.start : 0) * FPS);
}
