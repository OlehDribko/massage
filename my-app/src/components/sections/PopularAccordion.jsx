'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import Image from 'next/image';
import { Link, useFormat, useT } from '@/i18n/client';
import { msg } from '@/i18n/translate';

import MaskIcon from '@/components/ui/MaskIcon';
import { POPULAR_CARDS } from '@/content/services';
import { lowestPrice } from '@/lib/booking/catalog';

/** "60-90 min" (Figma) for the durations of a prestation. */
function durationRange(variants, minutes = 'min') {
  const first = variants[0].durationMinutes;
  const last = variants.at(-1).durationMinutes;
  return first === last ? `${first} ${minutes}` : `${first}-${last} ${minutes}`;
}

/*
 * The two photos of the mock-up (variants 789:513 / 789:515 / 789:658):
 * the open item changes the photo. They alternate down the list.
 */
const PHOTOS = [
  {
    src: '/images/popular-neck.jpg',
    alt: msg('Massage du cou, cliente allongée en cabine'),
    position: 'object-[50%_62%]',
  },
  {
    src: '/images/popular-back.jpg',
    alt: msg('Massage du dos et des épaules en cabine'),
    position: 'object-[50%_35%]',
  },
];

/*
 * Short muted clips of each soin (public/videos, 720×1280 H.264 without
 * sound, ~2 MB each), by editorial key (content/services.js). They replace
 * the photo of their prestation; one without a clip keeps the photos.
 * The poster is the first frame, so nothing jumps when playback starts.
 */
const clip = (name) => ({
  video: `/videos/popular-${name}.mp4`,
  poster: `/videos/popular-${name}.jpg`,
});
const VIDEOS = {
  'tuina-huiles-chaudes': clip('relax'),
  sportif: clip('sportif'),
  endospheres: clip('endospheres'),
  'drainage-lymphatique': clip('lymphatique'),
  maderotherapie: clip('anti-cellulite'),
};

// The order and titles of the mock-up (content/services.js).
const cardIndex = (prestation) => {
  const index = POPULAR_CARDS.findIndex((card) => card.key === prestation.key);
  return index < 0 ? POPULAR_CARDS.length : index;
};
const inMockupOrder = (prestations) =>
  prestations
    .map((prestation, index) => ({ prestation, index }))
    .sort(
      (a, b) =>
        cardIndex(a.prestation) - cardIndex(b.prestation) || a.index - b.index
    )
    .map(({ prestation }) => prestation);

const mediaFor = (prestation, index) =>
  VIDEOS[prestation?.key] ?? PHOTOS[Math.max(index, 0) % PHOTOS.length];

// Which of the two places shows the media: the column (from 1024 px) or
// the open item (below). Only the clip in the visible place plays.
// null before hydration (server render): nothing plays yet.
const DESKTOP = '(min-width: 64rem)';
const REDUCED = '(prefers-reduced-motion: reduce)';
const useMedia = (media) =>
  useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(media);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia(media).matches,
    () => null
  );

/**
 * A muted looping clip that plays only while `playing` and on screen.
 * preload="none": a clip downloads only once it is asked to play; until
 * then (and on reduced motion) its poster stands in.
 */
function Clip({ media, playing, className }) {
  const ref = useRef(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting)
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (playing && onScreen) {
      // Refused (power saving…): the poster stays, nothing to report.
      element.play().catch(() => {});
    } else {
      element.pause();
    }
  }, [playing, onScreen]);

  return (
    <video
      ref={ref}
      src={media.video}
      poster={media.poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className={className}
    />
  );
}

/**
 * Figma «Nos soins populaires» (704:1296, tablet 704:2255, mobile
 * 704:1465): a numbered accordion, one item open at a time (the first by
 * default). A click on a row opens or closes it; the arrow only shows the
 * state (↗ open, ↘ closed). The open item shows the API description of
 * the prestation's shortest duration — the one « Réserver ce soin » opens
 * (when one exists), the lowest current price and the durations, and
 * « Réserver ce soin » books that prestation. The clip (or photo) next to the list
 * follows the open item (from 1024 px); below, it sits inside the open
 * item.
 */
