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

export interface YearEntry {
  year: string;
  title: string;
  summary: string;
  tech: string[];
  projects: number | null;
  detail: string;
}

export const JOURNEY: YearEntry[] = [
  {
    year: '2020',
    title: 'The Spark',
    summary: 'Discovered game development through Unity tutorials and never looked back.',
    tech: ['Unity', 'C#', 'Blender basics'],
    projects: 2,
    detail:
      'Started exploring 3D game development after being fascinated by indie games. Built first prototype — a simple platformer that never shipped but sparked everything that followed.',
  },
  {
    year: '2022',
    title: 'Building the Foundation',
    summary: 'First game jam victories and deep dives into 3D art and animation.',
    tech: ['Blender', 'Illustrator', 'Unity', 'C#'],
    projects: 5,
    detail:
      'Participated in multiple game jams, shipped 3 games. Learned 3D modeling and began understanding the full pipeline from raw asset to running engine.',
  },
  {
    year: '2024',
    title: 'Expanding Horizons',
    summary: 'Entered UI/UX and web development while growing freelance work.',
    tech: ['React', 'Figma', 'JavaScript', 'CSS'],
    projects: 8,
    detail:
      'Began freelancing for app UI design and web development projects. Discovered that great design requires understanding both aesthetics and the code that delivers it.',
  },
  {
    year: '2025',
    title: 'Into Immersive Worlds',
    summary: 'XR/VR projects and advanced real-time development work.',
    tech: ['Unreal Engine', 'Unity XR', 'Blender', 'React Native'],
    projects: 12,
    detail:
      'Shipped first XR application and contributed to VR training simulations. Architecture began to feel as important as aesthetics — and performance became non-negotiable.',
  },
  {
    year: '2026',
    title: 'Mastering the Stack',
    summary: 'Full-stack capabilities, portfolio launch, and leveling up across disciplines.',
    tech: ['Next.js', 'Supabase', 'DaVinci Resolve', 'Three.js'],
    projects: 15,
    detail:
      'Built this portfolio from scratch. Deepened knowledge of backend systems, motion design, and film-quality rendering pipelines — and learned to ship complete products end-to-end.',
  },
  {
    year: 'FUTURE',
    title: 'The Vision',
    summary: 'International studios, original IP, and building immersive worlds at scale.',
    tech: ['Unreal 5', 'Nanite', 'Lumen', 'MetaHuman'],
    projects: null,
    detail:
      'The goal: ship games that millions play, XR experiences that reshape how people see virtual spaces, and build a studio that creates worlds with genuine soul.',
  },
];
