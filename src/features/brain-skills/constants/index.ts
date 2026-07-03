/** @format */

export interface Skill {
  name: string;
  angle: number;
  ring: number; // 1 = inner, 2 = outer
}

export const DESIGN_SKILLS: Skill[] = [
  { name: 'Blender', angle: 0, ring: 1 },
  { name: 'Figma', angle: 60, ring: 1 },
  { name: 'Illustrator', angle: 120, ring: 1 },
  { name: 'Photoshop', angle: 180, ring: 1 },
  { name: 'DaVinci Resolve', angle: 240, ring: 1 },
  { name: 'After Effects', angle: 300, ring: 1 },
  { name: 'Substance', angle: 30, ring: 2 },
  { name: 'Premiere', angle: 150, ring: 2 },
  { name: 'ZBrush', angle: 270, ring: 2 },
];

export const DEV_SKILLS: Skill[] = [
  { name: 'Unreal Engine', angle: 0, ring: 1 },
  { name: 'Unity', angle: 45, ring: 1 },
  { name: 'React', angle: 90, ring: 1 },
  { name: 'React Native', angle: 135, ring: 1 },
  { name: 'C#', angle: 180, ring: 1 },
  { name: 'JavaScript', angle: 225, ring: 1 },
  { name: 'Firebase', angle: 270, ring: 1 },
  { name: 'MySQL', angle: 315, ring: 1 },
  { name: 'Next.js', angle: 20, ring: 2 },
  { name: 'TypeScript', angle: 110, ring: 2 },
  { name: 'Three.js', angle: 200, ring: 2 },
  { name: 'Supabase', angle: 290, ring: 2 },
];
