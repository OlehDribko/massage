'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

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

const AUTOPLAY_MS = 7000;
// How long the outgoing review stays for its exit (globals.css).
const EXIT_MS = 600;

/** Its height follows the content smoothly (no jump between reviews). */
function AutoHeight({ children, className = '' }) {
  const inner = useRef(null);
  const [height, setHeight] = useState();
  useLayoutEffect(() => {
    const element = inner.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(() => setHeight(element.offsetHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      style={{ height }}
      className="[overflow-y:clip] transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
    >
      <div ref={inner} className={className}>
        {children}
      </div>
    </div>
  );
}

function PauseIcon({ paused }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
      {paused ? (
        <path d="M8 5v14l11-7z" />
      ) : (
        <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
      )}
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
 *
 * Autoplay: the next review every 7 s while the section is on screen,
 * paused on hover / keyboard focus, with a pause button (WCAG 2.2.2) and a
 * progress line; never with reduced motion. A changed review slides in.
 */
export default function TestimonialsSection({ id }) {
  const [current, setCurrent] = useState(0);
  const items = REVIEWS.items;
  const total = items.length;
  const featured = items[current];
  const following = [1, 2]
    .map((offset) => (current + offset) % total)
    .filter((index) => index !== current)
    .map((index) => ({ index, review: items[index] }));
  // Direction of the last change: the new review slides in from that side.
  const [direction, setDirection] = useState('next');
  // The review leaving: kept a moment so it slides out under the new one.
  const [leaving, setLeaving] = useState(null);
  const shownRef = useRef(0);
  const reducedRef = useRef(true);
  const change = (next, side) => {
    setDirection(side);
    // Reduced motion: no exit (nor slide), the review just changes.
    if (!reducedRef.current) setLeaving({ index: shownRef.current, side });
    shownRef.current = next;
    setCurrent(next);
  };
  useEffect(() => {
    if (!leaving) return undefined;
    const timer = setTimeout(() => setLeaving(null), EXIT_MS);
    return () => clearTimeout(timer);
  }, [leaving]);
  const go = (delta) =>
    change(
      (shownRef.current + delta + total) % total,
      delta < 0 ? 'prev' : 'next'
    );

  // Phones: a horizontal swipe on the review changes it.
  const touchStart = useRef(null);
  const onTouchStart = (event) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const onTouchEnd = (event) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      go(dx < 0 ? 1 : -1);
    }
  };

  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      reducedRef.current = query.matches;
      setReduced(query.matches);
    };
    update();
    query.addEventListener('change', update);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.35 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      query.removeEventListener('change', update);
      observer.disconnect();
    };
  }, []);

  const running = visible && !hovered && !paused && !reduced;
  useEffect(() => {
    if (!running) return undefined;
    const timer = setTimeout(
      () => change((shownRef.current + 1) % total, 'next'),
      AUTOPLAY_MS
    );
    return () => clearTimeout(timer);
  }, [running, current, total]);

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-labelledby={`${id}-title`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setHovered(false);
        }
      }}
      className="bg-secondary-100 px-page overflow-x-clip pt-40 pb-40 lg:pb-[200px]"
    >
      <h2 id={`${id}-title`} className="sr-only">
        Avis clients
      </h2>
      <div className="max-w-content mx-auto flex flex-col gap-16 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-12 lg:max-w-[661px] lg:flex-1 lg:gap-20">
          <figure
            className="flex touch-pan-y flex-col gap-8"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
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
                <span
                  key={current}
                  className="font-montserrat text-body fade-in text-gray-800"
                >
                  {formatDate(featured.date)}
                </span>
              </figcaption>
              <div className="flex items-center gap-2">
                {!reduced ? (
                  <button
                    type="button"
                    onClick={() => setPaused((value) => !value)}
                    aria-pressed={paused}
                    aria-label={
                      paused
                        ? 'Reprendre le défilement des avis'
                        : 'Mettre en pause le défilement des avis'
                    }
                    className="text-third-200 hover:bg-third-200/10 focus-visible:outline-third-200 flex size-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <PauseIcon paused={paused} />
                  </button>
                ) : null}
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
            {/* The new review slides in while the previous one slides out,
                both in the same grid cell; the height follows smoothly
                (globals.css). */}
            <AutoHeight className="grid">
              {leaving && leaving.index !== current ? (
                <blockquote
                  key={`out-${leaving.index}`}
                  aria-hidden
                  className={`slide-out-${leaving.side} font-faustina text-secondary-900 sm:text-h4 pointer-events-none text-[34px] leading-[1.12] font-light tracking-[-0.22px] break-words italic [grid-area:1/1]`}
                >
                  « {items[leaving.index].quote} »
                </blockquote>
              ) : null}
              <blockquote
                key={current}
                aria-live={running ? 'off' : 'polite'}
                className={`slide-${direction} font-faustina text-secondary-900 sm:text-h4 text-[34px] leading-[1.12] font-light tracking-[-0.22px] break-words italic [grid-area:1/1]`}
              >
                « {featured.quote} »
              </blockquote>
            </AutoHeight>
            <div className="flex items-center gap-4">
              <p className="font-montserrat text-body-sm shrink-0 text-gray-800">
                Avis {current + 1} sur {total}
              </p>
              {!reduced ? (
                <span
                  aria-hidden
                  className="relative h-px flex-1 overflow-hidden bg-black/10"
                >
                  {/* Restarts with each review and each resume. */}
                  <span
                    key={`${current}:${running}`}
                    className={`bg-third-200 absolute inset-y-0 left-0 ${running ? 'autoplay-bar' : 'w-0'}`}
                    style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                  />
                </span>
              ) : null}
            </div>
          </figure>

          <PlanityBadge />
        </div>

        {/* Mobile mock-up: only the featured review. */}
        <ul className="hidden flex-col gap-10 lg:flex lg:w-[554px] lg:shrink-0">
          {following.map(({ index: key, review }, index) => (
            <li
              key={key}
              style={{ animationDelay: `${0.25 + index * 0.12}s` }}
              className={`slide-${direction} flex flex-col gap-8 ${index ? 'border-t border-black/7 pt-10' : ''}`}
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
