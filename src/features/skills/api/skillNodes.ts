/** @format */

import { supabase } from '@/src/lib/supabase/client';

/**
 * Read-only — writes (including the tree-move that recalculates `level`)
 * live in the nngtw-admin app. See the note in
 * `src/features/hero/api/heroRoles.ts`.
 */

export type SkillNodeRow = {
  id: string;
  parent_id: string | null;
  level: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  rating: number | null;
  sort_order: number;
  is_active: boolean;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

/** Fetches the entire tree flat — callers build hierarchy client-side. */
export async function getAllSkillNodes(): Promise<SkillNodeRow[]> {
  const { data, error } = await supabase
    .from('skill_nodes')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return data ?? [];
}
