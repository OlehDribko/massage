import Image from 'next/image';

import NavLink from '@/components/ui/NavLink';
import { BUSINESS, SITE } from '@/config/site';
import { REVIEWS } from '@/content/reviews';

const NAVIGATION = [
  { href: '/#services', label: 'Ce que nous faisons' },
  { href: '/#about', label: 'À propos' },
  // TODO: no "réalisations/portfolio" section exists yet in this design
  { href: '#', label: 'Nos réalisations' },
  { href: '/#testimonials', label: 'Avis' },
];

// TODO: replace with the real social profile URLs
const SOCIALS = [
  { href: '#', label: 'Instagram' },
  { href: '#', label: 'Facebook' },
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
              <ul className="flex flex-col gap-3">
                {SOCIALS.map((social) => (
                  <li key={social.label}>
                    <NavLink
                      href={social.href}
                      tone="footer"
                      className="underline"
                    >
                      {social.label}
                    </NavLink>
                  </li>
                ))}
                {/* Planity profile (reviews); booking itself is /reserver. */}
                {REVIEWS.url ? (
                  <li>
                    <a
                      href={REVIEWS.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-montserrat hover:text-base-white text-[16px] tracking-[0.16px] text-gray-100 underline transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current motion-reduce:transition-none"
                    >
                      Planity
                      <span className="sr-only">
                        {' '}
                        — profil du cabinet (nouvel onglet)
                      </span>
                    </a>
                  </li>
                ) : null}
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
