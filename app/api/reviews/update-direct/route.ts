import { NextResponse } from 'next/server';
import { sql } from '../../../utils/db';
import { t } from '../../../utils/i18n';

// API route to update review non-content fields without requiring re-approval
export async function POST(request: Request) {
  try {
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
