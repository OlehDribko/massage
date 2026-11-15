'use client';

import { Link, useT } from '@/i18n/client';
import { msg } from '@/i18n/translate';

import { useAuth } from '@/components/auth/AuthProvider';
import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import { AUTH_ROUTES } from '@/config/auth';

const TABS = [
  { key: 'calendrier', href: '/admin/calendrier', label: msg('Calendrier') },
  { key: 'horaires', href: '/admin/horaires', label: msg('Horaires') },
  {
    key: 'cartes-cadeaux',
    href: '/admin/cartes-cadeaux',
    label: msg('Cartes cadeaux'),
  },
];

/**
 * Gate of the admin pages. The menu and the pages appear only for the role
 * confirmed by the backend profile (`role: admin`); data is requested only
 * then. This is UX, not protection: every /api/admin call is checked by the
 * server (`requireAdmin`: admin role, non-anonymous, verified email) and a
 * 403 is shown as "no access". After sign-out or an account switch the
 * status changes at once and the children (with their data) are unmounted.
 */
export default function AdminShell({ title, current, returnTo, children }) {
  const t = useT();
  const auth = useAuth();
  const { enabled, controller, status } = auth;

  let content;
  if (!enabled) {
    content = (
      <Notice>{t('L’administration n’est pas encore disponible.')}</Notice>
    );
  } else if (status === 'loading') {
    content = (
      <p role="status" className="font-montserrat text-body text-gray-800">
        {t('Vérification de vos droits…')}
      </p>
    );
  } else if (status === 'unavailable') {
    content = (
      <div className="flex flex-col gap-4">
        <Notice tone="error">
          {t('Le service de connexion est momentanément indisponible.')}
        </Notice>
        <PillButton
          variant="outline"
          tone="dark"
          onClick={() => controller.retry()}
          className="self-start"
        >
          {t('Réessayer')}
        </PillButton>
      </div>
    );
  } else if (status === 'guest') {
    content = (
      <div className="flex flex-col gap-6">
        <p className="font-montserrat text-body text-gray-800">
          {t('Connectez-vous avec le compte de l’administration.')}
        </p>
        <PillButton
          href={`${AUTH_ROUTES.signIn}?retour=${encodeURIComponent(returnTo)}`}
          className="self-start"
        >
          {t('Se connecter')}
        </PillButton>
      </div>
    );
  } else if (status !== 'admin') {
    content = (
      <Notice tone="error">
        {t('Cette page est réservée à l’administration du cabinet.')}
      </Notice>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-section-title text-third-900">{title}</h1>
      {content ?? (
        <>
          <nav aria-label={t('Administration')}>
            <ul className="font-montserrat text-label flex flex-wrap gap-x-6 gap-y-2 border-b border-black/10">
              {TABS.map((tab) => (
                <li key={tab.key}>
                  <Link
                    href={tab.href}
                    aria-current={current === tab.key ? 'page' : undefined}
                    className={`focus-visible:outline-third-200 -mb-px inline-block border-b-2 py-3 font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 motion-reduce:transition-none ${
                      current === tab.key
                        ? 'border-third-200 text-third-900'
                        : 'hover:text-third-200 border-transparent text-gray-800'
                    }`}
                  >
                    {t(tab.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {children(auth)}
        </>
      )}
    </section>
  );
}

/** Error of an admin request: 403 means the role was withdrawn. */
export function AdminError({ error, onRetry, message }) {
  const t = useT();
  const forbidden = error?.status === 403;
  return (
    <div className="flex flex-col gap-4">
      <Notice tone="error">
        {forbidden ? t('Vous n’avez plus accès à l’administration.') : message}
      </Notice>
      {!forbidden && onRetry ? (
        <PillButton
          variant="outline"
          tone="dark"
          onClick={onRetry}
          className="self-start"
        >
          {t('Réessayer')}
        </PillButton>
      ) : null}
    </div>
  );
}
