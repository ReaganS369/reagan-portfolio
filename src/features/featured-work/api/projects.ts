/** @format */

import { supabase } from '@/src/lib/supabase/client';

export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string | null;
  project_url: string | null;
  sort_order: number;
  created_at: string;
};

function sortByOrder(items: Project[]): Project[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

/** Public portfolio — all projects, ordered for display. */
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order');

  if (error) throw error;

  return sortByOrder(data ?? []);
}
