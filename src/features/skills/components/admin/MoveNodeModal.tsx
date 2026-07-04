'use client';

/** @format */

import { X, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/src/components/ui/Button';
import type { SkillNodeRow } from '../../api/skillNodes';
import { getDescendantIds } from '../../lib/tree';

type MoveNodeModalProps = {
  open: boolean;
  node: SkillNodeRow | null;
  allNodes: SkillNodeRow[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (newParentId: string | null) => Promise<void>;
};

export default function MoveNodeModal({
  open,
  node,
  allNodes,
  isSubmitting,
  onClose,
  onSubmit,
}: MoveNodeModalProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !node) return;
    setQuery('');
    setSelected(node.parent_id);
    setError(null);
  }, [open, node]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, isSubmitting, onClose]);

  const options = useMemo(() => {
    if (!node) return [];
    const blocked = getDescendantIds(node.id, allNodes);
    blocked.add(node.id);
    const q = query.trim().toLowerCase();
    return allNodes
      .filter((n) => !blocked.has(n.id))
      .filter((n) => !q || n.name.toLowerCase().includes(q))
      .sort((a, b) => a.level - b.level || a.sort_order - b.sort_order);
  }, [node, allNodes, query]);

  if (!open || !node) return null;

  async function handleConfirm() {
    setError(null);
    try {
      await onSubmit(selected);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to move skill.');
    }
  }

  return createPortal(
    <div
      className="skx-modal-backdrop"
      role="presentation"
      onClick={() => { if (!isSubmitting) onClose(); }}
    >
      <div
        className="skx-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-node-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(420px, 100%)' }}
      >
        <div className="skx-modal__header">
          <div>
            <h2 id="move-node-modal-title" className="skx-modal__title">Move &ldquo;{node.name}&rdquo;</h2>
            <p className="skx-modal__description">Choose a new parent — its children move with it.</p>
          </div>
          <button
            type="button"
            className="skx-modal__close"
            aria-label="Close"
            disabled={isSubmitting}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="skx-modal__body">
          <div className="skx-search" style={{ width: '100%' }}>
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills…"
              disabled={isSubmitting}
            />
          </div>

          <div className="skx-move-list">
            <button
              type="button"
              className={`skx-move-option ${selected === null ? 'skx-move-option--selected' : ''}`}
              onClick={() => setSelected(null)}
              disabled={isSubmitting}
            >
              — Make root level (Level 0) —
            </button>
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`skx-move-option ${selected === opt.id ? 'skx-move-option--selected' : ''}`}
                onClick={() => setSelected(opt.id)}
                disabled={isSubmitting}
              >
                {opt.icon ? `${opt.icon} ` : ''}
                {opt.name}
                <span style={{ marginLeft: 'auto', opacity: 0.5, fontSize: '0.7rem' }}>
                  Level {opt.level}
                </span>
              </button>
            ))}
          </div>

          {error && <p className="skx-field__error">{error}</p>}
        </div>

        <div className="skx-modal__footer">
          <Button type="button" variant="ghost" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={isSubmitting || selected === node.parent_id}
            onClick={handleConfirm}
          >
            {isSubmitting ? 'Moving…' : 'Move here'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
