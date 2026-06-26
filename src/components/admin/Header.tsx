'use client';

/** @format */

import { Menu, X } from 'lucide-react';

type HeaderProps = {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
};

export default function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  return (
    <header className="admin-header">
      <div className="admin-header__start">
        <button
          type="button"
          className="admin-header__menu-btn"
          onClick={onMenuToggle}
          aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isSidebarOpen}
          aria-controls="admin-sidebar"
        >
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div className="admin-header__context">
          <span className="admin-header__eyebrow">Admin</span>
          <span className="admin-header__title">Content Management</span>
        </div>
      </div>

      <div className="admin-header__end">
        <div className="admin-header__user">
          <span className="admin-header__avatar" aria-hidden="true">
            RS
          </span>
          <div className="admin-header__user-meta">
            <span className="admin-header__user-name">Reagan</span>
            <span className="admin-header__user-role">Owner</span>
          </div>
        </div>
      </div>
    </header>
  );
}
