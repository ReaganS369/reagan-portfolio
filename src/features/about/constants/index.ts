/** @format */

export const PORTRAIT_STORAGE_PATH = 'profile/reagan_sagolsem.jpg';
export const RESUME_STORAGE_PATH = 'resume/reagan_sagolsem_cv.pdf';

export interface OriginJourneyEntry {
  year: string;
  description: string;
}

export const ORIGIN_JOURNEY: OriginJourneyEntry[] = [
  { year: '2020', description: 'Started learning programming and software development.' },
  { year: '2021', description: 'Discovered Blender and entered the world of 3D.' },
  { year: '2022', description: 'Built games using Unity while expanding into UI/UX.' },
  { year: '2023', description: 'Focused on technical art, web experiences, and creative technology.' },
  { year: '2024', description: 'Graduated in Computer Science.' },
  { year: 'Today', description: 'Building products while preparing the future of NNGTW Studio.' },
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
    description: 'Designing gameplay systems, mechanics, multiplayer experiences, and interactive worlds.',
  },
  {
    icon: '🧩',
    title: 'Technical Art',
    description: 'Creating optimized pipelines, procedural workflows, shaders, tools, and bridging art with engineering.',
  },
  {
    icon: '🎨',
    title: 'Design',
    description: 'Crafting intuitive interfaces, visual identities, motion graphics, and user experiences.',
  },
  {
    icon: '🚀',
    title: 'Creative Technology',
    description: 'Exploring AI, automation, web experiences, and emerging technologies to build smarter creative workflows.',
  },
];

export const BEYOND_WORK: BentoItem[] = [
  {
    icon: '🎮',
    title: 'Games',
    description: 'Strategy, survival, simulation, and open-world experiences inspire many of my ideas.',
  },
  {
    icon: '🎬',
    title: 'Storytelling',
    description: 'Interested in cinematic animation and immersive visual storytelling.',
  },
  {
    icon: '📚',
    title: 'Learning',
    description: 'Always exploring new tools, workflows, and technologies.',
  },
  {
    icon: '💡',
    title: 'Curiosity',
    description: 'I enjoy understanding how things work before using them.',
  },
];

export const CURRENT_FOCUS = [
  'Building NNGTW Studio',
  'Advanced Web Experiences',
  'AI Workflows',
  'Technical Art',
  'Interactive Storytelling',
] as const;

/**
 * Journey milestones moved to ./journey.ts when they grew rich structured
 * content (skill categories, accents, CTAs) ahead of CMS integration.
 * Re-exported here so existing "from '../../constants'" imports keep working.
 */
export * from './journey';
