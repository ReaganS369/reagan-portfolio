'use client';

/** @format */

import { MessageSquareOff, RefreshCw } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { Review } from '../../api/reviews';
import {
  formatReviewDate,
  recommendationLabel,
  relationshipLabel,
} from '../../lib/reviewMeta';

const AUTO_SCROLL_PX_PER_FRAME = 0.45;
const RESUME_DELAY_MS = 1400;

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="rvw-card-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? 'star star--filled' : 'star'}>
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewCarouselCard({
  review,
  onReadMore,
}: {
  review: Review;
  onReadMore: (review: Review) => void;
}) {
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useLayoutEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    setIsClamped(el.scrollHeight - el.clientHeight > 2);
  }, [review.public_review]);

  const recommend = recommendationLabel(review.recommendation);
  const role = relationshipLabel(review.relationship) ?? 'Reviewer';

  return (
    <div className="rvw-carousel-card" aria-hidden={undefined}>
      <div className="rvw-carousel-card__header">
        <div
          className={`review-avatar review-avatar--${review.avatar}`}
          aria-hidden="true"
        />
        <div className="rvw-carousel-card__identity">
          <span className="testimonial-name">{review.display_name}</span>
          <span className="testimonial-role">
            {recommend ? `${role} · ${recommend}` : role}
          </span>
        </div>
      </div>

      <StarRow rating={review.rating} />

      <p ref={quoteRef} className="rvw-carousel-card__quote">
        "{review.public_review}"
      </p>

      <div className="rvw-carousel-card__footer">
        <span className="rvw-carousel-card__date">
          {formatReviewDate(review.created_at)}
        </span>
        {isClamped && (
          <button
            type="button"
            className="rvw-carousel-card__more"
            onClick={() => onReadMore(review)}
          >
            Read more
          </button>
        )}
      </div>
    </div>
  );
}

function CarouselSkeleton() {
  return (
    <div className="rvw-carousel-track rvw-carousel-track--static">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rvw-carousel-card rvw-carousel-card--skeleton">
          <div className="rvw-carousel-card__header">
            <div className="rvw-skel-avatar" />
            <div className="rvw-carousel-card__identity">
              <span className="rvw-skel-line" style={{ width: '60%' }} />
              <span className="rvw-skel-line" style={{ width: '40%', marginTop: 6 }} />
            </div>
          </div>
          <span className="rvw-skel-line" style={{ width: '35%', height: 12, marginTop: 14 }} />
          <span className="rvw-skel-line" style={{ width: '100%', marginTop: 18 }} />
          <span className="rvw-skel-line" style={{ width: '90%', marginTop: 8 }} />
          <span className="rvw-skel-line" style={{ width: '70%', marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

type Props = {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onReadMore: (review: Review) => void;
};

export function ReviewsCarousel({
  reviews,
  loading,
  error,
  onRetry,
  onReadMore,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const setWidthRef = useRef(0);
  const hoveringRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const resumeTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const hasEnoughToLoop = reviews.length >= 3;
  const loopReviews = hasEnoughToLoop ? [...reviews, ...reviews] : reviews;

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    // One set = half the duplicated track's scroll width
    setWidthRef.current = hasEnoughToLoop ? track.scrollWidth / 2 : 0;
  }, [hasEnoughToLoop]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, reviews.length]);

  useEffect(() => {
    if (!hasEnoughToLoop) return;

    const step = () => {
      rafRef.current = requestAnimationFrame(step);
      const track = trackRef.current;
      if (!track || hoveringRef.current || draggingRef.current) return;
      const setWidth = setWidthRef.current;
      if (setWidth <= 0) return;

      track.scrollLeft += AUTO_SCROLL_PX_PER_FRAME;
      if (track.scrollLeft >= setWidth) {
        track.scrollLeft -= setWidth;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hasEnoughToLoop]);

  function clearResumeTimer() {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }

  function scheduleResume() {
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      draggingRef.current = false;
    }, RESUME_DELAY_MS);
  }

  function handlePointerEnter(event: React.PointerEvent) {
    if (event.pointerType === 'mouse') hoveringRef.current = true;
  }

  function handlePointerLeave(event: React.PointerEvent) {
    if (event.pointerType === 'mouse') hoveringRef.current = false;
  }

  function handlePointerDown(event: React.PointerEvent) {
    if (event.pointerType !== 'mouse') return; // touch keeps native scrolling
    const track = trackRef.current;
    if (!track) return;
    clearResumeTimer();
    draggingRef.current = true;
    dragStartRef.current = { x: event.clientX, scrollLeft: track.scrollLeft };
    track.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (event.pointerType !== 'mouse' || !draggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    const dx = event.clientX - dragStartRef.current.x;
    track.scrollLeft = dragStartRef.current.scrollLeft - dx;
  }

  function endDrag() {
    if (!draggingRef.current) return;
    scheduleResume();
  }

  // Touch/manual scroll: keep the loop seamless by wrapping scrollLeft even
  // when the browser (not our rAF) is driving the scroll position — mirrors
  // the rAF wrap logic so a fast fling can never outrun it.
  function handleScroll() {
    const track = trackRef.current;
    const setWidth = setWidthRef.current;
    if (!track || setWidth <= 0) return;
    while (track.scrollLeft >= setWidth) {
      track.scrollLeft -= setWidth;
    }
  }

  function handleTouchStart() {
    draggingRef.current = true;
    clearResumeTimer();
  }

  function handleTouchEnd() {
    scheduleResume();
  }

  if (loading) {
    return <CarouselSkeleton />;
  }

  if (error) {
    return (
      <div className="rvw-carousel-state rvw-carousel-state--error">
        <p>{error}</p>
        <button type="button" className="rvw-carousel-retry" onClick={onRetry}>
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rvw-carousel-state">
        <MessageSquareOff size={28} strokeWidth={1.5} />
        <p>No reviews yet — be the first to share your experience.</p>
      </div>
    );
  }

  return (
    <div
      ref={trackRef}
      className="rvw-carousel-track"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onScroll={handleScroll}
    >
      {loopReviews.map((review, i) => (
        <ReviewCarouselCard
          key={`${review.id}-${i}`}
          review={review}
          onReadMore={onReadMore}
        />
      ))}
    </div>
  );
}
