/** @format */

import { PageHeader, Section } from '@/src/components/ui';
import ExperienceManager from '@/src/features/experience/components/admin/ExperienceManager';

export default function ExperienceAdminPage() {
  return (
    <>
      <PageHeader
        title="Experience"
        description="Manage roles, companies, timelines, and highlights for your career history."
      />

      <Section title="Work experience">
        <ExperienceManager />
      </Section>
    </>
  );
}
