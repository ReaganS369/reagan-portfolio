/** @format */

import { EmptyState, PageHeader, Section } from '@/src/components/admin';

export default function ProjectsAdminPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Organize portfolio projects, case studies, and featured work."
      />

      <Section title="All projects">
        <EmptyState
          title="No projects yet"
          description="Project entries will be managed here once CRUD is connected to Supabase."
        />
      </Section>
    </>
  );
}
