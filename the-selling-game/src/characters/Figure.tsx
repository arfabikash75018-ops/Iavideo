import React from 'react';
import {C} from '../theme';
import {Mouth, Viseme} from '../components/LipSync';
import type {Expr} from '../data/types';

export interface Look {
  skin: string; skinShade: string; hair: string; hairStyle: 'slick' | 'curly';
  jacket: string; jacketShade: string; shirt: string; accent: string; glasses?: boolean; hood?: boolean; tie?: boolean; stubble?: boolean;
}
export interface Gesture {rShoulder: number; rElbow: number; lShoulder: number; lElbow: number}
export interface FigureProps {
  look: Look; frame: number; viseme: Viseme; open: number; expr: Expr; speaking: boolean;
  gesture: Gesture; lookX?: number; seed?: number; bodyTilt?: number;
}

const EXPR: Record<Expr, {bl: [number, number]; br: [number, number]; eye: number; smile: number; tilt: number}> = {
  neutral: {bl: [0, 0], br: [0, 0], eye: 1, smile: 0.15, tilt: 0},
  smirk: {bl: [-4, -8], br: [-16, 14], eye: 0.82, smile: 0.7, tilt: 7},
  happy: {bl: [-12, -8], br: [-12, 8], eye: 0.8, smile: 1, tilt: 0},
  skeptical: {bl: [8, 14], br: [-24, -10], eye: 0.78, smile: 0.0, tilt: 8},
  surprised: {bl: [-24, 0], br: [-24, 0], eye: 1.25, smile: 0, tilt: 0},
};

const Arm: React.FC<{side: 1 | -1; a1: number; a2: number; look: Look}> = ({side, a1, a2, look}) => (
  <g transform={`translate(${side * 150} -425) rotate(${a1})`}>
    <rect x={-37} y={-30} width={74} height={215} rx={37} fill={look.jacket} />
    <rect x={-37} y={120} width={74} height={14} fill={look.jacketShade} opacity={0.5} />
    <g transform={`translate(0 170) rotate(${a2})`}>
      <rect x={-31} y={-26} width={62} height={170} rx={31} fill={look.jacket} />
      <rect x={-33} y={118} width={66} height={22} rx={8} fill={look.shirt} />
      <circle cx={0} cy={162} r={34} fill={look.skin} />
      <ellipse cx={-side * 22} cy={150} rx={11} ry={17} fill={look.skin} transform={`rotate(${side * 20} ${-side * 22} 150)`} />
    </g>
  </g>
);

