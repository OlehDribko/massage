'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import { postMarketingAction } from '@/lib/api/public';

const COPY = {
  confirm: {
    intro: 'Confirmez votre inscription à la newsletter du cabinet.',
    button: 'Confirmer mon inscription',
    success: {
      SUBSCRIBED: 'Votre inscription à la newsletter est confirmée.',
      ALREADY_SUBSCRIBED: 'Votre inscription était déjà confirmée.',
    },
    invalid:
      'Ce lien n’est plus valide : il a expiré, a déjà été utilisé ou a été remplacé par un lien plus récent.',
  },
  unsubscribe: {
    intro:
      'Vous ne recevrez plus la newsletter du cabinet. Les e-mails liés à vos rendez-vous ne sont pas concernés.',
    button: 'Me désabonner',
    success: { UNSUBSCRIBED: 'Vous êtes désabonné·e de la newsletter.' },
    invalid: 'Ce lien de désabonnement n’est pas valide.',
  },
};

/**
 * Newsletter link from an email (confirm or unsubscribe). The action runs
 * only on an explicit click: mail scanners that open links must not
 * subscribe or unsubscribe anyone. The token is sent in the POST body.
 */
export default function MarketingLinkAction({ action }) {
  const copy = COPY[action];
  const token = useSearchParams().get('token');
  const [state, setState] = useState({ status: 'idle' });
  const busyRef = useRef(false);

  if (!token) {
    return (
      <Notice tone="error">
        Ce lien est incomplet. Utilisez le lien reçu par e-mail.
      </Notice>
    );
  }

  const run = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setState({ status: 'pending' });
    try {
      const result = await postMarketingAction(action, token);
      setState({
        status: 'done',
        text: copy.success[result?.code] ?? Object.values(copy.success)[0],
      });
    } catch (error) {
      let text = 'Une erreur est survenue. Réessayez dans quelques instants.';
      let final = false;
      if (error?.code === 'INVALID_ACTION_TOKEN') {
        text = copy.invalid;
        final = true;
      } else if (error?.status === 404) {
        text = 'La newsletter n’est pas disponible pour le moment.';
        final = true;
      }
      setState({
        status: 'error',
        text,
        final,
        notFound: error?.status === 404,
      });
    } finally {
      busyRef.current = false;
    }
  };

  if (state.status === 'done') {
    return (
      <div role="status" className="flex flex-col gap-6">
        <Notice>{state.text}</Notice>
        <PillButton
          href="/"
          variant="outline"
          tone="dark"
          className="self-start"
        >
          Retour à l’accueil
        </PillButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="font-montserrat text-body text-gray-800">{copy.intro}</p>
      {state.status === 'error' ? (
        <div role="alert">
          <Notice tone="error">{state.text}</Notice>
        </div>
      ) : null}
      {state.status === 'error' &&
      state.final &&
      action === 'confirm' &&
      !state.notFound ? (
        // Expired or replaced link: a new one is an explicit request.
        <PillButton
          href="/#newsletter"
          variant="outline"
          tone="dark"
          className="self-start"
        >
          Demander un nouveau lien
        </PillButton>
      ) : null}
      {state.status !== 'error' || !state.final ? (
        <PillButton
          onClick={run}
          disabled={state.status === 'pending'}
          aria-busy={state.status === 'pending'}
          className="self-start disabled:opacity-60"
        >
          {state.status === 'pending' ? 'Un instant…' : copy.button}
        </PillButton>
      ) : null}
    </div>
  );
}
