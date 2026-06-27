/** @format */

'use client';

import Button from '@/src/components/ui/Button';
import EmptyState from '@/src/components/ui/EmptyState';
import {
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  TableRow,
} from '@/src/components/ui/Table';
import type { SocialLink } from '@/src/features/social-links/api/social-links';
import SocialLinkRow from './SocialLinkRow';

type SocialLinkTableProps = {
  links: SocialLink[];
  isLoading: boolean;
  busyLinkId: string | null;
  onAdd: () => void;
  onEdit: (link: SocialLink) => void;
  onDelete: (link: SocialLink) => void;
};

export default function SocialLinkTable({
  links,
  isLoading,
  busyLinkId,
  onAdd,
  onEdit,
  onDelete,
}: SocialLinkTableProps) {
  if (isLoading) {
    return <div className="social-links-loading">Loading social links…</div>;
  }

  return (
    <>
      <div className="social-links-toolbar">
        <p className="social-links-toolbar__meta">{links.length} total</p>
        <Button variant="primary" onClick={onAdd}>
          + Add Social Link
        </Button>
      </div>

      {links.length === 0 ? (
        <EmptyState
          title="No social links yet"
          description="Add social profile links and icons to display on the public homepage."
          action={
            <Button variant="primary" onClick={onAdd}>
              Add social link
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Icon</TableHeadCell>
              <TableHeadCell>Platform</TableHeadCell>
              <TableHeadCell>URL</TableHeadCell>
              <TableHeadCell>Order</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {links.map((link) => (
              <SocialLinkRow
                key={link.id}
                link={link}
                isBusy={busyLinkId === link.id}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
