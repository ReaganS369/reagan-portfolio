/** @format */

export const PORTRAIT_STORAGE_PATH = 'profile/reagan_profile.png';
export const RESUME_STORAGE_PATH = 'resume/reagan_sagolsem_cv.pdf';

export interface OriginJourneyEntry {
  year: string;
  description: string;
}

export const ORIGIN_JOURNEY: OriginJourneyEntry[] = [
  { year: '2020', description: 'Wrote my first lines of code, laying the foundation in software engineering.' },
  { year: '2021', description: 'Mastered the fundamentals of 3D modeling and spatial design.' },
  { year: '2022', description: 'Engineered early game prototypes in Unity, refining UI/UX principles.' },
  { year: '2023', description: 'Pivoted into technical art and scalable web experiences.' },
  { year: '2024', description: 'Earned my degree in Computer Science, solidifying core systems architecture.' },
  { year: 'Today', description: 'Architecting NNGTW Studio and pushing the boundaries of interactive design.' },
];

export interface BentoItem {
  icon: string;
  title: string;
  description: string;
}

export const WHAT_I_DO: BentoItem[] = [
  {
    icon: '🎮',
    title: 'Game Development',
    description: 'Architecting gameplay systems, multiplayer architectures, and immersive interactive worlds.',
  },
  {
    icon: '🧩',
    title: 'Technical Art',
    description: 'Engineering rendering pipelines, procedural workflows, and tools that bridge art with logic.',
  },
  {
    icon: '🎨',
    title: 'Design',
    description: 'Crafting premium visual identities, motion graphics, and fluid user interfaces.',
  },
  {
    icon: '🚀',
    title: 'Creative Technology',
    description: 'Pioneering AI workflows, automation, and advanced web technologies for next-generation products.',
  },
];

export const BEYOND_WORK: BentoItem[] = [
  {
    icon: '🎮',
    title: 'Gaming',
    description: 'Studying mechanics in strategy, survival, and open-world ecosystems.',
  },
  {
    icon: '🎬',
    title: 'Storytelling',
    description: 'Deconstructing cinematic composition and visual narratives.',
  },
  {
    icon: '📚',
    title: 'Progression',
    description: 'Constantly adopting new frameworks, engines, and methodologies.',
  },
  {
    icon: '💡',
    title: 'Systems',
    description: 'Reverse-engineering complex mechanisms to understand their core logic.',
  },
];

export const CURRENT_FOCUS = [
  'Building NNGTW Studio',
  'Next-Gen Web Experiences',
  'AI-Driven Workflows',
  'Real-Time Technical Art',
  'Immersive Storytelling',
] as const;

/**
 * Journey milestones moved to ./journey.ts when they grew rich structured
 * content (skill categories, accents, CTAs) ahead of CMS integration.
 * Re-exported here so existing "from '../../constants'" imports keep working.
 */
export * from './journey';
