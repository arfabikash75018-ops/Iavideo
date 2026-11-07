import React from 'react';
import {spring, useVideoConfig} from 'remotion';
import {C} from '../theme';
import {Jordan} from '../characters/Jordan';
import {Phone, Watch, Laptop, Lock, Bubble, Heart, Sparkle, Clock, Group} from '../components/Icons';
import {TalkState, wordF} from '../components/Talk';
import type {Placed} from '../data/types';
import {W, H} from './Shop';

const pop = (frame: number, f0: number, fps: number) => (frame < f0 ? 0 : spring({frame: frame - f0, fps, config: {damping: 11, stiffness: 170}, durationInFrames: 16}));

const Chrome: React.FC<{frame: number; t: TalkState; title: string; bg?: string}> = ({frame, t, title, bg = C.mint}) => (
  <>
    <rect width={W} height={H} fill={C.cream} />
    <circle cx={900} cy={380} r={380} fill={bg} opacity={0.65} /><circle cx={140} cy={760} r={260} fill={bg} opacity={0.5} />
    <g transform="translate(540 205)"><rect x={-370} y={-46} width={740} height={92} rx={46} fill={C.navy} /><text textAnchor="middle" y={17} fontFamily="Inter, sans-serif" fontWeight={900} fontSize={42} fill={C.cream} letterSpacing={2}>{title}</text></g>
    <rect x={0} y={1480} width={W} height={440} fill={C.navy} />
    <g transform="translate(540 1500) scale(0.72)"><Jordan frame={frame} viseme={t.jv.v} open={t.jv.open} expr={t.jExpr} speaking={!!t.jl} lookX={0} /></g>
    <rect x={0} y={1470} width={W} height={20} fill={C.orange} />
  </>
);

/* ----------------------------- ÉCOSYSTÈME ----------------------------- */
export const Ecosystem: React.FC<{frame: number; line: Placed; t: TalkState}> = ({frame, line, t}) => {
  const {fps} = useVideoConfig();
  const P = {x: 250, y: 520}, L = {x: 810, y: 450}, Wt = {x: 560, y: 760};
  const trig = {photos: wordF(line, /photos/i), messages: wordF(line, /messages/i), appareils: wordF(line, /appareils/i), connecte: wordF(line, /connecte/i), changer: wordF(line, /changer/i), efforts: wordF(line, /efforts/i)};
  const edge = (a: {x: number; y: number}, b: {x: number; y: number}, f0: number, key: string) => {
    const k = Math.max(0, Math.min(1, (frame - f0) / 12));
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const on = frame >= f0;
    return (
      <g key={key}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.navy} strokeOpacity={0.22} strokeWidth={8} strokeDasharray="4 16" strokeLinecap="round" />
        {on && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.orange} strokeWidth={14} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - k)} />}
        {on && k >= 1 && [0, 0.5].map((o) => { const p = ((frame - f0) / 34 + o) % 1; return <circle key={o} cx={a.x + (b.x - a.x) * p} cy={a.y + (b.y - a.y) * p} r={11} fill={C.cream} stroke={C.navy} strokeWidth={5} />; })}
      </g>
    );
  };
  const lit = (f: number) => frame >= f + 8;
  const ring = (frame - trig.connecte) / 30;
  const cx = (P.x + L.x + Wt.x) / 3, cy = (P.y + L.y + Wt.y) / 3;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <Chrome frame={frame} t={t} title="MÉCANISME 1 · L'ÉCOSYSTÈME" />
      {edge(P, L, trig.photos, 'pl')}{edge(L, Wt, trig.messages, 'lw')}{edge(Wt, P, trig.appareils, 'wp')}
      {frame >= trig.connecte && ring < 1.6 && [0, 0.4].map((o) => { const r = ((ring - o) % 1.6); return r > 0 ? <circle key={o} cx={cx} cy={cy} r={r * 360} fill="none" stroke={C.orange} strokeWidth={10 * (1 - r / 1.6)} opacity={1 - r / 1.6} /> : null; })}
      <g transform={`translate(${P.x} ${P.y}) scale(${1.15 * (0.5 + 0.5 * pop(frame, trig.photos - 20, fps)) + (lit(trig.photos) ? 0.04 * Math.sin(frame / 4) : 0)})`}><Phone lit={lit(trig.photos)} /></g>
      <g transform={`translate(${L.x} ${L.y}) scale(${1.0 * (0.5 + 0.5 * pop(frame, trig.photos - 10, fps))})`}><Laptop lit={lit(trig.messages)} /></g>
      <g transform={`translate(${Wt.x} ${Wt.y}) scale(${1.15 * (0.5 + 0.5 * pop(frame, trig.messages - 10, fps))})`}><Watch lit={lit(trig.appareils)} /></g>
      {/* petites bulles qui voyagent : photo puis message */}
      {frame >= trig.photos + 12 && frame < trig.photos + 60 && (() => { const p = (frame - trig.photos - 12) / 40; return <g transform={`translate(${P.x + (L.x - P.x) * Math.min(1, p)} ${P.y + (L.y - P.y) * Math.min(1, p) - 70})`}><rect x={-26} y={-22} width={52} height={44} rx={8} fill={C.cream} stroke={C.navy} strokeWidth={5} /><circle cx={-7} cy={-6} r={7} fill={C.orange} /><path d="M -22 18 L -6 4 L 4 14 L 12 6 L 22 18 Z" fill={C.mint2} /></g>; })()}
      {frame >= trig.messages + 12 && frame < trig.messages + 60 && (() => { const p = (frame - trig.messages - 12) / 40; return <g transform={`translate(${L.x + (Wt.x - L.x) * Math.min(1, p) + 60} ${L.y + (Wt.y - L.y) * Math.min(1, p)})`}><g transform="scale(0.45)"><Bubble w={110} h={80} /></g></g>; })()}
      {/* coût de changement */}
      {frame >= trig.changer && <g transform={`translate(${cx} ${cy + 10}) scale(${pop(frame, trig.changer, fps) * 1.25})`}><Lock /></g>}
      {frame >= trig.efforts - 4 && <g transform={`translate(540 935) scale(${pop(frame, trig.efforts - 4, fps)})`}><rect x={-330} y={-44} width={660} height={88} rx={44} fill={C.orange} stroke={C.navy} strokeWidth={7} /><text textAnchor="middle" y={15} fontFamily="Inter, sans-serif" fontWeight={900} fontSize={42} fill={C.navy}>COÛT DE CHANGEMENT</text></g>}
    </svg>
  );
};

