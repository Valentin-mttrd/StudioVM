export interface ProcessStep {
  index: string;
  title: string;
  description: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    index: '01',
    title: 'Échange',
    description: 'Comprendre votre besoin, vos contraintes et vos objectifs.',
  },
  {
    index: '02',
    title: 'Conception',
    description: "Définir l'expérience, les fonctionnalités et la direction visuelle.",
  },
  {
    index: '03',
    title: 'Création',
    description: 'Développer, modéliser et produire la solution.',
  },
  {
    index: '04',
    title: 'Livraison',
    description: 'Mettre en ligne, déployer et assurer le suivi.',
  },
];
