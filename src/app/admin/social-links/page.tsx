/** @format */

import { EmptyState, PageHeader, Section } from '@/src/components/admin';

export default function SocialLinksAdminPage() {
  return (
    <>
      <PageHeader
        title="Social Links"
        description="Manage social profiles, contact links, and outbound URLs."
      />

      <Section title="Social profiles">
        <EmptyState
          title="No social links yet"
          description="LinkedIn, GitHub, and other profile links will be configurable here."
        />
      </Section>
    </>
  );
}
