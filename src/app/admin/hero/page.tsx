/** @format */

import { PageHeader, Section } from '@/src/components/admin';
import HeroRolesManager from '@/src/components/admin/hero/HeroRolesManager';

export default function HeroAdminPage() {
  return (
    <>
      <PageHeader
        title="Hero"
        description="Manage the homepage hero — rotating role titles and SVG icons shown in the carousel."
      />

      <Section
        title="Role carousel"
        description="Active roles appear on the public portfolio. Inactive roles remain saved here."
      >
        <HeroRolesManager />
      </Section>
    </>
  );
}
