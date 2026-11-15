'use client';

import Header from '@/components/layout/Header';

// Sample data only. Links point to anchors because the sign-in, account and
// admin routes do not exist yet.
const wait = () => new Promise((resolve) => setTimeout(resolve, 600));

const STATES = [
  { key: 'none', title: 'Connexion non configurée', account: null },
  { key: 'loading', title: 'Initialisation', account: { status: 'loading' } },
  {
    key: 'guest',
    title: 'Visiteur anonyme',
    account: { status: 'guest', signInHref: '#connexion' },
  },
  {
    key: 'member',
    title: 'Compte permanent',
    account: {
      status: 'member',
      user: { name: 'Léa Martin', email: 'lea@example.com' },
      accountHref: '#compte',
      onSignOut: wait,
    },
  },
  {
    key: 'member-no-name',
    title: 'Compte permanent sans nom',
    account: {
      status: 'member',
      user: { email: 'lea@example.com' },
      accountHref: '#compte',
      onSignOut: wait,
    },
  },
  {
    key: 'member-long-name',
    title: 'Compte permanent, nom très long',
    account: {
      status: 'member',
      user: {
        name: 'Marie-Christine Delacroix-Montmorency de la Tour d’Auvergne',
        email: 'marie-christine.delacroix-montmorency@exemple-tres-long.fr',
      },
      accountHref: '#compte',
      bookingsHref: '#reservations',
      onSignOut: wait,
    },
  },
  {
    key: 'admin',
    title: 'Administratrice (rôle confirmé par le serveur)',
    account: {
      status: 'admin',
      user: { name: 'Stefania Ben' },
      accountHref: '#compte',
      bookingsHref: '#reservations',
      adminHref: '#admin',
      onSignOut: wait,
    },
  },
  {
    key: 'sign-out-error',
    title: 'Échec de la déconnexion',
    account: {
      status: 'member',
      user: { name: 'Léa Martin' },
      accountHref: '#compte',
      onSignOut: () => wait().then(() => Promise.reject(new Error('demo'))),
    },
  },
  {
    key: 'unavailable',
    title: 'Erreur, nouvel essai possible',
    account: { status: 'unavailable', onRetry: () => {} },
  },
  {
    key: 'unavailable-no-retry',
    title: 'Erreur, sans nouvel essai',
    account: { status: 'unavailable' },
  },
];

export default function HeaderPreview() {
  return (
    <main className="bg-gray-50 pb-20">
      <p className="font-montserrat px-page py-6 text-[14px] text-gray-800">
        Aperçu local (next dev uniquement) — données fictives, aucune session
        réelle.
      </p>
      {/* Earlier samples stack above later ones, so an open account menu is
          not covered by the next sample header. */}
      {STATES.map((state, index) => (
        <section
          key={state.key}
          id={`state-${state.key}`}
          className="relative mb-10"
          style={{ zIndex: STATES.length - index }}
        >
          <h2 className="font-montserrat px-page pb-2 text-[14px] font-semibold text-gray-900">
            {state.title}
          </h2>
          <div className="bg-secondary-900 relative z-30 h-[160px]">
            <Header variant="overlay" account={state.account} />
          </div>
          <div className="relative min-h-[160px]">
            <Header variant="solid" account={state.account} />
          </div>
        </section>
      ))}
    </main>
  );
}
