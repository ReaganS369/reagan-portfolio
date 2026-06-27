/** @format */

import AdminPlaceholderPage from '@/src/features/admin/components/AdminPlaceholderPage';

export default function MediaAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Media Library"
      description="Upload, browse, and reuse images and files across your portfolio."
      sectionTitle="Assets"
      emptyTitle="Media library is empty"
      emptyDescription="Uploaded assets will be stored in Supabase and surfaced here for reuse."
    />
  );
}
