'use server';

import { sendEmail as sendEmailService } from '../utils/emailService';
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
