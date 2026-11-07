import React from 'react';
import {Composition} from 'remotion';
import {Interview} from './scenes/Interview';
import {layout} from './data/types';
import {FPS} from './theme';

const test = layout('test01');
export const Root: React.FC = () => (
  <Composition id="Test01" component={() => <Interview lines={test.placed} />} durationInFrames={test.total} fps={FPS} width={1080} height={1920} />
);
