'use client';

import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { DbReview } from '../models/review';

interface ReviewsCacheState {
  reviews: DbReview[];
  loading: boolean;
  error: string | null;
  fetchReviews: (force?: boolean) => Promise<DbReview[]>;
  lastFetch: number;
}

const ReviewsCacheContext = createContext<ReviewsCacheState | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const ReviewsCacheProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef(0);

  const fetchReviews = useCallback(
    async (force = false): Promise<DbReview[]> => {
      const now = Date.now();
      if (!force && reviews.length > 0 && now - lastFetchRef.current < CACHE_DURATION) {
        return reviews;
      }

      setLoading(true);
      setError(null);
      try {
        // Lazy import to avoid loading db.ts on pages that don't need it
        const { getPublishedReviews } = await import('../models/review');
        const result = await getPublishedReviews();
        setReviews(result);
        lastFetchRef.current = now;
        return result;
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to fetch reviews');
        return reviews;
      } finally {
        setLoading(false);
      }
    },
    [reviews],
  );

  return (
    <ReviewsCacheContext.Provider value={{ reviews, loading, error, fetchReviews, lastFetch: lastFetchRef.current }}>
      {children}
    </ReviewsCacheContext.Provider>
  );
};

export function useReviewsCache(): ReviewsCacheState {
  const context = useContext(ReviewsCacheContext);
  if (context === undefined) {
    throw new Error('useReviewsCache must be used within a ReviewsCacheProvider');
  }
  return context;
}
