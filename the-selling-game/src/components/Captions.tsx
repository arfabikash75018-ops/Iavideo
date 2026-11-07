import React from 'react';
import {spring, useVideoConfig} from 'remotion';
import {C, FPS} from '../theme';
import type {Placed} from '../data/types';

/** Sous-titres TikTok : groupes de 3 mots max, mot courant en orange (minutage estimé). */
export const Captions: React.FC<{lines: Placed[]; frame: number; top?: number}> = ({lines, frame, top = 1490}) => {
  const {fps} = useVideoConfig();
  const line = lines.find((l) => frame >= l.startF && frame <= l.endF + 6);
  if (!line) return null;
  const t = (frame - line.startF) / FPS;
  const ws = line.meta.words;
  const chunks: number[][] = [];
  let cur: number[] = [];
  ws.forEach((w, i) => { cur.push(i); const chars = cur.reduce((n, k) => n + ws[k].w.length, 0); const nxt = ws[i + 1]?.w.length ?? 0; if (cur.length >= 3 || chars + nxt > 17 || /[.!?…,]$/.test(w.w)) { chunks.push(cur); cur = []; } });
  if (cur.length) chunks.push(cur);
  let ci = chunks.findIndex((c) => t < ws[c[c.length - 1]].end + 0.05);
  if (ci < 0) ci = chunks.length - 1;
  const chunk = chunks[ci];
  const chunkStartF = line.startF + ws[chunk[0]].start * FPS;
  const appear = spring({frame: frame - chunkStartF, fps, config: {damping: 14, stiffness: 220}, durationInFrames: 10});
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 30px', transform: `scale(${0.85 + 0.15 * appear})`, opacity: Math.min(1, appear * 1.5)}}>
      {chunk.map((i) => {
        const active = t >= ws[i].start && t < ws[i].end + 0.04;
        return (
          <span key={i} style={{fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 104, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: -2,
            color: active ? C.orange : C.cream, WebkitTextStroke: `12px ${C.navy}`, paintOrder: 'stroke fill',
            display: 'inline-block', transform: active ? 'scale(1.12) rotate(-2deg)' : 'none'} as React.CSSProperties}>{ws[i].w}</span>
        );
      })}
    </div>
  );
};
