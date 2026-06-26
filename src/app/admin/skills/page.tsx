/** @format */

import { EmptyState, PageHeader, Section } from '@/src/components/admin';

export default function SkillsAdminPage() {
  return (
    <>
      <PageHeader
        title="Skills"
        description="Curate tools, technologies, and capability groups for your portfolio."
      />

      <Section title="Skill groups">
        <EmptyState
          title="No skills configured yet"
          description="Skills and categories will be managed here in a future update."
        />
      </Section>
    </>
  );
}
