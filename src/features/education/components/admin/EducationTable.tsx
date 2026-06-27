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
import type { Education } from '../../api/education';
import EducationRow from './EducationRow';

type EducationTableProps = {
  entries: Education[];
  isLoading: boolean;
  busyId: string | null;
  onAdd: () => void;
  onEdit: (entry: Education) => void;
  onDelete: (entry: Education) => void;
  onMove: (entry: Education, direction: 'up' | 'down') => void;
};

export default function EducationTable({
  entries,
  isLoading,
  busyId,
  onAdd,
  onEdit,
  onDelete,
  onMove,
}: EducationTableProps) {
  if (isLoading) {
    return <div className="education-loading">Loading education entries…</div>;
  }

  return (
    <>
      <div className="education-toolbar">
        <p className="education-toolbar__meta">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </p>
        <Button variant="primary" onClick={onAdd}>
          Add education
        </Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="No education entries yet"
          description="Add your first degree, institution, and academic milestones."
          action={
            <Button variant="primary" onClick={onAdd}>
              Add education
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Institution</TableHeadCell>
              <TableHeadCell>Years</TableHeadCell>
              <TableHeadCell>Order</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry, index) => (
              <EducationRow
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
