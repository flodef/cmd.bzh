import { sql } from '../utils/db';
import { randomUUID } from 'crypto';

export interface DbReview {
  id: string;
  created_at: string; 
  name: string;
  email: string;
  comment: string;
  rating: number; // DECIMAL(2,1) in database, represents values like 3.5
  published: boolean;
}

export interface NewReview {
  name: string;
  email: string;
  comment: string;
  rating: number;
}

/**
 * Create a new review with a generated UUID as both ID and validation token
 */
export async function createReview(review: NewReview): Promise<DbReview> {
  const { name, email, comment, rating } = review;
  
  // Generate a unique ID that will serve as both primary key and validation token
  const id = randomUUID();
  
  const result = await sql`
    INSERT INTO reviews (id, name, email, comment, rating) 
    VALUES (${id}, ${name}, ${email}, ${comment}, ${rating}) 
    RETURNING id, created_at, name, email, comment, rating, published
  `;
  
  return result[0] as unknown as DbReview;
}

/**
 * Get a review by its ID (which doubles as validation token)
 */
export async function getReviewByToken(token: string): Promise<DbReview | null> {
  const results = await sql`
    SELECT * FROM reviews WHERE id = ${token}
  `;
  
  return results.length > 0 ? results[0] as unknown as DbReview : null;
}

/**
 * Publish a review by setting published to true
 */
export async function publishReview(id: string): Promise<boolean> {
  const result = await sql`
    UPDATE reviews SET published = true WHERE id = ${id} RETURNING id
  `;
  
  return result.length > 0;
}

/**
 * Delete a review by ID
 */
export async function deleteReview(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM reviews WHERE id = ${id} RETURNING id
  `;
  
  return result.length > 0;
}

/**
 * Get all published reviews
 */
export async function getPublishedReviews(): Promise<DbReview[]> {
  const results = await sql`
    SELECT * FROM reviews WHERE published = true ORDER BY created_at DESC
  `;
  
  return results as unknown as DbReview[];
}

/**
 * Get all reviews regardless of publication status
 */
export async function getAllReviews(): Promise<DbReview[]> {
  const results = await sql`
    SELECT * FROM reviews ORDER BY created_at DESC
  `;
  
  return results as unknown as DbReview[];
}

/**
 * Update an existing review content and set it to unpublished
 * Used when editing a review with comment changes that require re-approval
 */
export async function updateReviewContent(id: string, review: NewReview): Promise<DbReview | null> {
  const { name, email, comment, rating } = review;
  
  try {
    const result = await sql`
      UPDATE reviews 
      SET name = ${name}, 
          email = ${email}, 
          comment = ${comment}, 
          rating = ${rating}, 
          published = false
      WHERE id = ${id}
      RETURNING id, created_at, name, email, comment, rating, published
    `;
    
    return result.length > 0 ? result[0] as unknown as DbReview : null;
  } catch (error) {
    console.error('Error updating review content:', error);
    return null;
  }
}
