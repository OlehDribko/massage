/*
 * Editorial layer of the catalogue — NOT a second catalogue. Names, prices,
 * durations and availability always come from the API (GET /api/services);
 * this file only says which API services are durations of the same
 * prestation (by their stable ids, Massage-backend docs/booking.md,
 * «Початковий каталог») and holds the approved description of each one.
 *
 * - `serviceIds`: the durations of one prestation. Ids missing from the API
 *   (archived) are skipped; API services not listed here get their own card.
 * - `description`: approved public text only, or null. Drafts and internal
 *   notes never go here. No approved descriptions exist yet (2026-11-02):
 *   cards show no "description" toggle until a text is added.
 * - `featured`: shown in « Massages populaires » on the home page.
 */
export const SERVICE_GROUPS = [
  {
    key: 'tuina-huiles-chaudes',
    serviceIds: [
      '8768f0f0-3e76-4ed6-a273-5dd431a305e5',
      '039b509e-baff-4748-bb5e-094ed66a2198',
      'a0f4141c-2f1a-49b4-9ee6-09d15b0853af',
    ],
    description: null,
    featured: true,
  },
  {
    key: 'tuina-sans-huile',
    serviceIds: [
      '69465693-b812-4dab-a100-f1f880b7c1b7',
      'fe0523ef-4b29-4c4e-96fa-e8bdbd3f899e',
      '81f49f12-7b74-43b2-9dc5-ad1e18c92b59',
    ],
    description: null,
  },
  {
    key: 'premium-femmes',
    serviceIds: ['0a879540-15e2-4e5a-8b8a-ab3ce30cc25e'],
    description: null,
  },
  {
    key: 'pierres-chaudes',
    serviceIds: [
      '3d21cb0f-5905-4b76-af1c-a0268602ad88',
      '7cbaae05-e433-4087-b64e-fed91195ad2e',
      '1abe839a-35e1-4322-aec3-c03b3fcd6864',
    ],
    description: null,
  },
  {
    key: 'ayurvedique',
    serviceIds: [
      'cf4fb0b1-7b35-455b-8367-e4b422639610',
      '40c8f682-6222-4cd0-b6aa-d3bcfb2a80d3',
    ],
    description: null,
  },
  {
    key: 'tete-aux-pieds',
    serviceIds: [
      '2703c0d8-c30a-49d7-bd41-bc51179dd22f',
      'c438d102-95ae-4c7d-9dda-87cf966d3efd',
      'b84f23ba-773d-4ff2-b128-10a1ee22a4cf',
    ],
    description: null,
  },
  {
    key: 'sportif',
    serviceIds: [
      '11a5f7a9-4e3a-4fe1-bfcb-ad85073b7ec4',
      'dea5ef63-6ab1-4338-aa05-2fab089ee070',
      'e416e435-88a8-458c-8737-3f9b5b9b5e6f',
    ],
    description: null,
    featured: true,
  },
  {
    key: 'enfant',
    serviceIds: ['570a1b88-f7e4-43e7-9e25-23455764aa74'],
    description: null,
  },
  {
    key: 'reflexologie-plantaire',
    serviceIds: ['e0a4be32-524f-49e3-b525-1051092007d3'],
    description: null,
  },
  {
    key: 'dos',
    serviceIds: ['696afe81-79e4-4114-961c-af875229a2b1'],
    description: null,
  },
  {
    key: 'tete-cou-trapezes',
    serviceIds: ['353c5f3d-62d3-43e1-a9f4-65181e356e6b'],
    description: null,
  },
  {
    key: 'endospheres',
    serviceIds: ['57f78078-f65b-4723-b20b-aad89495c898'],
    description: null,
    featured: true,
  },
  {
    key: 'maderotherapie',
    serviceIds: [
      '97b3295d-8d7e-4c7f-a8a8-bbe1df1af633',
      '0eb52a15-863f-4981-8354-e1a4ab84c088',
    ],
    description: null,
  },
  {
    key: 'drainage-lymphatique',
    serviceIds: [
      'ca2c3570-e81f-4410-b447-7fc90618da8f',
      '713d9d2a-c90e-42e3-a224-99390862f856',
      'c513a89e-712f-4462-83d0-3b1a08df1f92',
    ],
    description: null,
    featured: true,
  },
  {
    key: 'prenatal',
    serviceIds: ['9b081644-29e6-496a-9303-6e07a12966d4'],
    description: null,
  },
  {
    key: 'postnatal',
    serviceIds: [
      '3dd3ebdd-da7b-4ca2-9f13-3a46d96be6f4',
      '2bdfa0e1-5556-46a7-869a-ef48114dc07c',
    ],
    description: null,
  },
  {
    key: 'myofascial',
    serviceIds: [
      'e8714bef-1897-4dd9-9ee9-c0c31d58f293',
      'f85a106b-7f20-4ef1-88f7-670cacee7747',
    ],
    description: null,
  },
  {
    key: 'tissus-profonds',
    serviceIds: [
      'a587db53-7b29-4b32-adc3-15d68289cfa8',
      '018a645a-7ff7-48fd-a730-894ef3b62aa5',
    ],
    description: null,
  },
];

/** Endosphères — the "soin signature" banner of the home page books it. */
export const ENDOSPHERES_SERVICE_ID = '57f78078-f65b-4723-b20b-aad89495c898';
