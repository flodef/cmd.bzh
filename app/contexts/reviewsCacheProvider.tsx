'use client';

import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { DbReview } from '../models/types';

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
  // Read the latest reviews through a ref so fetchReviews keeps a stable
  // identity — otherwise every setReviews changes the callback and retriggers
  // consumer effects in an infinite loop
  const reviewsRef = useRef(reviews);
  reviewsRef.current = reviews;

  const fetchReviews = useCallback(async (force = false): Promise<DbReview[]> => {
    const now = Date.now();
    if (!force && reviewsRef.current.length > 0 && now - lastFetchRef.current < CACHE_DURATION) {
      return reviewsRef.current;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reviews');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result: DbReview[] = await response.json();
      setReviews(result);
      lastFetchRef.current = now;
      return result;
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to fetch reviews');
      return reviewsRef.current;
    } finally {
      setLoading(false);
    }
  }, []);

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
