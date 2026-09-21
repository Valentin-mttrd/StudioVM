export type ServiceId = 'web' | 'applications' | '3d';

export interface Service {
  id: ServiceId;
  index: string;
  title: string;
  short: string;
  description: string[];
  bullets: string[];
  audiences: string[];
  cta: { label: string; href: string };
}

export const SERVICES: Service[] = [
  {
    id: 'web',
    index: '01',
    title: 'Web',
    short: 'Des sites modernes, rapides et pensés pour convertir vos visiteurs en clients.',
    description: [
      "Un site web n'est pas une brochure numérique : c'est l'endroit où un visiteur décide de vous faire confiance, ou de partir.",
      'Studio VM conçoit des sites pensés pour votre activité réelle — votre offre, vos clients, votre façon de travailler — avec une structure claire et des pages qui ont chacune un objectif.',
    ],
    bullets: [
      'Sites vitrines',
      'Refonte de sites',
      'Sites professionnels',
      'Optimisation mobile',
      'SEO technique de base',
      'Hébergement',
      'Maintenance',
      'Évolutions',
    ],
    audiences: ['Artisans', 'Commerces', 'Indépendants', 'PME'],
    cta: { label: 'Créer mon site', href: '/contact?projet=web' },
  },
  {
    id: 'applications',
    index: '02',
    title: 'Applications',
    short: 'Des outils métier sur mesure qui simplifient vraiment votre quotidien.',
    description: [
      "Beaucoup d'entreprises pilotent encore leur activité avec des tableurs, des fichiers dispersés et des informations qui ne communiquent pas entre elles.",
      'Studio VM conçoit des applications web sur mesure qui transforment un processus métier complexe en un outil simple, centralisé et automatisé.',
    ],
    bullets: [
      'Gestion de stock',
      'Gestion de chantiers',
      'Tableaux de bord',
      'CRM',
      'Automatisation',
      'Outils internes',
      'Préparation de chantier',
      "Suivi d'activité",
      'Gestion de données',
    ],
    audiences: ['Entreprises du bâtiment', 'Paysagistes', 'PME avec besoins internes'],
    cta: { label: 'Imaginer mon application', href: '/contact?projet=application' },
  },
  {
    id: '3d',
    index: '03',
    title: '3D',
    short: "Des images et vidéos qui donnent à voir un projet avant qu'il n'existe.",
    description: [
      "Un plan, un permis de construire ou un projet paysager restent abstraits pour la plupart des interlocuteurs.",
      'Studio VM transforme ces projets en visuels réalistes — images et vidéos — pour aider à décider, présenter ou vendre un projet avant sa réalisation.',
    ],
    bullets: [
      'Visualisations architecturales',
      'Projets paysagers',
      'Aménagements extérieurs',
      'Photomontages',
      'Images commerciales',
      'Animations',
      'Vidéos de présentation',
    ],
    audiences: ['Architectes', 'Paysagistes', 'Promoteurs', 'Entreprises de construction'],
    cta: { label: 'Donner vie à mon projet', href: '/contact?projet=3d' },
  },
];

export function getService(id: ServiceId): Service {
  const service = SERVICES.find((s) => s.id === id);
  if (!service) throw new Error(`Unknown service id: ${id}`);
  return service;
}
