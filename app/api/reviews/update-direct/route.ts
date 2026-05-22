import { NextResponse } from 'next/server';
import { sql } from '../../../utils/db';
import { t } from '../../../utils/i18n';
import { checkRateLimit, getClientIp } from '../../../utils/rateLimit';

// API route to update review non-content fields without requiring re-approval
export async function POST(request: Request) {
  try {
    // Rate limiting: 10 requests per minute per IP
    const clientIp = getClientIp(request);
    if (checkRateLimit(clientIp, 10, 60000)) {
      return NextResponse.json({ success: false, message: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { id, name, email, rating } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json({ success: false, message: t('ApiValidateMissingId') }, { status: 400 });
    }

    // Update the review in the database - only non-content fields
    const result = await sql`
      UPDATE reviews SET name = ${name}, email = ${email}, rating = ${rating} 
      WHERE id = ${id} RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: t('ApiValidateReviewNotFound') }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: t('ApiValidateUpdateSuccess') });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ success: false, message: t('ApiValidateServerError') }, { status: 500 });
  }
}
