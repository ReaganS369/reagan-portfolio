/** @format */

'use client';

import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useMemo, useState } from 'react';
import Button from '@/src/components/ui/Button';
import type { SocialLink } from '@/src/features/social-links/api/social-links';

export type SocialLinkFormValues = {
  platform: string;
  url: string;
  icon: string;
  display_order: number;
  iconFile: File | null;
};

type SocialLinkModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  link: SocialLink | null;
  defaultDisplayOrder: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: SocialLinkFormValues) => Promise<void>;
};

function buildInitialState(
  mode: 'create' | 'edit',
  link: SocialLink | null,
  defaultDisplayOrder: number,
): SocialLinkFormValues {
  if (mode === 'edit' && link) {
    return {
      platform: link.platform,
      url: link.url,
      icon: link.icon,
      display_order: link.sort_order,
      iconFile: null,
    };
  }

  return {
    platform: '',
    url: '',
    icon: '',
    display_order: defaultDisplayOrder,
    iconFile: null,
  };
}

export default function SocialLinkModal({
  open,
  mode,
  link,
  defaultDisplayOrder,
  isSubmitting,
  onClose,
  onSubmit,
}: SocialLinkModalProps) {
  const [form, setForm] = useState<SocialLinkFormValues>(() =>
    buildInitialState(mode, link, defaultDisplayOrder),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setForm(buildInitialState(mode, link, defaultDisplayOrder));
    setError(null);
  }, [open, mode, link, defaultDisplayOrder]);

  const previewUrl = useMemo(() => {
    if (!form.iconFile) return null;
    return URL.createObjectURL(form.iconFile);
  }, [form.iconFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resolvedPreview = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (form.icon) return form.icon;
    return null;
  }, [previewUrl, form.icon]);

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

    const trimmedPlatform = form.platform.trim();
    const trimmedUrl = form.url.trim();

    if (!trimmedPlatform) {
      setError('Platform name is required.');
      return;
    }

    if (!trimmedUrl) {
      setError('URL is required.');
      return;
    }

    if (mode === 'create' && !form.iconFile && !form.icon) {
      setError('Upload an SVG icon for this social link.');
      return;
    }

    try {
      await onSubmit({
        ...form,
        platform: trimmedPlatform,
        url: trimmedUrl,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to save social link.',
      );
    }
  }

  return createPortal(
    <div
      className="social-link-modal-backdrop"
      role="presentation"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="social-link-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="social-link-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="social-link-modal__header">
          <div>
            <h2
              id="social-link-modal-title"
              className="social-link-modal__title"
            >
              {mode === 'create' ? 'Add social link' : 'Edit social link'}
            </h2>
            <p className="social-link-modal__description">
              Social links appear in the public homepage. Upload a 64×64 SVG
              icon.
            </p>
          </div>
          <button
            type="button"
            className="social-link-modal__close"
            aria-label="Close modal"
            disabled={isSubmitting}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="social-link-modal__body">
            <div className="social-link-field">
              <label
                className="social-link-field__label"
                htmlFor="social-link-platform"
              >
                Platform
              </label>
              <input
                id="social-link-platform"
                className="social-link-field__input"
                value={form.platform}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    platform: event.target.value,
                  }))
                }
                placeholder="e.g. GitHub"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="social-link-field">
              <label
                className="social-link-field__label"
                htmlFor="social-link-url"
              >
                URL
              </label>
              <input
                id="social-link-url"
                className="social-link-field__input"
                value={form.url}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    url: event.target.value,
                  }))
                }
                placeholder="https://"
                disabled={isSubmitting}
              />
            </div>

            <div className="social-link-field">
              <label
                className="social-link-field__label"
                htmlFor="social-link-icon"
              >
                Icon SVG
              </label>
              <input
                id="social-link-icon"
                className="social-link-field__file"
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
              <p className="social-link-field__hint">
                Upload a 64×64 SVG icon for the public homepage.
              </p>
            </div>

            {resolvedPreview && (
              <div className="social-link-icon-preview">
                <div className="social-link-icon-preview__box">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolvedPreview} alt="Icon preview" />
                </div>
                <div className="social-link-icon-preview__meta">
                  <p className="social-link-icon-preview__label">
                    Icon preview
                  </p>
                  <p className="social-link-icon-preview__filename">
                    {form.iconFile?.name ?? form.icon}
                  </p>
                </div>
              </div>
            )}

            <div className="social-link-field">
              <label
                className="social-link-field__label"
                htmlFor="social-link-order"
              >
                Display order
              </label>
              <input
                id="social-link-order"
                className="social-link-field__input"
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

            {error && <p className="social-link-field__error">{error}</p>}
          </div>

          <div className="social-link-modal__footer">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {mode === 'create' ? 'Create social link' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
