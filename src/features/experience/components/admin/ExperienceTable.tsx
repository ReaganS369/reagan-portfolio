'use client';

/** @format */

import Button from '@/src/components/ui/Button';
import EmptyState from '@/src/components/ui/EmptyState';
import {
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
  TableRow,
} from '@/src/components/ui/Table';
import type { Experience } from '../../api/experience';
import ExperienceRow from './ExperienceRow';

type ExperienceTableProps = {
  entries: Experience[];
  isLoading: boolean;
  busyId: string | null;
  onAdd: () => void;
  onEdit: (entry: Experience) => void;
  onDelete: (entry: Experience) => void;
  onMove: (entry: Experience, direction: 'up' | 'down') => void;
};

export default function ExperienceTable({
  entries,
  isLoading,
  busyId,
  onAdd,
  onEdit,
  onDelete,
  onMove,
}: ExperienceTableProps) {
  if (isLoading) {
    return <div className="experience-loading">Loading experience entries…</div>;
  }

  return (
    <>
      <div className="experience-toolbar">
        <p className="experience-toolbar__meta">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </p>
        <Button variant="primary" onClick={onAdd}>
          Add experience
        </Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="No experience entries yet"
          description="Add your first role, company, and career highlights."
          action={
            <Button variant="primary" onClick={onAdd}>
              Add experience
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Position</TableHeadCell>
              <TableHeadCell>Dates</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Order</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry, index) => (
              <ExperienceRow
                key={entry.id}
                entry={entry}
                isFirst={index === 0}
                isLast={index === entries.length - 1}
                isBusy={busyId === entry.id}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
