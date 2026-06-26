/** @format */

import { EmptyState, PageHeader, Section } from '@/src/components/admin';

export default function ExperienceAdminPage() {
  return (
    <>
      <PageHeader
        title="Experience"
        description="Manage roles, companies, timelines, and highlights for your career history."
      />

      <Section title="Work experience">
        <EmptyState
          title="No experience entries yet"
          description="Experience items will appear here when the content module is wired up."
        />
      </Section>
    </>
  );
}
