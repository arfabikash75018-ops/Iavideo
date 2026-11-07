import React from 'react';
import {C} from '../theme';
import {Figure, Look, Gesture} from './Figure';
import type {Viseme} from '../components/LipSync';
import type {Expr} from '../data/types';

export const customerLook: Look = {skin: C.skinC, skinShade: '#B57A52', hair: '#2B1B14', hairStyle: 'curly',
  jacket: C.orange, jacketShade: C.orange2, shirt: C.cream, accent: C.navy, glasses: true, hood: true};

export const customerGesture = (f: number, speaking: boolean): Gesture => {
  if (!speaking) return {rShoulder: -14, rElbow: 10, lShoulder: 8, lElbow: -52 + Math.sin(f / 20) * 3};
  const a = Math.sin(f / 8), b = Math.sin(f / 12 + 2);
  return {rShoulder: -30 + a * 10, rElbow: 60 + b * 18, lShoulder: 12, lElbow: -50 + b * 5};
};

export const Customer: React.FC<{frame: number; viseme: Viseme; open: number; expr: Expr; speaking: boolean; lookX?: number}> = (p) => (
  <Figure {...p} look={customerLook} gesture={customerGesture(p.frame, p.speaking)} seed={9} />
);
