/** @format */

import { supabase } from '@/src/lib/supabase/client';

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  icon: string;
  sort_order: number;
  created_at: string;
};

export type SocialLinkInput = {
  platform: string;
  url: string;
  icon: string;
  sort_order: number;
};

export type SocialLinkUpdate = Partial<SocialLinkInput>;

export async function getSocialLinks(): Promise<SocialLink[]> {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export async function createSocialLink(
  input: SocialLinkInput,
): Promise<SocialLink> {
  const { data, error } = await supabase
    .from('social_links')
    .insert(input)
    .select('*')
    .single();

  if (error) throw error;

  return data;
}

export async function updateSocialLink(
  id: string,
  input: SocialLinkUpdate,
): Promise<SocialLink> {
  const { data, error } = await supabase
    .from('social_links')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return data;
}

export async function deleteSocialLink(id: string): Promise<void> {
  const { error } = await supabase.from('social_links').delete().eq('id', id);

  if (error) throw error;
}
