'use server';

import { createReview, NewReview, getPublishedReviews, DbReview } from '../models/review';
import { sendEmail } from '../utils/emailService';
import { companyInfo } from '../utils/constants';

/**
 * Server action to submit a new review
 * This creates an unpublished review in the database and sends a validation email
 */
export async function submitNewReview(reviewData: NewReview) {
  try {
    // Ensure rating is treated as a decimal
    const review = {
      ...reviewData,
      rating: Number(reviewData.rating),
    };

    // Create the review in the database (initially unpublished)
    const savedReview = await createReview(review);

    // Send validation email to admin
    await sendEmail('review-validation', {
      to: companyInfo.email,
      data: savedReview as unknown as Record<string, unknown>,
      subject: `Validation d'avis - ${reviewData.name}`,
    });

    // Send confirmation to the reviewer
    if (reviewData.email) {
      await sendEmail('review', {
        to: reviewData.email,
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
