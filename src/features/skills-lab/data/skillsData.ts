/** @format */

/**
 * Single source of truth for the Skills Lab experience.
 * Both the avatar (body regions) and the 3D companion model (categories)
 * render from this data — different visualization, same information.
 */

export interface SkillNode {
  id: string;
  label: string;
  /** 1–10 — drives visual size (larger = stronger) */
  weight: number;
  blurb?: string;
  examples?: string[];
  children?: SkillNode[];
}

export type RegionId =
  | 'head'
  | 'eyes'
  | 'ears'
  | 'mouth'
  | 'neck'
  | 'shoulders'
  | 'heart'
  | 'hands'
  | 'torso'
  | 'legs'
  | 'feet';

export interface BodyRegion {
  id: RegionId;
  label: string;
  tagline: string;
  /** camera focus rect in avatar viewBox coords (0 0 600 900) */
  focus: { x: number; y: number; w: number; h: number };
  nodes: SkillNode[];
}

/* ---------------------------------- helpers --------------------------------- */

const node = (
  id: string,
  label: string,
  weight: number,
  extra: Partial<SkillNode> = {}
): SkillNode => ({ id, label, weight, ...extra });

/* ------------------------------- skill trees -------------------------------- */

const programming: SkillNode = node('programming', 'Programming', 9, {
  blurb: 'Building interactive systems from engine code to the web.',
  children: [
    node('javascript', 'JavaScript', 9, {
      blurb: 'Primary language for web and tooling.',
      children: [
        node('react', 'React', 9, {
          blurb: 'Component-driven UI with hooks and motion.',
          children: [
            node('nextjs', 'Next.js', 8, {
              blurb: 'App Router, server components, full-stack apps.',
              examples: ['This portfolio', 'Studio site (NNGTW)', 'CMS dashboards'],
            }),
            node('react-native', 'React Native', 7, {
              examples: ['Mobile prototypes', 'Cross-platform apps'],
            }),
          ],
        }),
        node('typescript', 'TypeScript', 8, {
          blurb: 'Types as design tools — safer, faster iteration.',
        }),
      ],
    }),
    node('csharp', 'C#', 8, {
      blurb: 'Gameplay systems, editor tooling, simulations.',
      children: [
        node('unity', 'Unity', 8, {
          examples: ['Gameplay prototypes', 'Tools & editor extensions'],
        }),
      ],
    }),
    node('backend', 'Backend & Data', 7, {
      children: [
        node('supabase', 'Supabase', 7, { examples: ['Portfolio CMS', 'Auth flows'] }),
        node('firebase', 'Firebase', 7),
        node('mysql', 'MySQL', 6),
      ],
    }),
  ],
});

const gamedev: SkillNode = node('game-dev', 'Game Development', 9, {
  blurb: 'From mechanic sketches to playable, polished builds.',
  children: [
    node('unreal', 'Unreal Engine', 8, {
      examples: ['Blueprints', 'Cinematics', 'Level design'],
    }),
    node('game-design', 'Game Design', 9, {
      blurb: 'Mechanics, economies, pacing, player psychology.',
      examples: ['Design docs', 'Prototyped mechanics', 'Balancing passes'],
    }),
    node('system-design', 'System Design', 8, {
      blurb: 'Architecting systems that scale with content.',
    }),
  ],
});

const creative: SkillNode = node('creative-thinking', 'Creative Thinking', 10, {
  blurb: 'Ideas first — worlds, mechanics, visuals, stories.',
  children: [
    node('concepting', 'Concepting', 9, { examples: ['World-building', 'Moodboards'] }),
    node('storytelling', 'Storytelling', 8),
    node('innovation', 'Innovation', 8),
  ],
});

const problemSolving: SkillNode = node('problem-solving', 'Problem Solving', 9, {
  blurb: 'Debugging reality — technical or human.',
  children: [
    node('debugging', 'Debugging', 9),
    node('optimization', 'Optimization', 7),
    node('rapid-iteration', 'Rapid Iteration', 8),
  ],
});

const planning: SkillNode = node('planning', 'Planning', 7, {
  blurb: 'Roadmaps, scoping, and milestones that survive contact.',
});

