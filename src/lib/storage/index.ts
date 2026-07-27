/** @format */

const STORAGE_BUCKET = 'nngtw-assets';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/**
 * URL resolution only. The upload/delete helpers that used to live here
 * (hero role and social link SVG icons) moved to the nngtw-admin app,
 * where they run server-side after a permission check — see
 * `src/modules/portfolio/services/assets.service.ts` there. This file no
 * longer needs a Supabase client at all.
 */
export function getStorageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}
