'use client';

import Link from 'next/link';

import { useAuth } from '@/components/auth/AuthProvider';
import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import { AUTH_ROUTES } from '@/config/auth';

const TABS = [
  { key: 'profil', href: '/compte', label: 'Mon profil' },
  {
    key: 'reservations',
    href: '/compte/reservations',
    label: 'Mes réservations',
  },
];

export function AccountNav({ current, isAdmin }) {
  const tabs = isAdmin
    ? [...TABS, { key: 'admin', href: '/admin', label: 'Administration' }]
    : TABS;
  return (
    <nav aria-label="Espace client">
      <ul className="font-montserrat text-label flex flex-wrap gap-x-6 gap-y-2 border-b border-black/10">
        {tabs.map((tab) => (
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
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Gate of the private client pages. Renders `children` only for a permanent
 * account (member/admin); otherwise the matching state, never private data.
 * `children` is a function of the session so pages read the shared state.
 */
export default function AccountShell({ title, current, returnTo, children }) {
  const auth = useAuth();
  const { enabled, controller, status } = auth;

  let content;
  if (!enabled) {
    content = <Notice>L’espace client n’est pas encore disponible.</Notice>;
  } else if (status === 'loading') {
    content = (
      <p role="status" className="font-montserrat text-body text-gray-800">
        Chargement de votre compte…
      </p>
    );
  } else if (status === 'unavailable') {
    content = (
      <div className="flex flex-col gap-4">
        <Notice tone="error">
          Le service de connexion est momentanément indisponible.
        </Notice>
        <PillButton
          variant="outline"
          tone="dark"
          onClick={() => controller.retry()}
          className="self-start"
        >
          Réessayer
        </PillButton>
      </div>
    );
  } else if (status === 'guest') {
    content = (
      <div className="flex flex-col gap-6">
        <p className="font-montserrat text-body text-gray-800">
          Connectez-vous pour accéder à votre compte.
        </p>
        <PillButton
          href={`${AUTH_ROUTES.signIn}?retour=${encodeURIComponent(returnTo ?? AUTH_ROUTES.account)}`}
          className="self-start"
        >
          Se connecter
        </PillButton>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      {/* `title={null}`: the page renders its own h1 (e.g. confirmation). */}
      {title || content ? (
        <h1 className="text-section-title text-third-900">
          {title ?? 'Mon compte'}
        </h1>
      ) : null}
      {content ?? (
        <>
          {current ? (
            <AccountNav current={current} isAdmin={status === 'admin'} />
          ) : null}
          {children(auth)}
        </>
      )}
    </section>
  );
}
