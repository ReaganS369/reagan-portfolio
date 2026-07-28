/** @format */

import { supabase } from '@/src/lib/supabase/client';

/**
 * The portfolio owner's profile row.
 *
 * `profiles` is no longer this site's alone — the CMS split out into
 * nngtw-admin shares the same Supabase project and adds its own row. A plain
 * `.single()` therefore fails with PGRST116 ("cannot coerce the result to a
 * single JSON object") the moment a second row exists, which silently nulls
 * the profile and takes the hero portrait down with it.
 *
 * Oldest row wins: this site's profile predates every other consumer of the
 * table, and ordering makes the pick deterministic rather than dependent on
 * whatever order Postgres happens to return. `maybeSingle` keeps an empty
 * table from throwing.
 */
export async function getProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
}
