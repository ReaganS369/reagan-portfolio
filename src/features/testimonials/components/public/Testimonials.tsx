/** @format */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { SectionNumber } from '@/src/components/home/SectionNumber';
import ReviewModal from '../ReviewModal';
import { createReview, getApprovedReviews, type Review } from '../../api/reviews';
import { recommendationLabel, relationshipLabel } from '../../lib/reviewMeta';
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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const item = {
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

function ReviewPlaceholder() {
  return (
    <motion.div className="testimonial-card review-placeholder" variants={item}>
      <span className="review-placeholder__label">
        Your review belongs here
      </span>
      <p className="review-placeholder__text">
        Leave feedback about the portfolio, skills, and experience. Approved
        reviews will appear publicly once the admin reviews them.
      </p>
    </motion.div>
  );
}

function ReviewPreview({ review }: { review: ReviewFormValues }) {
  const recommendText = useMemo(() => {
    if (review.recommend === 'yes') return 'Would recommend';
    if (review.recommend === 'maybe') return 'May recommend';
    if (review.recommend === 'no') return 'Would not recommend';
    return 'No recommendation selected';
  }, [review.recommend]);

  return (
    <motion.div
      className="testimonial-card review-preview-card"
      variants={item}
    >
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
      {review.privateSuggestion && (
        <p className="review-private-note">
          Private note included for admin review.
        </p>
      )}
    </motion.div>
  );
}

function ApprovedReviewCard({ review }: { review: Review }) {
  const recommend = recommendationLabel(review.recommendation);
  const role = relationshipLabel(review.relationship) ?? 'Reviewer';

  return (
    <motion.div className="testimonial-card" variants={item}>
      <div className="review-preview-header">
        <div
          className={`review-avatar review-avatar--${review.avatar}`}
          aria-hidden="true"
        />
        <div>
          <span className="testimonial-name">{review.display_name}</span>
          <span className="testimonial-role">
            {recommend ? `${role} · ${recommend}` : role}
          </span>
        </div>
      </div>
      <StarRating rating={review.rating} />
      <blockquote className="testimonial-review">
        "{review.public_review}"
      </blockquote>
    </motion.div>
  );
}

export function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [modalOpen, setModalOpen] = useState(false);
  const [submittedReview, setSubmittedReview] =
    useState<ReviewFormValues | null>(null);
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);

  useEffect(() => {
    let active = true;
    void getApprovedReviews()
      .then((reviews) => {
        if (active) setApprovedReviews(reviews);
      })
      .catch(() => {
        if (active) setApprovedReviews([]);
      });
    return () => {
      active = false;
    };
  }, []);

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
        <div className="heading-container">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <SectionNumber number="04" title="What Others Say" />
          </motion.div>
        </div>
      </div>

      <div className="testimonials-container">
        <motion.div
          className="testimonials-grid"
          variants={container}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
        >
          <motion.div className="review-cta-card" variants={item}>
            <span className="avg-card__label">Leave Feedback</span>
            <h3 className="review-cta-card__title">
              Share your experience with Reagan’s portfolio.
            </h3>
            <p className="review-cta-card__text">
              Rate the work, choose a premium avatar, and submit a short public
              review. Optional private suggestions let you speak directly to the
              admin.
            </p>
            <button
              type="button"
              className="review-cta-button"
              onClick={() => setModalOpen(true)}
            >
              Leave a Review
            </button>
          </motion.div>

          {approvedReviews.map((review) => (
            <ApprovedReviewCard key={review.id} review={review} />
          ))}

          {submittedReview ? (
            <ReviewPreview review={submittedReview} />
          ) : (
            approvedReviews.length === 0 && <ReviewPlaceholder />
          )}
        </motion.div>
      </div>

      <ReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
