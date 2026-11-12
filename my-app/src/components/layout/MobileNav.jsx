'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

import MaskIcon from '@/components/ui/MaskIcon';
import PillButton from '@/components/ui/PillButton';

// Figma: mobile menu 804:5921 (full screen), tablet 805:7080 (583 px panel
// over a dimmed page). A modal <dialog>: the browser keeps focus inside,
// makes the page inert and closes it on Escape.
// Account entry of the menu, with text (the bar only has the round icon).
function AccountLinks({ account, onClose }) {
  if (!account) return null;
  const { status } = account;
  const linkClasses =
    'font-montserrat hover:text-third-100 focus-visible:outline-on-dark flex min-h-11 items-center gap-3 text-[16px] text-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none';

  if (status === 'guest' && account.signInHref) {
    return (
      <PillButton
        variant="outline"
        size="sm"
        href={account.signInHref}
        onClick={onClose}
        className="w-full normal-case"
      >
        <MaskIcon src="/icons/person.svg" className="size-5" />
        Se connecter
      </PillButton>
    );
  }
  if (status === 'member' || status === 'admin') {
    const links = [
      account.accountHref && { href: account.accountHref, label: 'Mon compte' },
      account.bookingsHref && {
        href: account.bookingsHref,
        label: 'Mes réservations',
      },
      status === 'admin' &&
        account.adminHref && {
          href: account.adminHref,
          label: 'Administration',
        },
    ].filter(Boolean);
    return (
      <ul aria-label="Mon compte" className="flex flex-col">
        {links.map((link, index) => (
          <li key={link.href}>
            <Link href={link.href} onClick={onClose} className={linkClasses}>
              {index === 0 ? (
                <MaskIcon src="/icons/person.svg" className="size-5" />
              ) : (
                <span aria-hidden className="size-5" />
              )}
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    );
  }
  if (status === 'unavailable' && account.onRetry) {
    return (
      <PillButton
        variant="outline"
        size="sm"
        onClick={account.onRetry}
        className="w-full normal-case"
      >
        Connexion indisponible — réessayer
      </PillButton>
    );
  }
  // Loading / not available: the neutral entry, as in the bar.
  return (
    <Link
      href={account.accountHref ?? '/compte'}
      onClick={onClose}
      className={linkClasses}
    >
      <MaskIcon src="/icons/person.svg" className="size-5" />
      Espace personnel
    </Link>
  );
}

export default function MobileNav({ id, open, onClose, items, cta, account }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Escape fires `cancel` at once and `close` later (a queued task); any
  // other dialog.close() fires `close`. Both keep the header state
  // (aria-expanded, scroll lock) in sync; a second call is a no-op.
  useEffect(() => {
    const dialog = dialogRef.current;
    const handleClose = () => onCloseRef.current();
    dialog.addEventListener('cancel', handleClose);
    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('cancel', handleClose);
      dialog.removeEventListener('close', handleClose);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) return undefined;

    // The page behind must not scroll while the menu covers it.
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-label="Menu"
      className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-gray-50 backdrop:bg-transparent"
    >
      {/* Dimmed page on tablet; a click on it closes the menu. */}
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 hidden bg-[rgba(28,25,20,0.5)] backdrop-blur-[7px] sm:block"
      />

      <div className="relative ml-auto flex h-full w-full flex-col overflow-y-auto bg-[rgba(28,25,20,0.9)] px-4 pt-10 pb-8 backdrop-blur-[7px] sm:w-[583px] sm:border-l sm:border-white/15 sm:bg-[#1c1914] sm:px-[60px]">
        {/* Same position as the open button, so the toggle stays in place. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le menu"
          className="text-on-dark hover:text-third-100 focus-visible:outline-on-dark flex size-10 shrink-0 items-center justify-center self-end transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
        >
          <MaskIcon src="/icons/close.svg" className="size-7 sm:size-10" />
        </button>

        <nav
          aria-label="Navigation principale"
          className="mt-6 flex flex-1 flex-col sm:mt-[100px] sm:flex-none sm:gap-[60px]"
        >
          <ul className="flex flex-col">
            {items.map((item, index) => (
              <li key={item.href} className="border-b border-white/15">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="font-montserrat hover:text-third-100 focus-visible:outline-on-dark flex items-center justify-between px-4 py-6 text-[18px] leading-[1.4] font-semibold tracking-[0.18px] text-[#e7eaed] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 motion-reduce:transition-none sm:flex-row-reverse sm:justify-end sm:gap-12 sm:px-0 sm:py-10 sm:text-[24px] sm:font-medium sm:tracking-normal"
                >
                  {item.label}
                  <span
                    aria-hidden
                    className="text-third-200 font-normal tabular-nums"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-col gap-4 pt-8 sm:mt-0 sm:pt-0">
            <AccountLinks account={account} onClose={onClose} />
            <PillButton href={cta.href} onClick={onClose} className="w-full">
              {cta.label}
            </PillButton>
            <PillButton
              href="#carte-cadeau"
              variant="outline"
              tone="dark"
              onClick={onClose}
              className="w-full"
            >
              Offrir une carte cadeau
            </PillButton>
          </div>
        </nav>
      </div>
    </dialog>
  );
}
