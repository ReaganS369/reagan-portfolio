/** @format */

import { supabase } from '@/src/lib/supabase/client';

export type HeroRole = {
  id: string;
  title: string;
  icon_url: string;
  display_order: number;
  is_active: boolean;
};

export type HeroRoleInput = {
  title: string;
  icon_url: string;
  display_order: number;
  is_active: boolean;
};

export type HeroRoleUpdate = Partial<HeroRoleInput>;

function sortByDisplayOrder(roles: HeroRole[]): HeroRole[] {
  return [...roles].sort((a, b) => a.display_order - b.display_order);
}

/** Public portfolio — active roles only (unchanged contract). */
export async function getHeroRoles(): Promise<HeroRole[]> {
  const { data, error } = await supabase
    .from('hero_roles')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;

  return data ?? [];
}

/** Admin — all roles, active and inactive. */
export async function getAllHeroRoles(): Promise<HeroRole[]> {
  const { data, error } = await supabase
    .from('hero_roles')
    .select('*')
    .order('display_order');

  if (error) throw error;

  return sortByDisplayOrder(data ?? []);
}

export async function createHeroRole(input: HeroRoleInput): Promise<HeroRole> {
  const { data, error } = await supabase
    .from('hero_roles')
    .insert(input)
    .select('*')
    .single();

  if (error) throw error;

  return data;
}

export async function updateHeroRole(
  id: string,
  input: HeroRoleUpdate,
): Promise<HeroRole> {
  const { data, error } = await supabase
    .from('hero_roles')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return data;
}

export async function deleteHeroRole(id: string): Promise<void> {
  const { error } = await supabase.from('hero_roles').delete().eq('id', id);

  if (error) throw error;
}

export async function swapHeroRoleOrder(
  roles: HeroRole[],
  id: string,
  direction: 'up' | 'down',
): Promise<HeroRole[]> {
  const sorted = sortByDisplayOrder(roles);
  const index = sorted.findIndex((role) => role.id === id);

  if (index === -1) {
    throw new Error('Role not found');
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= sorted.length) {
    return sorted;
  }

  const current = sorted[index];
  const neighbor = sorted[targetIndex];

  const [updatedCurrent, updatedNeighbor] = await Promise.all([
    updateHeroRole(current.id, { display_order: neighbor.display_order }),
    updateHeroRole(neighbor.id, { display_order: current.display_order }),
  ]);

  return sortByDisplayOrder(
    sorted.map((role) => {
      if (role.id === updatedCurrent.id) return updatedCurrent;
      if (role.id === updatedNeighbor.id) return updatedNeighbor;
      return role;
    }),
  );
}
