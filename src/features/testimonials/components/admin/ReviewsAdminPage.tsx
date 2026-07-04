'use client';

/** @format */

import { RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader, Section } from '@/src/components/ui';
import Card from '@/src/components/ui/Card';
import {
  deleteReview,
  updateReview,
  type Review,
  type ReviewUpdate,
} from '../../api/reviews';
import { useReviews } from '../../context/ReviewsProvider';
import {
  filterAndSortReviews,
  formatReviewDate,
  REVIEW_FILTERS,
  type ReviewFilter,
} from '../../lib/reviewMeta';
import {
  RecommendationBadge,
  ReviewAvatar,
  StarRating,
  StatusBadge,
} from './ReviewBits';
import ReviewDetailDrawer from './ReviewDetailDrawer';
import ReviewEditModal from './ReviewEditModal';
import ReviewNotificationBanner from './ReviewNotificationBanner';
import './reviews-admin.css';

type BusyAction = 'approve' | 'hide' | 'feature' | 'unfeature' | 'delete';

export default function ReviewsAdminPage() {
  const { reviews, loading, error, stats, refresh, setReviews } = useReviews();

  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Review | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const visible = useMemo(
    () => filterAndSortReviews(reviews, filter, search),
    [reviews, filter, search],
  );

  const selected = useMemo(
    () => reviews.find((r) => r.id === selectedId) ?? null,
    [reviews, selectedId],
  );

  const statCards = [
    { label: 'Pending', value: stats.pending, tone: 'pending' },
    { label: 'Approved', value: stats.approved, tone: 'approved' },
    { label: 'Hidden', value: stats.hidden, tone: 'hidden' },
    { label: 'Featured', value: stats.featured, tone: 'featured' },
    {
      label: 'Average Rating',
      value: stats.total ? `${stats.averageRating.toFixed(1)} ★` : '—',
      tone: 'accent',
    },
    { label: 'Total Reviews', value: stats.total, tone: 'neutral' },
  ] as const;

  function applyLocal(updated: Review) {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  async function runAction(
    action: BusyAction,
    review: Review,
    patch: ReviewUpdate,
  ) {
    setBusyAction(action);
    setActionError(null);
    try {
      const updated = await updateReview(review.id, patch);
      applyLocal(updated);
      void refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Action failed. Please retry.',
      );
    } finally {
      setBusyAction(null);
    }
  }

  const handleApprove = (review: Review) =>
    runAction('approve', review, { status: 'approved' });

  const handleHide = (review: Review) =>
    runAction('hide', review, { status: 'hidden', featured: false });

  const handleToggleFeature = (review: Review) =>
    review.featured
      ? runAction('unfeature', review, { featured: false })
      : runAction('feature', review, { featured: true, status: 'approved' });

  async function handleDelete(review: Review) {
    setBusyAction('delete');
    setActionError(null);
    try {
      await deleteReview(review.id);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      setSelectedId(null);
      void refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to delete review.',
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleEditSubmit(values: ReviewUpdate) {
    if (!editing) return;
    setIsSaving(true);
    try {
      const updated = await updateReview(editing.id, values);
      applyLocal(updated);
      void refresh();
      setEditing(null);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Moderate feedback submitted from the portfolio. Approve, hide, feature, or edit reviews — the public site updates automatically."
        action={
          <button
            type="button"
            className="admin-btn admin-btn--secondary admin-btn--sm"
            onClick={() => void refresh()}
          >
            <RefreshCw size={14} style={{ marginRight: 6 }} />
            Refresh
          </button>
        }
      />

      <ReviewNotificationBanner withLink={false} />

      <div className="rvw-stat-grid">
        {statCards.map((card) => (
          <Card key={card.label} padding="md" className="rvw-stat-card">
            <p className="rvw-stat-card__label">{card.label}</p>
            <p className={`rvw-stat-card__value rvw-stat-card__value--${card.tone}`}>
              {card.value}
            </p>
          </Card>
        ))}
      </div>

      <Section
        title="All reviews"
        description="Click any row to open the full review and moderation actions."
      >
        {(error || actionError) && (
          <div className="rvw-alert">{actionError ?? error}</div>
        )}

        <div className="rvw-toolbar">
          <div className="rvw-search">
            <Search size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or review text…"
            />
          </div>
          <div className="rvw-filters">
            {REVIEW_FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={
                  filter === option.id
                    ? 'rvw-filter rvw-filter--on'
                    : 'rvw-filter'
                }
                onClick={() => setFilter(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <Card padding="none">
          <div className="admin-table-wrap">
            <table className="admin-table rvw-table">
              <thead className="admin-table__head">
                <tr>
                  <th className="admin-table__head-cell">Avatar</th>
                  <th className="admin-table__head-cell">Display Name</th>
                  <th className="admin-table__head-cell">Rating</th>
                  <th className="admin-table__head-cell">Recommendation</th>
                  <th className="admin-table__head-cell">Relationship</th>
                  <th className="admin-table__head-cell">Status</th>
                  <th className="admin-table__head-cell">Submitted</th>
                </tr>
              </thead>
              <tbody className="admin-table__body">
                {loading ? (
                  <tr>
                    <td className="admin-table__cell rvw-table__empty" colSpan={7}>
                      Loading reviews…
                    </td>
                  </tr>
                ) : visible.length === 0 ? (
                  <tr>
                    <td className="admin-table__cell rvw-table__empty" colSpan={7}>
                      {reviews.length === 0
                        ? 'No reviews have been submitted yet.'
                        : 'No reviews match this filter or search.'}
                    </td>
                  </tr>
                ) : (
                  visible.map((review) => (
                    <tr
                      key={review.id}
                      className="admin-table__row rvw-table__row"
                      onClick={() => setSelectedId(review.id)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedId(review.id);
                        }
                      }}
                    >
                      <td className="admin-table__cell">
                        <ReviewAvatar avatar={review.avatar} size="sm" />
                      </td>
                      <td className="admin-table__cell rvw-table__name">
                        {review.display_name}
                      </td>
                      <td className="admin-table__cell">
                        <StarRating rating={review.rating} />
                      </td>
                      <td className="admin-table__cell">
                        <RecommendationBadge
                          recommendation={review.recommendation}
                        />
                      </td>
                      <td className="admin-table__cell">
                        {review.relationship
                          ? review.relationship
                              .split('-')
                              .map(
                                (w) => w.charAt(0).toUpperCase() + w.slice(1),
                              )
                              .join(' ')
                          : '—'}
                      </td>
                      <td className="admin-table__cell">
                        <StatusBadge review={review} />
                      </td>
                      <td className="admin-table__cell">
                        {formatReviewDate(review.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      <ReviewDetailDrawer
        review={selected}
        busyAction={busyAction}
        onClose={() => setSelectedId(null)}
        onApprove={handleApprove}
        onHide={handleHide}
        onToggleFeature={handleToggleFeature}
        onEdit={(review) => setEditing(review)}
        onDelete={handleDelete}
      />

      <ReviewEditModal
        open={editing !== null}
        review={editing}
        isSubmitting={isSaving}
        onClose={() => {
          if (!isSaving) setEditing(null);
        }}
        onSubmit={handleEditSubmit}
      />
    </>
  );
}
