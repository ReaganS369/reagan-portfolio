/** @format */

import type {
  Review,
  ReviewRecommendation,
  ReviewStatus,
} from '../api/reviews';

/* --------------------------- avatars --------------------------- */

export const AVATAR_EMOJI: Record<string, string> = {
  'short-hair': '👨',
  beard: '🧔',
  glasses: '🤓',
  'short-hair-female': '👱‍♀️',
  'long-hair': '👩',
  'curly-hair': '👨‍🦱',
  'neutral-1': '🙂',
  'neutral-2': '😌',
};

export function avatarEmoji(avatar: string | null | undefined): string {
  if (!avatar) return '🙂';
  return AVATAR_EMOJI[avatar] ?? '🙂';
}

/* --------------------------- status --------------------------- */

export type ReviewBadge = {
  label: string;
  tone: 'pending' | 'approved' | 'hidden' | 'featured';
};

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  hidden: 'Hidden',
};

/**
 * A featured review outranks its raw status for display purposes — it reads
 * as "Featured" everywhere in the admin, matching the public ordering.
 */
export function statusBadge(review: Review): ReviewBadge {
  if (review.featured) {
    return { label: 'Featured', tone: 'featured' };
  }
  return { label: STATUS_LABEL[review.status] ?? 'Pending', tone: review.status };
}

/* ----------------------- recommendation ----------------------- */

const RECOMMENDATION_LABEL: Record<Exclude<ReviewRecommendation, ''>, string> = {
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

export function recommendationTone(
  recommendation: ReviewRecommendation,
): 'yes' | 'maybe' | 'no' | null {
  if (!recommendation) return null;
  return recommendation;
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

export function formatReviewDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/* ---------------------------- stats --------------------------- */

export type ReviewStats = {
  total: number;
  pending: number;
  approved: number;
  hidden: number;
  featured: number;
  averageRating: number;
};

export function computeReviewStats(reviews: Review[]): ReviewStats {
  const rated = reviews.filter((r) => r.rating > 0);
  const ratingSum = rated.reduce((sum, r) => sum + r.rating, 0);

  return {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    hidden: reviews.filter((r) => r.status === 'hidden').length,
    featured: reviews.filter((r) => r.featured).length,
    averageRating: rated.length ? ratingSum / rated.length : 0,
  };
}

/* ------------------------ notifications ----------------------- */

/**
 * Human-readable pending summary, e.g. "1 New Review Pending" /
 * "3 Reviews Awaiting Approval" / "No pending reviews.".
 */
export function pendingNotificationLabel(pending: number): string {
  if (pending <= 0) return 'No pending reviews.';
  if (pending === 1) return '1 New Review Pending';
  return `${pending} Reviews Awaiting Approval`;
}

/* -------------------------- filtering ------------------------- */

export type ReviewFilter =
  | 'all'
  | 'pending'
  | 'approved'
  | 'hidden'
  | 'featured'
  | 'highest'
  | 'lowest';

export const REVIEW_FILTERS: { id: ReviewFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'hidden', label: 'Hidden' },
  { id: 'featured', label: 'Featured' },
  { id: 'highest', label: 'Highest Rated' },
  { id: 'lowest', label: 'Lowest Rated' },
];

/** newest first, but featured always float to the top */
function byRecencyFeaturedFirst(a: Review, b: Review): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export function filterAndSortReviews(
  reviews: Review[],
  filter: ReviewFilter,
  search: string,
): Review[] {
  const query = search.trim().toLowerCase();

  const searched = query
    ? reviews.filter(
        (r) =>
          r.display_name.toLowerCase().includes(query) ||
          r.public_review.toLowerCase().includes(query),
      )
    : reviews;

  let scoped = searched;
  switch (filter) {
    case 'pending':
    case 'approved':
    case 'hidden':
      scoped = searched.filter((r) => r.status === filter);
      break;
    case 'featured':
      scoped = searched.filter((r) => r.featured);
      break;
    default:
      scoped = searched;
  }

  const sorted = [...scoped];
  if (filter === 'highest') {
    sorted.sort((a, b) => b.rating - a.rating || byRecencyFeaturedFirst(a, b));
  } else if (filter === 'lowest') {
    sorted.sort((a, b) => a.rating - b.rating || byRecencyFeaturedFirst(a, b));
  } else {
    sorted.sort(byRecencyFeaturedFirst);
  }

  return sorted;
}
