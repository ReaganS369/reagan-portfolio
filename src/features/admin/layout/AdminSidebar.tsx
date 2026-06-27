'use client';

/** @format */

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminNavigation, isNavItemActive } from '@/src/features/admin/constants/navigation';

type SidebarProps = {
  isOpen: boolean;
  onNavigate?: () => void;
};

export default function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      id="admin-sidebar"
      className={clsx('admin-sidebar', isOpen && 'admin-sidebar--open')}
      aria-label="Admin navigation"
    >
      <div className="admin-sidebar__brand">
        <Link href="/admin" className="admin-sidebar__logo" onClick={onNavigate}>
          <span className="admin-sidebar__logo-mark" aria-hidden="true">
            N
          </span>
          <span className="admin-sidebar__logo-text">
            <span className="admin-sidebar__logo-title">NNGTW</span>
            <span className="admin-sidebar__logo-subtitle">Portfolio CMS</span>
          </span>
        </Link>
      </div>

      <nav className="admin-sidebar__nav">
        {adminNavigation.map((group) => (
          <div key={group.label} className="admin-sidebar__group">
            <p className="admin-sidebar__group-label">{group.label}</p>
            <ul className="admin-sidebar__list">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isNavItemActive(pathname, item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        'admin-sidebar__link',
                        isActive && 'admin-sidebar__link--active',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={onNavigate}
                    >
                      <Icon
                        className="admin-sidebar__link-icon"
                        size={16}
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
