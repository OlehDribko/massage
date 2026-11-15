'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useLocale, useT } from '@/i18n/client';
import {
  ADMIN_LOCALE_COOKIE,
  ADMIN_LOCALES,
  LANGUAGE_NAMES,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALES,
  switchLocalePath,
} from '@/i18n/config';

/*
 * Language choice in the header: opens the same page in another language
 * (/reserver ↔ /en/reserver …) and remembers the choice in a cookie, which
 * src/proxy.js applies on the person's next visit. No automatic redirect
 * from the browser's language. `scope="admin"`: the administration's own
 * switcher (French / Ukrainian, its own cookie).
 */

function Flag({ code, className = '' }) {
  const shape = `${className} shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10`;
  switch (code) {
    case 'fr':
      return (
        <svg viewBox="0 0 3 2" aria-hidden className={shape}>
          <path fill="#002654" d="M0 0h1v2H0z" />
          <path fill="#fff" d="M1 0h1v2H1z" />
          <path fill="#ce1126" d="M2 0h1v2H2z" />
        </svg>
      );
    case 'en':
      return (
        <svg viewBox="0 0 60 40" aria-hidden className={shape}>
          <path fill="#012169" d="M0 0h60v40H0z" />
          <path stroke="#fff" strokeWidth="8" d="M0 0l60 40M60 0L0 40" />
          <path stroke="#c8102e" strokeWidth="3" d="M0 0l60 40M60 0L0 40" />
          <path stroke="#fff" strokeWidth="12" d="M30 0v40M0 20h60" />
          <path stroke="#c8102e" strokeWidth="7" d="M30 0v40M0 20h60" />
        </svg>
      );
    case 'uk':
      return (
        <svg viewBox="0 0 3 2" aria-hidden className={shape}>
          <path fill="#0057b7" d="M0 0h3v1H0z" />
          <path fill="#ffd700" d="M0 1h3v1H0z" />
        </svg>
      );
    case 'ru':
      return (
        <svg viewBox="0 0 9 6" aria-hidden className={shape}>
          <path fill="#fff" d="M0 0h9v2H0z" />
          <path fill="#0039a6" d="M0 2h9v2H0z" />
          <path fill="#d52b1e" d="M0 4h9v2H0z" />
        </svg>
      );
    default:
      return null;
  }
}

const languagesOf = (codes) =>
  codes.map((code) => ({
    code,
    short: code.toUpperCase(),
    name: LANGUAGE_NAMES[code],
  }));

function rememberLanguage(cookie, code) {
  document.cookie = `${cookie}=${code}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

const tones = {
  overlay:
    'text-on-dark sm:border-white/35 hover:border-on-dark focus-visible:outline-on-dark',
  solid:
    'text-third-900 sm:border-black/15 hover:border-third-900 focus-visible:outline-third-900',
};

export default function LanguageSwitcher({
  variant = 'overlay',
  scope = 'site',
}) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();
  const admin = scope === 'admin';
  const languages = languagesOf(admin ? ADMIN_LOCALES : LOCALES);
  const current =
    languages.find((language) => language.code === locale) ?? languages[0];

  const choose = (code) => {
    setOpen(false);
    triggerRef.current?.focus();
    rememberLanguage(admin ? ADMIN_LOCALE_COOKIE : LOCALE_COOKIE, code);
    if (code === current.code) return;
    const { search, hash } = window.location;
    router.push(`${switchLocalePath(pathname, code)}${search}${hash}`, {
      scroll: false,
    });
  };

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t('Langue : {name}', { name: current.name })}
        onClick={() => setOpen((value) => !value)}
        className={`rounded-pill font-montserrat text-label inline-flex h-11 items-center gap-1.5 border border-transparent px-1.5 font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none sm:gap-2 sm:px-3.5 lg:h-12 ${tones[variant]}`}
      >
        <Flag code={current.code} className="h-3.5 w-5" />
        <span aria-hidden>{current.short}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
          className={`hidden size-4 transition-transform duration-200 motion-reduce:transition-none sm:block ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="rounded-card bg-secondary-900 absolute top-full right-0 z-10 mt-3 w-[min(15rem,calc(100vw-2rem))] overflow-hidden border border-white/15 py-2 shadow-xl"
      >
        <p className="font-montserrat px-4 pt-1 pb-2 text-[12px] font-medium tracking-[0.08em] text-gray-200 uppercase">
          {admin ? t('Langue de l’administration') : t('Langue du site')}
        </p>
        <ul>
          {languages.map((language) => {
            const selected = language.code === current.code;
            return (
              <li key={language.code}>
                <button
                  type="button"
                  lang={language.code}
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => choose(language.code)}
                  className="font-montserrat hover:text-third-100 flex w-full items-center gap-3 px-4 py-3 text-left text-[16px] tracking-[0.16px] text-gray-50 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gray-50 motion-reduce:transition-none"
                >
                  <Flag code={language.code} className="h-3.5 w-5" />
                  <span className="flex-1">{language.name}</span>
                  {selected ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                      className="text-primary-200 size-4"
                    >
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