/* ------------------------------ IDENTITÉ ------------------------------ */
const Avatar: React.FC<{skin: string; hair: string; top: string; curly?: boolean}> = ({skin, hair, top, curly}) => (
  <g>
    <path d="M -70 110 Q -70 40 0 40 Q 70 40 70 110 Z" fill={top} />
    <circle cx={0} cy={-6} r={52} fill={skin} />
    {curly ? [-32, -10, 12, 32].map((x, i) => <circle key={i} cx={x} cy={-48 + (i % 2) * 6} r={22} fill={hair} />) : <path d="M -54 -10 Q -54 -64 0 -64 Q 54 -64 54 -10 Q 30 -40 -54 -10 Z" fill={hair} />}
    <circle cx={-18} cy={-4} r={6} fill={C.navy} /><circle cx={18} cy={-4} r={6} fill={C.navy} />
    <path d="M -16 20 Q 0 32 16 20" stroke={C.navy} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);
export const Identity: React.FC<{frame: number; line: Placed; t: TalkState}> = ({frame, line, t}) => {
  const {fps} = useVideoConfig();
  const tr = {certains: wordF(line, /certains/i), outil: wordF(line, /outil/i), marque: wordF(line, /marque/i), ident: wordF(line, /identifient/i)};
  const O = {x: 540, y: 560};
  const people = [
    {x: 190, y: 400, f: tr.certains - 6, skin: C.skinC, hair: '#2B1B14', top: C.orange, label: 'DESIGN', icon: <Sparkle />, curly: true},
    {x: 890, y: 380, f: tr.certains + 4, skin: C.skinJ, hair: C.navy, top: C.navy, label: 'HABITUDES', icon: <Clock />},
    {x: 190, y: 730, f: tr.certains + 14, skin: '#E4A98B', hair: '#8A4B2A', top: C.mint2, label: 'COMMUNAUTÉ', icon: <Group />, curly: true},
    {x: 890, y: 720, f: tr.certains + 24, skin: '#A66B47', hair: '#1B1B1B', top: C.orange2, label: 'STYLE DE VIE', icon: <Heart />},
  ];
  const lit = frame >= tr.ident - 4;
  const ring = (frame - tr.ident) / 26;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <Chrome frame={frame} t={t} title="MÉCANISME 2 · L'IDENTITÉ" bg={C.mint2} />
      {people.map((p, i) => {
        const dx = O.x - p.x, dy = O.y - p.y, len = Math.hypot(dx, dy);
        return (
          <g key={'l' + i}>
            <line x1={p.x} y1={p.y} x2={O.x} y2={O.y} stroke={lit ? C.orange : C.navy} strokeOpacity={lit ? 1 : 0.2} strokeWidth={lit ? 12 : 7} strokeDasharray={lit ? undefined : '4 16'} strokeLinecap="round" />
            {lit && [0, 0.5].map((o) => { const q = (((frame - tr.ident) / 26) + o) % 1; return <circle key={o} cx={p.x + dx * q} cy={p.y + dy * q} r={10} fill={C.cream} stroke={C.navy} strokeWidth={5} />; })}
          </g>
        );
      })}
      {/* la marque (forme abstraite, sans logo) */}
      <g transform={`translate(${O.x} ${O.y}) scale(${(0.6 + 0.4 * pop(frame, tr.marque - 8, fps)) * (1 + (lit ? 0.04 * Math.sin(frame / 3) : 0))})`}>
        <circle r={130} fill={C.orange} stroke={C.navy} strokeWidth={9} />
        <path d="M 0 -62 L 17 -20 L 62 -18 L 27 10 L 39 54 L 0 29 L -39 54 L -27 10 L -62 -18 L -17 -20 Z" fill={C.cream} stroke={C.navy} strokeWidth={6} strokeLinejoin="round" />
        <text y={176} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={34} fill={C.navy} letterSpacing={3}>LA MARQUE</text>
      </g>
      {lit && ring < 1.5 && [0, 0.45].map((o) => { const r = ring - o; return r > 0 ? <circle key={o} cx={O.x} cy={O.y} r={130 + r * 300} fill="none" stroke={C.orange} strokeWidth={10 * (1 - r / 1.5)} opacity={1 - r / 1.5} /> : null; })}
      {people.map((p, i) => {
        const s = pop(frame, p.f, fps);
        return (
          <g key={i} transform={`translate(${p.x} ${p.y + Math.sin(frame / 18 + i) * 6}) scale(${s})`}>
            <g transform="scale(1.15)"><Avatar skin={p.skin} hair={p.hair} top={p.top} curly={p.curly} /></g>
            <g transform={`translate(${p.x < 540 ? 100 : -100} -110) scale(0.9)`}><Bubble w={130} h={100} /><g transform="translate(0 -4)">{p.icon}</g></g>
            <g transform="translate(0 140)"><rect x={-105} y={-25} width={210} height={50} rx={25} fill={C.navy} /><text y={11} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={26} fill={C.cream} letterSpacing={1}>{p.label}</text></g>
          </g>
        );
      })}
      {frame >= tr.outil && frame < tr.marque && <g transform={`translate(540 955) scale(${pop(frame, tr.outil, fps)})`}><rect x={-270} y={-44} width={540} height={88} rx={44} fill={C.cream} stroke={C.navy} strokeWidth={7} /><text textAnchor="middle" y={15} fontFamily="Inter, sans-serif" fontWeight={900} fontSize={40} fill={C.navy}>PAS JUSTE UN OUTIL</text></g>}
      {frame >= tr.ident - 2 && <g transform={`translate(540 955) scale(${pop(frame, tr.ident - 2, fps)})`}><rect x={-300} y={-44} width={600} height={88} rx={44} fill={C.orange} stroke={C.navy} strokeWidth={7} /><text textAnchor="middle" y={15} fontFamily="Inter, sans-serif" fontWeight={900} fontSize={40} fill={C.navy}>ILS S'Y IDENTIFIENT</text></g>}
    </svg>
  );
};
