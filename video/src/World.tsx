import React from 'react';
import {rnd} from './util';

const Box: React.FC<{p: [number, number, number]; s: [number, number, number]; c: string; r?: number}> = ({p, s, c, r = 0.95}) => (
  <mesh position={p}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={r} />
  </mesh>
);

const Tree: React.FC<{x: number; z: number; h: number; hue?: string}> = ({x, z, h, hue = '#4f9a3a'}) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, h * 0.35, 0]}>
      <cylinderGeometry args={[0.16 * h * 0.5, 0.26 * h * 0.5, h * 0.7, 10]} />
      <meshStandardMaterial color="#6b4a2a" roughness={1} />
    </mesh>
    {[[0, 0.95, 0, 1.0], [0.5, 0.75, 0.2, 0.7], [-0.5, 0.8, -0.1, 0.75], [0.1, 1.2, 0.2, 0.7]].map(([a, b, c, d], i) => (
      <mesh key={i} position={[a * h * 0.5, b * h, c * h * 0.5]} scale={d * h * 0.55}>
        <sphereGeometry args={[1, 20, 16]} />
        <meshStandardMaterial color={i % 2 ? '#5aa842' : hue} roughness={1} />
      </mesh>
    ))}
  </group>
);

export const World: React.FC<{dim?: number}> = ({dim = 1}) => {
  const planks = Array.from({length: 70}, (_, i) => i);
  const flowers = Array.from({length: 46}, (_, i) => i);
  const grass = Array.from({length: 60}, (_, i) => i);
  return (
    <group>
      {/* ground layers */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#6fa24a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]} scale={[1, 0.85, 1]}>
        <circleGeometry args={[7.5, 48]} />
        <meshStandardMaterial color="#c49a63" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.5, 0.003, -1.2]} scale={[1.3, 0.8, 1]}>
        <circleGeometry args={[1.8, 32]} />
        <meshStandardMaterial color="#b88b55" roughness={1} />
      </mesh>
      {/* fence */}
      <group position={[0, 0, -7]}>
        {planks.map((i) => (
          <Box key={i} p={[-7.6 + i * 0.22, 0.7 + (rnd(i) - 0.5) * 0.08, 0]} s={[0.19, 1.4 + rnd(i, 2) * 0.12, 0.05]} c={i % 3 ? '#d1a876' : '#c29a68'} />
        ))}
        <Box p={[0, 0.35, 0.05]} s={[16, 0.1, 0.04]} c="#9a7448" />
        <Box p={[0, 1.05, 0.05]} s={[16, 0.1, 0.04]} c="#9a7448" />
      </group>
      {/* house */}
      <Box p={[-9, 2.6, -11]} s={[9, 5.2, 0.6]} c="#e9dcc6" />
      <Box p={[-9, 5.35, -11]} s={[10, 0.5, 0.9]} c="#a2503a" />
      <Box p={[-10.4, 2.8, -10.65]} s={[1.5, 1.7, 0.1]} c="#7ab6dc" r={0.3} />
      <Box p={[-7.3, 2.8, -10.65]} s={[1.5, 1.7, 0.1]} c="#7ab6dc" r={0.3} />
      <Box p={[-10.4, 2.8, -10.62]} s={[1.65, 0.07, 0.1]} c="#ffffff" />
      <Box p={[-10.4, 2.8, -10.62]} s={[0.07, 1.85, 0.1]} c="#ffffff" />
      {/* trees and bushes */}
      <Tree x={4.8} z={-9} h={5.5} />
      <Tree x={-2.2} z={-10} h={6.6} hue="#3f8a34" />
      <Tree x={9} z={-12} h={7} hue="#5aa842" />
      <Tree x={-14} z={-8} h={6} hue="#468f38" />
      {[[-4, -6.4, 0.7], [3.6, -6.4, 0.55], [-1, -6.5, 0.45], [6.4, -6.3, 0.8], [-6.6, -6.3, 0.65]].map(([x, z, s], i) => (
        <mesh key={i} position={[x, s * 0.7, z]} scale={[s * 1.4, s, s]}>
          <sphereGeometry args={[1, 18, 14]} />
          <meshStandardMaterial color={i % 2 ? '#3f8a34' : '#4c9a3c'} roughness={1} />
        </mesh>
      ))}
      {/* flowers & grass tufts */}
      {flowers.map((i) => {
        const a = rnd(i, 1) * Math.PI * 2;
        const r = 4.2 + rnd(i, 2) * 5;
        const col = ['#ffffff', '#ffd23c', '#ff7aa8', '#c48cff'][Math.floor(rnd(i, 3) * 4)];
        return (
          <group key={i} position={[Math.sin(a) * r * 1.2, 0, -Math.cos(a) * r * 0.7 - 1.5]}>
            <mesh position={[0, 0.09, 0]}>
              <cylinderGeometry args={[0.007, 0.007, 0.18, 5]} />
              <meshStandardMaterial color="#3f8a34" />
            </mesh>
            <mesh position={[0, 0.2, 0]} scale={[1, 0.6, 1]}>
              <sphereGeometry args={[0.05, 10, 8]} />
              <meshStandardMaterial color={col} roughness={0.8} />
            </mesh>
          </group>
        );
      })}
      {grass.map((i) => {
        const a = rnd(i, 7) * Math.PI * 2;
        const r = 2.5 + rnd(i, 8) * 7;
        return (
          <mesh key={i} position={[Math.sin(a) * r * 1.2, 0.07, -Math.cos(a) * r * 0.8 - 1]} scale={[0.14, 0.12, 0.14]}>
            <coneGeometry args={[1, 1.4, 5]} />
            <meshStandardMaterial color="#4f9a3a" roughness={1} />
          </mesh>
        );
      })}
      <fog attach="fog" args={['#cfe6f6', 16, 48]} />
      <hemisphereLight args={['#bfe0ff', '#9a7a52', 1.5 * dim]} />
      <directionalLight position={[5, 9, 6]} intensity={2.2 * dim} color="#fff1d6" />
      <directionalLight position={[-6, 4, -4]} intensity={0.9 * dim} color="#ffd2a0" />
    </group>
  );
};
