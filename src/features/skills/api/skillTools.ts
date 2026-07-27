/** @format */

import { supabase } from '@/src/lib/supabase/client';

/**
 * Read-only — writes live in the nngtw-admin app. See the note in
 * `src/features/hero/api/heroRoles.ts`.
 */

export type SkillToolRow = {
  id: string;
  skill_node_id: string;
  name: string;
  icon: string | null;
  rating: number | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
};

export async function getAllSkillTools(): Promise<SkillToolRow[]> {
  const { data, error } = await supabase
    .from('skill_tools')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return data ?? [];
}
