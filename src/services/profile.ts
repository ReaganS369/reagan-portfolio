/** @format */

import { supabase } from '../lib/supabase';

export async function getProfile() {
  const { data, error } = await supabase.from('profiles').select('*').single();

  if (error) throw error;

  return data;
}
