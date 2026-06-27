/** @format */

import { supabase } from '../supabase/client';

const STORAGE_BUCKET = 'nngtw-assets';
const HERO_ICONS_PREFIX = 'icons/portfolio-roles';
const SOCIAL_LINKS_ICONS_PREFIX = 'icons/social-links';

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

export async function uploadSocialLinkIcon(file: File): Promise<string> {
  const isSvg =
    file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

  if (!isSvg) {
    throw new Error('Only SVG files are allowed.');
  }

  const path = `${SOCIAL_LINKS_ICONS_PREFIX}/${crypto.randomUUID()}.svg`;

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

  return getStorageUrl(path);
}

export function getStoragePathFromUrl(url: string): string | null {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`;
  if (!url.startsWith(prefix)) {
    return null;
  }

  return url.slice(prefix.length);
}

export async function deleteStorageObject(path: string): Promise<void> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

  if (error) throw error;
}
