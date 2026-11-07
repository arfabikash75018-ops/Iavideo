import React from 'react';
import {Composition} from 'remotion';
import {Interview} from './scenes/Interview';
import {layout} from './data/types';
import {FPS} from './theme';
import {Episode, episodeFrames} from './Episode';

const test = layout('test01');
const ep = episodeFrames();
export const Root: React.FC = () => (
  <>
  <Composition id="AppleEpisode01" component={Episode} durationInFrames={ep.total} fps={FPS} width={1080} height={1920} />
  <Composition id="Test01" component={() => <Interview lines={test.placed} />} durationInFrames={test.total} fps={FPS} width={1080} height={1920} />
  </>
);
