import { hasActiveSale } from '@/lib/booking/catalog';
import { formatLocalDate, formatPrice, saleLastDay } from '@/lib/format';

// Current price of a service; during an active sale (as reported by the
// API) the regular price is struck through and the last day is shown.
export default function PriceTag({ service, showSaleEnd = false }) {
  if (!hasActiveSale(service)) {
    return (
      <span>{formatPrice(service.effectivePriceCents, service.currency)}</span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span className="text-third-900 font-semibold">
        {formatPrice(service.effectivePriceCents, service.currency)}
      </span>
      <s className="text-gray-800">
        <span className="sr-only">au lieu de </span>
        {formatPrice(service.priceCents, service.currency)}
      </s>
      {showSaleEnd ? (
        <span className="text-body-sm text-gray-800">
          offre valable jusqu’au{' '}
          {formatLocalDate(saleLastDay(service.saleEndsAt), {
            weekday: undefined,
          })}
        </span>
      ) : null}
    </span>
  );
}
