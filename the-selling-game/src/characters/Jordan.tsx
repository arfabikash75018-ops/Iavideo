import React from 'react';
import {C} from '../theme';
import {Figure, Look, Gesture} from './Figure';
import type {Viseme} from '../components/LipSync';
import type {Expr} from '../data/types';

/** Caricature satirique FICTIVE du présentateur : costume, cheveux gominés, verve de vendeur. */
export const jordanLook: Look = {skin: C.skinJ, skinShade: '#DCA783', hair: C.navy, hairStyle: 'slick',
  jacket: C.navy, jacketShade: C.navy2, shirt: C.cream, accent: C.orange, tie: true};

export const jordanGesture = (f: number, speaking: boolean): Gesture => {
  if (!speaking) return {rShoulder: -10, rElbow: 6, lShoulder: 10, lElbow: -6};
  const a = Math.sin(f / 7), b = Math.sin(f / 11 + 1.5);
  return {rShoulder: -38 + a * 14, rElbow: 78 + b * 22, lShoulder: 14 + b * 6, lElbow: -10 + a * 8};
};

export const Jordan: React.FC<{frame: number; viseme: Viseme; open: number; expr: Expr; speaking: boolean; lookX?: number}> = (p) => (
  <Figure {...p} look={jordanLook} gesture={jordanGesture(p.frame, p.speaking)} seed={3} />
);