const leadership: SkillNode = node('leadership', 'Leadership', 8, {
  blurb: 'Leading small teams through ambiguous creative work.',
  children: [
    node('team-direction', 'Team Direction', 8),
    node('mentoring', 'Mentoring', 7),
    node('decision-making', 'Decision Making', 8),
  ],
});

/* --------------------------------- regions ---------------------------------- */

export const BODY_REGIONS: BodyRegion[] = [
  {
    id: 'head',
    label: 'Brain',
    tagline: 'How I think',
    focus: { x: 210, y: 30, w: 180, h: 180 },
    nodes: [
      creative,
      node('technical-thinking', 'Technical Thinking', 9, {
        blurb: 'Engineering mindset — systems, constraints, tradeoffs.',
        children: [programming, gamedev],
      }),
      problemSolving,
      node('game-design-zone', 'Game Design', 9, {
        blurb: 'Designing play itself.',
        children: [gamedev],
      }),
      node('system-design-zone', 'System Design', 8),
      planning,
      leadership,
    ],
  },
  {
    id: 'eyes',
    label: 'Eyes',
    tagline: 'What I notice',
    focus: { x: 240, y: 80, w: 120, h: 70 },
    nodes: [
      node('detail', 'Attention to Detail', 9, {
        examples: ['Pixel-perfect UI passes', 'Animation timing reviews'],
      }),
      node('observation', 'Observation', 8),
      node('visual-analysis', 'Visual Analysis', 8, {
        examples: ['Art direction critique', 'Reference breakdowns'],
      }),
      node('qa', 'Quality Assurance', 7, { examples: ['Playtest passes', 'Bug triage'] }),
      node('pixel-precision', 'Pixel Precision', 8),
    ],
  },
  {
    id: 'ears',
    label: 'Ears',
    tagline: 'How I listen',
    focus: { x: 210, y: 75, w: 180, h: 90 },
    nodes: [
      node('feedback', 'Taking Feedback', 8, {
        examples: ['Design reviews', 'Playtest feedback loops'],
      }),
      node('active-listening', 'Active Listening', 8),
      node('audio-sense', 'Audio Sensibility', 6, { examples: ['Sound design taste'] }),
    ],
  },
  {
    id: 'mouth',
    label: 'Mouth',
    tagline: 'How I communicate',
    focus: { x: 255, y: 125, w: 90, h: 60 },
    nodes: [
      node('written', 'Written Communication', 8, {
        examples: ['Design docs', 'Technical write-ups'],
      }),
      node('spoken', 'Spoken Communication', 7),
      node('presentation', 'Presentation', 7, { examples: ['Pitches', 'Demos'] }),
      node('documentation', 'Documentation', 8),
      node('collaboration', 'Team Collaboration', 8),
      node('english', 'English', 9),
      node('manipuri', 'Manipuri', 10),
      node('hindi', 'Hindi', 7),
    ],
  },
  {
    id: 'neck',
    label: 'Neck',
    tagline: 'How I adapt',
    focus: { x: 250, y: 165, w: 100, h: 70 },
    nodes: [
      node('adaptability', 'Adaptability', 8),
      node('context-switching', 'Context Switching', 7),
    ],
  },
  {
    id: 'shoulders',
    label: 'Shoulders',
    tagline: 'What I carry',
    focus: { x: 150, y: 190, w: 300, h: 120 },
    nodes: [
      node('responsibility', 'Responsibility', 9),
      node('ownership', 'Ownership', 8, { examples: ['Solo-shipped projects'] }),
      node('pressure', 'Working Under Pressure', 7),
    ],
  },
  {
    id: 'heart',
    label: 'Heart',
    tagline: 'What drives me',
    focus: { x: 260, y: 250, w: 110, h: 110 },
    nodes: [
      node('passion-gamedev', 'Game Development', 10),
      node('passion-animation', 'Animation', 9),
      node('passion-tech', 'Technology', 9),
      node('passion-learning', 'Learning', 9),
      node('passion-leadership', 'Leadership', 7),
      node('passion-innovation', 'Innovation', 8),
    ],
  },
  {
    id: 'hands',
    label: 'Hands',
    tagline: 'What I make',
    focus: { x: 40, y: 390, w: 220, h: 220 },
    nodes: [
      node('3d-modeling', '3D Modeling', 8, {
        examples: ['Blender', 'ZBrush', 'Substance'],
        children: [
          node('blender', 'Blender', 8),
          node('zbrush', 'ZBrush', 6),
          node('substance', 'Substance', 6),
        ],
      }),
      node('animation', 'Animation', 8, {
        examples: ['Character animation', 'Motion graphics', 'After Effects'],
      }),
      node('graphic-design', 'Graphic Design', 8, {
        children: [
          node('figma', 'Figma', 8),
          node('illustrator', 'Illustrator', 7),
          node('photoshop', 'Photoshop', 8),
        ],
      }),
      node('technical-art', 'Technical Art', 7, {
        examples: ['Shaders', 'Procedural tools'],
      }),
      node('ui-design', 'UI Design', 8),
      node('prototyping', 'Rapid Prototyping', 9),
    ],
  },
  {
    id: 'torso',
    label: 'Core',
    tagline: 'How I hold it together',
    focus: { x: 200, y: 250, w: 200, h: 260 },
    nodes: [
      node('systems-core', 'Systems Thinking', 8),
      node('organization', 'Organization', 7),
      node('resilience', 'Resilience', 8),
    ],
  },
  {
    id: 'legs',
    label: 'Legs',
    tagline: 'How I deliver',
    focus: { x: 190, y: 500, w: 220, h: 260 },
    nodes: [
      node('execution', 'Execution', 9),
      node('consistency', 'Consistency', 8),
      node('delivery', 'Delivery', 8, { examples: ['Shipped projects end-to-end'] }),
      node('long-term', 'Long-term Projects', 8),
      node('production', 'Production', 7),
    ],
  },
  {
    id: 'feet',
    label: 'Feet',
    tagline: 'What I stand on',
    focus: { x: 180, y: 740, w: 240, h: 130 },
    nodes: [
      node('foundation', 'Foundation', 9),
      node('discipline', 'Discipline', 8),
      node('reliability', 'Reliability', 9),
      node('growth', 'Growth', 9),
      node('continuous-learning', 'Continuous Learning', 10),
    ],
  },
];

