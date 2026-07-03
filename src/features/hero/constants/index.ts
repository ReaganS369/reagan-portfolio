/** @format */

import type { MarqueeMessage } from '../types';

export const storyMessages: MarqueeMessage[] = [
  { label: 'What I Build', shortLabel: 'BUILDS', href: '/builds' },
  { label: 'Where It All Began', shortLabel: 'ORIGIN', href: '/origin' },
  { label: "What I'm Made Of", shortLabel: 'STATS', href: '/stats' },
  { label: 'Where Connections Begin', shortLabel: 'COMMS', href: '/comms' },
];

const CV_RIBBON_MESSAGE =
  'View Curriculum Vitae: Experience Beyond the Portfolio';

export const cvRibbonMessages: string[] = Array.from(
  { length: 8 },
  () => CV_RIBBON_MESSAGE,
);
