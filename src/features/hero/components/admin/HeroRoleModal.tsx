'use client';

/** @format */

import clsx from 'clsx';
import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/src/components/ui/Button';
import type { HeroRole } from '@/src/features/hero/api/heroRoles';
import { getStorageUrl } from '@/src/lib/storage';

export type HeroRoleFormValues = {
  title: string;
  icon_url: string;
  display_order: number;
  is_active: boolean;
  iconFile: File | null;
};

type HeroRoleModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  role: HeroRole | null;
  defaultDisplayOrder: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: HeroRoleFormValues) => Promise<void>;
};

function buildInitialState(
  mode: 'create' | 'edit',
  role: HeroRole | null,
  defaultDisplayOrder: number,
): HeroRoleFormValues {
  if (mode === 'edit' && role) {
    return {
      title: role.title,
      icon_url: role.icon_url,
      display_order: role.display_order,
      is_active: role.is_active,
      iconFile: null,
    };
  }

  return {
    title: '',
    icon_url: '',
    display_order: defaultDisplayOrder,
    is_active: true,
    iconFile: null,
  };
}

export default function HeroRoleModal({
  open,
  mode,
  role,
  defaultDisplayOrder,
  isSubmitting,
  onClose,
  onSubmit,
}: HeroRoleModalProps) {
  const [form, setForm] = useState<HeroRoleFormValues>(() =>
    buildInitialState(mode, role, defaultDisplayOrder),
  );
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setForm(buildInitialState(mode, role, defaultDisplayOrder));
    setError(null);
    setPreviewUrl(null);
  }, [open, mode, role, defaultDisplayOrder]);

  useEffect(() => {
    if (!form.iconFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(form.iconFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [form.iconFile]);

  const resolvedPreview = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (form.icon_url) return getStorageUrl(form.icon_url);
    return null;
  }, [previewUrl, form.icon_url]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
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

    const trimmedTitle = form.title.trim();

    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }

    if (mode === 'create' && !form.iconFile && !form.icon_url) {
      setError('Upload an SVG icon for this role.');
      return;
    }

    try {
      await onSubmit({
        ...form,
        title: trimmedTitle,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to save hero role.',
      );
    }
  }

  return createPortal(
    <div
      className="hero-role-modal-backdrop"
      role="presentation"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="hero-role-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hero-role-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="hero-role-modal__header">
          <div>
            <h2 id="hero-role-modal-title" className="hero-role-modal__title">
              {mode === 'create' ? 'Add hero role' : 'Edit hero role'}
            </h2>
            <p className="hero-role-modal__description">
              Roles rotate in the homepage hero carousel. Icons must be SVG.
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
              <label className="hero-role-field__label" htmlFor="hero-role-title">
                Title
              </label>
              <input
                id="hero-role-title"
                className="hero-role-field__input"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. Game Developer"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="hero-role-field">
              <label className="hero-role-field__label" htmlFor="hero-role-icon">
                SVG icon
              </label>
              <input
                id="hero-role-icon"
                className="hero-role-field__file"
                type="file"
                accept="image/svg+xml,.svg"
                disabled={isSubmitting}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setForm((current) => ({
                    ...current,
                    iconFile: file,
                  }));
                }}
              />
              <p className="hero-role-field__hint">
                Uploaded to Supabase Storage (`nngtw-assets/hero-icons/`).
              </p>
            </div>

            {resolvedPreview && (
              <div className="hero-role-icon-preview">
                <div className="hero-role-icon-preview__box">
                  <img src={resolvedPreview} alt="" aria-hidden="true" />
                </div>
                <div className="hero-role-icon-preview__meta">
                  <p className="hero-role-icon-preview__label">Icon preview</p>
                  <p className="hero-role-icon-preview__filename">
                    {form.iconFile?.name ?? form.icon_url}
                  </p>
                </div>
              </div>
            )}

            <div className="hero-role-field">
              <label
                className="hero-role-field__label"
                htmlFor="hero-role-order"
              >
                Display order
              </label>
              <input
                id="hero-role-order"
                className="hero-role-field__input"
                type="number"
                min={0}
                value={form.display_order}
                disabled={isSubmitting}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    display_order: Number(event.target.value),
                  }))
                }
              />
            </div>

            <div className="hero-role-toggle-row">
              <div className="hero-role-toggle-row__copy">
                <span className="hero-role-toggle-row__title">Active</span>
                <span className="hero-role-toggle-row__description">
                  Inactive roles stay in the CMS but are hidden on the public
                  site.
                </span>
              </div>
              <button
                type="button"
                className={clsx(
                  'hero-role-switch',
                  form.is_active && 'hero-role-switch--on',
                )}
                role="switch"
                aria-checked={form.is_active}
                disabled={isSubmitting}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    is_active: !current.is_active,
                  }))
                }
              />
            </div>

            {error && <p className="hero-role-field__error">{error}</p>}
          </div>

          <div className="hero-role-modal__footer">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving…'
                : mode === 'create'
                  ? 'Create role'
                  : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
