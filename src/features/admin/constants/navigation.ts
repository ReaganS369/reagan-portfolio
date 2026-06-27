/** @format */

import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  FolderKanban,
  GraduationCap,
  Images,
  LayoutDashboard,
  Link2,
  Settings,
  Sparkles,
  Upload,
  Wrench,
} from 'lucide-react';

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const adminNavigation: AdminNavGroup[] = [
  {
    label: 'Portfolio',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Hero', href: '/admin/hero', icon: Sparkles },
      { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
      { label: 'Experience', href: '/admin/experience', icon: Briefcase },
      { label: 'Education', href: '/admin/education', icon: GraduationCap },
      { label: 'Skills', href: '/admin/skills', icon: Wrench },
      { label: 'Gallery', href: '/admin/gallery', icon: Images },
      { label: 'Social Links', href: '/admin/social-links', icon: Link2 },
    ],
  },
  {
    label: 'Assets',
    items: [{ label: 'Media Library', href: '/admin/media', icon: Upload }],
  },
  {
    label: 'System',
    items: [{ label: 'Settings', href: '/admin/settings', icon: Settings }],
  },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
