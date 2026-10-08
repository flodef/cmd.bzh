import { NextRequest, NextResponse } from 'next/server';

// Legacy tab-based URLs (/?tab=X) → single-page anchors.
// Done in middleware rather than next.config redirects so the `tab` query
// param is fully cleared (config redirects merge the incoming query string,
// which would re-match and loop).
const tabTargets: Record<string, string> = {
  About: '/#about',
  Contact: '/#contact',
  Reviews: '/#reviews',
  GDPR: '/gdpr',
};

export function proxy(request: NextRequest) {
  const target = tabTargets[request.nextUrl.searchParams.get('tab') ?? ''];
  if (!target) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.search = '';
  const [path, hash] = target.split('#');
  url.pathname = path;
  url.hash = hash ?? '';
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: '/',
};
