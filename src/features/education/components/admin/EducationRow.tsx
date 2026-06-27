'use client';

/** @format */

import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '@/src/components/ui/Button';
import { TableCell, TableRow } from '@/src/components/ui/Table';
import type { Education } from '../../api/education';

type EducationRowProps = {
  entry: Education;
  isFirst: boolean;
  isLast: boolean;
  isBusy: boolean;
  onEdit: (entry: Education) => void;
  onDelete: (entry: Education) => void;
  onMove: (entry: Education, direction: 'up' | 'down') => void;
};

export default function EducationRow({
  entry,
  isFirst,
  isLast,
  isBusy,
  onEdit,
  onDelete,
  onMove,
}: EducationRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <TableRow>
      <TableCell>
        <div className="education-institution-cell">
          <span className="education-institution-cell__title">{entry.institution}</span>
          <span className="education-institution-cell__detail">{entry.degree}, {entry.field}</span>
        </div>
      </TableCell>

      <TableCell>
        <div className="education-years">
          {entry.start_year ?? '—'} – {entry.end_year ?? 'Present'}
        </div>
      </TableCell>

      <TableCell>
        <div className="education-order">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Move up"
            disabled={isBusy || isFirst}
            onClick={() => onMove(entry, 'up')}
          >
            <ChevronUp size={16} />
          </Button>
          <span className="education-order__value">{entry.sort_order}</span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Move down"
            disabled={isBusy || isLast}
            onClick={() => onMove(entry, 'down')}
          >
            <ChevronDown size={16} />
          </Button>
        </div>
      </TableCell>

      <TableCell>
        <div className="education-actions">
          {confirmDelete ? (
            <div className="education-delete-confirm">
              <span className="education-delete-confirm__label">Delete?</span>
              <Button variant="danger" size="sm" disabled={isBusy} onClick={() => { onDelete(entry); setConfirmDelete(false); }}>
                Confirm
              </Button>
              <Button variant="ghost" size="sm" disabled={isBusy} onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" disabled={isBusy} aria-label="Edit" onClick={() => onEdit(entry)}>
                <Pencil size={16} />
              </Button>
              <Button variant="ghost" size="sm" disabled={isBusy} aria-label="Delete" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={16} />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