export const Figure: React.FC<FigureProps> = ({look, frame, viseme, open, expr, speaking, gesture, lookX = 0, seed = 0, bodyTilt = 0}) => {
  const ex = EXPR[expr];
  const breathe = Math.sin((frame + seed * 17) / 22) * 4;
  const headBob = speaking ? Math.sin((frame + seed) / 4.2) * 3.5 : Math.sin((frame + seed) / 30) * 1.5;
  const headRot = (speaking ? Math.sin((frame + seed) / 9) * 2.2 : 0) + bodyTilt;
  const blinkPhase = (frame + seed * 41) % 96;
  const blink = blinkPhase < 4 ? Math.abs(blinkPhase - 2) / 2 : 1;   // 1 = ouvert
  const eyeOpen = Math.max(0.08, ex.eye * blink);
  return (
    <g>
      {/* corps */}
      <g transform={`translate(0 ${breathe})`}>
        <Arm side={-1} a1={gesture.lShoulder} a2={gesture.lElbow} look={look} />
        <path d="M -150 -425 Q -165 -440 -110 -455 L 110 -455 Q 165 -440 150 -425 L 135 0 L -135 0 Z" fill={look.jacket} />
        {look.hood ? (
          <>
            <path d="M -95 -462 Q 0 -380 95 -462 L 95 -440 Q 0 -340 -95 -440 Z" fill={look.jacketShade} />
            <path d="M -22 -380 L -26 -270" stroke={look.shirt} strokeWidth={7} strokeLinecap="round" />
            <path d="M 22 -380 L 26 -270" stroke={look.shirt} strokeWidth={7} strokeLinecap="round" />
            <rect x={-70} y={-140} width={140} height={90} rx={22} fill={look.jacketShade} opacity={0.6} />
          </>
        ) : (
          <>
            <path d="M -62 -455 L 0 -330 L 62 -455 Z" fill={look.shirt} />
            {look.tie && <><path d="M -15 -400 L 15 -400 L 22 -360 L 0 -340 L -22 -360 Z" fill={look.accent} /><path d="M -22 -360 L 22 -360 L 34 -150 L 0 -128 L -34 -150 Z" fill={look.accent} /></>}
            <path d="M -62 -455 L -20 -300 L -85 -230 L -112 -440 Z" fill={look.jacketShade} />
            <path d="M 62 -455 L 20 -300 L 85 -230 L 112 -440 Z" fill={look.jacketShade} />
            <rect x={70} y={-300} width={40} height={10} rx={3} fill={look.accent} />
          </>
        )}
        <Arm side={1} a1={gesture.rShoulder} a2={gesture.rElbow} look={look} />
      </g>
      {/* cou */}
      <rect x={-34} y={-492 + breathe} width={68} height={60} fill={look.skinShade} />
      {/* tête */}
      <g transform={`translate(0 ${-585 + headBob + breathe}) rotate(${headRot})`}>
        {look.hairStyle === 'curly' && <ellipse cx={0} cy={-30} rx={118} ry={118} fill={look.hair} />}
        <ellipse cx={-106} cy={10} rx={18} ry={28} fill={look.skinShade} />
        <ellipse cx={106} cy={10} rx={18} ry={28} fill={look.skinShade} />
        <path d="M -104 -20 C -104 80 -60 130 0 130 C 60 130 104 80 104 -20 C 104 -100 60 -125 0 -125 C -60 -125 -104 -100 -104 -20 Z" fill={look.skin} />
        {look.stubble && <path d="M -90 40 C -70 120 70 120 90 40 C 60 90 -60 90 -90 40Z" fill={look.hair} opacity={0.18} />}
        {look.hairStyle === 'slick' ? (
          <>
            <path d="M -112 -10 C -125 -150 -30 -190 50 -172 C 120 -158 125 -80 110 -8 C 104 -70 70 -112 10 -116 C -55 -120 -98 -80 -112 -10 Z" fill={look.hair} />
            <path d="M -60 -150 C -20 -168 30 -166 70 -150" stroke={C.mint2} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.55} />
            <path d="M -90 -120 C -40 -150 10 -150 60 -135" stroke={C.mint2} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.35} />
          </>
        ) : (
          <>
            {[-80, -45, -8, 30, 68].map((x, i) => <circle key={i} cx={x} cy={-102 + (i % 2) * 8} r={36} fill={look.hair} />)}
          </>
        )}
        {/* sourcils */}
        <g transform={`translate(-46 ${-40 + ex.bl[0]}) rotate(${ex.bl[1]})`}><rect x={-30} y={-6} width={60} height={13} rx={6} fill={look.hair === C.navy ? C.navy : look.hair} /></g>
        <g transform={`translate(46 ${-40 + ex.br[0]}) rotate(${-ex.br[1]})`}><rect x={-30} y={-6} width={60} height={13} rx={6} fill={look.hair === C.navy ? C.navy : look.hair} /></g>
        {/* yeux */}
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * 46} -6)`}>
            <ellipse cx={0} cy={0} rx={24} ry={22 * eyeOpen} fill={C.cream} stroke={C.navy} strokeWidth={4} />
            <circle cx={lookX * 8} cy={2} r={Math.min(11, 11 * eyeOpen + 2)} fill={C.navy} />
            <circle cx={lookX * 8 + 4} cy={-3} r={3.5} fill={C.cream} />
          </g>
        ))}
        {look.glasses && (
          <g stroke={C.navy} strokeWidth={7} fill="none">
            <rect x={-80} y={-34} width={68} height={56} rx={22} /><rect x={12} y={-34} width={68} height={56} rx={22} />
            <path d="M -12 -14 L 12 -14" /><path d="M -80 -14 L -104 -20" /><path d="M 80 -14 L 104 -20" />
          </g>
        )}
        {/* nez */}
        <path d="M 0 -4 C -6 22 -16 34 -4 40 C 6 42 14 38 12 32" stroke={look.skinShade} strokeWidth={7} strokeLinecap="round" fill="none" />
        {/* bouche */}
        <g transform="translate(0 76)"><Mouth v={viseme} open={open} smile={ex.smile} tilt={ex.tilt} /></g>
      </g>
    </g>
  );
};
