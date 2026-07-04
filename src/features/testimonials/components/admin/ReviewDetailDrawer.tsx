'use client';

/** @format */

import {
  Check,
  EyeOff,
  Pencil,
  Pin,
  PinOff,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Review } from '../../api/reviews';
import {
  formatReviewDateTime,
  recommendationLabel,
  relationshipLabel,
} from '../../lib/reviewMeta';
import { ReviewAvatar, StarRating, StatusBadge } from './ReviewBits';

type Action = 'approve' | 'hide' | 'feature' | 'unfeature' | 'delete';

type Props = {
  review: Review | null;
  busyAction: Action | null;
  onClose: () => void;
  onApprove: (review: Review) => void;
  onHide: (review: Review) => void;
  onToggleFeature: (review: Review) => void;
  onEdit: (review: Review) => void;
  onDelete: (review: Review) => void;
};

export default function ReviewDetailDrawer({
  review,
  busyAction,
  onClose,
  onApprove,
  onHide,
  onToggleFeature,
  onEdit,
  onDelete,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
  }, [review?.id]);

  useEffect(() => {
    if (!review) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [review, onClose]);

  if (!review) return null;

  const busy = busyAction !== null;
  const recommendation = recommendationLabel(review.recommendation);
  const relationship = relationshipLabel(review.relationship);

  return createPortal(
    <div className="rvw-drawer-scrim" role="presentation" onClick={onClose}>
      <aside
        className="rvw-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Review details"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="rvw-drawer__header">
          <span className="rvw-drawer__eyebrow">Review details</span>
          <button
            type="button"
            className="rvw-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="rvw-drawer__body">
          <div className="rvw-drawer__identity">
            <ReviewAvatar avatar={review.avatar} size="lg" />
            <div>
              <div className="rvw-drawer__name">{review.display_name}</div>
              <StatusBadge review={review} />
            </div>
          </div>

          <div className="rvw-drawer__rating">
            <StarRating rating={review.rating} />
            <span className="rvw-drawer__rating-value">
              {review.rating.toFixed(0)}/5
            </span>
          </div>

          <div className="rvw-detail-field">
            <span className="rvw-detail-field__label">Public review</span>
            <p className="rvw-detail-field__value">“{review.public_review}”</p>
          </div>

          {review.private_suggestion && (
            <div className="rvw-detail-field rvw-detail-field--private">
              <span className="rvw-detail-field__label">
                Private suggestions
              </span>
              <p className="rvw-detail-field__value">
                {review.private_suggestion}
              </p>
            </div>
          )}

          <div className="rvw-detail-grid">
            {recommendation && (
              <div className="rvw-detail-field">
                <span className="rvw-detail-field__label">Recommendation</span>
                <p className="rvw-detail-field__value">{recommendation}</p>
              </div>
            )}
            {relationship && (
              <div className="rvw-detail-field">
                <span className="rvw-detail-field__label">Relationship</span>
                <p className="rvw-detail-field__value">{relationship}</p>
              </div>
            )}
          </div>

          <div className="rvw-detail-field">
            <span className="rvw-detail-field__label">Submitted</span>
            <p className="rvw-detail-field__value">
              {formatReviewDateTime(review.created_at)}
            </p>
          </div>
        </div>

        <div className="rvw-drawer__actions">
          {review.status !== 'approved' && (
            <button
              type="button"
              className="rvw-action rvw-action--approve"
              disabled={busy}
              onClick={() => onApprove(review)}
            >
              <Check size={15} />
              {busyAction === 'approve' ? 'Approving…' : 'Approve'}
            </button>
          )}

          {review.status !== 'hidden' && (
            <button
              type="button"
              className="rvw-action"
              disabled={busy}
              onClick={() => onHide(review)}
            >
              <EyeOff size={15} />
              {busyAction === 'hide' ? 'Hiding…' : 'Hide'}
            </button>
          )}

          <button
            type="button"
            className="rvw-action"
            disabled={busy}
            onClick={() => onToggleFeature(review)}
          >
            {review.featured ? <PinOff size={15} /> : <Pin size={15} />}
            {busyAction === 'feature' || busyAction === 'unfeature'
              ? 'Saving…'
              : review.featured
                ? 'Unfeature'
                : 'Feature'}
          </button>

          <button
            type="button"
            className="rvw-action"
            disabled={busy}
            onClick={() => onEdit(review)}
          >
            <Pencil size={15} />
            Edit
          </button>

          {confirmDelete ? (
            <div className="rvw-delete-confirm">
              <span className="rvw-delete-confirm__label">Delete forever?</span>
              <button
                type="button"
                className="rvw-action rvw-action--danger"
                disabled={busy}
                onClick={() => onDelete(review)}
              >
                {busyAction === 'delete' ? 'Deleting…' : 'Confirm'}
              </button>
              <button
                type="button"
                className="rvw-action"
                disabled={busy}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="rvw-action rvw-action--danger"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={15} />
              Delete
            </button>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
