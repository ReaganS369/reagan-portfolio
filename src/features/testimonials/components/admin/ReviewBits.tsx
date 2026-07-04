/** @format */

import clsx from 'clsx';
import type { Review, ReviewRecommendation } from '../../api/reviews';
import {
  avatarEmoji,
  recommendationLabel,
  recommendationTone,
  statusBadge,
} from '../../lib/reviewMeta';

export function ReviewAvatar({
  avatar,
  size = 'md',
}: {
  avatar: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <span
      className={clsx('rvw-avatar', `rvw-avatar--${size}`)}
      aria-hidden="true"
    >
      {avatarEmoji(avatar)}
    </span>
  );
}

export function StarRating({ rating }: { rating: number }) {
  return (
    <span className="rvw-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={clsx('rvw-star', i < rating && 'rvw-star--on')}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function StatusBadge({ review }: { review: Review }) {
  const badge = statusBadge(review);
  return (
    <span className={clsx('rvw-badge', `rvw-badge--${badge.tone}`)}>
      {badge.label}
    </span>
  );
}

export function RecommendationBadge({
  recommendation,
}: {
  recommendation: ReviewRecommendation;
}) {
  const label = recommendationLabel(recommendation);
  const tone = recommendationTone(recommendation);
  if (!label || !tone) {
    return <span className="rvw-muted">—</span>;
  }
  return (
    <span className={clsx('rvw-rec', `rvw-rec--${tone}`)}>{label}</span>
  );
}
