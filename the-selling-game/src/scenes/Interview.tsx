import React from 'react';
import {AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FPS} from '../theme';
import {Jordan} from '../characters/Jordan';
import {Customer} from '../characters/Customer';
import {Captions} from '../components/Captions';
import {visemeAt} from '../components/LipSync';
import type {Placed} from '../data/types';

const W = 1080, H = 1920;
const WORLD_J = 470, WORLD_C = 1440;          // positions des personnages dans le plan large
const WAIST_Y = 1400, CHAR_SCALE = 1.45;

/** Décor : étagère, fenêtre, lampes. Rendu en parallaxe (0.6x la caméra). */
export const Backdrop: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <rect x={-400} y={-100} width={3000} height={2100} fill={C.cream} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-300 + i * 640} y={180} width={500} height={900} rx={40} fill={C.mint} />)}
    {[0, 1, 2, 3].map((i) => <rect key={'w' + i} x={-270 + i * 640} y={210} width={440} height={840} rx={26} fill={C.mint2} opacity={0.55} />)}
    {[0, 1, 2].map((r) => (
      <g key={r} transform={`translate(0 ${520 + r * 250})`}>
        <rect x={-300} y={150} width={2800} height={22} rx={8} fill={C.navy} opacity={0.9} />
        {Array.from({length: 11}).map((_, i) => {
          const x = -240 + i * 260 + (r % 2) * 70;
          const k = (i + r) % 3;
          return k === 0 ? <rect key={i} x={x} y={40} width={90} height={110} rx={16} fill={C.orange} />
            : k === 1 ? <rect key={i} x={x} y={65} width={60} height={85} rx={14} fill={C.navy} />
            : <circle key={i} cx={x + 45} cy={105} r={45} fill={C.cream2} stroke={C.navy} strokeWidth={6} />;
        })}
      </g>
    ))}
    {[400, 1100, 1800].map((x, i) => (
      <g key={i} transform={`translate(${x} 250) rotate(${Math.sin(frame / 40 + i) * 1.2} 0 0)`}>
        <line x1={0} y1={-100} x2={0} y2={120} stroke={C.navy} strokeWidth={5} />
        <path d="M -60 200 Q 0 90 60 200 Z" fill={C.orange} />
      </g>
    ))}
  </g>
);

/** Appareils génériques (sans logo) posés sur le comptoir, côté client. */
export const Devices: React.FC = () => (
  <g transform="translate(1160 1300)">
    <rect x={0} y={20} width={230} height={140} rx={14} fill={C.navy2} /><rect x={-30} y={150} width={290} height={16} rx={8} fill={C.navy} />
    <rect x={20} y={36} width={190} height={104} rx={6} fill={C.mint} />
    <rect x={300} y={30} width={74} height={132} rx={16} fill={C.navy} /><rect x={308} y={42} width={58} height={104} rx={8} fill={C.cream} />
    <rect x={420} y={66} width={70} height={96} rx={20} fill={C.navy2} /><rect x={430} y={78} width={50} height={64} rx={12} fill={C.mint} /><rect x={438} y={40} width={34} height={34} fill={C.orange} />
    <ellipse cx={560} cy={140} rx={34} ry={26} fill={C.cream} stroke={C.navy} strokeWidth={5} />
  </g>
);

export const Interview: React.FC<{lines: Placed[]}> = ({lines}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const active = lines.find((l) => frame >= l.startF - 4 && frame <= l.endF + 8);

  // plans : à chaque changement d'interlocuteur, la caméra file vers lui avec un léger push-in
  const shots = lines.map((l, i) => ({f: i === 0 ? 0 : l.startF - 6, x: l.speaker === 'jordan' ? WORLD_J : WORLD_C, z: 1.0 + (i % 2) * 0.04}));
  let idx = 0; shots.forEach((s, i) => { if (frame >= s.f) idx = i; });
  const cur = shots[idx], prev = shots[Math.max(0, idx - 1)];
  const p = idx === 0 ? 1 : spring({frame: frame - cur.f, fps, config: {damping: 22, stiffness: 120}, durationInFrames: 22});
  const camX = prev.x + (cur.x - prev.x) * p;
  const zoom = (prev.z + (cur.z - prev.z) * p) + Math.min(0.06, (frame - cur.f) / 400);
  const shakeX = Math.sin(frame / 9) * 3 + Math.sin(frame / 5.3) * 1.6, shakeY = Math.cos(frame / 11) * 3;
  const camT = `translate(${W / 2 + shakeX} ${H * 0.62 + shakeY}) scale(${zoom}) translate(${-camX} ${-H * 0.62})`;
  const bgT = `translate(${W / 2} ${H * 0.62}) scale(${zoom}) translate(${-(camX * 0.6 + 200)} ${-H * 0.62})`;

  const jl = lines.find((l) => l.speaker === 'jordan' && frame >= l.startF && frame <= l.endF);
  const cl = lines.find((l) => l.speaker === 'client' && frame >= l.startF && frame <= l.endF);
  const jv = jl ? visemeAt(jl, frame) : {v: 'rest' as const, open: 0};
  const cv = cl ? visemeAt(cl, frame) : {v: 'rest' as const, open: 0};
  const lastBy = (s: string) => [...lines].reverse().find((l) => l.speaker === s && frame >= l.startF);
  // expression : celle de la réplique en cours/dernière ; l'auditeur réagit à l'autre
  const jExpr = jl?.expr ?? (cl ? 'skeptical' : (lastBy('jordan')?.expr ?? 'smirk'));
  const cExpr = cl?.expr ?? (jl ? 'neutral' : (lastBy('client')?.expr ?? 'neutral'));

  return (
    <AbsoluteFill style={{background: C.cream}}>
      {lines.map((l) => (
        <Sequence key={l.id} from={l.startF} durationInFrames={l.endF - l.startF + 2}><Audio src={staticFile(l.meta.file)} /></Sequence>
      ))}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <g transform={bgT}><Backdrop frame={frame} /></g>
        <g transform={camT}>
          <g transform={`translate(${WORLD_J} ${WAIST_Y}) scale(${CHAR_SCALE})`}>
            <Jordan frame={frame} viseme={jv.v} open={jv.open} expr={jExpr} speaking={!!jl} lookX={0.5} />
          </g>
          <g transform={`translate(${WORLD_C} ${WAIST_Y}) scale(${-CHAR_SCALE} ${CHAR_SCALE})`}>
            <Customer frame={frame} viseme={cv.v} open={cv.open} expr={cExpr} speaking={!!cl} lookX={-0.3} />
          </g>
          {/* comptoir au premier plan */}
          <rect x={-600} y={WAIST_Y - 10} width={3200} height={700} fill={C.navy} />
          <rect x={-600} y={WAIST_Y - 22} width={3200} height={26} fill={C.orange} />
          <Devices />
        </g>
      </svg>
      <Captions lines={lines} frame={frame} />
      {/* identité & mention satire */}
      <div style={{position: 'absolute', top: 70, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Inter, sans-serif'}}>
        <div style={{fontWeight: 900, fontSize: 46, letterSpacing: 2, color: C.navy}}>THE SELLING <span style={{color: C.orange}}>GAME</span></div>
        <div style={{fontWeight: 800, fontSize: 28, color: C.cream, background: C.navy, padding: '10px 22px', borderRadius: 999}}>ÉP. 001 · TEST</div>
      </div>
      <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 26, color: C.cream, opacity: 0.85}}>
        Satire fictive · dialogues imaginaires · aucune citation réelle
      </div>
    </AbsoluteFill>
  );
};
