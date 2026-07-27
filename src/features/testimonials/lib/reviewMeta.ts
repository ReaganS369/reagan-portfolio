/** @format */

import type { ReviewRecommendation } from '../api/reviews';

/**
 * Presentation helpers for the public testimonials carousel and its
 * read-more modal.
 *
 * This file used to be shared with the CMS, so it also carried status
 * badges, review stats, filter definitions, and the moderation sort —
 * all of which moved to the nngtw-admin app along with the rest of the
 * admin. What's left is only what the public site renders.
 */

/* ------------------------ recommendation ------------------------ */

const RECOMMENDATION_LABEL: Record<
  Exclude<ReviewRecommendation, ''>,
  string
> = {
  yes: 'Recommends',
  maybe: 'Maybe',
  no: 'Does not recommend',
};

export function recommendationLabel(
  recommendation: ReviewRecommendation,
): string | null {
  if (!recommendation) return null;
  return RECOMMENDATION_LABEL[recommendation] ?? null;
}

/* ------------------------ relationship ------------------------ */

export function relationshipLabel(
  relationship: string | null | undefined,
): string | null {
  if (!relationship) return null;
  return relationship
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/* ---------------------------- dates --------------------------- */

export function formatReviewDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
