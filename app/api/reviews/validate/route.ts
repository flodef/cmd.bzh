import { NextResponse } from 'next/server';
import { deleteReview, getReviewByToken, publishReview } from '../../../models/review';

export async function GET(request: Request) {
  try {
    // Get the URL and parse parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token manquant' }, { status: 400 });
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ success: false, message: 'Action invalide' }, { status: 400 });
    }

    // Get the review associated with this ID/token
    const review = await getReviewByToken(token);
    if (!review) {
      // Review not found, redirect to reviews page with not found status
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${baseUrl}/?tab=Reviews#status=notfound`);
    }

    if (action === 'approve') {
      try {
        // Mark the review as published
        const result = await publishReview(review.id);
        if (result) {
          // Use absolute URL with the base URL from environment
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          return NextResponse.redirect(`${baseUrl}/?tab=Reviews#status=approved`);
        } else {
          // Use absolute URL with the base URL from environment
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          return NextResponse.redirect(`${baseUrl}/?tab=Reviews#status=error&message=publication`);
        }
      } catch {
        // In case of error, redirect to reviews with error status
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        return NextResponse.redirect(`${baseUrl}/?tab=Reviews#status=error&message=publication`);
      }
    } else {
      try {
        // Delete the review
        const result = await deleteReview(review.id);
        if (result) {
          // Use absolute URL with the base URL from environment
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          return NextResponse.redirect(`${baseUrl}/?tab=Reviews#status=rejected`);
        } else {
          // Use absolute URL with the base URL from environment
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          return NextResponse.redirect(`${baseUrl}/?tab=Reviews#status=error&message=deletion`);
        }
      } catch {
        // In case of error, redirect to reviews with error status
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        return NextResponse.redirect(`${baseUrl}/?tab=Reviews#status=error&message=deletion`);
      }
    }
  } catch (error) {
    console.error('Error processing review validation:', error);
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
  }
}
