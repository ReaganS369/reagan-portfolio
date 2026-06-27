'use client';

/** @format */

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/src/components/ui/Button';
import type { Education } from '../../api/education';

export type EducationFormValues = {
  institution: string;
  degree: string;
  field: string;
  description: string;
  start_year: string;
  end_year: string;
  sort_order: number;
};

type EducationModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  entry: Education | null;
  defaultSortOrder: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: EducationFormValues) => Promise<void>;
};

function buildInitialState(
  mode: 'create' | 'edit',
  entry: Education | null,
  defaultSortOrder: number,
): EducationFormValues {
  if (mode === 'edit' && entry) {
    return {
      institution: entry.institution ?? '',
      degree: entry.degree ?? '',
      field: entry.field ?? '',
      description: entry.description ?? '',
      start_year: entry.start_year?.toString() ?? '',
      end_year: entry.end_year?.toString() ?? '',
      sort_order: entry.sort_order,
    };
  }

  return {
    institution: '',
    degree: '',
    field: '',
    description: '',
    start_year: '',
    end_year: '',
    sort_order: defaultSortOrder,
  };
}

export default function EducationModal({
  open,
  mode,
  entry,
  defaultSortOrder,
  isSubmitting,
  onClose,
  onSubmit,
}: EducationModalProps) {
  const [form, setForm] = useState<EducationFormValues>(() =>
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

    if (!form.institution.trim()) {
      setError('Institution is required.');
      return;
    }

    if (!form.degree.trim()) {
      setError('Degree is required.');
      return;
    }

    if (!form.field.trim()) {
      setError('Field of study is required.');
      return;
    }

    try {
      await onSubmit({
        ...form,
        institution: form.institution.trim(),
        degree: form.degree.trim(),
        field: form.field.trim(),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to save education entry.',
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
        aria-labelledby="education-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="hero-role-modal__header">
          <div>
            <h2 id="education-modal-title" className="hero-role-modal__title">
              {mode === 'create' ? 'Add education' : 'Edit education'}
            </h2>
            <p className="hero-role-modal__description">
              Record a degree, institution, and the years you attended.
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
              <label className="hero-role-field__label" htmlFor="edu-institution">Institution</label>
              <input
                id="edu-institution"
                className="hero-role-field__input"
                value={form.institution}
                onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
                placeholder="e.g. University of Southern California"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="hero-role-field">
              <label className="hero-role-field__label" htmlFor="edu-degree">Degree</label>
              <input
                id="edu-degree"
                className="hero-role-field__input"
                value={form.degree}
                onChange={(e) => setForm((f) => ({ ...f, degree: e.target.value }))}
                placeholder="e.g. Bachelor of Science"
                disabled={isSubmitting}
              />
            </div>

            <div className="hero-role-field">
              <label className="hero-role-field__label" htmlFor="edu-field">Field of study</label>
              <input
                id="edu-field"
                className="hero-role-field__input"
                value={form.field}
                onChange={(e) => setForm((f) => ({ ...f, field: e.target.value }))}
                placeholder="e.g. Computer Science"
                disabled={isSubmitting}
              />
            </div>

            <div className="hero-role-field">
              <label className="hero-role-field__label" htmlFor="edu-desc">Description</label>
              <textarea
                id="edu-desc"
                className="hero-role-field__input"
                style={{ minHeight: 80, padding: '10px 12px', resize: 'vertical' }}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Notable achievements, activities, or honours..."
                disabled={isSubmitting}
              />
            </div>

            <div className="hero-role-field">
              <label className="hero-role-field__label" htmlFor="edu-start">Start year</label>
              <input
                id="edu-start"
                className="hero-role-field__input"
                type="number"
                min={1900}
                max={2100}
                value={form.start_year}
                onChange={(e) => setForm((f) => ({ ...f, start_year: e.target.value }))}
                placeholder="e.g. 2018"
                disabled={isSubmitting}
              />
            </div>

            <div className="hero-role-field">
              <label className="hero-role-field__label" htmlFor="edu-end">End year</label>
              <input
                id="edu-end"
                className="hero-role-field__input"
                type="number"
                min={1900}
                max={2100}
                value={form.end_year}
                onChange={(e) => setForm((f) => ({ ...f, end_year: e.target.value }))}
                placeholder="e.g. 2022"
                disabled={isSubmitting}
              />
            </div>

            <div className="hero-role-field">
              <label className="hero-role-field__label" htmlFor="edu-order">Sort order</label>
              <input
                id="edu-order"
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
