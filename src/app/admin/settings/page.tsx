/** @format */

import { EmptyState, PageHeader, Section } from '@/src/components/admin';

export default function SettingsAdminPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Configure site-wide preferences, metadata, and CMS options."
      />

      <Section title="General">
        <EmptyState
          title="Settings panel coming soon"
          description="Site configuration controls will live here — profile details, SEO defaults, and integrations."
        />
      </Section>
    </>
  );
}
