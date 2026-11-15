import { NextResponse } from 'next/server';

import { ADMIN_LOCALE_COOKIE, LOCALE_COOKIE } from '@/i18n/config';
import { routeLocale } from '@/i18n/routing';

/*
 * Language of every page request (rules in src/i18n/routing.js). Files,
 * Next internals and metadata routes (robots.txt, sitemap.xml, llms.txt,
 * icons) are left out by the matcher.
 */
export function proxy(request) {
  const { nextUrl, headers, method } = request;
  const isPageLoad =
    method === 'GET' &&
    !headers.has('rsc') &&
    !headers.has('next-router-prefetch') &&
    (headers.get('accept') ?? '').includes('text/html');

  const decision = routeLocale(nextUrl.pathname, {
    cookies: {
      [LOCALE_COOKIE]: request.cookies.get(LOCALE_COOKIE)?.value,
      [ADMIN_LOCALE_COOKIE]: request.cookies.get(ADMIN_LOCALE_COOKIE)?.value,
    },
    isPageLoad,
  });

  if (decision.type === 'next') return NextResponse.next();
  const url = nextUrl.clone();
  url.pathname = decision.pathname;
  if (decision.type === 'redirect') {
    return NextResponse.redirect(url, decision.status);
  }
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next|api|icon|apple-icon|.*\\..*).*)'],
};
