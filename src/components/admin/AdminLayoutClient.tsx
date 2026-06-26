'use client';

/** @format */

import { useEffect, useState, type ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

type AdminLayoutClientProps = {
  children: ReactNode;
};

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        setIsSidebarOpen(false);
      }
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('admin-nav-open', isSidebarOpen);

    return () => {
      document.body.classList.remove('admin-nav-open');
    };
  }, [isSidebarOpen]);

  return (
    <div className="admin-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        onNavigate={() => setIsSidebarOpen(false)}
      />

      {isSidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="admin-main">
        <Header
          isSidebarOpen={isSidebarOpen}
          onMenuToggle={() => setIsSidebarOpen((open) => !open)}
        />

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
