/** @format */

import { PageHeader, Section } from '@/src/components/ui';
import SocialLinksManager from '@/src/features/social-links/components/admin/SocialLinksManager';

export default function SocialLinksAdminPage() {
  return (
    <>
      <PageHeader
        title="Social Links"
        description="Manage social profiles, contact links, and outbound URLs."
      />

      <Section title="Social profiles">
        <SocialLinksManager />
      </Section>
    </>
  );
}
