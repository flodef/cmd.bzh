'use server';

import { sendEmail as sendEmailService, EmailType } from '../utils/emailService';

/**
 * Server action to submit a contact form
 */
export async function submitContactForm(formData: Record<string, unknown>) {
  try {
    // Extract reply-to email if available
    const replyTo = typeof formData.email === 'string' ? formData.email : undefined;
    
    // Send the email using our service
    const result = await sendEmailService('contact', {
      data: formData,
      replyTo
    });

    return { messageId: result.messageId };
  } catch (error) {
    console.error('Contact form submission error:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

/**
 * Server action to submit a review
 */
export async function submitReview(reviewData: Record<string, unknown>) {
  try {
    // Extract reply-to email if available
    const replyTo = typeof reviewData.email === 'string' ? reviewData.email : undefined;
    
    // Send the review notification email
    const result = await sendEmailService('review', {
      data: reviewData,
      replyTo
    });

    return { messageId: result.messageId };
  } catch (error) {
    console.error('Review submission error:', error);
    return { success: false, error: 'Failed to submit review' };
  }
}

/**
 * Generic server action to send any type of email
 */
export async function sendEmail(type: EmailType, data: Record<string, unknown>, options?: { 
  to?: string;
  subject?: string;
  replyTo?: string;
}) {
  try {
    const result = await sendEmailService(type, {
      data,
      to: options?.to,
      subject: options?.subject,
      replyTo: options?.replyTo
    });
    
    return { messageId: result.messageId };
  } catch (error) {
    console.error(`Email sending error (${type}):`, error);
    return { success: false, error: `Failed to send ${type} email` };
  }
}
