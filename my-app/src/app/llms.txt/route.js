import { BUSINESS, SITE, SITE_URL } from '@/config/site';
import { FORFAITS } from '@/content/forfaits';
import { CATEGORIES } from '@/content/services';
import { loadCatalog } from '@/lib/booking/loadCatalog';
import { formatDuration, formatPrice } from '@/lib/format';

/*
 * /llms.txt (llmstxt.org): the site in plain Markdown for AI agents and
 * assistants — who, where, when, what it costs and how to book — without
 * running the page's JavaScript. Prices come from the API at request time,
 * like the booking catalogue; without the API the list is left out rather
 * than shown stale.
 */

// Joins lines; '' stays (Markdown blank line), null / false are skipped.
const line = (items) =>
  items.filter((item) => item !== null && item !== false).join('\n');

function priceList(catalog) {
  if (!catalog?.length) {
    return 'Tarifs actuels : voir la page de réservation (liste momentanément indisponible ici).';
  }
  const sections = [
    ...CATEGORIES.map((category) => ({
      label: category.label,
      items: catalog.filter(
        (prestation) => prestation.category === category.key
      ),
    })),
    {
      label: 'Autres soins',
      items: catalog.filter(
        (prestation) =>
          !CATEGORIES.some((category) => category.key === prestation.category)
      ),
    },
  ].filter((section) => section.items.length);

  return sections
    .map((section) =>
      line([
        `### ${section.label}`,
        '',
        ...section.items.map((prestation) => {
          const variants = prestation.variants
            .map(
              (service) =>
                `${formatDuration(service.durationMinutes)} : ${formatPrice(service.effectivePriceCents)}`
            )
            .join(' · ');
          return `- ${prestation.name}${prestation.featured ? ' (populaire)' : ''} — ${variants}`;
        }),
      ])
    )
    .join('\n\n');
}

export async function GET(request) {
  const origin = SITE_URL ?? new URL(request.url).origin;
  const { catalog } = await loadCatalog();
  const { address, phone, email, openingHours, socials } = BUSINESS;

  const body = line([
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    'Cabinet de massage tenu par une masseuse certifiée (plus de 10 ans d’expérience). Site en français.',
    '',
    '## Infos pratiques',
    '',
    `- Adresse : ${address.street}, ${address.postalCode} ${address.city}, France`,
    `- Horaires : ${openingHours.display}`,
    `- Téléphone : ${phone.display}`,
    `- E-mail : ${email}`,
    '- Paiement : sur place, au cabinet (pas de paiement en ligne)',
    '',
    '## Réserver',
    '',
    `- [Réserver en ligne](${origin}/reserver) : choisir le soin et la durée, puis un créneau libre. La confirmation demande un compte client (e-mail ou Google).`,
    `- Par téléphone : ${phone.display}`,
    `- [Avis clients sur Planity](${socials.planity})`,
    '',
    '## Soins et tarifs (prix actuels, EUR)',
    '',
    priceList(catalog),
    '',
    '## Forfaits Endosphères',
    '',
    'Achetés au cabinet (non réservables en ligne) ; chaque séance se réserve ensuite en ligne.',
    '',
    ...FORFAITS.endospheres.map(
      (forfait) => `- ${forfait.label} : ${formatPrice(forfait.priceCents)}`
    ),
    '',
    '## Carte cadeau',
    '',
    'Un montant libre ou un soin précis, au choix.',
    `Pas d’achat en ligne : laisser ses coordonnées via le [formulaire carte cadeau](${origin}/#carte-cadeau) ou contacter le cabinet (${phone.display}, ${email}) ; la praticienne rappelle pour l’achat.`,
    '',
    '## Pages',
    '',
    `- [Accueil](${origin}/) : présentation, soins populaires, approche, avis`,
    `- [Réservation](${origin}/reserver) : catalogue complet avec filtres (catégorie, durée, budget)`,
    `- [Instagram](${socials.instagram})`,
    `- [Facebook](${socials.facebook})`,
    '',
  ]);

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      // Prices change rarely; a short shared cache spares the API.
      'Cache-Control':
        'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
