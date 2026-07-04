'use client';

/** @format */

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useReviews } from '../../context/ReviewsProvider';
import {
  avatarEmoji,
  formatReviewDate,
  pendingNotificationLabel,
} from '../../lib/reviewMeta';
import './reviews-admin.css';

export default function ReviewNotificationBell() {
  const { reviews, pendingCount } = useReviews();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const pending = useMemo(
    () => reviews.filter((r) => r.status === 'pending').slice(0, 6),
    [reviews],
  );

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="rvw-bell" ref={wrapRef}>
      <button
        type="button"
        className="rvw-bell__button"
        aria-label={pendingNotificationLabel(pendingCount)}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell size={18} strokeWidth={1.75} />
        {pendingCount > 0 && (
          <span className="rvw-bell__dot" aria-hidden="true">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </button>

      {open && (
        <div className="rvw-bell__panel" role="menu">
          <div className="rvw-bell__panel-head">
            <span className="rvw-bell__panel-title">
              {pendingCount > 0
                ? `🔔 ${pendingNotificationLabel(pendingCount)}`
                : 'Notifications'}
            </span>
          </div>

          {pending.length === 0 ? (
            <p className="rvw-bell__empty">No pending reviews.</p>
          ) : (
            <ul className="rvw-bell__list">
              {pending.map((review) => (
                <li key={review.id}>
                  <Link
                    href="/admin/reviews"
                    className="rvw-bell__item"
                    onClick={() => setOpen(false)}
                    role="menuitem"
                  >
                    <span className="rvw-bell__avatar" aria-hidden="true">
                      {avatarEmoji(review.avatar)}
                    </span>
                    <span className="rvw-bell__item-body">
                      <span className="rvw-bell__item-name">
                        {review.display_name}
                      </span>
                      <span className="rvw-bell__item-meta">
                        {'★'.repeat(review.rating)} ·{' '}
                        {formatReviewDate(review.created_at)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/admin/reviews"
            className="rvw-bell__footer"
            onClick={() => setOpen(false)}
          >
            View All Reviews
          </Link>
        </div>
      )}
    </div>
  );
}
