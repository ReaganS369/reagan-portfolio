/** @format */

import { supabase } from '@/src/lib/supabase/client';

/**
 * Read-only — writes live in the nngtw-admin app. See the note in
 * `src/features/hero/api/heroRoles.ts`.
 */

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  icon: string;
  sort_order: number;
  created_at: string;
};

export async function getSocialLinks(): Promise<SocialLink[]> {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data ?? [];
}
