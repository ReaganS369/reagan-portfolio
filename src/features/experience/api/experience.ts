/** @format */

import { supabase } from '@/src/lib/supabase/client';

/**
 * Read-only — writes live in the nngtw-admin app. See the note in
 * `src/features/hero/api/heroRoles.ts`.
 */

export type Experience = {
  id: string;
  company: string;
  position: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean;
  sort_order: number;
  created_at: string;
};

export async function getExperience(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from('experience')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return data ?? [];
}
