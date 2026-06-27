'use client';

/** @format */

import clsx from 'clsx';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from '@/src/components/ui/Button';
import { TableCell, TableRow } from '@/src/components/ui/Table';
import type { HeroRole } from '@/src/features/hero/api/heroRoles';
import { getStorageUrl } from '@/src/lib/storage';

type HeroRoleRowProps = {
  role: HeroRole;
  isFirst: boolean;
  isLast: boolean;
  isBusy: boolean;
  onEdit: (role: HeroRole) => void;
  onDelete: (role: HeroRole) => void;
  onToggleActive: (role: HeroRole) => void;
  onMove: (role: HeroRole, direction: 'up' | 'down') => void;
};

export default function HeroRoleRow({
  role,
  isFirst,
  isLast,
  isBusy,
  onEdit,
  onDelete,
  onToggleActive,
  onMove,
}: HeroRoleRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <TableRow>
      <TableCell>
        <div className="hero-roles-icon">
          <img
            src={getStorageUrl(role.icon_url)}
            alt=""
            aria-hidden="true"
          />
        </div>
      </TableCell>

      <TableCell>
        <div className="hero-roles-title-cell">
          <span className="hero-roles-title-cell__title">{role.title}</span>
          <span className="hero-roles-title-cell__path">{role.icon_url}</span>
        </div>
      </TableCell>

      <TableCell>
        <div className="hero-roles-order">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Move ${role.title} up`}
            disabled={isBusy || isFirst}
            onClick={() => onMove(role, 'up')}
          >
            <ChevronUp size={16} />
          </Button>
          <span className="hero-roles-order__value">{role.display_order}</span>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Move ${role.title} down`}
            disabled={isBusy || isLast}
            onClick={() => onMove(role, 'down')}
          >
            <ChevronDown size={16} />
          </Button>
        </div>
      </TableCell>

      <TableCell>
        <button
          type="button"
          className={clsx(
            'hero-roles-status',
            role.is_active
              ? 'hero-roles-status--active'
              : 'hero-roles-status--inactive',
          )}
          disabled={isBusy}
          onClick={() => onToggleActive(role)}
          aria-pressed={role.is_active}
        >
          {role.is_active ? 'Active' : 'Inactive'}
        </button>
      </TableCell>

      <TableCell>
        <div className="hero-roles-actions">
          {confirmDelete ? (
            <div className="hero-roles-delete-confirm">
              <span className="hero-roles-delete-confirm__label">Delete?</span>
              <Button
                variant="danger"
                size="sm"
                disabled={isBusy}
                onClick={() => {
                  onDelete(role);
                  setConfirmDelete(false);
                }}
              >
                Confirm
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={isBusy}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={isBusy}
                aria-label={`Edit ${role.title}`}
                onClick={() => onEdit(role)}
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={isBusy}
                aria-label={`Delete ${role.title}`}
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={16} />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
