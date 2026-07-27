/** @format */

import { supabase } from '@/src/lib/supabase/client';

/**
 * Read-only. The create/update/delete/reorder functions that used to live
 * here moved to the nngtw-admin app (`src/modules/portfolio`), where they
 * run server-side behind an authenticated permission check instead of
 * writing from the browser with the anon key.
 */

export type HeroRole = {
  id: string;
  title: string;
  icon_url: string;
  display_order: number;
  is_active: boolean;
};

/** Public portfolio — active roles only. */
export async function getHeroRoles(): Promise<HeroRole[]> {
  const { data, error } = await supabase
    .from('hero_roles')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;

  return data ?? [];
}
