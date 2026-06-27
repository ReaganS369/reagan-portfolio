/** @format */

import { PageHeader, Section } from '@/src/components/ui';
import EducationManager from '@/src/features/education/components/admin/EducationManager';

export default function EducationAdminPage() {
  return (
    <>
      <PageHeader
        title="Education"
        description="Manage degrees, institutions, and academic milestones."
      />

      <Section title="Education history">
        <EducationManager />
      </Section>
    </>
  );
}
