/** @format */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import ReviewModal from '../ReviewModal';
import {
  createReview,
  getApprovedReviews,
  subscribeToReviews,
  type Review,
} from '../../api/reviews';
import { ReviewsCarousel } from './ReviewsCarousel';
import ReviewReadMoreModal from './ReviewReadMoreModal';
import '../../styles/testimonials.css';

export type ReviewFormValues = {
  avatar: string;
  rating: number;
  displayName: string;
  publicReview: string;
  privateSuggestion: string;
  recommend: 'yes' | 'maybe' | 'no' | '';
  relationship: string;
};

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const heading = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? 'star star--filled' : 'star'}>
          ★
        </span>
      ))}
    </div>
  );
}

function PendingPreviewCard({ review }: { review: ReviewFormValues }) {
  const recommendText = useMemo(() => {
    if (review.recommend === 'yes') return 'Would recommend';
    if (review.recommend === 'maybe') return 'May recommend';
    if (review.recommend === 'no') return 'Would not recommend';
    return 'No recommendation selected';
  }, [review.recommend]);

  return (
    <div className="review-preview-card">
      <span className="review-preview-badge">Pending admin approval</span>
      <div className="review-preview-header">
        <div
          className={`review-avatar review-avatar--${review.avatar}`}
          aria-hidden="true"
        />
        <div>
          <span className="testimonial-name">{review.displayName}</span>
          <span className="testimonial-role">
            {review.relationship || 'Reviewer'} · {recommendText}
          </span>
        </div>
      </div>
      <StarRating rating={review.rating} />
      <blockquote className="testimonial-review">
        "{review.publicReview}"
      </blockquote>
      <p className="review-preview-note">
        Thanks for your feedback! This will appear publicly once approved.
      </p>
    </div>
  );
}

export function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const [modalOpen, setModalOpen] = useState(false);
  const [submittedReview, setSubmittedReview] =
    useState<ReviewFormValues | null>(null);

  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readMoreReview, setReadMoreReview] = useState<Review | null>(null);

  const loadReviews = useCallback(async () => {
    try {
      const reviews = await getApprovedReviews();
      setApprovedReviews(reviews);
      setError(null);
    } catch {
      setError('Unable to load reviews right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
    // Live sync: admin approvals/edits/deletes appear here without a refresh.
    const unsubscribe = subscribeToReviews(() => void loadReviews());
    return unsubscribe;
  }, [loadReviews]);

  const averageRating = useMemo(() => {
    if (approvedReviews.length === 0) return 0;
    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / approvedReviews.length;
  }, [approvedReviews]);

  const handleSubmit = (values: ReviewFormValues) => {
    setSubmittedReview(values);
    setModalOpen(false);

    void createReview({
      avatar: values.avatar || 'neutral-1',
      rating: values.rating,
      display_name: values.displayName,
      public_review: values.publicReview,
      private_suggestion: values.privateSuggestion || null,
      recommendation: values.recommend || 'maybe',
      relationship: values.relationship || null,
    }).catch(() => {
      /* submission is best-effort; the preview still reflects their input */
    });
  };

  return (
    <section className="testimonials-section" ref={ref}>
      <div className="section-heading-wrapper">
        <div className="heading-container testimonials-heading-row">
          <motion.div
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
            variants={heading}
          >
            <SectionNumber number="04" title="What Others Say" />
          </motion.div>

          <motion.div
            className="testimonials-heading-meta"
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
            variants={heading}
            transition={{ delay: 0.1 }}
          >
            {approvedReviews.length > 0 && (
              <div className="testimonials-avg" aria-hidden="true">
                <span className="testimonials-avg__number">
                  {averageRating.toFixed(1)}
                </span>
                <StarRating rating={Math.round(averageRating)} />
                <span className="testimonials-avg__count">
                  from {approvedReviews.length} review
                  {approvedReviews.length === 1 ? '' : 's'}
                </span>
              </div>
            )}
            <button
              type="button"
              className="review-cta-button"
              onClick={() => setModalOpen(true)}
            >
              Leave a Review
            </button>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="testimonials-container"
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      >
        {submittedReview && <PendingPreviewCard review={submittedReview} />}

        <ReviewsCarousel
          reviews={approvedReviews}
          loading={loading}
          error={error}
          onRetry={() => {
            setLoading(true);
            void loadReviews();
          }}
          onReadMore={setReadMoreReview}
        />
      </motion.div>

      <ReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ReviewReadMoreModal
        review={readMoreReview}
        onClose={() => setReadMoreReview(null)}
      />
    </section>
  );
}
