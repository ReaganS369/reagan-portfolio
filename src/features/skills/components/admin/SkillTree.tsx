'use client';

/** @format */

import {
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  FolderInput,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { SkillNodeRow } from '../../api/skillNodes';
import { computeSharePercent, getSiblings, type SkillTreeNode } from '../../lib/tree';

export type SkillTreeHandlers = {
  onSelect: (node: SkillNodeRow) => void;
  onAddChild: (parent: SkillNodeRow) => void;
  onEdit: (node: SkillNodeRow) => void;
  onMove: (node: SkillNodeRow) => void;
  onDelete: (node: SkillNodeRow) => void;
  onReorder: (node: SkillNodeRow, direction: 'up' | 'down') => void;
};

type SkillTreeProps = SkillTreeHandlers & {
  roots: SkillTreeNode[];
  allNodes: SkillNodeRow[];
  selectedId: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  forceExpand: boolean;
  busyId: string | null;
};

export default function SkillTree({
  roots,
  allNodes,
  selectedId,
  expandedIds,
  onToggleExpand,
  forceExpand,
  busyId,
  ...handlers
}: SkillTreeProps) {
  return (
    <div className="skx-tree">
      {roots.map((node) => (
        <SkillTreeRow
          key={node.id}
          node={node}
          depth={0}
          allNodes={allNodes}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
          forceExpand={forceExpand}
          busyId={busyId}
          {...handlers}
        />
      ))}
    </div>
  );
}

type RowProps = SkillTreeHandlers & {
  node: SkillTreeNode;
  depth: number;
  allNodes: SkillNodeRow[];
  selectedId: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  forceExpand: boolean;
  busyId: string | null;
};

function SkillTreeRow({
  node,
  depth,
  allNodes,
  selectedId,
  expandedIds,
  onToggleExpand,
  forceExpand,
  busyId,
  onSelect,
  onAddChild,
  onEdit,
  onMove,
  onDelete,
  onReorder,
}: RowProps) {
  const hasChildren = node.children.length > 0;
  const expanded = forceExpand || expandedIds.has(node.id);
  const siblings = getSiblings(node, allNodes);
  const share = computeSharePercent(node, siblings);
  const sorted = [...siblings].sort((a, b) => a.sort_order - b.sort_order);
  const index = sorted.findIndex((s) => s.id === node.id);
  const isBusy = busyId === node.id;
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div
        className={[
          'skx-row',
          selectedId === node.id ? 'skx-row--selected' : '',
          !node.is_active ? 'skx-row--inactive' : '',
        ].join(' ')}
        style={{ paddingLeft: 8 + depth * 2 }}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          <button
            type="button"
            className="skx-row__caret"
            onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="skx-row__caret skx-row__caret--spacer" />
        )}

        <span className="skx-row__icon">{node.icon || '•'}</span>
        <span className="skx-row__name">{node.name}</span>
        <span className="skx-row__level">L{node.level}</span>
        <span className="skx-row__share">{share > 0 ? `~${Math.round(share)}%` : '—'}</span>

        <div className="skx-row__actions">
          {confirmDelete ? (
            <>
              <button
                type="button"
                className="skx-row__action skx-row__action--danger"
                title="Confirm delete"
                onClick={(e) => { e.stopPropagation(); onDelete(node); setConfirmDelete(false); }}
              >
                <Check size={13} />
              </button>
              <button
                type="button"
                className="skx-row__action"
                title="Cancel"
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
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
                disabled={index <= 0 || isBusy}
                onClick={(e) => { e.stopPropagation(); onReorder(node, 'up'); }}
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                className="skx-row__action"
                title="Reorder down"
                disabled={index === -1 || index >= sorted.length - 1 || isBusy}
                onClick={(e) => { e.stopPropagation(); onReorder(node, 'down'); }}
              >
                <ArrowDown size={13} />
              </button>
              <button
                type="button"
                className="skx-row__action"
                title="Add child skill"
                onClick={(e) => { e.stopPropagation(); onAddChild(node); }}
              >
                <Plus size={13} />
              </button>
              <button
                type="button"
                className="skx-row__action"
                title="Edit"
                onClick={(e) => { e.stopPropagation(); onEdit(node); }}
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                className="skx-row__action"
                title="Move to another parent"
                onClick={(e) => { e.stopPropagation(); onMove(node); }}
              >
                <FolderInput size={13} />
              </button>
              <button
                type="button"
                className="skx-row__action skx-row__action--danger"
                title="Delete"
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="skx-children">
          {node.children.map((child) => (
            <SkillTreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              allNodes={allNodes}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              forceExpand={forceExpand}
              busyId={busyId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onMove={onMove}
              onDelete={onDelete}
              onReorder={onReorder}
            />
          ))}
        </div>
      )}
    </>
  );
}
