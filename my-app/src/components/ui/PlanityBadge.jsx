import Image from 'next/image';

import RatingStars from '@/components/ui/RatingStars';
import { REVIEWS } from '@/content/reviews';

/**
 * Planity rating as a link to the studio's Planity page (all reviews).
 * `variant`: 'light' (reviews section, Figma 583:774), 'card' (hero card
 * from 768 px, Figma 412:194), 'strip' (hero bottom strip on phones,
 * Figma 546:220).
 */
export default function PlanityBadge({ variant = 'light', className = '' }) {
  const label = `Note ${REVIEWS.rating} sur 5 — ${REVIEWS.count} avis vérifiés sur Planity (nouvelle fenêtre)`;
  const link = {
    href: REVIEWS.url,
    target: '_blank',
    rel: 'noopener noreferrer',
    'aria-label': label,
  };

  if (variant === 'card') {
    return (
      <a
        {...link}
        className={`rounded-card group flex w-fit shrink-0 flex-col gap-4 border border-white/15 bg-white/10 p-6 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none ${className}`}
      >
        <span className="flex items-center gap-3">
          <Image
            src="/images/planity-badge.png"
            alt=""
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="flex flex-col gap-1">
            <RatingStars />
            <span className="font-montserrat text-[16px] tracking-[0.16px] text-[#dacbcb]">
              Note parfaite : {REVIEWS.rating.replace(',0', '')} / 5
            </span>
          </span>
        </span>
        <span className="font-montserrat text-[18px] font-medium tracking-[0.18px] text-[#ececec]">
          {REVIEWS.count} avis vérifiés
        </span>
      </a>
    );
  }

  if (variant === 'strip') {
    return (
      <a
        {...link}
        className={`flex items-center justify-between gap-2 bg-white/10 px-4 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${className}`}
      >
        <span className="flex items-center gap-3">
          <Image
            src="/images/planity-badge.png"
            alt=""
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="flex flex-col gap-0.5">
            <RatingStars />
            <span className="font-montserrat text-[12px] tracking-[0.12px] text-gray-100">
              Note parfaite : {REVIEWS.rating.replace(',0', '')} / 5
            </span>
          </span>
        </span>
        <span className="font-montserrat text-[14px] tracking-[0.14px] text-[#ececec] underline-offset-4">
          {REVIEWS.count} avis vérifiés
        </span>
      </a>
    );
  }

  return (
    <a
      {...link}
      className={`group focus-visible:outline-third-200 flex w-fit items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 ${className}`}
    >
      <Image
        src="/images/planity-badge.png"
        alt=""
        width={40}
        height={40}
        className="rounded-lg"
      />
      <span className="flex flex-col gap-1">
        <RatingStars />
        <span className="font-montserrat text-body group-hover:text-third-200 text-gray-800 underline-offset-4 group-hover:underline">
          {REVIEWS.count} avis vérifiés
        </span>
      </span>
    </a>
  );
}
