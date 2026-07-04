/** @format */

import { getAllSkillNodes } from '@/src/features/skills/api/skillNodes';
import { getAllSkillTools } from '@/src/features/skills/api/skillTools';
import { buildSkillTree, type SkillTreeNode } from '@/src/features/skills/lib/tree';
import type { ExplorerNode, ExplorerTool } from './explorerTypes';

/** Un-rated (or zero-rated) nodes still get a fair sliver instead of vanishing. */
const MIN_WEIGHT = 0.5;

function toWeight(rating: number | null): number {
  return rating && rating > 0 ? rating : MIN_WEIGHT;
}

function toExplorerNode(
  node: SkillTreeNode,
  toolsByNode: Map<string, ExplorerTool[]>,
): ExplorerNode | null {
  if (!node.is_active) return null;

  const children = node.children
    .map((c) => toExplorerNode(c, toolsByNode))
    .filter((c): c is ExplorerNode => c !== null);

  return {
    id: node.id,
    label: node.name,
    weight: toWeight(node.rating),
    rating: node.rating,
    description: node.description,
    icon: node.icon,
    color: node.color,
    tools: toolsByNode.get(node.id) ?? [],
    children: children.length > 0 ? children : undefined,
  };
}

/**
 * Loads the entire Skills Explorer hierarchy from Supabase and shapes it into
 * the tree the 3D explorer renders. No hierarchy, percentages, or tool lists
 * live in frontend code — everything here is admin-authored data.
 */
export async function loadExplorerTree(): Promise<ExplorerNode> {
  const [nodes, tools] = await Promise.all([getAllSkillNodes(), getAllSkillTools()]);

  const toolsByNode = new Map<string, ExplorerTool[]>();
  for (const t of tools) {
    const list = toolsByNode.get(t.skill_node_id) ?? [];
    list.push({ id: t.id, name: t.name, icon: t.icon, rating: t.rating });
    toolsByNode.set(t.skill_node_id, list);
  }

  const roots = buildSkillTree(nodes.filter((n) => n.is_active));
  const children = roots
    .map((r) => toExplorerNode(r, toolsByNode))
    .filter((c): c is ExplorerNode => c !== null);

  return {
    id: 'root',
    label: 'Knowledge Core',
    weight: 1,
    rating: null,
    description: null,
    icon: null,
    color: null,
    tools: [],
    children: children.length > 0 ? children : undefined,
  };
}
