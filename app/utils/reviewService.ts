import { NewReview } from '../models/review';

interface ReviewResponse {
  success: boolean;
  message?: string;
  reviewId?: string;
}

/** Submit a new review or update an existing one via the API route. */
export async function sendReview(reviewData: NewReview & { id?: string }): Promise<ReviewResponse> {
  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData),
  });
  return response.json();
}
