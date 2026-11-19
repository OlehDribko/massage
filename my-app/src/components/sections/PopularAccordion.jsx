'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Link, useFormat, useT } from '@/i18n/client';

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
 * Short muted clips of each soin (public/videos, 720×1280 H.264 without
 * sound, ~2 MB each), by editorial key (content/services.js). No photo or
 * still frame: the open item shows its clip, playing. A featured
 * prestation without a clip shows no media.
 */
const VIDEOS = {
  'tuina-huiles-chaudes': '/videos/popular-relax.mp4',
  sportif: '/videos/popular-sportif.mp4',
  endospheres: '/videos/popular-endospheres.mp4',
  'drainage-lymphatique': '/videos/popular-lymphatique.mp4',
  maderotherapie: '/videos/popular-anti-cellulite.mp4',
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

const videoOf = (prestation) => VIDEOS[prestation?.key] ?? null;

// Which of the two places shows the clip: the column (from 1024 px) or
// the open item (below). Only the clip in the visible place plays.
// null before hydration (server render): nothing plays yet.
const DESKTOP = '(min-width: 64rem)';
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
 * The whole clip is the pause / play control, with no button drawn on it:
 * a soft translucent icon in the middle appears on mouse hover and keyboard
 * focus (pause while it plays), and the play icon stays while it is paused.
 * Touch: a tap toggles it (no hover on touch screens).
 */
function PauseOverlay({ paused, onToggle }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={paused}
      aria-label={paused ? t('Lire la vidéo') : t('Mettre en pause la vidéo')}
      className="group absolute inset-0 z-10 flex cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white/70"
    >
      <span
        aria-hidden
        className={`flex size-16 items-center justify-center rounded-full bg-black/20 text-white/80 backdrop-blur-[2px] transition-[opacity,scale] duration-300 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:transition-none ${paused ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
      >
        <svg viewBox="0 0 24 24" className="size-7 fill-current">
          {paused ? (
            <path d="M8.5 5.5v13l10-6.5z" />
          ) : (
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
          )}
        </svg>
      </span>
    </button>
  );
}

/**
 * A muted looping clip that plays while `playing` and on screen (scrolled
 * away it waits, and goes on when back). preload="none": only the clips
 * asked to play are downloaded.
 */
function Clip({ src, playing, className }) {
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
      // Refused (power saving…): nothing to report.
      element.play().catch(() => {});
    } else {
      element.pause();
    }
  }, [playing, onScreen]);

  return (
    <video
      ref={ref}
      src={src}
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
 * 704:1465): a numbered accordion, always one item open (the first by
 * default). A click on a closed row opens it and closes the other; the
 * open one cannot be folded. The arrow only shows the state (↗ open,
 * ↘ closed). The open item shows the API description of
 * the prestation's shortest duration — the one « Réserver ce soin » opens
 * (when one exists), the lowest current price and the durations, and
 * « Réserver ce soin » books that prestation. The clip next to the list
 * follows the open item (from 1024 px); below, it sits inside the open
 * item. It plays until the person pauses it (a click on the clip);
 * opening another item plays that one's clip again.
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
  const desktop = useMedia(DESKTOP);
  // A click on the clip pauses / resumes it (WCAG 2.2.2: the clips loop
  // for more than 5 s). Nothing else stops it.
  const [paused, setPaused] = useState(false);
  const togglePaused = () => setPaused((value) => !value);
  const openItem = (index) => {
    if (index === open) return;
    setOpen(index);
    setPaused(false);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-stretch">
      <ul className="flex min-w-0 flex-1 flex-col justify-center py-6 lg:py-[60px] lg:pr-[65px]">
        {prestations.map((prestation, index) => {
          const isOpen = index === open;
          const panelId = `${id}-${index}`;
          const number = String(index + 1).padStart(2, '0');
          const video = videoOf(prestation);
          return (
            <li
              key={prestation.key}
              className="border-b border-black/7 py-6 last:border-b-0 max-sm:-mx-4 max-sm:px-4"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => openItem(index)}
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

                  {/* Phones and tablets (Figma 704:1465): the clip of the
                      open item, inside it. Always mounted, so it never pops
                      in: it fades in as the item opens (the scroll parallax
                      of HomeMotion already moves it). */}
                  {video ? (
                    <div className="relative mt-6 aspect-[358/398] w-full overflow-hidden rounded-[4px] sm:aspect-[4/3] lg:hidden">
                      <Clip
                        src={video}
                        playing={isOpen && desktop === false && !paused}
                        className={`absolute inset-0 size-full object-cover transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isOpen ? 'opacity-100 delay-150 duration-1000' : 'opacity-0 duration-300'}`}
                      />
                      {isOpen ? (
                        <PauseOverlay paused={paused} onToggle={togglePaused} />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* From 1024 px: the clip of the open item, cross-faded. */}
      <div className="relative hidden shrink-0 overflow-hidden lg:block lg:min-h-[703px] lg:w-[554px]">
        {prestations.map((prestation, index) => {
          const video = videoOf(prestation);
          if (!video) return null;
          const active = index === open;
          return (
            <Clip
              key={prestation.key}
              src={video}
              playing={active && desktop === true && !paused}
              className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${active ? 'opacity-100' : 'opacity-0'}`}
            />
          );
        })}
        {videoOf(prestations[open]) ? (
          <PauseOverlay paused={paused} onToggle={togglePaused} />
        ) : null}
      </div>
    </div>
  );
}
