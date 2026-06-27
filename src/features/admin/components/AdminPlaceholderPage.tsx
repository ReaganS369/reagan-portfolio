/** @format */

import { EmptyState, PageHeader, Section } from '@/src/components/ui';

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
  sectionTitle: string;
  emptyTitle: string;
  emptyDescription: string;
};

export default function AdminPlaceholderPage({
  title,
  description,
  sectionTitle,
  emptyTitle,
  emptyDescription,
}: AdminPlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Section title={sectionTitle}>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </Section>
    </>
  );
}
