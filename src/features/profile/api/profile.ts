/** @format */

import { supabase } from '@/src/lib/supabase/client';

export async function getProfile() {
  const { data, error } = await supabase.from('profiles').select('*').single();

  if (error) throw error;

  return data;
}
