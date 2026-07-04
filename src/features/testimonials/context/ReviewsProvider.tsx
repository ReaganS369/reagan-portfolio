'use client';

/** @format */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {
  getAllReviews,
  subscribeToReviews,
  type Review,
} from '../api/reviews';
import { computeReviewStats, type ReviewStats } from '../lib/reviewMeta';

type ReviewsContextValue = {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  stats: ReviewStats;
  pendingCount: number;
  recent: Review[];
  refresh: () => Promise<void>;
  /** Apply an optimistic mutation locally; every consumer re-derives instantly. */
  setReviews: Dispatch<SetStateAction<Review[]>>;
};

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

/** Background poll interval — a safety net if Realtime is not enabled. */
const POLL_MS = 45_000;

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedOnce = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const data = await getAllReviews();
      setReviews(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews.');
    } finally {
      if (!loadedOnce.current) {
        loadedOnce.current = true;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refresh();

    const unsubscribe = subscribeToReviews(() => {
      void refresh();
    });

    const interval = window.setInterval(() => {
      void refresh();
    }, POLL_MS);

    return () => {
      unsubscribe();
      window.clearInterval(interval);
    };
  }, [refresh]);

  const stats = useMemo(() => computeReviewStats(reviews), [reviews]);
  const pendingCount = stats.pending;
  const recent = useMemo(() => reviews.slice(0, 5), [reviews]);

  const value = useMemo<ReviewsContextValue>(
    () => ({
      reviews,
      loading,
      error,
      stats,
      pendingCount,
      recent,
      refresh,
      setReviews,
    }),
    [reviews, loading, error, stats, pendingCount, recent, refresh],
  );

  return (
    <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
  );
}

export function useReviews(): ReviewsContextValue {
  const ctx = useContext(ReviewsContext);
  if (!ctx) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return ctx;
}
