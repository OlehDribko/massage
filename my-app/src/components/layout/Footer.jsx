import Image from 'next/image';

import NavLink from '@/components/ui/NavLink';
import { BUSINESS, SITE } from '@/config/site';

const NAVIGATION = [
  { href: '/#services', label: 'Ce que nous faisons' },
  { href: '/#about', label: 'À propos' },
  // TODO: no "réalisations/portfolio" section exists yet in this design
  { href: '#', label: 'Nos réalisations' },
  { href: '/#testimonials', label: 'Avis' },
];

const ICON = 'size-[22px]';

const SOCIALS = [
  {
    href: BUSINESS.socials.instagram,
    label: 'Instagram',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden
        className={ICON}
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: BUSINESS.socials.facebook,
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={ICON}>
        <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21z" />
      </svg>
    ),
  },
  {
    href: BUSINESS.socials.planity,
    label: 'Planity',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className={ICON}>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M12 2c7.4 0 10 2.6 10 10s-2.6 10-10 10S2 19.4 2 12 4.6 2 12 2zM8.6 6.8v10.4h2.2v-3.4h2.4a3.5 3.5 0 0 0 0-7zm2.2 2h2.3a1.5 1.5 0 0 1 0 3h-2.3z"
        />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer
      id="footer"
      className="bg-secondary-900 px-page pt-16 pb-6 lg:pt-20"
    >
      <div className="max-w-content mx-auto flex flex-col gap-16">
        <div className="flex flex-col gap-[60px] max-sm:items-center max-sm:text-center sm:gap-12 lg:flex-row lg:justify-between lg:gap-10">
          <div className="flex max-w-[325px] flex-col gap-6 max-sm:items-center sm:gap-8">
            <Image src="/massage.svg" alt={SITE.name} width={170} height={38} />
            <p className="font-montserrat text-[16px] tracking-[0.16px] text-gray-100">
              Massage thérapeutique et bien-être, dans un cadre calme et
              confidentiel à Bordeaux.
            </p>
          </div>

          {/* Phones (Figma 704:2004): one centred column. */}
          <div className="flex flex-col gap-[60px] max-sm:items-center sm:flex-row sm:flex-wrap sm:gap-x-20 sm:gap-y-10">
            <nav
              aria-label="Navigation du pied de page"
              className="flex flex-col gap-6"
            >
              <p className="font-montserrat text-base-white text-[18px] font-medium">
                NAVIGATION
              </p>
              <ul className="flex flex-col gap-3">
                {NAVIGATION.map((item) => (
                  <li key={item.label}>
                    <NavLink href={item.href} tone="footer">
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex flex-col gap-6">
              <p className="font-montserrat text-base-white text-[18px] font-medium">
                CONTACT
              </p>
              <ul className="font-montserrat flex flex-col gap-3 text-[16px] tracking-[0.16px] text-gray-100">
                <li>
                  <a
                    href={`tel:${BUSINESS.phone.e164}`}
                    className="hover:text-base-white"
                  >
                    {BUSINESS.phone.display}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${BUSINESS.email}`}
                    className="hover:text-base-white wrap-anywhere"
                  >
                    {BUSINESS.email}
                  </a>
                </li>
                <li>
                  <address className="not-italic">
                    {BUSINESS.address.street}, {BUSINESS.address.city}
                  </address>
                </li>
                <li>{BUSINESS.openingHours.display}</li>
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <p className="font-montserrat text-base-white text-[18px] font-medium">
                SUIVEZ-NOUS
              </p>
              <ul className="flex items-center gap-3">
                {SOCIALS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${social.label} (nouvel onglet)`}
                      title={social.label}
                      className="hover:border-base-white hover:text-base-white flex size-11 items-center justify-center rounded-full border border-white/20 text-gray-100 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current motion-reduce:transition-none"
                    >
                      {social.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-4 pb-2">
          <p className="font-montserrat text-center text-[14px] tracking-[0.14px] text-gray-800">
            © 2026 {SITE.name}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