export default function PopularAccordion({ prestations: featured }) {
  const t = useT();
  const prestations = inMockupOrder(featured);
  const titleOf = (prestation) => {
    const card = POPULAR_CARDS.find((item) => item.key === prestation.key);
    return card ? t(card.title) : prestation.name;
  };
  const { formatPrice } = useFormat();
  const [open, setOpen] = useState(0);
  const id = useId();
  const shown = open < 0 ? 0 : open;
  const desktop = useMedia(DESKTOP);
  // No clip plays by itself with reduced motion: its poster stays.
  const paused = useMedia(REDUCED) !== false;
  // One layer per distinct clip or photo of the column.
  const layers = [];
  prestations.forEach((prestation, index) => {
    const media = mediaFor(prestation, index);
    const layer = layers.find((item) => item.media === media);
    if (layer) layer.indexes.push(index);
    else layers.push({ media, indexes: [index] });
  });

  return (
    <div className="flex flex-col lg:flex-row lg:items-stretch">
      <ul className="flex min-w-0 flex-1 flex-col justify-center py-6 lg:py-[60px] lg:pr-[65px]">
        {prestations.map((prestation, index) => {
          const isOpen = index === open;
          const panelId = `${id}-${index}`;
          const number = String(index + 1).padStart(2, '0');
          const media = mediaFor(prestation, index);
          return (
            <li
              key={prestation.key}
              className="border-b border-black/7 py-6 last:border-b-0 max-sm:-mx-4 max-sm:px-4"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : index)}
                className="group focus-visible:outline-primary-200 flex w-full min-w-0 items-start gap-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 sm:gap-20"
              >
                <span
                  aria-hidden
                  className="font-faustina text-gold w-7 shrink-0 pt-0.5 text-[24px] font-light tracking-[-0.24px] italic"
                >
                  {number}
                </span>
                <span className="font-montserrat text-title-sm sm:text-service-title group-hover:text-third-200 min-w-0 font-normal text-gray-900 transition-colors motion-reduce:transition-none">
                  {titleOf(prestation)}
                </span>
                <MaskIcon
                  src="/icons/arrow-up-right.svg"
                  className={`text-third-200 ml-auto size-7 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:size-8 ${isOpen ? '' : 'rotate-90'}`}
                />
              </button>

              <div
                id={panelId}
                inert={!isOpen}
                className={`grid transition-[grid-template-rows] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden">
                  <div
                    className={`font-montserrat text-body flex flex-col pt-8 pl-[3.25rem] transition-[opacity,translate] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:pl-[6.75rem] lg:pr-[46px] ${isOpen ? 'translate-y-0 opacity-100 delay-100 duration-600' : '-translate-y-2 opacity-0 duration-300'}`}
                  >
                    {prestation.description ? (
                      <p className="text-gray-200">{prestation.description}</p>
                    ) : null}
                    <div
                      className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-3 ${prestation.description ? 'pt-5' : ''}`}
                    >
                      <p className="flex items-center gap-3 whitespace-nowrap">
                        <span className="font-semibold text-gray-800">
                          {t('à partir de {price}', {
                            price: formatPrice(
                              lowestPrice(prestation),
                              prestation.variants[0].currency
                            ),
                          })}
                        </span>
                        <span aria-hidden className="text-gray-200">
                          •
                        </span>
                        <span className="text-gray-200">
                          {durationRange(prestation.variants, t('min'))}
                        </span>
                      </p>
                      <Link
                        href={`/reserver/${prestation.variants[0].id}`}
                        className="text-primary-200 hover:text-third-200 focus-visible:outline-primary-200 border-b-[1.2px] border-current text-[14px] font-medium tracking-[0.01em] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none"
                      >
                        {t('Réserver ce soin')}
                      </Link>
                    </div>
                  </div>

                  {/* Phones and tablets (Figma 704:1465): the clip (or photo)
                      of the open item, inside it. Always mounted, so it
                      never pops in: it fades in as the item opens (the scroll
                      parallax of HomeMotion already moves it). A clip shows
                      its poster until it plays. */}
                  <div className="relative mt-6 aspect-[358/398] w-full overflow-hidden rounded-[4px] sm:aspect-[4/3] lg:hidden">
                    {media.video ? (
                      <Clip
                        media={media}
                        playing={isOpen && desktop === false && !paused}
                        className={`absolute inset-0 size-full object-cover transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isOpen ? 'opacity-100 delay-150 duration-1000' : 'opacity-0 duration-300'}`}
                      />
                    ) : (
                      <Image
                        src={media.src}
                        alt={isOpen ? t(media.alt) : ''}
                        fill
                        loading="eager"
                        fetchPriority="low"
                        sizes="(min-width: 1024px) 1px, (min-width: 640px) 90vw, 100vw"
                        className={`object-cover ${media.position} transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isOpen ? 'opacity-100 delay-150 duration-1000' : 'opacity-0 duration-300'}`}
                      />
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* From 1024 px: the clip (or photo) of the open item, cross-faded.
          Items sharing a photo share one layer. */}
      <div className="relative hidden shrink-0 overflow-hidden lg:block lg:min-h-[703px] lg:w-[554px]">
        {layers.map(({ media, indexes }) => {
          const active = indexes.includes(shown);
          const fade = `transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${active ? 'opacity-100' : 'opacity-0'}`;
          return media.video ? (
            <Clip
              key={media.video}
              media={media}
              playing={active && desktop === true && !paused}
              className={`absolute inset-0 size-full object-cover ${fade}`}
            />
          ) : (
            <Image
              key={media.src}
              src={media.src}
              alt={active ? t(media.alt) : ''}
              aria-hidden={active ? undefined : true}
              fill
              sizes="554px"
              className={`object-cover ${media.position} ${fade}`}
            />
          );
        })}
      </div>
    </div>
  );
}
