/** @format */

import AdminLayoutClient from '@/src/features/admin/layout/AdminLayoutClient';
import '@/src/features/admin/styles/admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
