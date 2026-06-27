'use client';

/** @format */

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/src/components/ui/Button';
import type { Experience } from '../../api/experience';

export type ExperienceFormValues = {
  company: string;
  position: string;
  description: string;
  start_date: string;
  end_date: string;
  current: boolean;
  sort_order: number;
};

type ExperienceModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  entry: Experience | null;
  defaultSortOrder: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ExperienceFormValues) => Promise<void>;
};

function buildInitialState(
  mode: 'create' | 'edit',
  entry: Experience | null,
  defaultSortOrder: number,
): ExperienceFormValues {
  if (mode === 'edit' && entry) {
    return {
      company: entry.company ?? '',
      position: entry.position ?? '',
      description: entry.description ?? '',
      start_date: entry.start_date ?? '',
      end_date: entry.end_date ?? '',
      current: entry.current,
      sort_order: entry.sort_order,
    };
  }

  return {
    company: '',
    position: '',
    description: '',
    start_date: '',
    end_date: '',
    current: false,
    sort_order: defaultSortOrder,
  };
}

export default function ExperienceModal({
  open,
  mode,
  entry,
  defaultSortOrder,
  isSubmitting,
  onClose,
  onSubmit,
}: ExperienceModalProps) {
  const [form, setForm] = useState<ExperienceFormValues>(() =>
    buildInitialState(mode, entry, defaultSortOrder),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialState(mode, entry, defaultSortOrder));
    setError(null);
  }, [open, mode, entry, defaultSortOrder]);

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.company.trim()) {
      setError('Company is required.');
      return;
    }

    if (!form.position.trim()) {
      setError('Position is required.');
      return;
    }

    if (form.current && form.end_date) {
      setError('Clear the end date if this is a current position.');
      return;
    }

    try {
      await onSubmit({
        ...form,
        company: form.company.trim(),
        position: form.position.trim(),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to save experience entry.',
      );
    }
  }

  return createPortal(
    <div
      className="hero-role-modal-backdrop"
      role="presentation"
      onClick={() => { if (!isSubmitting) onClose(); }}
    >
      <div
        className="hero-role-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="experience-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="hero-role-modal__header">
          <div>
            <h2 id="experience-modal-title" className="hero-role-modal__title">
              {mode === 'create' ? 'Add experience' : 'Edit experience'}
            </h2>
            <p className="hero-role-modal__description">
              Record a role, company, and the dates you held the position.
            </p>
          </div>
          <button
            type="button"
            className="hero-role-modal__close"
            aria-label="Close modal"
            disabled={isSubmitting}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="hero-role-modal__body">
            <div className="hero-role-field">
              <label className="hero-role-field__label" htmlFor="exp-company">Company</label>
              <input
                id="exp-company"
                className="hero-role-field__input"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="e.g. Epic Games"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="hero-role-field">
              <label className="hero-role-field__label" htmlFor="exp-position">Position</label>
              <input
                id="exp-position"
                className="hero-role-field__input"
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                placeholder="e.g. Senior Technical Artist"
                disabled={isSubmitting}
              />
            </div>

            <div className="hero-role-field">
              <label className="hero-role-field__label" htmlFor="exp-description">Description</label>
              <textarea
                id="exp-description"
                className="hero-role-field__input"
                style={{ minHeight: 80, padding: '10px 12px', resize: 'vertical' }}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Key responsibilities and achievements..."
                disabled={isSubmitting}
              />
            </div>

            <div className="hero-role-field">
              <label className="hero-role-field__label" htmlFor="exp-start">Start date</label>
              <input
                id="exp-start"
                className="hero-role-field__input"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            <div className="hero-role-field">
              <label className="hero-role-field__label" htmlFor="exp-end">End date</label>
              <input
                id="exp-end"
                className="hero-role-field__input"
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                disabled={isSubmitting || form.current}
              />
            </div>

            <div className="hero-role-toggle-row">
              <div className="hero-role-toggle-row__copy">
                <span className="hero-role-toggle-row__title">Current position</span>
                <span className="hero-role-toggle-row__description">
                  I currently hold this role. End date will be hidden.
                </span>
              </div>
              <button
                type="button"
                className={`hero-role-switch${form.current ? ' hero-role-switch--on' : ''}`}
                role="switch"
                aria-checked={form.current}
                disabled={isSubmitting}
                onClick={() => setForm((f) => ({ ...f, current: !f.current, end_date: f.current ? f.end_date : '' }))}
              />
            </div>

            <div className="hero-role-field">
              <label className="hero-role-field__label" htmlFor="exp-order">Sort order</label>
              <input
                id="exp-order"
                className="hero-role-field__input"
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                disabled={isSubmitting}
              />
            </div>

            {error && <p className="hero-role-field__error">{error}</p>}
          </div>

          <div className="hero-role-modal__footer">
            <Button type="button" variant="ghost" disabled={isSubmitting} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create entry' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
