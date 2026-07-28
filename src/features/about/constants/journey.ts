/** @format */

/**
 * Journey milestones — the homepage "02 The Journey" chapter sequence.
 *
 * Deliberately shaped as records an admin can edit rather than as the minimum
 * the current UI happens to need: every field below is rendered defensively, so
 * a milestone with no skills, no CTA and no featured projects still renders a
 * clean chapter card. When this moves into the CMS (see nngtw-admin's
 * `src/modules/portfolio`), a row maps 1:1 onto JourneyMilestone and nothing in
 * the presentation layer has to change.
 *
 * Note: this is the HOMEPAGE dataset. `/origin` has its own, simpler
 * ORIGIN_JOURNEY in ./index.ts — the two are separate on purpose, don't merge.
 */

export interface JourneySkill {
  name: string;
  /** Proficiency at the time of this chapter, 0–10. Drives the bar fill. */
  level: number;
}

export interface JourneySkillCategory {
  /** e.g. "Frontend", "3D", "Design" — the UI renders any number of these. */
  name: string;
  skills: JourneySkill[];
}

export interface JourneyFeaturedProject {
  name: string;
  /** Optional — renders as plain text when absent. */
  href?: string;
}

export interface JourneyCta {
  label: string;
  href: string;
}

/** Per-milestone artwork. Null today: every chapter shares the one continuous
 *  scrubbed take (see JourneyScrub). Present so a future chapter can override
 *  the backdrop without a schema change. */
export interface JourneyMedia {
  image?: string;
  video?: string;
}

export interface JourneyMilestone {
  /** Stable key — survives year relabels, unlike the year string. */
  id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  /** Longer copy revealed in the expanded profile. */
  detail: string;
  /** Chapter accent, used for the eyebrow, skill bars and glow. Kept in the
   *  same warm-to-cool family so the section still reads as one piece. */
  accent: string;
  projectCount: number | null;
  skillCategories: JourneySkillCategory[];
  technologies: string[];
  software: string[];
  tags: string[];
  featuredProjects: JourneyFeaturedProject[];
  cta: JourneyCta | null;
  media: JourneyMedia | null;
  /** Sort key for the admin; the UI sorts on it rather than array position. */
  order: number;
  visible: boolean;
}

/**
 * ⚠️ Skill levels are authored estimates, not measurements — they exist to give
 * the bars a believable shape and are the first thing to adjust in the admin.
 */
