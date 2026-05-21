'use server';

import { sendEmail as sendEmailService, EmailType } from '../utils/emailService';
import { createContactMessage, NewContactMessage } from '../models/contactMessage';
import { emailRegex } from '../utils/constants';

/**
 * Server action to submit a contact form
 */
export async function submitContactForm(formData: Record<string, unknown>) {
  try {
    // Extract contacts array and find the first email for reply-to
    const contacts = formData.Contacts as { contact: string }[] | undefined;
    const contactsArray = contacts?.map(c => c.contact) || [];

    // Find the first email address in contacts for reply-to
    const replyTo = contactsArray.find(contact => typeof contact === 'string' && emailRegex.test(contact));

    // Store the contact message in the database
    const contactMessage: NewContactMessage = {
      name: formData.Nom as string,
      contacts: contactsArray,
      message: formData.Message as string,
    };

    await createContactMessage(contactMessage);

    // Send the email using our service with proper reply-to
    const result = await sendEmailService('contact', {
      data: formData,
      replyTo,
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
      replyTo,
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
export async function sendEmail(
  type: EmailType,
  data: Record<string, unknown>,
  options?: {
    to?: string;
    subject?: string;
    replyTo?: string;
  },
) {
  try {
    const result = await sendEmailService(type, {
      data,
      to: options?.to,
      subject: options?.subject,
      replyTo: options?.replyTo,
    });

    return { messageId: result.messageId };
  } catch (error) {
    console.error(`Email sending error (${type}):`, error);
    return { success: false, error: `Failed to send ${type} email` };
  }
}
