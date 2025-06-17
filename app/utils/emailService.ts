import nodemailer from 'nodemailer';
import { companyInfo } from './constants';

// Email template types
export type EmailType = 'contact' | 'review' | 'review-validation' | 'notification' | 'password-reset';

// Email data structure
export interface EmailData {
  to?: string; // Optional recipient, falls back to company email if not provided
  from?: string; // Optional sender, falls back to default from email
  subject?: string; // Optional subject, determined by email type if not provided
  data: Record<string, unknown>; // The data to include in the email
  replyTo?: string; // Optional reply-to email
}

/**
 * Creates and configures the email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Generate subject for different email types
 */
const getSubjectByType = (type: EmailType): string => {
  switch (type) {
    case 'contact':
      return 'Contact depuis le site web';
    case 'review':
      return 'Nouvelle évaluation reçue';
    case 'review-validation':
      return "Validation d'avis requise";
    case 'notification':
      return 'Notification de CMD Breizh';
    case 'password-reset':
      return 'Réinitialisation de mot de passe';
    default:
      return 'Message depuis le site CMD Breizh';
  }
};

/**
 * Generate email content based on type and data
 */
const generateEmailContent = (type: EmailType, data: Record<string, unknown>) => {
  // Convert data to text format
  const textContent = Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  // Generate HTML based on email type
  let htmlContent: string;

  switch (type) {
    case 'review-validation':
      const approveUrl = `${companyInfo.url}/api/reviews/validate?action=approve&token=${data.id}`;
      const rejectUrl = `${companyInfo.url}/api/reviews/validate?action=reject&token=${data.id}`;

      htmlContent = `
        <h1>Nouvelle évaluation - Validation requise</h1>
        <p>Une nouvelle évaluation a été soumise et nécessite votre validation :</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>De:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Note:</strong> ${data.rating} / 5</p>
          <p><strong>Commentaire:</strong> ${data.comment}</p>
          <p><strong>Date:</strong> ${
            typeof data.created_at === 'string'
              ? new Date(data.created_at).toLocaleDateString('fr-FR')
              : new Date().toLocaleDateString('fr-FR')
          }</p>
        </div>
        <p>Veuillez valider ou rejeter cette évaluation :</p>
        <div style="margin: 25px 0;">
          <a href="${approveUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Approuver l'avis</a>
          <a href="${rejectUrl}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Rejeter l'avis</a>
        </div>
      `;
      break;

    case 'review':
      htmlContent = `
        <h1>Nouvelle évaluation reçue</h1>
        <p><strong>De:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Note:</strong> ${data.rating} / 5</p>
        <p><strong>Commentaire:</strong> ${data.comment}</p>
      `;
      break;
    case 'notification':
      htmlContent = `
        <h1>${data.title || 'Notification'}</h1>
        <p>${data.message}</p>
      `;
      break;
    case 'contact':
    default:
      // Default formatter for contact and other types
      htmlContent = `<pre>${textContent}</pre>`;
      break;
  }

  return {
    text: textContent,
    html: htmlContent,
  };
};

/**
 * Send email using the provided type and data
 */
export async function sendEmail(type: EmailType, emailData: EmailData) {
  try {
    const transporter = createTransporter();

    const { to, from, subject, data, replyTo } = emailData;

    const content = generateEmailContent(type, data);
    const emailSubject = subject || getSubjectByType(type);
    const recipient = to || companyInfo.email;
    const sender = from || `CMD Breizh <${process.env.SMTP_FROM_EMAIL}>`;

    // Send email
    const result = await transporter.sendMail({
      from: sender,
      to: recipient,
      replyTo: replyTo || undefined,
      subject: emailSubject,
      text: content.text,
      html: content.html,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
}