export const JOURNEY_MILESTONES: JourneyMilestone[] = [
  {
    id: 'spark',
    year: '2020',
    title: 'The Spark',
    subtitle: 'Where it started',
    description:
      'Discovered game development through Unity tutorials and never looked back.',
    detail:
      'Started exploring 3D game development after being fascinated by indie games. Built first prototype — a simple platformer that never shipped but sparked everything that followed.',
    accent: '#F58A1F',
    projectCount: 2,
    skillCategories: [
      {
        name: 'Development',
        skills: [
          { name: 'Unity', level: 3 },
          { name: 'C#', level: 3 },
        ],
      },
      {
        name: '3D',
        skills: [{ name: 'Blender', level: 2 }],
      },
    ],
    technologies: ['Unity', 'C#'],
    software: ['Blender'],
    tags: ['Game Dev', 'Self-taught'],
    featuredProjects: [],
    cta: null,
    media: null,
    order: 1,
    visible: true,
  },
  {
    id: 'foundation',
    year: '2022',
    title: 'Building the Foundation',
    subtitle: 'Game jams & pipelines',
    description:
      'First game jam victories and deep dives into 3D art and animation.',
    detail:
      'Participated in multiple game jams, shipped 3 games. Learned 3D modeling and began understanding the full pipeline from raw asset to running engine.',
    accent: '#4C9BE8',
    projectCount: 5,
    skillCategories: [
      {
        name: 'Development',
        skills: [
          { name: 'Unity', level: 5 },
          { name: 'C#', level: 5 },
        ],
      },
      {
        name: '3D',
        skills: [{ name: 'Blender', level: 5 }],
      },
      {
        name: 'Design',
        skills: [{ name: 'Illustrator', level: 4 }],
      },
    ],
    technologies: ['Unity', 'C#'],
    software: ['Blender', 'Illustrator'],
    tags: ['Game Jams', '3D Art', 'Animation'],
    featuredProjects: [],
    cta: null,
    media: null,
    order: 2,
    visible: true,
  },
  {
    id: 'horizons',
    year: '2024',
    title: 'Expanding Horizons',
    subtitle: 'Into product & web',
    description:
      'Entered UI/UX and web development while growing freelance work.',
    detail:
      'Began freelancing for app UI design and web development projects. Discovered that great design requires understanding both aesthetics and the code that delivers it.',
    accent: '#4FBF8B',
    projectCount: 8,
    skillCategories: [
      {
        name: 'Frontend',
        skills: [
          { name: 'React', level: 6 },
          { name: 'JavaScript', level: 6 },
          { name: 'CSS', level: 7 },
        ],
      },
      {
        name: 'Design',
        skills: [{ name: 'Figma', level: 6 }],
      },
    ],
    technologies: ['React', 'JavaScript', 'CSS'],
    software: ['Figma'],
    tags: ['UI/UX', 'Freelance', 'Web'],
    featuredProjects: [],
    cta: null,
    media: null,
    order: 3,
    visible: true,
  },
  {
    id: 'immersive',
    year: '2025',
    title: 'Into Immersive Worlds',
    subtitle: 'XR & real-time',
    description: 'XR/VR projects and advanced real-time development work.',
    detail:
      'Shipped first XR application and contributed to VR training simulations. Architecture began to feel as important as aesthetics — and performance became non-negotiable.',
    accent: '#A47BE8',
    projectCount: 12,
    skillCategories: [
      {
        name: 'Real-time',
        skills: [
          { name: 'Unreal Engine', level: 6 },
          { name: 'Unity XR', level: 7 },
        ],
      },
      {
        name: '3D',
        skills: [{ name: 'Blender', level: 8 }],
      },
      {
        name: 'Mobile',
        skills: [{ name: 'React Native', level: 6 }],
      },
    ],
    technologies: ['Unreal Engine', 'Unity XR', 'React Native'],
    software: ['Blender'],
    tags: ['XR', 'VR', 'Real-time'],
    featuredProjects: [],
    cta: null,
    media: null,
    order: 4,
    visible: true,
  },
  {
    id: 'stack',
    year: '2026',
    title: 'Mastering the Stack',
    subtitle: 'End to end',
    description:
      'Full-stack capabilities, portfolio launch, and leveling up across disciplines.',
    detail:
      'Built this portfolio from scratch. Deepened knowledge of backend systems, motion design, and film-quality rendering pipelines — and learned to ship complete products end-to-end.',
    accent: '#E8C04C',
    projectCount: 15,
    skillCategories: [
      {
        name: 'Frontend',
        skills: [
          { name: 'Next.js', level: 9 },
          { name: 'Three.js', level: 7 },
        ],
      },
      {
        name: 'Backend',
        skills: [{ name: 'Supabase', level: 8 }],
      },
      {
        name: 'Motion',
        skills: [{ name: 'DaVinci Resolve', level: 7 }],
      },
    ],
    technologies: ['Next.js', 'Supabase', 'Three.js'],
    software: ['DaVinci Resolve'],
    tags: ['Full-stack', 'Motion', 'Rendering'],
    featuredProjects: [],
    cta: null,
    media: null,
    order: 5,
    visible: true,
  },
  {
    id: 'vision',
    year: 'FUTURE',
    title: 'The Vision',
    subtitle: 'Where this is going',
    description:
      'International studios, original IP, and building immersive worlds at scale.',
    detail:
      'The goal: ship games that millions play, XR experiences that reshape how people see virtual spaces, and build a studio that creates worlds with genuine soul.',
    accent: '#F7F0E7',
    projectCount: null,
    skillCategories: [
      {
        name: 'Real-time',
        skills: [
          { name: 'Unreal 5', level: 7 },
          { name: 'Nanite', level: 6 },
          { name: 'Lumen', level: 6 },
        ],
      },
      {
        name: 'Characters',
        skills: [{ name: 'MetaHuman', level: 5 }],
      },
    ],
    technologies: ['Unreal 5', 'Nanite', 'Lumen'],
    software: ['MetaHuman'],
    tags: ['Original IP', 'Studio', 'At scale'],
    featuredProjects: [],
    cta: { label: 'Start a conversation', href: '/comms' },
    media: null,
    order: 6,
    visible: true,
  },
];

/** What the UI consumes: visible chapters in author-defined order. */
export const JOURNEY: JourneyMilestone[] = JOURNEY_MILESTONES.filter(
  (m) => m.visible,
).sort((a, b) => a.order - b.order);
