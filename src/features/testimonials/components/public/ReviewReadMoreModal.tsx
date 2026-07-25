'use client';

/** @format */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Review } from '../../api/reviews';
import {
  formatReviewDate,
  recommendationLabel,
  relationshipLabel,
} from '../../lib/reviewMeta';

type Props = {
  review: Review | null;
  onClose: () => void;
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="rm-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? 'rm-star rm-star--on' : 'rm-star'}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function ReviewReadMoreModal({ review, onClose }: Props) {
  useEffect(() => {
    if (!review) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [review, onClose]);

  if (!review) return null;

  const recommend = recommendationLabel(review.recommendation);
  const role = relationshipLabel(review.relationship);

  return createPortal(
    <div
      className="rm-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="rm-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Full review"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="rm-close" aria-label="Close" onClick={onClose}>
          ×
        </button>

        <div className="rm-header">
          <div
            className={`review-avatar review-avatar--${review.avatar}`}
            aria-hidden="true"
          />
          <div>
            <p className="rm-name">{review.display_name}</p>
            <p className="rm-meta">
              {[role, recommend].filter(Boolean).join(' · ') || 'Reviewer'}
            </p>
          </div>
        </div>

        <StarRow rating={review.rating} />

        <blockquote className="rm-quote">"{review.public_review}"</blockquote>

        <p className="rm-date">{formatReviewDate(review.created_at)}</p>
      </div>
    </div>,
    document.body,
  );
}
