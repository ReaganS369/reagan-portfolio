/** @format */

import { PageHeader, Section } from '@/src/components/ui';
import SkillsExplorerManager from '@/src/features/skills/components/admin/SkillsExplorerManager';

export default function SkillsAdminPage() {
  return (
    <>
      <PageHeader
        title="Skills Explorer"
        description="Manage the full hierarchy powering the 3D Skills Explorer — categories, skills, ratings, and attached tools, to unlimited depth."
      />

      <Section title="Hierarchy">
        <SkillsExplorerManager />
      </Section>
    </>
  );
}
