// Grille « Formules & tarifs », édition 2026 — mêmes prix et textes que la
// plaquette PDF. Prix nets, TVA non applicable (art. 293 B du CGI).

export interface Plan {
  name: string;
  audience: string;
  price: string;
  /** Petit libellé au-dessus du prix, ex. « À partir de ». */
  pricePrefix?: string;
  /** Unité après le prix, ex. « / mois ». */
  priceSuffix?: string;
  /** Délai ou précision sous le prix. */
  detail?: string;
  /** « Tout l'Essentiel, plus : » */
  includesPrevious?: string;
  features: string[];
  recommended?: boolean;
}

export interface PriceRow {
  label: string;
  description?: string;
  price: string;
}

export const VAT_NOTE = 'Prix nets · TVA non applicable, art. 293 B du CGI';

export const WEBSITE_PLANS: Plan[] = [
  {
    name: 'Essentiel',
    audience: 'Artisan ou indépendant qui démarre',
    price: '790 €',
    detail: 'Livré en 2 semaines',
    features: ['Site une page : accueil, services, contact', 'Formulaire de contact', 'Version mobile', 'Mentions légales', 'Mise en ligne'],
  },
  {
    name: 'Vitrine',
    audience: 'Restaurant, commerce, artisan établi',
    price: '1 490 €',
    detail: 'Livré en 3 à 4 semaines',
    includesPrevious: "Tout l'Essentiel, plus :",
    features: ["Jusqu'à 5 pages", 'Design sur mesure', 'Référencement local de base', 'Fiche Google Business reliée au site'],
    recommended: true,
  },
  {
    name: 'Sur mesure',
    audience: 'Hôtel, PME, activité au contenu riche',
    pricePrefix: 'À partir de',
    price: '2 490 €',
    detail: 'Livré en 5 à 6 semaines',
    includesPrevious: 'Tout le Vitrine, plus :',
    features: [
      "Jusqu'à 10 pages",
      'Animations',
      'Actualités ou carte modifiables par vous',
      'Rédaction optimisée des pages clés',
      'Statistiques de visite',
    ],
  },
];

export const MAINTENANCE_PLANS: Plan[] = [
  {
    name: 'Hébergement',
    audience: 'Le site en ligne, en sécurité',
    price: '25 €',
    priceSuffix: '/ mois',
    features: ['Hébergement et nom de domaine', 'Certificat SSL', 'Sauvegardes', 'Mises à jour de sécurité'],
  },
  {
    name: 'Sérénité',
    audience: 'Un site toujours à jour',
    price: '49 €',
    priceSuffix: '/ mois',
    includesPrevious: "Tout l'Hébergement, plus :",
    features: ["Jusqu'à 1 h de modifications par mois", 'Horaires, menu, photos, textes', 'Réponse sous 48 h'],
    recommended: true,
  },
  {
    name: 'Croissance',
    audience: 'Gagner en visibilité',
    price: '119 €',
    priceSuffix: '/ mois',
    includesPrevious: 'Tout le Sérénité, plus :',
    features: ["Jusqu'à 3 h de modifications par mois", 'Suivi du référencement local', 'Rapport de visites mensuel'],
  },
];

export const WEB_OPTIONS: PriceRow[] = [
  { label: 'Page supplémentaire', price: '150 €' },
  { label: "Rédaction d'une page optimisée pour Google", price: '90 €' },
  { label: 'Version anglaise du site', price: 'dès 290 €' },
  { label: 'Réservation ou prise de rendez-vous en ligne', price: '250 €' },
  { label: 'Création et optimisation de la fiche Google Business', price: '150 €' },
  { label: 'Logo simple', price: '390 €' },
  { label: "Heure d'intervention hors abonnement", price: '55 €' },
];

export const APPLICATION_TIERS: PriceRow[] = [
  {
    label: 'Atelier de cadrage',
    description: '2 h sur place, maquette des écrans, devis détaillé. Déduit si le projet est signé.',
    price: '290 €',
  },
  { label: 'Outil simple', description: 'Inventaire ou stock pour une équipe, une base de données, export', price: 'dès 3 500 €' },
  { label: 'Outil métier', description: 'Gestion de chantiers, CRM, tableau de bord avec plusieurs rôles', price: '6 000 € à 12 000 €' },
  { label: 'Maintenance', description: 'Hébergement, sauvegardes, corrections, petites évolutions', price: '89 € à 190 € / mois' },
];

export const VISUALIZATION_TIERS: PriceRow[] = [
  { label: 'Image 3D', description: 'Un point de vue, rendu réaliste, 2 allers-retours', price: '350 €' },
  { label: 'Pack 3 images', description: 'Trois points de vue du même projet', price: '890 €' },
  { label: 'Photomontage', description: 'Le projet intégré dans une photo du terrain existant', price: '290 €' },
  { label: 'Vidéo de présentation', description: 'Survol animé de 30 à 60 secondes', price: 'dès 1 290 €' },
];

export const PROJECT_TERMS = [
  { index: '01', title: 'Échange', description: 'Comprendre votre besoin, vos contraintes et vos objectifs.', terms: 'Devis détaillé, valable 30 jours.' },
  {
    index: '02',
    title: 'Conception',
    description: "Définir l'expérience, les fonctionnalités et la direction visuelle.",
    terms: 'Acompte de 30 % à la signature. 2 allers-retours inclus sur la maquette.',
  },
  {
    index: '03',
    title: 'Création',
    description: 'Développer, modéliser et produire la solution.',
    terms: 'Vous fournissez textes et photos sous 2 semaines. La rédaction est en option.',
  },
  {
    index: '04',
    title: 'Livraison',
    description: 'Mettre en ligne, déployer et assurer le suivi.',
    terms: 'Solde à la mise en ligne. Le site vous appartient dès le solde réglé.',
  },
];
