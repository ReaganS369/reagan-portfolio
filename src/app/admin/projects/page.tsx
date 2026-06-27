/** @format */

import AdminPlaceholderPage from '@/src/features/admin/components/AdminPlaceholderPage';

export default function ProjectsAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Projects"
      description="Organize portfolio projects, case studies, and featured work."
      sectionTitle="All projects"
      emptyTitle="No projects yet"
      emptyDescription="Project entries will be managed here once CRUD is connected to Supabase."
    />
  );
}
