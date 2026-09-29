import { business } from './business';
import { groupedHours } from '@/lib/hours';

export interface FaqItem {
  question: string;
  /** Plain text — also used verbatim in the FAQPage JSON-LD. */
  answer: string;
}

const hoursSentence = groupedHours()
  .map(({ days, hours, closed }) => `${days} : ${closed ? 'fermé' : hours}`)
  .join(' · ');

export const faq: FaqItem[] = [
  {
    question: 'Comment prendre rendez-vous ?',
    answer: `En ligne, sur l’agenda ${business.booking.provider} de l’institut : vous choisissez votre soin puis votre créneau parmi les disponibilités. Vous pouvez aussi appeler l’institut au ${business.phone.display} pendant les horaires d’ouverture.`,
  },
  {
    question: 'Où consulter les tarifs ?',
    answer: `La carte complète des prestations, avec leurs tarifs et leurs durées, est affichée sur l’agenda en ligne au moment de réserver. L’institut vous renseigne aussi par téléphone au ${business.phone.display}.`,
  },
  {
    question: 'Quels produits utilisez-vous ?',
    answer:
      'Les soins du visage et du corps sont réalisés avec des produits 100 % naturels. C’est tout le sens d’un institut slow cosmétique : prendre soin de vous autrement.',
  },
  {
    question: 'Qu’a de particulier votre vernis semi-permanent ?',
    answer: 'Il est à base de manioc et de maïs. Il est posé lors des prestations de beauté des mains.',
  },
  {
    question: 'Quelle cire utilisez-vous pour l’épilation ?',
    answer: 'Une cire végétale, sans ingrédients controversés.',
  },
  {
    question: 'Où se trouve l’institut ? Peut-on se garer facilement ?',
    answer: `L’institut se trouve au ${business.address.street}, ${business.address.postalCode} ${business.address.city}. Il bénéficie d’un parking facile d’accès.`,
  },
  {
    question: 'Quels sont vos horaires ?',
    answer: `${hoursSentence}.`,
  },
  {
    question: 'Proposez-vous des séances UV ?',
    answer: `Oui, l’institut dispose d’une cabine UV. Pour en savoir plus, appelez l’institut au ${business.phone.display}.`,
  },
];
