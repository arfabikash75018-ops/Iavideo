import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import T from './timeline.json';

export const Root: React.FC = () => (
  <Composition id="Film" component={Film} durationInFrames={Math.round(T.end * 30)} fps={30} width={1080} height={1920} />
);