/* -------------------------- companion model categories ----------------------- */

export interface Category {
  id: string;
  label: string;
  /** body region this category lives in — clicking syncs both views */
  region: RegionId;
  /** node id inside the region to open directly (optional) */
  nodeId?: string;
  weight: number;
}

export const CATEGORIES: Category[] = [
  { id: 'cat-programming', label: 'Programming', region: 'head', nodeId: 'technical-thinking', weight: 9 },
  { id: 'cat-software', label: 'Software', region: 'hands', nodeId: 'graphic-design', weight: 8 },
  { id: 'cat-gamedev', label: 'Game Dev', region: 'head', nodeId: 'game-design-zone', weight: 9 },
  { id: 'cat-languages', label: 'Languages', region: 'mouth', weight: 8 },
  { id: 'cat-soft', label: 'Soft Skills', region: 'shoulders', weight: 8 },
  { id: 'cat-leadership', label: 'Leadership', region: 'head', nodeId: 'leadership', weight: 8 },
  { id: 'cat-creative', label: 'Creative', region: 'head', nodeId: 'creative-thinking', weight: 10 },
  { id: 'cat-technical', label: 'Technical', region: 'legs', weight: 8 },
  { id: 'cat-ai', label: 'AI', region: 'eyes', weight: 7 },
  { id: 'cat-3d', label: '3D', region: 'hands', nodeId: '3d-modeling', weight: 8 },
  { id: 'cat-design', label: 'Design', region: 'hands', nodeId: 'ui-design', weight: 8 },
];

/* --------------------------------- lookups ----------------------------------- */

export function getRegion(id: RegionId): BodyRegion {
  return BODY_REGIONS.find((r) => r.id === id)!;
}

/** Resolve a breadcrumb path of node ids inside a region to actual nodes. */
export function resolvePath(region: BodyRegion, path: string[]): SkillNode[] {
  const out: SkillNode[] = [];
  let pool: SkillNode[] | undefined = region.nodes;
  for (const id of path) {
    const found: SkillNode | undefined = pool?.find((n) => n.id === id);
    if (!found) break;
    out.push(found);
    pool = found.children;
  }
  return out;
}
