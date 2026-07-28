/** @format */

'use client';

import { usePathname } from 'next/navigation';

import { HeroNavigationRibbon } from '@/src/features/hero/components/public/HeroNavigationRibbon';
import { HeroCVRibbon } from '@/src/features/hero/components/public/HeroCVRibbon';

/**
 * The pinned nav bar, mounted once for the whole site.
 *
 * On the home page the two ribbons start as the hero's crossed diagonals and
 * flatten into the bar as you scroll past it. Everywhere else that flourish has
 * nothing to play against, so they mount already flat — same bar, same links,
 * no entrance.
 *
 * `key` matters: the ribbons decide their starting phase on mount, so a route
 * change between the two modes has to remount them rather than leave one stuck
 * mid-dock.
 */
export function SiteNav() {
  const pathname = usePathname();

  // Reserved for any future non-public surface mounted under this layout.
  if (pathname?.startsWith('/admin')) return null;

  const animated = pathname === '/';
  const mode = animated ? 'hero' : 'flat';

  return (
    <>
      <HeroNavigationRibbon key={`story-${mode}`} animated={animated} />
      <HeroCVRibbon key={`cv-${mode}`} animated={animated} />
    </>
  );
}
