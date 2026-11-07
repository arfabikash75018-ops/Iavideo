import React from 'react';
import {C} from '../theme';

export const PopText: React.FC<{frame: number; f0: number; dur: number; x: number; y: number; rot?: number; size?: number; color?: string; text: string; shake?: number}> =
({frame, f0, dur, x, y, rot = 0, size = 150, color = C.orange, text, shake = 0}) => {
  const k = frame - f0;
  if (k < 0 || k > dur) return null;
  const pop = k < 3 ? k / 3 * 1.3 : k < 6 ? 1.3 - (k - 3) / 3 * 0.3 : 1;
  const out = Math.min(1, (dur - k) / 5);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) translate(${Math.sin(frame * 2.3) * shake}px, ${Math.cos(frame * 1.9) * shake}px) rotate(${rot}deg) scale(${pop * out})`,
      fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', color,
      WebkitTextStroke: `${size * 0.09}px ${C.navy}`, paintOrder: 'stroke fill', letterSpacing: -2} as React.CSSProperties}>{text}</div>
  );
};
