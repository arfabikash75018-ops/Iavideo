import React from 'react';
import {C} from '../theme';
import {Jordan} from '../characters/Jordan';
import {Customer} from '../characters/Customer';
import {Backdrop, Devices} from './Interview';
import {TalkState} from '../components/Talk';
import type {Expr} from '../data/types';

export const W = 1080, H = 1920, WORLD_J = 470, WORLD_C = 1440, WAIST_Y = 1400, CHAR_SCALE = 1.45;
export interface Cam {x: number; zoom: number; y?: number; shake?: number}

/** Plan large de la boutique : décor en parallaxe, deux personnages, comptoir. Les `overlay*` sont en coordonnées monde. */
export const Shop: React.FC<{frame: number; cam: Cam; t: TalkState; jExpr?: Expr; cExpr?: Expr; jLook?: number; cLook?: number; behind?: React.ReactNode; front?: React.ReactNode}> =
({frame, cam, t, jExpr, cExpr, jLook = 0.5, cLook = -0.3, behind, front}) => {
  const sh = cam.shake ?? 1;
  const sx = (Math.sin(frame / 9) * 3 + Math.sin(frame / 5.3) * 1.6) * sh, sy = Math.cos(frame / 11) * 3 * sh;
  const camT = `translate(${W / 2 + sx} ${H * 0.62 + sy}) scale(${cam.zoom}) translate(${-cam.x} ${-(cam.y ?? H * 0.62)})`;
  const bgT = `translate(${W / 2} ${H * 0.62}) scale(${cam.zoom}) translate(${-(cam.x * 0.6 + 200)} ${-H * 0.62})`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <rect width={W} height={H} fill={C.cream} />
      <g transform={bgT}><Backdrop frame={frame} /></g>
      <g transform={camT}>
        {behind}
        <g transform={`translate(${WORLD_J} ${WAIST_Y}) scale(${CHAR_SCALE})`}>
          <Jordan frame={frame} viseme={t.jv.v} open={t.jv.open} expr={jExpr ?? t.jExpr} speaking={!!t.jl} lookX={jLook} />
        </g>
        <g transform={`translate(${WORLD_C} ${WAIST_Y}) scale(${-CHAR_SCALE} ${CHAR_SCALE})`}>
          <Customer frame={frame} viseme={t.cv.v} open={t.cv.open} expr={cExpr ?? t.cExpr} speaking={!!t.cl} lookX={cLook} />
        </g>
        <rect x={-600} y={WAIST_Y - 10} width={3200} height={700} fill={C.navy} />
        <rect x={-600} y={WAIST_Y - 22} width={3200} height={26} fill={C.orange} />
        <Devices />
        {front}
      </g>
    </svg>
  );
};
