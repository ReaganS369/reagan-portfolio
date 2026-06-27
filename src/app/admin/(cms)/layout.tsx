/** @format */

import AdminLayoutClient from '@/src/features/admin/layout/AdminLayoutClient';

export default function AdminCmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
