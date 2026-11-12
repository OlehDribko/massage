'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';

import { useHeaderAccount } from '@/components/auth/useHeaderAccount';
import AccountControl from '@/components/layout/AccountControl';
import MobileNav from '@/components/layout/MobileNav';
import MaskIcon from '@/components/ui/MaskIcon';
import NavLink from '@/components/ui/NavLink';
import PillButton from '@/components/ui/PillButton';

const NAV_ITEMS = [
  { href: '/#about', label: 'À propos de moi' },
  { href: '/#services', label: 'Massages populaires' },
  { href: '/#approach', label: 'Mon approche' },
  { href: '/#testimonials', label: 'Avis' },
];

// The booking entry: first action of the menu (the hero and pages have
// their own « Prendre rendez-vous »).
const BOOKING_CTA = { href: '/reserver', label: 'Prendre rendez-vous' };

// The bar's own action: offering a gift card (GiftCardDrawer).
function GiftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
      className="text-primary-200 size-[18px] shrink-0"
    >
      <rect x="3.5" y="8" width="17" height="4" rx="1" />
      <path d="M5 12v8h14v-8M12 8v12M12 8c-1.5-3-5-3.5-5.5-1.5S9.5 8 12 8zm0 0c1.5-3 5-3.5 5.5-1.5S14.5 8 12 8z" />
    </svg>
  );
}

// Each page picks its variant explicitly (no guessing from the background):
// - overlay: transparent over a dark hero, out of flow — the page itself
//   keeps its content clear of the header (hero/404 top padding);
// - solid: light pages, in normal flow, so content never slides under it.
const variants = {
  overlay: {
    header: 'absolute inset-x-0 top-0',
    text: 'text-on-dark',
    navTone: 'header',
    divider: 'min-[90rem]:border-white/20',
  },
  solid: {
    header: 'relative border-b border-black/7 bg-background',
    text: 'text-third-900',
    navTone: 'headerSolid',
    divider: 'min-[90rem]:border-black/10',
  },
};

// Hierarchy, left to right: logo · navigation (from 1440 px, where it fits
// next to the actions) · account (secondary outlined pill, after a divider)
// · «Offrir une carte cadeau» (outlined, opens the gift card panel; the
// hero keeps the gold «Prendre rendez-vous»). Below 1440 px the
// navigation moves to the menu; the booking button stays in the bar from
// 768 px and is the first action of the menu below that. Mobile keeps the
// Figma bar: account | centred logo | menu, with 44 px targets.
//
// `account` comes from the shared session; the local preview passes sample
// states instead (null = no account element).
export default function Header({ variant = 'overlay', account: sample }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const styles = variants[variant];
  const live = useHeaderAccount();
  const account = sample === undefined ? live : (sample ?? undefined);

  // Widening the window to the full navigation hides the burger: close it.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const desktop = window.matchMedia('(min-width: 90rem)');
    const closeOnDesktop = (event) => {
      if (event.matches) setMenuOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, [menuOpen]);

  return (
    <header className={`z-header px-page ${styles.header}`}>
      <div
        className={`font-montserrat max-w-content mx-auto grid grid-cols-[2.75rem_1fr_2.75rem] items-center pt-10 pb-5 sm:flex sm:gap-3 sm:pb-6 lg:gap-4 ${styles.text}`}
      >
        <Link
          href="/"
          className="col-start-2 row-start-1 flex justify-self-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current sm:mr-auto"
        >
          <MaskIcon
            src="/massage.svg"
            label="Massage by Stefania Ben"
            className="aspect-[207/45] h-7 sm:h-[38px] xl:h-[44px]"
          />
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden min-[90rem]:block"
        >
          <ul className="flex items-center gap-5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  tone={styles.navTone}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {account ? (
          <div
            className={`col-start-1 row-start-1 min-[90rem]:border-l min-[90rem]:pl-6 ${styles.divider}`}
          >
            <AccountControl account={account} variant={variant} />
          </div>
        ) : null}

        <div className={`hidden md:block ${account ? '' : 'min-[90rem]:ml-6'}`}>
          <a
            href="#carte-cadeau"
            className="rounded-pill font-montserrat text-label hover:border-primary-200 inline-flex min-h-11 items-center gap-2.5 border border-current/30 px-5 font-medium tracking-[0.05em] whitespace-nowrap uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none"
          >
            <GiftIcon />
            Offrir une carte cadeau
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label="Ouvrir le menu"
          className="col-start-3 row-start-1 flex size-11 items-center justify-center justify-self-end transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none min-[90rem]:hidden"
        >
          <MaskIcon src="/icons/menu.svg" className="size-10" />
        </button>
      </div>

      <MobileNav
        id={menuId}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={NAV_ITEMS}
        cta={BOOKING_CTA}
        account={account}
      />
    </header>
  );
}
