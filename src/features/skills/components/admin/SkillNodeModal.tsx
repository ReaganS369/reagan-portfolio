'use client';

/** @format */

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/src/components/ui/Button';
import type { SkillNodeRow } from '../../api/skillNodes';

export type SkillNodeFormValues = {
  name: string;
  description: string;
  icon: string;
  color: string;
  rating: string; // '' = unrated
  sort_order: number;
  is_active: boolean;
  notes: string;
};

type SkillNodeModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  node: SkillNodeRow | null;
  /** shown read-only: where this node will live */
  parentLabel: string;
  levelLabel: string;
  defaultSortOrder: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: SkillNodeFormValues) => Promise<void>;
};

function buildInitialState(
  mode: 'create' | 'edit',
  node: SkillNodeRow | null,
  defaultSortOrder: number,
): SkillNodeFormValues {
  if (mode === 'edit' && node) {
    return {
      name: node.name,
      description: node.description ?? '',
      icon: node.icon ?? '',
      color: node.color ?? '',
      rating: node.rating !== null ? String(node.rating) : '',
      sort_order: node.sort_order,
      is_active: node.is_active,
      notes: node.notes ?? '',
    };
  }
  return {
    name: '',
    description: '',
    icon: '',
    color: '',
    rating: '',
    sort_order: defaultSortOrder,
    is_active: true,
    notes: '',
  };
}

export default function SkillNodeModal({
  open,
  mode,
  node,
  parentLabel,
  levelLabel,
  defaultSortOrder,
  isSubmitting,
  onClose,
  onSubmit,
}: SkillNodeModalProps) {
  const [form, setForm] = useState<SkillNodeFormValues>(() =>
    buildInitialState(mode, node, defaultSortOrder),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialState(mode, node, defaultSortOrder));
    setError(null);
  }, [open, mode, node, defaultSortOrder]);

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

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    const ratingNum = form.rating.trim() === '' ? null : Number(form.rating);
    if (ratingNum !== null && (Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5)) {
      setError('Rating must be between 0 and 5.');
      return;
    }

    try {
      await onSubmit({ ...form, name: form.name.trim() });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save skill.');
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
        aria-labelledby="skill-node-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="skx-modal__header">
          <div>
            <h2 id="skill-node-modal-title" className="skx-modal__title">
              {mode === 'create' ? 'Add skill' : 'Edit skill'}
            </h2>
            <p className="skx-modal__description">
              {levelLabel} · under {parentLabel}
            </p>
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

        <form onSubmit={handleSubmit}>
          <div className="skx-modal__body">
            <div className="skx-field">
              <label className="skx-field__label" htmlFor="skn-name">Name</label>
              <input
                id="skn-name"
                className="skx-field__input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. 3D Design"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="skx-field-grid">
              <div className="skx-field">
                <label className="skx-field__label" htmlFor="skn-icon">Icon (optional)</label>
                <input
                  id="skn-icon"
                  className="skx-field__input"
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  placeholder="🎨"
                  disabled={isSubmitting}
                />
              </div>
              <div className="skx-field">
                <label className="skx-field__label" htmlFor="skn-color">Color (optional)</label>
                <input
                  id="skn-color"
                  type="color"
                  className="skx-field__input"
                  style={{ padding: 4, height: 38 }}
                  value={form.color || '#f58a1f'}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="skx-field-grid">
              <div className="skx-field">
                <label className="skx-field__label" htmlFor="skn-rating">Rating (0–5)</label>
                <input
                  id="skn-rating"
                  className="skx-field__input"
                  type="number"
                  min={0}
                  max={5}
                  step={0.5}
                  value={form.rating}
                  onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                  placeholder="Unrated"
                  disabled={isSubmitting}
                />
                <span className="skx-field__hint">
                  Surface area in the 3D explorer is generated from this — never entered directly.
                </span>
              </div>
              <div className="skx-field">
                <label className="skx-field__label" htmlFor="skn-order">Display order</label>
                <input
                  id="skn-order"
                  className="skx-field__input"
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="skx-field">
              <label className="skx-field__label" htmlFor="skn-desc">Description</label>
              <textarea
                id="skn-desc"
                className="skx-field__textarea"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Shown in the hover panel / detail view..."
                disabled={isSubmitting}
              />
            </div>

            <div className="skx-field">
              <label className="skx-field__label" htmlFor="skn-notes">Notes</label>
              <textarea
                id="skn-notes"
                className="skx-field__textarea"
                style={{ minHeight: 50 }}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Internal notes — not shown publicly"
                disabled={isSubmitting}
              />
            </div>

            <label className="skx-toggle">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                disabled={isSubmitting}
              />
              <span className="skx-toggle__label">Active — visible in the 3D explorer</span>
            </label>

            {error && <p className="skx-field__error">{error}</p>}
          </div>

          <div className="skx-modal__footer">
            <Button type="button" variant="ghost" disabled={isSubmitting} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create skill' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
