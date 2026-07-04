'use client';

/** @format */

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/src/components/ui/Button';
import type {
  Review,
  ReviewRecommendation,
  ReviewStatus,
  ReviewUpdate,
} from '../../api/reviews';
import REVIEW_AVATARS from '../../data/reviewAvatars';
import { avatarEmoji } from '../../lib/reviewMeta';

const RELATIONSHIP_OPTIONS = [
  'client',
  'recruiter',
  'employer',
  'colleague',
  'friend',
  'community-member',
  'visitor',
];

type FormState = {
  display_name: string;
  avatar: string;
  rating: number;
  public_review: string;
  private_suggestion: string;
  recommendation: ReviewRecommendation;
  relationship: string;
  status: ReviewStatus;
  featured: boolean;
};

function buildState(review: Review): FormState {
  return {
    display_name: review.display_name,
    avatar: review.avatar || 'neutral-1',
    rating: review.rating,
    public_review: review.public_review,
    private_suggestion: review.private_suggestion ?? '',
    recommendation: review.recommendation,
    relationship: review.relationship ?? '',
    status: review.status,
    featured: review.featured,
  };
}

type Props = {
  open: boolean;
  review: Review | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ReviewUpdate) => Promise<void>;
};

export default function ReviewEditModal({
  open,
  review,
  isSubmitting,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormState>(() =>
    review ? buildState(review) : buildState(EMPTY),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && review) {
      setForm(buildState(review));
      setError(null);
    }
  }, [open, review]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, isSubmitting, onClose]);

  if (!open || !review) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.display_name.trim()) {
      setError('Display name is required.');
      return;
    }
    if (form.public_review.trim().length < 5) {
      setError('Public review is too short.');
      return;
    }

    try {
      await onSubmit({
        display_name: form.display_name.trim(),
        avatar: form.avatar,
        rating: form.rating,
        public_review: form.public_review.trim(),
        private_suggestion: form.private_suggestion.trim() || null,
        recommendation: form.recommendation,
        relationship: form.relationship || null,
        status: form.status,
        featured: form.featured,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to save review.',
      );
    }
  }

  return createPortal(
    <div
      className="rvw-modal-backdrop"
      role="presentation"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="rvw-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rvw-edit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="rvw-modal__header">
          <div>
            <h2 id="rvw-edit-title" className="rvw-modal__title">
              Edit review
            </h2>
            <p className="rvw-modal__description">
              Update the content, status, and visibility of this review.
            </p>
          </div>
          <button
            type="button"
            className="rvw-modal__close"
            aria-label="Close"
            disabled={isSubmitting}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rvw-modal__body">
            <div className="rvw-field">
              <label className="rvw-field__label" htmlFor="rvw-name">
                Display name
              </label>
              <input
                id="rvw-name"
                className="rvw-field__input"
                value={form.display_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, display_name: e.target.value }))
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="rvw-field">
              <label className="rvw-field__label">Overall rating</label>
              <div className="rvw-rating-picker">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      form.rating >= value
                        ? 'rvw-rating-picker__star rvw-rating-picker__star--on'
                        : 'rvw-rating-picker__star'
                    }
                    onClick={() => setForm((f) => ({ ...f, rating: value }))}
                    disabled={isSubmitting}
                    aria-label={`${value} star${value > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="rvw-field">
              <label className="rvw-field__label" htmlFor="rvw-public">
                Public review
              </label>
              <textarea
                id="rvw-public"
                className="rvw-field__textarea"
                value={form.public_review}
                onChange={(e) =>
                  setForm((f) => ({ ...f, public_review: e.target.value }))
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="rvw-field">
              <label className="rvw-field__label" htmlFor="rvw-private">
                Private suggestions
              </label>
              <textarea
                id="rvw-private"
                className="rvw-field__textarea"
                style={{ minHeight: 50 }}
                value={form.private_suggestion}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    private_suggestion: e.target.value,
                  }))
                }
                placeholder="Only visible to the admin"
                disabled={isSubmitting}
              />
            </div>

            <div className="rvw-field-grid">
              <div className="rvw-field">
                <label className="rvw-field__label" htmlFor="rvw-rec">
                  Recommendation
                </label>
                <select
                  id="rvw-rec"
                  className="rvw-field__input"
                  value={form.recommendation}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      recommendation: e.target.value as ReviewRecommendation,
                    }))
                  }
                  disabled={isSubmitting}
                >
                  <option value="">None</option>
                  <option value="yes">Recommends</option>
                  <option value="maybe">Maybe</option>
                  <option value="no">Does not recommend</option>
                </select>
              </div>

              <div className="rvw-field">
                <label className="rvw-field__label" htmlFor="rvw-rel">
                  Relationship
                </label>
                <select
                  id="rvw-rel"
                  className="rvw-field__input"
                  value={form.relationship}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, relationship: e.target.value }))
                  }
                  disabled={isSubmitting}
                >
                  <option value="">Not specified</option>
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option
                        .split('-')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rvw-field">
              <label className="rvw-field__label" htmlFor="rvw-status">
                Status
              </label>
              <select
                id="rvw-status"
                className="rvw-field__input"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as ReviewStatus,
                  }))
                }
                disabled={isSubmitting}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved (public)</option>
                <option value="hidden">Hidden</option>
              </select>
              <span className="rvw-field__hint">
                Only approved reviews appear on the public portfolio.
              </span>
            </div>

            <div className="rvw-field">
              <label className="rvw-field__label">Avatar</label>
              <div className="rvw-avatar-picker">
                {REVIEW_AVATARS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={
                      form.avatar === option.id
                        ? 'rvw-avatar-picker__item rvw-avatar-picker__item--on'
                        : 'rvw-avatar-picker__item'
                    }
                    onClick={() =>
                      setForm((f) => ({ ...f, avatar: option.id }))
                    }
                    disabled={isSubmitting}
                    aria-label={option.label}
                    aria-pressed={form.avatar === option.id}
                  >
                    {avatarEmoji(option.id)}
                  </button>
                ))}
              </div>
            </div>

            <label className="rvw-toggle">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured: e.target.checked }))
                }
                disabled={isSubmitting}
              />
              <span className="rvw-toggle__label">
                Featured — pinned first on the public portfolio
              </span>
            </label>

            {error && <p className="rvw-field__error">{error}</p>}
          </div>

          <div className="rvw-modal__footer">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

const EMPTY: Review = {
  id: '',
  display_name: '',
  avatar: 'neutral-1',
  rating: 5,
  public_review: '',
  private_suggestion: null,
  recommendation: '',
  relationship: null,
  status: 'pending',
  featured: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
