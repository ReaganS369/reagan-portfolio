'use client';

/** @format */

import Button from '@/src/components/admin/Button';
import EmptyState from '@/src/components/admin/EmptyState';
import {
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  TableRow,
} from '@/src/components/admin/Table';
import type { HeroRole } from '@/src/lib/api/heroRoles';
import HeroRoleRow from './HeroRoleRow';

type HeroRoleTableProps = {
  roles: HeroRole[];
  isLoading: boolean;
  busyRoleId: string | null;
  onAdd: () => void;
  onEdit: (role: HeroRole) => void;
  onDelete: (role: HeroRole) => void;
  onToggleActive: (role: HeroRole) => void;
  onMove: (role: HeroRole, direction: 'up' | 'down') => void;
};

export default function HeroRoleTable({
  roles,
  isLoading,
  busyRoleId,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
  onMove,
}: HeroRoleTableProps) {
  const activeCount = roles.filter((role) => role.is_active).length;

  if (isLoading) {
    return <div className="hero-roles-loading">Loading hero roles…</div>;
  }

  return (
    <>
      <div className="hero-roles-toolbar">
        <p className="hero-roles-toolbar__meta">
          {roles.length} total · {activeCount} active ·{' '}
          {roles.length - activeCount} inactive
        </p>
        <Button variant="primary" onClick={onAdd}>
          Add role
        </Button>
      </div>

      {roles.length === 0 ? (
        <EmptyState
          title="No hero roles yet"
          description="Add your first rotating role title and SVG icon for the homepage hero."
          action={
            <Button variant="primary" onClick={onAdd}>
              Add role
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Icon</TableHeadCell>
              <TableHeadCell>Title</TableHeadCell>
              <TableHeadCell>Order</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role, index) => (
              <HeroRoleRow
                key={role.id}
                role={role}
                isFirst={index === 0}
                isLast={index === roles.length - 1}
                isBusy={busyRoleId === role.id}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
                onMove={onMove}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
