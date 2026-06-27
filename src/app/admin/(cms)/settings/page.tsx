/** @format */

import AdminPlaceholderPage from '@/src/features/admin/components/AdminPlaceholderPage';

export default function SettingsAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Settings"
      description="Configure site-wide preferences, metadata, and CMS options."
      sectionTitle="General"
      emptyTitle="Settings panel coming soon"
      emptyDescription="Site configuration controls will live here — profile details, SEO defaults, and integrations."
    />
  );
}
