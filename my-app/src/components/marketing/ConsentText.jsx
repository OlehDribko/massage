'use client';

import { MARKETING_CONSENT } from '@/config/marketing';
import { useLocale, useT } from '@/i18n/client';

/*
 * The newsletter consent text. Its French wording is bound to the version
 * the API checks (src/config/marketing.js): it is always shown as is, in
 * French. On the other languages a translation follows it, marked as such —
 * the French text stays the one the visitor agrees to.
 */
export default function ConsentText() {
  const t = useT();
  const locale = useLocale();
  return (
    <>
      <span lang="fr">{MARKETING_CONSENT.text}</span>
      {locale !== 'fr' ? (
        <span className="mt-1 block">
          {t(
            'Traduction (seul le texte français ci-dessus fait foi) : {text}',
            {
              text: t(MARKETING_CONSENT.text),
            }
          )}
        </span>
      ) : null}
    </>
  );
}
