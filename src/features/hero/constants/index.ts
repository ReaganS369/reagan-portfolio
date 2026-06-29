/** @format */

import type { MarqueeMessage } from '../types';

export const storyMessages: MarqueeMessage[] = [
  { label: 'What I Build', shortLabel: 'BUILDS' },
  { label: 'Where It All Began', shortLabel: 'ORIGIN' },
  { label: "What I'm Made Of", shortLabel: 'STATS' },
  { label: 'Where Connections Begin', shortLabel: 'COMMS' },
];

const CV_RIBBON_MESSAGE =
  'View Curriculum Vitae: Experience Beyond the Portfolio';

export const cvRibbonMessages: string[] = Array.from(
  { length: 8 },
  () => CV_RIBBON_MESSAGE,
);
