import { NextResponse } from 'next/server';
import { sendEmail as sendEmailService } from '../../utils/emailService';
import { createContactMessage, NewContactMessage } from '../../models/contactMessage';
import { emailRegex } from '../../utils/constants';
import { checkRateLimit, getClientIp } from '../../utils/rateLimit';

export async function POST(request: Request) {
  try {
    // Rate limiting: 10 requests per minute per IP
    const clientIp = getClientIp(request);
    if (checkRateLimit(clientIp, 10, 60000)) {
      return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
    }

    const formData = (await request.json()) as Record<string, unknown>;

    // Contacts may be raw {contact: string} objects or preformatted strings
    const contacts = formData.Contacts as (string | { contact: string })[] | undefined;
    const contactsArray =
      contacts?.map(c => (typeof c === 'string' ? c : c.contact)).filter((c): c is string => Boolean(c)) ?? [];

    // Find the first email address in contacts for reply-to
    const replyToEntry = contactsArray.find(c => emailRegex.test(c));
    const replyTo = replyToEntry?.match(emailRegex)?.[0];

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

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
