/** @format */

import { supabase } from '@/src/lib/supabase/client';

/**
 * Read-only — writes live in the nngtw-admin app. See the note in
 * `src/features/hero/api/heroRoles.ts`.
 */

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_year: number | null;
  end_year: number | null;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export async function getEducation(): Promise<Education[]> {
  const { data, error } = await supabase
    .from('education')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return data ?? [];
}
