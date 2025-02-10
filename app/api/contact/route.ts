import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { companyInfo } from '../../utils/constants';

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    // Configure transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Format message content
    const textContent = Object.entries(formData)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    // Send email
    await transporter.sendMail({
      from: `CMD Breizh <${process.env.SMTP_FROM_EMAIL}>`,
      to: companyInfo.email,
      subject: 'Contact depuis le site web',
      text: textContent,
      html: `<pre>${textContent}</pre>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
