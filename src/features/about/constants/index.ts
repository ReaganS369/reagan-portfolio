/** @format */

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
    year: '2018',
    title: 'The Spark',
    summary: 'Discovered game development through Unity tutorials and never looked back.',
    tech: ['Unity', 'C#', 'Blender basics'],
    projects: 2,
    detail:
      'Started exploring 3D game development after being fascinated by indie games. Built first prototype — a simple platformer that never shipped but sparked everything that followed.',
  },
  {
    year: '2020',
    title: 'Building the Foundation',
    summary: 'First game jam victories and deep dives into 3D art and animation.',
    tech: ['Blender', 'Illustrator', 'Unity', 'C#'],
    projects: 5,
    detail:
      'Participated in multiple game jams, shipped 3 games. Learned 3D modeling and began understanding the full pipeline from raw asset to running engine.',
  },
  {
    year: '2022',
    title: 'Expanding Horizons',
    summary: 'Entered UI/UX and web development while growing freelance work.',
    tech: ['React', 'Figma', 'JavaScript', 'CSS'],
    projects: 8,
    detail:
      'Began freelancing for app UI design and web development projects. Discovered that great design requires understanding both aesthetics and the code that delivers it.',
  },
  {
    year: '2024',
    title: 'Into Immersive Worlds',
    summary: 'XR/VR projects and advanced real-time development work.',
    tech: ['Unreal Engine', 'Unity XR', 'Blender', 'React Native'],
    projects: 12,
    detail:
      'Shipped first XR application and contributed to VR training simulations. Architecture began to feel as important as aesthetics — and performance became non-negotiable.',
  },
  {
    year: '2025',
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
