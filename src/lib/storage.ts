/** @format */

import { supabase } from './supabase';

const STORAGE_BUCKET = 'nngtw-assets';
const HERO_ICONS_PREFIX = 'icons/portfolio-roles';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function getStorageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

export async function uploadHeroRoleIcon(file: File): Promise<string> {
  const isSvg =
    file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

  if (!isSvg) {
    throw new Error('Only SVG files are allowed.');
  }

  const path = `${HERO_ICONS_PREFIX}/${crypto.randomUUID()}.svg`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType: 'image/svg+xml',
      upsert: false,
    });

  if (error) {
    console.error(JSON.stringify(error, null, 2));
    throw error;
  }

  return path;
}

export async function deleteStorageObject(path: string): Promise<void> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

  if (error) throw error;
}
