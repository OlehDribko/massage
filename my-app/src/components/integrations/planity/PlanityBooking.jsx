'use client';

import PlanityEmbed from './PlanityEmbed';
import { PLANITY_PRIMARY_COLOR } from './planityConfig';

function buildBookingConfig(key, container) {
  return {
    key,
    primaryColor: PLANITY_PRIMARY_COLOR,
    appointmentContainer: container,
  };
}

/** Toutes les prestations disponibles du salon. */
export default function PlanityBooking() {
  return <PlanityEmbed variant="booking" buildConfig={buildBookingConfig} />;
}
