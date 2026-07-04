'use client';

/** @format */

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/src/components/ui/Button';
import type { SkillToolRow } from '../../api/skillTools';

export type ToolFormValues = {
  name: string;
  icon: string;
  rating: string;
  notes: string;
  sort_order: number;
};

type ToolModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  tool: SkillToolRow | null;
  skillName: string;
  defaultSortOrder: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ToolFormValues) => Promise<void>;
};

function buildInitialState(
  mode: 'create' | 'edit',
  tool: SkillToolRow | null,
  defaultSortOrder: number,
): ToolFormValues {
  if (mode === 'edit' && tool) {
    return {
      name: tool.name,
      icon: tool.icon ?? '',
      rating: tool.rating !== null ? String(tool.rating) : '',
      notes: tool.notes ?? '',
      sort_order: tool.sort_order,
    };
  }
  return { name: '', icon: '', rating: '', notes: '', sort_order: defaultSortOrder };
}

export default function ToolModal({
  open,
  mode,
  tool,
  skillName,
  defaultSortOrder,
  isSubmitting,
  onClose,
  onSubmit,
}: ToolModalProps) {
  const [form, setForm] = useState<ToolFormValues>(() =>
    buildInitialState(mode, tool, defaultSortOrder),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialState(mode, tool, defaultSortOrder));
    setError(null);
  }, [open, mode, tool, defaultSortOrder]);

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
      setError(submitError instanceof Error ? submitError.message : 'Unable to save tool.');
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
        aria-labelledby="tool-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(420px, 100%)' }}
      >
        <div className="skx-modal__header">
          <div>
            <h2 id="tool-modal-title" className="skx-modal__title">
              {mode === 'create' ? 'Add tool' : 'Edit tool'}
            </h2>
            <p className="skx-modal__description">attached to {skillName}</p>
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
            <div className="skx-field-grid">
              <div className="skx-field">
                <label className="skx-field__label" htmlFor="tool-name">Name</label>
                <input
                  id="tool-name"
                  className="skx-field__input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Blender"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div className="skx-field">
                <label className="skx-field__label" htmlFor="tool-icon">Icon (optional)</label>
                <input
                  id="tool-icon"
                  className="skx-field__input"
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  placeholder="🧊"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="skx-field-grid">
              <div className="skx-field">
                <label className="skx-field__label" htmlFor="tool-rating">Rating (0–5, optional)</label>
                <input
                  id="tool-rating"
                  className="skx-field__input"
                  type="number"
                  min={0}
                  max={5}
                  step={0.5}
                  value={form.rating}
                  onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              <div className="skx-field">
                <label className="skx-field__label" htmlFor="tool-order">Display order</label>
                <input
                  id="tool-order"
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
              <label className="skx-field__label" htmlFor="tool-notes">Notes</label>
              <textarea
                id="tool-notes"
                className="skx-field__textarea"
                style={{ minHeight: 50 }}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            {error && <p className="skx-field__error">{error}</p>}
          </div>

          <div className="skx-modal__footer">
            <Button type="button" variant="ghost" disabled={isSubmitting} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : mode === 'create' ? 'Add tool' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
