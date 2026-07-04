/** @format */

/**
 * One-time seed for the admin-driven Skills Explorer.
 *
 * Inserts the full hierarchy into `skill_nodes` + `skill_tools` so every
 * node, rating, and tool is editable from /admin/skills afterwards. This
 * script is NOT part of the app — the frontend reads only from the database.
 *
 * Ratings were derived from the original percentage notes by scaling each
 * sibling group so its largest share = 5.0 (areas keep the exact same
 * ratios, since area = rating / sum of sibling ratings). Flat lists that
 * had no percentages are seeded with null ratings — equal areas until
 * rated in the admin.
 *
 * Usage:
 *   node scripts/seed-skills-explorer.mjs          # refuses if data exists
 *   FORCE=1 node scripts/seed-skills-explorer.mjs  # wipes and reseeds
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/* ------------------------------ env ------------------------------ */

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = {};
for (const line of readFileSync(join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2];
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
// prefer the service key, but fall back to anon if it's a placeholder
// (real Supabase keys are long JWTs; RLS policy permits anon writes here)
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const key =
  serviceKey && serviceKey.length > 40 ? serviceKey : env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing Supabase env in .env.local');
  process.exit(1);
}
const supabase = createClient(url, key);

/* --------------------------- data model --------------------------- */

/** tool: name [, rating] */
const T = (name, rating = null) => ({ name, rating });
/** node: name, rating, { children, tools, icon } */
const N = (name, rating = null, opts = {}) => ({ name, rating, ...opts });

