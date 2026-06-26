/** @format */

import { EmptyState, PageHeader, Section } from '@/src/components/admin';

export default function GalleryAdminPage() {
  return (
    <>
      <PageHeader
        title="Gallery"
        description="Manage visual gallery items displayed across your portfolio."
      />

      <Section title="Gallery items">
        <EmptyState
          title="Gallery is empty"
          description="Images and gallery entries will be organized here once media integration is added."
        />
      </Section>
    </>
  );
}
