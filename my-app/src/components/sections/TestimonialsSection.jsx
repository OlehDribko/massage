'use client';

import { useState } from 'react';

import PlanityBadge from '@/components/ui/PlanityBadge';
import RatingStars from '@/components/ui/RatingStars';
import { REVIEWS } from '@/content/reviews';

const DATE = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const formatDate = (date) => DATE.format(new Date(`${date}T12:00:00Z`));

function Arrow({ back = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
      className={`size-6 ${back ? 'rotate-180' : ''}`}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const arrowButton =
  'border-third-200 text-third-200 hover:bg-third-200 hover:text-on-dark focus-visible:outline-third-200 flex size-12 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none';

/**
 * Figma «discover-techniques» (577:760, mobile 704:1685): the reviews of
 * the studio's Planity page (content/reviews.js). One featured review with
 * previous / next arrows, the next two listed on the right (desktop), and
 * the Planity rating linking to the page with all reviews.
 */
export default function TestimonialsSection({ id }) {
  const [current, setCurrent] = useState(0);
  const items = REVIEWS.items;
  const total = items.length;
  const featured = items[current];
  const following = [1, 2]
    .map((offset) => items[(current + offset) % total])
    .filter((review) => review !== featured);
  const go = (delta) => setCurrent((index) => (index + delta + total) % total);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="bg-secondary-100 px-page pt-40 pb-40 lg:pb-[200px]"
    >
      <h2 id={`${id}-title`} className="sr-only">
        Avis clients
      </h2>
      <div className="max-w-content mx-auto flex flex-col gap-16 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-12 lg:max-w-[661px] lg:flex-1 lg:gap-20">
          <figure className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-6">
              <figcaption className="flex flex-col">
                <span className="flex items-center gap-2">
                  <span className="font-montserrat text-body-lg font-semibold text-gray-900">
                    Avis Planity
                  </span>
                  <RatingStars count={Math.round(featured.rating)} />
                  <span className="sr-only">
                    {String(featured.rating).replace('.', ',')} sur 5
                  </span>
                </span>
                <span className="font-montserrat text-body text-gray-800">
                  {formatDate(featured.date)}
                </span>
              </figcaption>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Avis précédent"
                  className={`${arrowButton} hidden sm:flex`}
                >
                  <Arrow back />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Avis suivant"
                  className={arrowButton}
                >
                  <Arrow />
                </button>
              </div>
            </div>
            <blockquote
              aria-live="polite"
              className="font-faustina text-secondary-900 sm:text-h4 text-[34px] leading-[1.12] font-light tracking-[-0.22px] break-words italic"
            >
              « {featured.quote} »
            </blockquote>
            <p className="font-montserrat text-body-sm text-gray-800">
              Avis {current + 1} sur {total}
            </p>
          </figure>

          <PlanityBadge />
        </div>

        {/* Mobile mock-up: only the featured review. */}
        <ul className="hidden flex-col gap-10 lg:flex lg:w-[554px] lg:shrink-0">
          {following.map((review, index) => (
            <li
              key={`${review.date}-${review.quote.slice(0, 20)}`}
              className={`flex flex-col gap-8 ${index ? 'border-t border-black/7 pt-10' : ''}`}
            >
              <RatingStars count={Math.round(review.rating)} />
              <blockquote className="font-montserrat text-body-lg text-gray-900">
                « {review.quote} »
              </blockquote>
              <p className="font-montserrat text-body-lg font-semibold text-gray-900">
                {formatDate(review.date)}
              </p>
            </li>
          ))}
          <li>
            <a
              href={REVIEWS.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-montserrat text-label text-primary-200 hover:text-primary-300 border-b-[1.2px] border-current font-medium uppercase"
            >
              Tous les avis sur Planity
              <span className="sr-only"> (nouvelle fenêtre)</span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
