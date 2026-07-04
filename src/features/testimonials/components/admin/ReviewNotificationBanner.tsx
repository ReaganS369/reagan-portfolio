'use client';

/** @format */

import { Bell, BellRing } from 'lucide-react';
import Link from 'next/link';
import { useReviews } from '../../context/ReviewsProvider';
import { pendingNotificationLabel } from '../../lib/reviewMeta';
import './reviews-admin.css';

type Props = {
  /** Show a "Review now" link (hidden on the reviews page itself). */
  withLink?: boolean;
};

export default function ReviewNotificationBanner({ withLink = true }: Props) {
  const { pendingCount, loading } = useReviews();

  if (loading) return null;

  const hasPending = pendingCount > 0;

  return (
    <div
      className={clsxBanner(hasPending)}
      role="status"
      aria-live="polite"
    >
      <span className="rvw-banner__icon" aria-hidden="true">
        {hasPending ? <BellRing size={18} /> : <Bell size={18} />}
      </span>
      <span className="rvw-banner__text">
        {hasPending
          ? `🔔 ${pendingNotificationLabel(pendingCount)}`
          : 'No pending reviews.'}
      </span>
      {hasPending && withLink && (
        <Link href="/admin/reviews" className="rvw-banner__action">
          Review now
        </Link>
      )}
    </div>
  );
}

function clsxBanner(hasPending: boolean): string {
  return hasPending
    ? 'rvw-banner rvw-banner--active'
    : 'rvw-banner rvw-banner--calm';
}