const TREE = [
  N('Design', null, {
    icon: '🎨',
    children: [
      N('3D Design', 5.0, {
        tools: [T('Blender', 5.0), T('Unreal Engine', 4.0), T('SolidWorks', 2.7), T('Illustrator', 1.3), T('Premiere Pro', 4.4), T('After Effects', 3.5)],
        children: [
          N('Modeling', 5.0, { tools: [T('Blender'), T('SolidWorks')] }),
          N('Sculpting', 1.3, { tools: [T('Blender'), T('ZBrush')] }),
          N('Texturing', 2.6, { tools: [T('Blender'), T('Substance 3D Painter')] }),
          N('Materials', 3.2, { tools: [T('Blender Shader Editor'), T('BlenderKit'), T('Quixel Megascans'), T('Substance 3D')] }),
          N('Lighting', 3.9, { tools: [T('Blender Cycles'), T('Eevee'), T('Unreal Lumen')] }),
          N('Rendering', 3.7, { tools: [T('Blender Cycles'), T('Eevee'), T('Unreal Engine')] }),
          N('Animation', 4.2, { tools: [T('Blender')] }),
          N('3D Graphics', 2.6, { tools: [T('Blender')] }),
        ],
      }),
      N('UI/UX Design', 4.6, {
        tools: [T('Figma', 4.1), T('Microsoft PowerPoint', 5.0)],
        children: [
          N('Wireframing', 2.6, { tools: [T('Figma')] }),
          N('Prototyping', 2.4, { tools: [T('Figma')] }),
          N('Design Systems', 1.8, { tools: [T('Figma')] }),
          N('User Experience', 2.6),
          N('User Interface', 5.0, { tools: [T('Figma')] }),
          N('Responsive Design', 3.2),
        ],
      }),
      N('Graphic Design', 3.3, {
        tools: [T('Illustrator', 5.0), T('Sketchbook Pro', 3.0), T('Figma', 2.0), T('Photoshop', 3.0)],
        children: [
          N('Poster Design', 2.5),
          N('Social Media', 2.2),
          N('Print Design', 1.3),
          N('Digital Graphics', 5.0),
          N('Icon Design', 4.1),
          N('Illustration', 2.2),
          N('Marketing Assets', 4.7),
        ],
      }),
      N('Design Tools', 2.9, {
        tools: [T('Blender', 5.0), T('Figma', 4.7), T('Photoshop', 3.4), T('Illustrator', 5.0), T('SolidWorks', 2.4), T('After Effects', 2.6), T('Sketchbook Pro', 3.4)],
      }),
      N('Technical Art', 2.3, {
        tools: [T('Python', 3.8), T('JavaScript', 2.5), T('Blender')],
        children: [
          N('Optimization', 2.7),
          N('Shader Basics', 1.3),
          N('Asset Pipeline', 3.0),
          N('Materials', 2.7),
          N('UV Workflow', 2.3),
          N('Export Pipeline', 4.0),
          N('Engine Integration', 5.0, { tools: [T('Unity'), T('Unreal Engine')] }),
          N('Automation', 5.0, { tools: [T('Python')] }),
        ],
      }),
      N('Brand Design', 1.7, {
        tools: [T('Illustrator', 5.0)],
        children: [
          N('Logo Design', 3.7),
          N('Visual Identity', 1.3),
          N('Brand Guidelines', 2.6),
          N('Typography', 3.7),
          N('Color Systems', 5.0),
          N('Brand Strategy', 3.4),
          N('Marketing Identity', 1.3),
        ],
      }),
      N('Motion Design', 1.0, {
        tools: [T('After Effects', 3.3), T('Premiere Pro', 5.0)],
        children: [
          N('Motion Graphics', 1.7),
          N('UI Motion', 3.3),
          N('Transitions', 1.7),
          N('Camera Motion', 5.0),
          N('Intro Animation', 5.0),
          N('Logo Animation', 3.8),
        ],
      }),
    ],
  }),

  N('Development', null, {
    icon: '💻',
    children: [
      N('Game Development', 5.0, {
        tools: [T('Unreal Engine', 5.0), T('Unity', 4.6)],
        children: [
          N('Gameplay Programming', 2.5),
          N('AI Systems', 3.6),
          N('UI Systems', 5.0),
          N('Save Systems', 4.6),
          N('Currency System', 4.3),
          N('Game Mechanics', 3.6),
          N('Animation', 3.6),
          N('Inventory', 2.5),
          N('Multiplayer', 2.9),
          N('Optimization', 2.1),
        ],
      }),
      N('Automation', 3.5, {
        tools: [T('Python'), T('Node.js')],
        children: [
          N('Python Scripts', 3.6),
          N('Batch Processing', 5.0),
          N('Workflow Automation', 3.4),
          N('AI Automation', 4.1),
          N('Data Processing', 2.5),
          N('Asset Generation', 1.8),
          N('Web Scraping', 2.3),
        ],
      }),
      N('Web Development', 3.1, {
        tools: [T('React', 5.0), T('Next.js', 4.5), T('Supabase', 3.2), T('Firebase', 2.3), T('SQL', 2.7)],
        children: [
          N('Frontend', 5.0),
          N('Backend', 3.2),
          N('APIs', 2.5),
          N('Authentication', 2.1),
          N('Database', 2.9),
          N('Deployment', 3.6, { tools: [T('Vercel')] }),
          N('SEO', 3.9),
        ],
      }),
      N('AI Development', 2.5, {
        tools: [T('OpenAI API'), T('Claude'), T('ChatGPT')],
        children: [
          N('Prompt Engineering', 3.3),
          N('Video Generation', 1.1),
          N('AI APIs', 2.8),
          N('Image Generation', 3.9),
          N('Automation', 5.0),
          N('Agents', 3.3),
          N('Model Integration', 2.2),
        ],
      }),
      N('Development Tools', 2.5, {
        tools: [T('VS Code', 5.0), T('Cursor', 3.4), T('Git', 3.4), T('GitHub', 5.0), T('Terminal', 4.2), T('Postman', 1.6), T('Supabase', 4.2)],
      }),
      N('Mobile Development', 2.1, {
        tools: [T('React Native', 5.0), T('Android Studio', 3.3), T('Firebase', 1.7)],
        children: [
          N('Offline Support', 5.0),
          N('Publishing', 5.0),
        ],
      }),
      N('Backend Development', 2.1, {
        tools: [T('MySQL', 5.0), T('Node.js', 3.2), T('Firebase', 3.2), T('MongoDB', 0.6)],
        children: [
          N('Authentication', 5.0),
        ],
      }),
    ],
  }),

  N('Production', null, {
    icon: '🎮',
    children: [
      N('Game Development', 4.1, {
        tools: [T('Unity'), T('Unreal Engine')],
        children: [
          N('Game Design', null, { tools: [T('Notion'), T('Figma'), T('Microsoft PowerPoint')] }),
          N('Gameplay Systems', null, { tools: [T('Unity'), T('Unreal Engine')] }),
          N('Level Design', null, { tools: [T('Unity'), T('Unreal Engine'), T('Blender')] }),
          N('UI Integration', null, { tools: [T('Unity UI Toolkit'), T('Unreal UMG')] }),
          N('Testing & QA', null, { tools: [T('Unity Test Framework')] }),
          N('Balancing', null, { tools: [T('Google Sheets')] }),
          N('Deployment', null, { tools: [T('itch.io'), T('Google Play Console')] }),
        ],
      }),
      N('3D Asset Production', 5.0, {
        tools: [T('Blender'), T('SolidWorks')],
        children: [
          N('Environment Assets', null, { tools: [T('Blender')] }),
          N('Props', null, { tools: [T('Blender')] }),
          N('Characters', null, { tools: [T('Blender'), T('ZBrush')] }),
          N('Low Poly', null, { tools: [T('Blender')] }),
          N('Hard Surface', null, { tools: [T('Blender'), T('SolidWorks')] }),
          N('Optimization', null, { tools: [T('Blender')] }),
          N('Export Pipeline', null, { tools: [T('Blender')] }),
        ],
      }),
      N('Animation', 3.6, {
        tools: [T('Blender'), T('Unity'), T('Unreal Engine')],
        children: [
          N('Character Animation', null, { tools: [T('Blender')] }),
          N('Object Animation', null, { tools: [T('Blender')] }),
          N('UI Animation', null, { tools: [T('After Effects'), T('Framer Motion')] }),
          N('Camera Animation', null, { tools: [T('Blender'), T('Unreal Sequencer')] }),
          N('Rigging', null, { tools: [T('Blender')] }),
          N('Timeline', null, { tools: [T('Unity Timeline'), T('Blender')] }),
          N('Animation Polish', null, { tools: [T('Blender')] }),
          N('Sprite Animation', null, { tools: [T('Aseprite'), T('Photoshop'), T('Unity')] }),
          N('Spine Animation', null, { tools: [T('Spine 2D'), T('DragonBones')] }),
          N('Motion Tracking', null, { tools: [T('After Effects'), T('Blender Motion Tracking'), T('Unreal Engine')] }),
        ],
      }),
      N('Video Production', 3.6, {
        tools: [T('DaVinci Resolve'), T('Premiere Pro'), T('After Effects')],
        children: [
          N('Video Editing', null, { tools: [T('DaVinci Resolve'), T('Premiere Pro')] }),
          N('Color Correction', null, { tools: [T('DaVinci Resolve')] }),
          N('Motion Graphics', null, { tools: [T('After Effects')] }),
          N('Audio Editing', null, { tools: [T('DaVinci Fairlight'), T('Audacity')] }),
          N('Cinematic Editing', null, { tools: [T('DaVinci Resolve')] }),
          N('Export Workflow', null, { tools: [T('DaVinci Resolve')] }),
          N('Storytelling', null),
          N('Storyboarding', null, { tools: [T('Storyboarder'), T('Figma'), T('Photoshop'), T('Microsoft PowerPoint')] }),
        ],
      }),
      N('Rendering', 4.1, {
        tools: [T('Blender Cycles'), T('Eevee'), T('Unreal Engine')],
        children: [
          N('Real-time Rendering', null, { tools: [T('Eevee'), T('Unreal Engine')] }),
          N('Offline Rendering', null, { tools: [T('Blender Cycles')] }),
          N('Lighting', null, { tools: [T('Blender Cycles'), T('Eevee'), T('Unreal Lumen')] }),
          N('Materials', null, { tools: [T('Blender Shader Editor'), T('BlenderKit'), T('Quixel Megascans'), T('Substance 3D')] }),
          N('Camera Composition', null, { tools: [T('Blender')] }),
          N('Render Optimization', null, { tools: [T('Blender')] }),
          N('Post Processing', null, { tools: [T('After Effects'), T('DaVinci Resolve')] }),
        ],
      }),
      N('Production Pipeline', 2.3, {
        tools: [T('Git'), T('GitHub'), T('Trello / Notion')],
        children: [
          N('Planning', null, { tools: [T('Notion'), T('Trello')] }),
          N('Version Control', null, { tools: [T('Git'), T('GitHub')] }),
          N('Asset Management', null, { tools: [T('Notion')] }),
          N('File Organization', null),
          N('Build Pipeline', null, { tools: [T('GitHub Actions')] }),
          N('Quality Assurance', null),
          N('Delivery', null),
        ],
      }),
    ],
  }),

  N('Intelligence', null, {
    icon: '🧠',
    children: [
      N('Research', 5.0, {
        tools: [T('ChatGPT'), T('Gemini'), T('Perplexity')],
        children: [
          N('Technical Research', null),
          N('Design Research', null),
          N('AI Research', null),
          N('Market Research', null),
          N('Competitive Analysis', null),
          N('Documentation Review', null),
          N('Experimentation', null),
        ],
      }),
      N('Strategic Thinking', 4.7, {
        tools: [T('Notion'), T('Miro')],
        children: [
          N('Long-term Planning', null),
          N('Roadmapping', null),
          N('System Architecture', null),
          N('Decision Making', null),
          N('Risk Analysis', null),
          N('Prioritization', null),
          N('Resource Planning', null),
        ],
      }),
      N('Creativity', 4.7, {
        tools: [T('Miro'), T('Milanote')],
        children: [
          N('Ideation', null),
          N('Concept Development', null),
          N('Visual Thinking', null),
          N('Innovation', null),
          N('Brainstorming', null),
          N('Storytelling', null),
          N('Creative Direction', null),
        ],
      }),
      N('Attention to Detail', 4.7, {
        tools: [T('Figma'), T('ESLint')],
        children: [
          N('Pixel Precision', null),
          N('Code Quality', null),
          N('UI Consistency', null),
          N('Naming Standards', null),
          N('Quality Control', null),
          N('Visual Accuracy', null),
          N('Debug Review', null),
        ],
      }),
      N('Continuous Learning', 3.8, {
        tools: [T('YouTube'), T('Udemy')],
        children: [
          N('Self Learning', null),
          N('Online Courses', null),
          N('Documentation', null),
          N('Experimentation', null),
          N('Reverse Engineering', null),
          N('Daily Practice', null),
          N('Skill Expansion', null),
        ],
      }),
      N('Problem Solving', 3.5, {
        tools: [T('Chrome DevTools'), T('VS Code Debugger')],
        children: [
          N('Debugging', null),
          N('Logical Analysis', null),
          N('Optimization', null),
          N('Root Cause Analysis', null),
          N('Troubleshooting', null),
          N('Algorithmic Thinking', null),
          N('Critical Decisions', null),
        ],
      }),
      N('Systems Thinking', 2.9, {
        tools: [T('Miro'), T('Notion')],
        children: [
          N('Workflow Design', null),
          N('Pipeline Design', null),
          N('Modular Architecture', null),
          N('Automation Planning', null),
          N('Scalability', null),
          N('Process Improvement', null),
          N('Integration', null),
        ],
      }),
    ],
  }),

  N('Technology', null, {
    icon: '⚙️',
    children: [
      N('Software & Tools', 5.0, {
        children: [
          N('Blender', null),
          N('Figma', null),
          N('Photoshop', null),
          N('Illustrator', null),
          N('DaVinci Resolve', null),
          N('SolidWorks', null),
          N('VS Code', null),
          N('Cursor', null),
        ],
      }),
      N('Game Engines', 4.2, {
        children: [
          N('Unity', null),
          N('Unreal Engine', null),
        ],
      }),
      N('AI Platforms', 4.0, {
        children: [
          N('ChatGPT', null),
          N('Claude', null),
          N('Gemini', null),
          N('GitHub Copilot', null),
          N('Cursor AI', null),
          N('OpenAI API', null),
          N('Google AI', null),
        ],
      }),
      N('Databases', 2.9, {
        children: [
          N('Firebase', null),
          N('MySQL', null),
          N('MongoDB', null),
          N('Supabase', null),
        ],
      }),
      N('Frameworks & Libraries', 2.7, {
        children: [
          N('React', null),
          N('React Native', null),
          N('Next.js', null),
          N('Node.js', null),
          N('Tailwind CSS', null),
          N('Framer Motion', null),
        ],
      }),
      N('Programming Languages', 2.1, {
        children: [
          N('JavaScript', null),
          N('TypeScript', null),
          N('C#', null),
          N('C++', null),
          N('Python', null),
          N('SQL', null),
        ],
      }),
    ],
  }),

  N('Communication', null, {
    icon: '🤝',
    children: [
      N('Documentation', 5.0, {
        tools: [T('Notion'), T('Markdown'), T('Google Docs')],
        children: [
          N('Technical Documentation', null),
          N('Project Documentation', null),
          N('API Documentation', null),
          N('User Guides', null),
          N('Development Notes', null),
          N('Reports', null),
          N('Knowledge Sharing', null),
        ],
      }),
      N('Presentation', 3.8, {
        tools: [T('Microsoft PowerPoint'), T('Figma'), T('Tome')],
        children: [
          N('Public Speaking', null),
          N('Technical Demonstration', null),
          N('Project Showcase', null),
          N('Pitching', null),
          N('Slide Design', null),
          N('Teaching', null),
          N('Workshops', null),
        ],
      }),
      N('Leadership', 3.3, {
        tools: [T('Notion'), T('Trello')],
        children: [
          N('Team Guidance', null),
          N('Project Ownership', null),
          N('Decision Making', null),
          N('Task Planning', null),
          N('Mentoring', null),
          N('Conflict Resolution', null),
          N('Vision Setting', null),
        ],
      }),
      N('Team Collaboration', 2.9, {
        tools: [T('GitHub'), T('Discord'), T('Google Meet')],
        children: [
          N('Agile Workflow', null),
          N('Communication', null),
          N('Code Reviews', null),
          N('Design Reviews', null),
          N('Feedback', null),
          N('Task Coordination', null),
          N('Remote Collaboration', null),
        ],
      }),
      N('Client Communication', 2.5, {
        tools: [T('Google Meet'), T('Gmail'), T('WhatsApp')],
        children: [
          N('Requirement Gathering', null),
          N('Progress Updates', null),
          N('Technical Explanation', null),
          N('Meetings', null),
          N('Feedback Handling', null),
          N('Proposal Writing', null),
          N('Delivery', null),
        ],
      }),
      N('Languages', 1.9, {
        children: [
          N('Manipuri', 5.0),
          N('English', 3.0),
          N('Hindi', 1.0),
          N('Japanese', 0.7),
          N('Korean', 0.5),
        ],
      }),
    ],
  }),
];

