'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const EASE = 'power3.out';
const MOTION_OK = '(prefers-reduced-motion: no-preference)';

/** "500+" → { value: 500, prefix: '', suffix: '+' }; null if no number. */
function parseStat(text) {
  const match = /^(\D*)(\d+)(\D*)$/.exec(text.trim());
  return match
    ? { prefix: match[1], value: Number(match[2]), suffix: match[3] }
    : null;
}

/**
 * Scroll animations of the home page (test). Uses GSAP + ScrollTrigger
 * (cross-browser, no CSS scroll-timeline needed) and Lenis smooth scroll.
 * It attaches to the server-rendered sections by selector, so the page
 * stays readable before / without JavaScript. Everything runs only when
 * the visitor does not ask for reduced motion, and is reverted on leave.
 */
export default function HomeMotion() {
  const markerRef = useRef(null);

  useGSAP(() => {
    const main = markerRef.current?.closest('main');
    if (!main) return undefined;
    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      /* Smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync. */
      const lenis = new Lenis({ anchors: { offset: -80 }, lerp: 0.1 });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const sections = gsap.utils.toArray(':scope > section', main);
      const [hero, ...rest] = sections;

      /* Hero: words of the title rise from a mask, then the rest. */
      if (hero) {
        const title = hero.querySelector('h1');
        const intro = gsap.timeline({ defaults: { ease: EASE } });
        intro.from(hero.querySelector('img'), {
          scale: 1.18,
          duration: 2.2,
          ease: 'power2.out',
        });
        if (title) {
          SplitText.create(title, {
            type: 'words',
            mask: 'words',
            autoSplit: true,
            // No aria-label on <p>/<h2> (prohibited ARIA, Lighthouse): the
            // split spans are read as plain text, in order.
            aria: 'none',
            onSplit: (split) =>
              intro.from(
                split.words,
                { yPercent: 110, duration: 1, stagger: 0.07 },
                0.25
              ),
          });
        }
        intro.from(
          hero.querySelectorAll('.hero-in'),
          { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.12 },
          0.6
        );

        /* While leaving: the photo drifts slower, the text lifts and fades. */
        const content = title?.closest('.relative.flex');
        gsap.to(hero.querySelector('img'), {
          yPercent: 14,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
        if (content) {
          gsap.to(content, {
            yPercent: -18,
            autoAlpha: 0.15,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        }
      }

      for (const section of rest) {
        /* Titles: lines slide up from behind a mask. */
        for (const heading of section.querySelectorAll('h2')) {
          SplitText.create(heading, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            // No aria-label on <p>/<h2> (prohibited ARIA, Lighthouse): the
            // split spans are read as plain text, in order.
            aria: 'none',
            onSplit: (split) =>
              gsap.from(split.lines, {
                yPercent: 105,
                duration: 1.1,
                stagger: 0.1,
                ease: EASE,
                scrollTrigger: { trigger: heading, start: 'top 88%' },
              }),
          });
        }

        /* Paragraphs: like the titles, line by line from a mask. */
        for (const paragraph of section.querySelectorAll('p')) {
          if (
            paragraph.closest('li, dl, form, blockquote, a, button, nav') ||
            paragraph.textContent.trim().length < 40
          ) {
            continue;
          }
          SplitText.create(paragraph, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            // No aria-label on <p>/<h2> (prohibited ARIA, Lighthouse): the
            // split spans are read as plain text, in order.
            aria: 'none',
            onSplit: (split) =>
              gsap.from(split.lines, {
                yPercent: 105,
                duration: 0.9,
                stagger: 0.06,
                ease: EASE,
                scrollTrigger: { trigger: paragraph, start: 'top 90%' },
              }),
          });
        }

        /* Photos: a curtain opens upwards, then a slow parallax. */
        for (const image of section.querySelectorAll('img')) {
          const frame = image.parentElement;
          if (!frame || image.closest('a, button')) continue;
          gsap.set(frame, { overflow: 'hidden' });
          // Full-bleed backgrounds (data-reveal="none") get no curtain: it
          // would uncover the section's dark background behind the photo.
          if (image.dataset.reveal !== 'none') {
            gsap.fromTo(
              frame,
              { clipPath: 'inset(18% 0% 0% 0% round 4px)' },
              {
                clipPath: 'inset(0% 0% 0% 0% round 4px)',
                duration: 1.4,
                ease: 'power2.out',
                scrollTrigger: { trigger: frame, start: 'top 85%' },
              }
            );
          }
          // Mirrored photos (Tailwind -scale-x-100 = CSS `scale`): keep
          // the mirror inside GSAP's own transform instead.
          const mirrored = /^-/.test(getComputedStyle(image).scale);
          if (mirrored) image.style.setProperty('scale', 'none');
          // Gentle: a big zoom would blur the photo and crop faces.
          const soft = image.dataset.parallax === 'soft';
          const zoom = soft ? 1.04 : 1.08;
          const shift = soft ? 2 : 4;
          const scaleX = mirrored ? -zoom : zoom;
          gsap.fromTo(
            image,
            { yPercent: -shift, scaleX, scaleY: zoom },
            {
              yPercent: shift,
              scaleX,
              scaleY: zoom,
              ease: 'none',
              scrollTrigger: {
                trigger: frame,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        }

        /* Lists and paragraphs of a block arrive one after another. */
        for (const list of section.querySelectorAll('ul, dl')) {
          const items = list.querySelectorAll(':scope > li, :scope > div');
          if (!items.length) continue;
          gsap.from(items, {
            y: 36,
            autoAlpha: 0,
            duration: 0.8,
            stagger: 0.09,
            ease: EASE,
            scrollTrigger: { trigger: list, start: 'top 88%' },
          });
        }
        // Review quotes animate themselves on change (TestimonialsSection).
        for (const block of section.querySelectorAll('form')) {
          gsap.from(block, {
            y: 40,
            autoAlpha: 0,
            duration: 1,
            ease: EASE,
            scrollTrigger: { trigger: block, start: 'top 90%' },
          });
        }

        /* Numbers count up once ("500+", "12", "98%"). */
        for (const stat of section.querySelectorAll('dl dd')) {
          const parsed = parseStat(stat.textContent);
          if (!parsed) continue;
          const counter = { value: 0 };
          gsap.to(counter, {
            value: parsed.value,
            duration: 1.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: stat, start: 'top 90%' },
            onUpdate: () => {
              stat.textContent = `${parsed.prefix}${Math.round(counter.value)}${parsed.suffix}`;
            },
          });
        }
      }

      return () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });

    return () => mm.revert();
  });

  return <span ref={markerRef} hidden />;
}
