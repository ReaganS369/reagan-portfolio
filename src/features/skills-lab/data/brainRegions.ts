/** @format */

import { supabase } from '@/src/lib/supabase/client';
import { getStorageUrl } from '@/src/lib/storage';
import type { BrainRegion } from './brainTypes';

/**
 * Read-only — writes live in the nngtw-admin app (Portfolio → Brain Regions).
 * See the note in `src/features/skills/api/skillNodes.ts`.
 */

type BrainRegionRow = {
  id: string;
  mesh_name: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon: string | null;
  color: string | null;
  display_order: number;
  is_active: boolean;
};

type BrainModelRow = {
  storage_path: string;
  updated_at: string;
};

function toBrainRegion(row: BrainRegionRow): BrainRegion {
  return {
    id: row.id,
    meshName: row.mesh_name,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    icon: row.icon,
    color: row.color,
    displayOrder: row.display_order,
  };
}

/** Active regions only, in curated display order. */
export async function getBrainRegions(): Promise<BrainRegion[]> {
  const { data, error } = await supabase
    .from('brain_regions')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return (data ?? []).map(toBrainRegion);
}

/**
 * The currently-active GLB, cache-busted by its `updated_at` so a model swap
 * in the admin shows up on the next page load without a redeploy.
 */
export async function getActiveBrainModelUrl(): Promise<string | null> {
  const { data, error } = await supabase
    .from('brain_model')
    .select('storage_path, updated_at')
    .eq('id', 1)
    .maybeSingle<BrainModelRow>();

  if (error) throw error;
  if (!data) return null;

  const url = getStorageUrl(data.storage_path);
  const version = encodeURIComponent(data.updated_at);
  return `${url}?v=${version}`;
}
