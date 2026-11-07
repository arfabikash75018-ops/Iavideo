import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {C, FPS} from './theme';
import {layout, Placed} from './data/types';
import {talk, wordF} from './components/Talk';
import {Captions} from './components/Captions';
import {PopText} from './components/PopText';
import {Phone, Watch, Laptop, Buds, Tablet, Coin} from './components/Icons';
import {Shop, WORLD_J, WORLD_C, WAIST_Y, H} from './scenes/Shop';
import {Ecosystem, Identity} from './scenes/Infographics';
import {kf} from './util';

const byId = (ls: Placed[], id: string) => ls.find((l) => l.id === id)!;
export const episodeFrames = () => {
  const {placed} = layout('ep01');
  const endStart = byId(placed, 'j_03').endF + 30;
  return {placed, endStart, total: endStart + 80};
};

export const Episode: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {placed: L, endStart} = episodeFrames();
  const h = byId(L, 'h_01'), j1 = byId(L, 'j_01'), c1 = byId(L, 'c_01'), j2 = byId(L, 'j_02'), e = byId(L, 'e_01'), p = byId(L, 'p_01'), r = byId(L, 'r_01'), c2 = byId(L, 'c_02'), j3 = byId(L, 'j_03');
  const mid = (a: Placed, b: Placed) => Math.round((a.endF + b.startF) / 2);
  const b1 = mid(h, j1), b2 = mid(j2, e), b3 = mid(e, p), b4 = mid(p, r);
  const t = talk(L, frame);

  // ---------------- caméra boutique (continue sur accroche → interview → final)
  const camX = kf(frame, [[0, 900], [b1 - 14, 1040], [j1.startF - 8, WORLD_J], [c1.startF - 8, WORLD_C], [j2.startF - 8, WORLD_J], [r.startF - 10, WORLD_J], [c2.startF - 8, WORLD_C], [j3.startF - 40, WORLD_J]]);
  const zoomK: [number, number][] = [[0, 0.76], [b1 - 14, 0.9], [j1.startF - 8, 1.0], [j1.endF, 1.06], [c1.startF - 8, 1.0], [c1.endF, 1.06], [j2.startF - 8, 1.0], [j2.endF, 1.06], [r.startF - 10, 1.04], [r.endF, 1.1], [c2.startF - 8, 1.0], [c2.endF, 1.05], [j3.startF - 40, 1.0], [j3.startF - 1, 1.04], [j3.startF + 5, 1.75]];
  const camZ = kf(frame, zoomK);
  const camY = kf(frame, [[0, 1100], [b1 - 14, 1100], [j1.startF - 8, H * 0.62], [j3.startF - 1, H * 0.62], [j3.startF + 5, 790]]);
  const cam = {x: camX, zoom: camZ, y: camY, shake: frame > j3.startF ? 2 : 1};

  // ---------------- accroche : produits en orbite autour du client
  const hookItems = [
    {re: /iPhone/i, a0: 0, el: <Phone />, s: 1.35},
    {re: /montre/i, a0: Math.PI / 2, el: <Watch />, s: 1.35},
    {re: /couteurs/i, a0: Math.PI, el: <Buds />, s: 1.6},
    {re: /^Mac/i, a0: (3 * Math.PI) / 2, el: <Laptop />, s: 1.0},
  ].map((it) => ({...it, f: wordF(h, it.re)}));
  const nHook = hookItems.filter((it) => frame >= it.f).length;
  const orbit = (
    <g>
      {hookItems.map((it, i) => {
        if (frame < it.f) return null;
        const k = frame - it.f;
        const sp = spring({frame: k, fps, config: {damping: 10, stiffness: 160}, durationInFrames: 18});
        const a = it.a0 + k * 0.035;
        return <g key={i} transform={`translate(${WORLD_C + Math.cos(a) * 400} ${880 + Math.sin(a) * 250}) rotate(${Math.sin(a) * 12}) scale(${it.s * sp})`}>{it.el}</g>;
      })}
    </g>
  );

  // ---------------- final : iPad, pièces, silence puis « Évidemment. »
  const ipadF = wordF(c2, /iPad/i);
  const kaching = j3.startF;
  const ipad = frame >= ipadF && (
    <g transform={`translate(${WORLD_C - 250} ${WAIST_Y - 150}) rotate(-10) scale(${0.8 * spring({frame: frame - ipadF, fps, config: {damping: 9, stiffness: 150}, durationInFrames: 16})})`}><Tablet /></g>
  );
  const coins = frame >= kaching && (
    <g>
      {Array.from({length: 10}).map((_, i) => {
        const k = (frame - kaching) / 30, vx = (i - 4.5) * 150, vy = -700 - (i % 3) * 120;
        return <g key={i} opacity={Math.max(0, 1 - k)} transform={`translate(${WORLD_C - 250 + vx * k} ${WAIST_Y - 250 + vy * k + 900 * k * k}) scale(1.2)`}><Coin /></g>;
      })}
    </g>
  );
  const silence = frame >= j2.endF && frame < j3.startF && frame > c2.endF;   // silence comique avant « Évidemment. »
  const jExprEnd = frame >= c2.endF && frame < j3.startF ? 'skeptical' : t.jExpr;
  const endCard = frame >= endStart;
  const ek = frame - endStart;

  // ---------------- bande-son : effets calés sur les mots
  const fx: {f: number; file: string; vol: number}[] = [
    {f: b1 - 8, file: 'whoosh', vol: 0.5}, {f: b2 - 8, file: 'whoosh', vol: 0.5}, {f: b3 - 8, file: 'whoosh', vol: 0.5}, {f: b4 - 8, file: 'whoosh', vol: 0.5},
    ...hookItems.map((it) => ({f: it.f, file: 'pop', vol: 0.6})),
    {f: wordF(e, /photos/i), file: 'ding', vol: 0.45}, {f: wordF(e, /messages/i), file: 'ding', vol: 0.45}, {f: wordF(e, /appareils/i), file: 'ding', vol: 0.45}, {f: wordF(e, /connecte/i), file: 'ding', vol: 0.6},
    {f: wordF(e, /changer/i), file: 'thud', vol: 0.5}, {f: wordF(e, /efforts/i) - 4, file: 'pop', vol: 0.6},
    {f: wordF(p, /certains/i) - 6, file: 'pop', vol: 0.5}, {f: wordF(p, /certains/i) + 4, file: 'pop', vol: 0.5}, {f: wordF(p, /certains/i) + 14, file: 'pop', vol: 0.5}, {f: wordF(p, /certains/i) + 24, file: 'pop', vol: 0.5},
    {f: wordF(p, /outil/i), file: 'pop', vol: 0.5}, {f: wordF(p, /marque/i) - 8, file: 'pop', vol: 0.6}, {f: wordF(p, /identifient/i) - 4, file: 'ding', vol: 0.6},
    {f: ipadF, file: 'pop', vol: 0.7}, {f: kaching, file: 'thud', vol: 0.9}, {f: kaching, file: 'kaching', vol: 0.9},
  ];

  const inShop = frame < b1 || (frame >= b2 && false);
  const scene = frame < b1 ? 'hook' : frame < b2 ? 'interview' : frame < b3 ? 'eco' : frame < b4 ? 'psy' : 'end';

  return (
    <AbsoluteFill style={{background: C.cream, fontFamily: 'Inter, sans-serif'}}>
      <Audio src={staticFile('audio/sfx/music.wav')} volume={0.2} />
      {L.map((l) => <Sequence key={l.id} from={l.startF} durationInFrames={l.endF - l.startF + 2}><Audio src={staticFile(l.meta.file)} /></Sequence>)}
      {fx.map((x, i) => <Sequence key={i} from={Math.max(0, x.f)} durationInFrames={90}><Audio src={staticFile(`audio/sfx/${x.file}.wav`)} volume={x.vol} /></Sequence>)}

      {(scene === 'hook' || scene === 'interview' || scene === 'end') && (
        <Shop frame={frame} cam={cam} t={t}
          jExpr={scene === 'end' ? jExprEnd : undefined}
          cExpr={scene === 'hook' && nHook >= 2 ? 'surprised' : undefined}
          jLook={silence || frame >= j3.startF ? 0 : 0.5}
          front={scene === 'hook' ? orbit : <>{ipad}{coins}</>} />
      )}
      {scene === 'eco' && <Ecosystem frame={frame} line={e} t={t} />}
      {scene === 'psy' && <Identity frame={frame} line={p} t={t} />}

      {!endCard && <Captions lines={L} frame={frame} />}
      <PopText frame={frame} f0={kaching} dur={42} x={540} y={420} rot={-6} size={210} color={C.orange} text="KA-CHING !" shake={5} />

      {!endCard && (
        <>
          <div style={{position: 'absolute', top: 70, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontWeight: 900, fontSize: 46, letterSpacing: 2, color: C.navy}}>THE SELLING <span style={{color: C.orange}}>GAME</span></div>
            <div style={{fontWeight: 800, fontSize: 28, color: C.cream, background: C.navy, padding: '10px 22px', borderRadius: 999}}>ÉP. 001 · APPLE</div>
          </div>
          <div style={{position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', fontWeight: 700, fontSize: 26, color: C.cream, opacity: 0.85}}>Satire fictive · dialogues imaginaires · aucune citation réelle</div>
        </>
      )}

      {endCard && (
        <AbsoluteFill style={{background: C.navy, opacity: Math.min(1, ek / 8), alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 36, padding: 80}}>
          <div style={{fontWeight: 900, fontSize: 96, color: C.cream, textAlign: 'center', lineHeight: 1.05, transform: `scale(${Math.min(1, 0.7 + ek / 14)})`}}>THE SELLING <span style={{color: C.orange}}>GAME</span></div>
          <div style={{fontWeight: 800, fontSize: 52, color: C.mint, textAlign: 'center', opacity: Math.min(1, Math.max(0, (ek - 10) / 8))}}>Épisode 001 · Comment Apple transforme-t-elle ses clients en fans ?</div>
          <div style={{fontWeight: 700, fontSize: 38, color: C.cream, opacity: Math.min(0.85, Math.max(0, (ek - 22) / 8)), textAlign: 'center'}}>Satire fictive · dialogues imaginaires<br />Sources en description · Abonne-toi pour la suite</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
