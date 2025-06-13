'use server';

import { createReview, updateReviewContent, NewReview, getPublishedReviews, DbReview } from '../models/review';
import { sendEmail } from '../utils/emailService';
import { companyInfo } from '../utils/constants';

/**
 * Server action to submit a new review or update an existing one
 * This creates an unpublished review in the database and sends a validation email
 */
export async function submitNewReview(reviewData: NewReview & { id?: string }) {
  try {
    // Ensure rating is treated as a decimal
    const review = {
      ...reviewData,
      rating: Number(reviewData.rating),
    };

    let savedReview;
    // If there's an ID, we're updating an existing review
    if (reviewData.id) {
      // Update the existing review and mark it as unpublished for re-approval
      savedReview = await updateReviewContent(reviewData.id, review);
      if (!savedReview) {
        throw new Error('Failed to update review');
      }
    } else {
      // Create a new review (initially unpublished)
      savedReview = await createReview(review);
    }

    // Send validation email to admin (admin only needs review-validation email, not the review email)
    await sendEmail('review-validation', {
      to: companyInfo.email,
      data: savedReview as unknown as Record<string, unknown>,
      subject: `Validation d'avis - ${reviewData.name}`,
    });

    // Send confirmation to the reviewer if they provided an email
    if (reviewData.email) {
      await sendEmail('review', {
        to: reviewData.email, // Send only to reviewer, not to admin
        data: reviewData as unknown as Record<string, unknown>,
        subject: 'Merci pour votre avis',
      });
    }

    return {
      success: true,
      message: 'Avis soumis avec succès',
      reviewId: savedReview.id,
    };
  } catch (error) {
    console.error('Review submission error:', error);
    return {
      success: false,
      message: "Erreur lors de la soumission de l'avis",
    };
  }
}

/**
 * Server action to get all published reviews
 */
export async function getReviews(): Promise<DbReview[]> {
  try {
    return await getPublishedReviews();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}
