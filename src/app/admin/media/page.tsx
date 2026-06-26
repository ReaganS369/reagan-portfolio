/** @format */

import { EmptyState, PageHeader, Section } from '@/src/components/admin';

export default function MediaAdminPage() {
  return (
    <>
      <PageHeader
        title="Media Library"
        description="Upload, browse, and reuse images and files across your portfolio."
      />

      <Section title="Assets">
        <EmptyState
          title="Media library is empty"
          description="Uploaded assets will be stored in Supabase and surfaced here for reuse."
        />
      </Section>
    </>
  );
}
