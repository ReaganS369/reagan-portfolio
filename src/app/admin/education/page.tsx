/** @format */

import { EmptyState, PageHeader, Section } from '@/src/components/admin';

export default function EducationAdminPage() {
  return (
    <>
      <PageHeader
        title="Education"
        description="Manage degrees, institutions, and academic milestones."
      />

      <Section title="Education history">
        <EmptyState
          title="No education entries yet"
          description="Education records will be editable from this section soon."
        />
      </Section>
    </>
  );
}
