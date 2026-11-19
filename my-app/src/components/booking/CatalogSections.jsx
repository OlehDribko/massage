'use client';

import ServiceCard from '@/components/booking/ServiceCard';
import { CATEGORIES } from '@/content/services';
import { useT } from '@/i18n/client';
import { msg } from '@/i18n/translate';
import { OTHERS, PROMOTIONS } from '@/lib/booking/catalog';

const TITLES = {
  [PROMOTIONS]: msg('Promotions en cours'),
  [OTHERS]: msg('Autres soins'),
};

const categoryOf = (key) =>
  CATEGORIES.find((category) => category.key === key) ?? null;

/**
 * Catalogue sections of /reserver (`catalogSections`): a serif title with
 * the number of prestations, the category's intro if any, then the rows.
 * In « Promotions en cours » each row names its category. Section heads
 * and rows carry `data-flip-id` for the glide of CatalogBrowser.
 */
export default function CatalogSections({ sections }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-10 md:gap-12">
      {sections.map((section) => {
        const category = categoryOf(section.key);
        const title = category?.label ?? TITLES[section.key];
        return (
          <section key={section.key} aria-labelledby={`sec-${section.key}`}>
            <div data-flip-id={`sec:${section.key}`}>
              <div className="border-secondary-200 flex items-baseline gap-2.5 border-b pb-3">
                <h2
                  id={`sec-${section.key}`}
                  className="font-faustina text-2xl leading-[1.2] font-normal text-gray-900 md:text-[1.75rem]"
                >
                  {t(title)}
                </h2>
                <span className="font-montserrat text-xs text-gray-800">
                  ({section.items.length})
                </span>
              </div>
              {category?.intro ? (
                <p className="font-montserrat text-body-sm mt-3 max-w-[760px] text-gray-800">
                  {t(category.intro)}
                </p>
              ) : null}
            </div>
            <ul className="flex flex-col">
              {section.items.map((prestation) => (
                <li key={prestation.key} data-flip-id={prestation.key}>
                  <ServiceCard
                    prestation={prestation}
                    categoryLabel={
                      section.key === PROMOTIONS &&
                      categoryOf(prestation.category)
                        ? t(categoryOf(prestation.category).label)
                        : undefined
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
