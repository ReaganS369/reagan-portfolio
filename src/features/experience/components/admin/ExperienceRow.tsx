'use client';

/** @format */

import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '@/src/components/ui/Button';
import { TableCell, TableRow } from '@/src/components/ui/Table';
import type { Experience } from '../../api/experience';

type ExperienceRowProps = {
  entry: Experience;
  isFirst: boolean;
  isLast: boolean;
  isBusy: boolean;
  onEdit: (entry: Experience) => void;
  onDelete: (entry: Experience) => void;
  onMove: (entry: Experience, direction: 'up' | 'down') => void;
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ExperienceRow({
  entry,
  isFirst,
  isLast,
  isBusy,
  onEdit,
  onDelete,
  onMove,
}: ExperienceRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <TableRow>
      <TableCell>
        <div className="experience-company-cell">
          <span className="experience-company-cell__title">{entry.position}</span>
          <span className="experience-company-cell__detail">{entry.company}</span>
        </div>
      </TableCell>

      <TableCell>
        <div className="experience-dates">
          {entry.start_date ? formatDate(entry.start_date) : '—'}
          {' — '}
          {entry.current ? 'Present' : entry.end_date ? formatDate(entry.end_date) : '—'}
        </div>
      </TableCell>

      <TableCell>
        {entry.current && <span className="experience-current-badge">Current</span>}
      </TableCell>

      <TableCell>
        <div className="experience-order">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Move up"
            disabled={isBusy || isFirst}
            onClick={() => onMove(entry, 'up')}
          >
            <ChevronUp size={16} />
          </Button>
          <span className="experience-order__value">{entry.sort_order}</span>
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
        <div className="experience-actions">
          {confirmDelete ? (
            <div className="experience-delete-confirm">
              <span className="experience-delete-confirm__label">Delete?</span>
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
