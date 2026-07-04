'use client';

/** @format */

import Link from 'next/link';
import Card from '@/src/components/ui/Card';
import { useReviews } from '../../context/ReviewsProvider';
import { formatReviewDate } from '../../lib/reviewMeta';
import { ReviewAvatar, StarRating, StatusBadge } from './ReviewBits';
import ReviewNotificationBanner from './ReviewNotificationBanner';
import './reviews-admin.css';

export default function DashboardRecentReviews() {
  const { recent, loading } = useReviews();

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <div className="admin-section__heading">
          <h2 className="admin-section__title">Recent Reviews</h2>
          <p className="admin-section__description">
            The latest feedback submitted from your portfolio.
          </p>
        </div>
        <div className="admin-section__action">
          <Link
            href="/admin/reviews"
            className="admin-btn admin-btn--secondary admin-btn--sm"
          >
            View All Reviews
          </Link>
        </div>
      </div>

      <div className="admin-section__content">
        <ReviewNotificationBanner />

        <Card padding="none" style={{ marginTop: 'var(--admin-space-4)' }}>
          {loading ? (
            <p className="rvw-recent__empty">Loading reviews…</p>
          ) : recent.length === 0 ? (
            <p className="rvw-recent__empty">No reviews submitted yet.</p>
          ) : (
            <ul className="rvw-recent">
              {recent.map((review) => (
                <li key={review.id} className="rvw-recent__item">
                  <ReviewAvatar avatar={review.avatar} size="sm" />
                  <div className="rvw-recent__body">
                    <span className="rvw-recent__name">
                      {review.display_name}
                    </span>
                    <StarRating rating={review.rating} />
                  </div>
                  <div className="rvw-recent__meta">
                    <StatusBadge review={review} />
                    <span className="rvw-recent__date">
                      {formatReviewDate(review.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </section>
  );
}
