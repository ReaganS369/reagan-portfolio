/** @format */

import type { MarqueeMessage } from '../types';

export const storyMessages: MarqueeMessage[] = [
  { label: 'Selected Works', shortLabel: 'WORKS', href: '/builds' },
  { label: 'Origin Story', shortLabel: 'ORIGIN', href: '/origin' },
  { label: 'Capabilities', shortLabel: 'STATS', href: '/stats' },
  { label: 'Initiate Contact', shortLabel: 'COMMS', href: '/comms' },
];

const CV_RIBBON_MESSAGE =
  'View Curriculum Vitae: Experience Beyond the Portfolio';

export const cvRibbonMessages: string[] = Array.from(
  { length: 8 },
  () => CV_RIBBON_MESSAGE,
);
