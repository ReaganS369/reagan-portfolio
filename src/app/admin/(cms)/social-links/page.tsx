/** @format */

import AdminPlaceholderPage from '@/src/features/admin/components/AdminPlaceholderPage';

export default function SocialLinksAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Social Links"
      description="Manage social profiles, contact links, and outbound URLs."
      sectionTitle="Social profiles"
      emptyTitle="No social links yet"
      emptyDescription="LinkedIn, GitHub, and other profile links will be configurable here."
    />
  );
}
