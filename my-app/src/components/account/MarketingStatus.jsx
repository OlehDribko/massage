'use client';

import { useState } from 'react';

import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PillButton from '@/components/ui/PillButton';
import { bookingErrorMessage } from '@/lib/booking/labels';

/**
 * Newsletter status of the verified email (`profile.marketing`, null until
 * the email is verified). Unsubscribing (DELETE /api/me/marketing/
 * subscription) works even when newsletters are switched off. Subscribing
 * needs the approved consent text shown with version 2026-10-28.fr.1, which
 * is not available yet — so there is no subscribe button here.
 */
export default function MarketingStatus({ marketing, onUnsubscribe }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  if (!marketing) {
    return (
      <p className="font-montserrat text-body text-gray-800">
        Le statut de la newsletter s’affiche une fois votre adresse e-mail
        confirmée.
      </p>
    );
  }

  const unsubscribe = async () => {
    setPending(true);
    setError(null);
    try {
      await onUnsubscribe();
      setConfirming(false);
    } catch (caught) {
      setError(bookingErrorMessage(caught));
    } finally {
      setPending(false);
    }
  };

  let text;
  if (marketing.subscribed) {
    text = 'Vous êtes inscrit·e à la newsletter.';
  } else if (marketing.pendingConfirmation) {
    text =
      'Inscription en attente : ouvrez le lien de confirmation reçu par e-mail.';
  } else {
    text = 'Vous n’êtes pas inscrit·e à la newsletter.';
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-montserrat text-body text-gray-900">{text}</p>
      {marketing.subscribed || marketing.pendingConfirmation ? (
        <PillButton
          variant="text"
          onClick={() => setConfirming(true)}
          className="self-start"
        >
          Se désabonner
        </PillButton>
      ) : null}
      <ConfirmDialog
        open={confirming}
        title="Se désabonner de la newsletter ?"
        confirmLabel="Me désabonner"
        pending={pending}
        error={error}
        onConfirm={unsubscribe}
        onClose={() => setConfirming(false)}
      >
        Vous ne recevrez plus nos offres par e-mail. Les e-mails liés à vos
        rendez-vous ne sont pas concernés.
      </ConfirmDialog>
    </div>
  );
}
