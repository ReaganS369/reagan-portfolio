'use client';

/** @format */

import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import Button from '@/src/components/ui/Button';
import type { SkillToolRow } from '../../api/skillTools';

type ToolsPanelProps = {
  tools: SkillToolRow[];
  busyId: string | null;
  onAdd: () => void;
  onEdit: (tool: SkillToolRow) => void;
  onDelete: (tool: SkillToolRow) => void;
  onReorder: (tool: SkillToolRow, direction: 'up' | 'down') => void;
};

export default function ToolsPanel({ tools, busyId, onAdd, onEdit, onDelete, onReorder }: ToolsPanelProps) {
  const sorted = [...tools].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      <div className="skx-detail__actions" style={{ marginBottom: 10 }}>
        <Button variant="secondary" size="sm" onClick={onAdd}>
          <Plus size={14} style={{ marginRight: 6 }} />
          Add tool
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="skx-empty-inline">No tools attached yet.</div>
      ) : (
        <div className="skx-tools">
          {sorted.map((tool, index) => (
            <ToolRow
              key={tool.id}
              tool={tool}
              isFirst={index === 0}
              isLast={index === sorted.length - 1}
              isBusy={busyId === tool.id}
              onEdit={onEdit}
              onDelete={onDelete}
              onReorder={onReorder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ToolRow({
  tool,
  isFirst,
  isLast,
  isBusy,
  onEdit,
  onDelete,
  onReorder,
}: {
  tool: SkillToolRow;
  isFirst: boolean;
  isLast: boolean;
  isBusy: boolean;
  onEdit: (tool: SkillToolRow) => void;
  onDelete: (tool: SkillToolRow) => void;
  onReorder: (tool: SkillToolRow, direction: 'up' | 'down') => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="skx-tool-row">
      <span className="skx-tool-row__icon">{tool.icon || '🔧'}</span>
      <span className="skx-tool-row__name">{tool.name}</span>
      {tool.rating !== null && (
        <span className="skx-tool-row__rating">{tool.rating.toFixed(1)}★</span>
      )}
      <div className="skx-tool-row__actions">
        {confirmDelete ? (
          <>
            <button
              type="button"
              className="skx-row__action skx-row__action--danger"
              title="Confirm delete"
              onClick={() => { onDelete(tool); setConfirmDelete(false); }}
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              className="skx-row__action"
              title="Cancel"
              onClick={() => setConfirmDelete(false)}
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="skx-row__action"
              title="Reorder up"
              disabled={isFirst || isBusy}
              onClick={() => onReorder(tool, 'up')}
            >
              <ArrowUp size={12} />
            </button>
            <button
              type="button"
              className="skx-row__action"
              title="Reorder down"
              disabled={isLast || isBusy}
              onClick={() => onReorder(tool, 'down')}
            >
              <ArrowDown size={12} />
            </button>
            <button
              type="button"
              className="skx-row__action"
              title="Edit"
              onClick={() => onEdit(tool)}
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              className="skx-row__action skx-row__action--danger"
              title="Delete"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
