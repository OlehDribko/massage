'use client';

import { createContext, forwardRef, useContext, useMemo } from 'react';
import NextLink from 'next/link';
import { useRouter as useNextRouter } from 'next/navigation';

import { DEFAULT_LOCALE, localizePath } from './config.js';
import { createTranslator } from './translate.js';
import { createFormat } from '../lib/format.js';
import { localizedServiceName } from '../lib/booking/serviceName.js';

/*
 * Client side of the translations: the [lang] layout passes the language and
 * its dictionary (only that language's) to <I18nProvider>; client components
 * read them with useT() / useLocale() / useFormat().
 */

const I18nContext = createContext({
  locale: DEFAULT_LOCALE,
  messages: {},
});

export function I18nProvider({ locale, messages, children }) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useLocale = () => useContext(I18nContext).locale;

export function useT() {
  const { locale, messages } = useContext(I18nContext);
  return useMemo(() => createTranslator(locale, messages), [locale, messages]);
}

export function useFormat() {
  const locale = useLocale();
  return useMemo(() => createFormat(locale), [locale]);
}

/** "/reserver" → the same path in the current language. */
export function useLocalizePath() {
  const locale = useLocale();
  return useMemo(() => (href) => localizePath(locale, href), [locale]);
}

/** next/navigation's router with internal paths localized. */
export function useRouter() {
  const router = useNextRouter();
  const localize = useLocalizePath();
  return useMemo(
    () => ({
      ...router,
      push: (href, options) => router.push(localize(href), options),
      replace: (href, options) => router.replace(localize(href), options),
      prefetch: (href, options) => router.prefetch(localize(href), options),
    }),
    [router, localize]
  );
}

/** next/link with internal hrefs in the current language. */
export const Link = forwardRef(function Link({ href, ...props }, ref) {
  const localize = useLocalizePath();
  const target = typeof href === 'string' ? localize(href) : href;
  return <NextLink ref={ref} href={target} {...props} />;
});

/** (service | { id, name }) → its name in the current language. */
export function useServiceName() {
  const locale = useLocale();
  return useMemo(
    () => (service) =>
      service ? localizedServiceName(service, locale) : service,
    [locale]
  );
}
