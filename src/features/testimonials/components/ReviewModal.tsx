/** @format */

'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import REVIEW_AVATARS from '../data/reviewAvatars';
import './review-modal.css';

const MAX_PUBLIC_REVIEW_LENGTH = 300;

interface ReviewFormValues {
  avatar: string;
  rating: number;
  displayName: string;
  publicReview: string;
  privateSuggestion: string;
  recommend: 'yes' | 'maybe' | 'no' | '';
  relationship: string;
}

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ReviewFormValues) => void;
}

const initialValues: ReviewFormValues = {
  avatar: '',
  rating: 5,
  displayName: '',
  publicReview: '',
  privateSuggestion: '',
  recommend: '',
  relationship: '',
};

export default function ReviewModal({
  open,
  onClose,
  onSubmit,
}: ReviewModalProps) {
  const [values, setValues] = useState<ReviewFormValues>(initialValues);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setSubmitted(false);
    }
  }, [open]);

  const errors = useMemo(() => {
    return {
      displayName: submitted && values.displayName.trim().length === 0,
      publicReview: submitted && values.publicReview.trim().length < 20,
    };
  }, [submitted, values.displayName, values.publicReview]);

  const handleChange = (
    field: keyof ReviewFormValues,
    value: string | number,
  ) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (values.displayName.trim() && values.publicReview.trim().length >= 20) {
      onSubmit(values);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="review-modal-backdrop" role="dialog" aria-modal="true">
      <div className="review-modal">
        <div className="review-modal__header">
          <div>
            <p className="review-modal__eyebrow">Leave Feedback</p>
            <h2 className="review-modal__title">
              Share a review for the portfolio
            </h2>
          </div>
          <button
            type="button"
            className="review-modal__close"
            onClick={onClose}
            aria-label="Close review modal"
          >
            ×
          </button>
        </div>

        <div className="review-modal__body">
          <form
            id="review-form"
            className="review-modal__form"
            onSubmit={handleSubmit}
          >
            <div className="review-modal__section">
              <label className="review-label" htmlFor="review-rating">
                Overall Rating
              </label>
              <div className="rating-row">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={`rating-chip ${values.rating === value ? 'rating-chip--active' : ''}`}
                      onClick={() => handleChange('rating', value)}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="review-modal__section">
              <label className="review-label" htmlFor="review-display-name">
                Display Name
              </label>
              <input
                id="review-display-name"
                className={`review-input ${errors.displayName ? 'review-input--error' : ''}`}
                type="text"
                value={values.displayName}
                onChange={(event) =>
                  handleChange('displayName', event.target.value)
                }
                placeholder="How should people see you?"
              />
              {errors.displayName && (
                <p className="review-error">Please enter a display name.</p>
              )}
            </div>

            <div className="review-modal__section">
              <label className="review-label" htmlFor="review-public-review">
                Public Review
              </label>
              <textarea
                id="review-public-review"
                className={`review-textarea ${errors.publicReview ? 'review-textarea--error' : ''}`}
                value={values.publicReview}
                onChange={(event) =>
                  handleChange('publicReview', event.target.value)
                }
                maxLength={MAX_PUBLIC_REVIEW_LENGTH}
                placeholder="What did you think of Reagan’s portfolio, work, or skills?"
                rows={5}
              />
              <div className="review-hint-row">
                <span className="review-note">
                  Please write your review in English if possible so visitors
                  from around the world can understand it.
                </span>
                <span className="review-count">
                  {values.publicReview.length}/300
                </span>
              </div>
              {errors.publicReview && (
                <p className="review-error">
                  Please enter a short public review.
                </p>
              )}
            </div>

            <div className="review-modal__section review-modal__section--grid">
              <div>
                <label
                  className="review-label"
                  htmlFor="review-private-suggestion"
                >
                  Private Suggestions{' '}
                  <span className="review-label--optional">(private)</span>
                </label>
                <textarea
                  id="review-private-suggestion"
                  className="review-textarea"
                  value={values.privateSuggestion}
                  onChange={(event) =>
                    handleChange('privateSuggestion', event.target.value)
                  }
                  rows={3}
                  placeholder="Share ideas, improvements, or issues for the admin only."
                />
              </div>

              <div>
                <label className="review-label" htmlFor="review-recommend">
                  Would you recommend this work?
                </label>
                <div className="toggle-group">
                  {['yes', 'maybe', 'no'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`toggle-chip ${values.recommend === option ? 'toggle-chip--active' : ''}`}
                      onClick={() => handleChange('recommend', option)}
                    >
                      {option === 'yes'
                        ? 'Yes'
                        : option === 'maybe'
                          ? 'Maybe'
                          : 'No'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="review-modal__section">
              <label className="review-label" htmlFor="review-relationship">
                Relationship
              </label>
              <select
                id="review-relationship"
                className="review-select"
                value={values.relationship}
                onChange={(event) =>
                  handleChange('relationship', event.target.value)
                }
              >
                <option value="">Select one</option>
                <option value="client">Client</option>
                <option value="recruiter">Recruiter</option>
                <option value="employer">Employer</option>
                <option value="colleague">Colleague</option>
                <option value="friend">Friend</option>
                <option value="community-member">Community Member</option>
                <option value="visitor">Visitor</option>
              </select>
            </div>

            <div className="review-modal__section">
              <span className="review-label">Avatar</span>
              <div className="avatar-grid">
                {REVIEW_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    className={`avatar-option ${values.avatar === avatar.id ? 'avatar-option--selected' : ''}`}
                    aria-pressed={values.avatar === avatar.id}
                    onClick={() => handleChange('avatar', avatar.id)}
                  >
                    <div
                      className={`avatar-preview avatar-preview--${avatar.className}`}
                      aria-hidden="true"
                    />
                    <span className="avatar-label">{avatar.label}</span>
                    <span className="avatar-sublabel">{avatar.subtitle}</span>
                  </button>
                ))}
              </div>
              {!values.avatar && (
                <p className="avatar-empty-hint">
                  Choose an avatar to represent your public review.
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="review-modal__footer">
          <button type="button" className="review-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="review-form" className="review-primary">
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