/* ---------------------------- seeding ---------------------------- */

const toolRows = [];
let nodeCount = 0;

async function insertGroup(defs, parentId, level) {
  if (defs.length === 0) return;

  const rows = defs.map((d, i) => ({
    parent_id: parentId,
    level,
    name: d.name,
    icon: d.icon ?? null,
    rating: d.rating ?? null,
    sort_order: i,
    is_active: true,
  }));

  const { data, error } = await supabase.from('skill_nodes').insert(rows).select('*');
  if (error) throw new Error(`insert nodes (level ${level}): ${error.message}`);

  const bySort = new Map(data.map((r) => [r.sort_order, r]));
  for (let i = 0; i < defs.length; i++) {
    const def = defs[i];
    const row = bySort.get(i);
    if (!row) throw new Error(`missing inserted row for ${def.name}`);
    nodeCount++;

    for (let t = 0; t < (def.tools ?? []).length; t++) {
      const tool = def.tools[t];
      toolRows.push({
        skill_node_id: row.id,
        name: tool.name,
        rating: tool.rating ?? null,
        sort_order: t,
      });
    }

    if (def.children?.length) {
      await insertGroup(def.children, row.id, level + 1);
    }
  }
}

async function main() {
  const { count, error: countError } = await supabase
    .from('skill_nodes')
    .select('id', { count: 'exact', head: true });
  if (countError) throw new Error(`count check: ${countError.message}`);

  if ((count ?? 0) > 0) {
    if (!process.env.FORCE) {
      console.error(
        `skill_nodes already has ${count} rows. Re-run with FORCE=1 to wipe and reseed.`,
      );
      process.exit(1);
    }
    console.log(`FORCE=1 — deleting ${count} existing nodes (cascade removes children + tools)…`);
    const { error: delError } = await supabase
      .from('skill_nodes')
      .delete()
      .is('parent_id', null);
    if (delError) throw new Error(`wipe: ${delError.message}`);
  }

  await insertGroup(TREE, null, 0);

  for (let i = 0; i < toolRows.length; i += 100) {
    const chunk = toolRows.slice(i, i + 100);
    const { error } = await supabase.from('skill_tools').insert(chunk);
    if (error) throw new Error(`insert tools: ${error.message}`);
  }

  console.log(`Seeded ${nodeCount} skill nodes and ${toolRows.length} tools.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
