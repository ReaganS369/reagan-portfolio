/** @format */

import Link from 'next/link';
import {
  Button,
  Card,
  PageHeader,
  Section,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from '@/src/components/admin';

const stats = [
  { label: 'Projects', value: '—', hint: 'Published portfolio work' },
  { label: 'Experience', value: '—', hint: 'Roles and milestones' },
  { label: 'Media assets', value: '—', hint: 'Images and files' },
  { label: 'Skills', value: '—', hint: 'Tools and capabilities' },
];

const quickLinks = [
  {
    href: '/admin/hero',
    title: 'Hero',
    description: 'Headline, roles, and intro copy',
  },
  {
    href: '/admin/projects',
    title: 'Projects',
    description: 'Case studies and featured work',
  },
  {
    href: '/admin/media',
    title: 'Media Library',
    description: 'Upload and organize assets',
  },
  {
    href: '/admin/settings',
    title: 'Settings',
    description: 'Site configuration and preferences',
  },
];

export default function AdminDashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your portfolio content. Manage sections from the sidebar or jump in with the shortcuts below."
        action={<Button variant="primary">New content</Button>}
      />

      <div className="admin-stat-grid">
        {stats.map((stat) => (
          <Card key={stat.label} padding="md">
            <p className="admin-stat-card__label">{stat.label}</p>
            <p className="admin-stat-card__value">{stat.value}</p>
            <p className="admin-stat-card__hint">{stat.hint}</p>
          </Card>
        ))}
      </div>

      <Section
        title="Quick access"
        description="Frequently used areas while building your portfolio."
      >
        <div className="admin-quick-links">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="admin-quick-link">
              <span className="admin-quick-link__title">{link.title}</span>
              <span className="admin-quick-link__description">
                {link.description}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title="Recent activity"
        description="Updates across your CMS will appear here."
      >
        <Card padding="none">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Section</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Last updated</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Hero</TableCell>
                <TableCell>Draft</TableCell>
                <TableCell>—</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Projects</TableCell>
                <TableCell>Empty</TableCell>
                <TableCell>—</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Media Library</TableCell>
                <TableCell>Empty</TableCell>
                <TableCell>—</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </Section>
    </>
  );
}
