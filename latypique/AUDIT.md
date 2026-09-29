# L'atypique — audit du site existant et inventaire du contenu

Site d'origine : <https://www.kalendes.com/latypique/#/welcome>
(mini-site + prise de rendez-vous hébergés par la plateforme Kalendes, aussi
servis sous <https://www.kalendes.com/site/latypique/welcome> et
<https://www.kalendes.com/platform/booking/latypique>).

Audit réalisé le 29/09/2026.

## 1. Limite de l'audit : à lire en premier

La politique réseau de l'environnement de travail bloque `www.kalendes.com`
(ainsi que Pages Jaunes, Planity, Fresha, Facebook, Instagram et les
annuaires d'entreprises). **Le mini-site Kalendes n'a donc pas pu être
parcouru directement.** Tout le contenu ci-dessous provient de la recherche
web (extraits indexés de ces pages), recoupé entre plusieurs sources.

Ce qui manque et doit être récupéré sur Kalendes (ou auprès de l'institut)
avant la mise en ligne :

- [ ] **la carte des prestations complète** : intitulés exacts, durées,
      prix, descriptions. Le fichier `src/data/soins.ts` est prêt à les
      recevoir (champ `prestations` de chaque catégorie) ; tant qu'il est
      vide, le site renvoie vers l'agenda en ligne pour les tarifs.
- [ ] **les photos** de l'institut, des cabines, des soins et des produits.
      Chaque emplacement est un placeholder étiqueté « Photo à venir »
      (composant `src/components/ui/Photo.astro`).
- [ ] **le logo** s'il existe (le site utilise un logotype typographique).
- [ ] **les avis clients** (texte, prénom, date) s'ils sont publiés sur
      Kalendes et que l'institut accepte de les reprendre.
- [ ] l'**équipe** (prénoms, rôles) si elle est présentée sur Kalendes.
- [ ] l'**adresse e-mail** de contact (obligatoire dans les mentions légales).
- [ ] le **nom de domaine** définitif (`SITE_URL`, voir `README.md`).
- [ ] l'**hébergeur** retenu (mentions légales).

## 2. Faits vérifiés (repris sur le nouveau site)

| Information | Valeur | Sources |
| --- | --- | --- |
| Nom commercial | L'atypique — institut de beauté | Kalendes (titre « L'atypique à Lorient - Institut de beauté »), Facebook, Pages Jaunes |
| Positionnement | Institut de beauté **slow cosmétique** | Fresha, Instagram, Mappy |
| Adresse | 14 rue du Général Dubail, 56100 Lorient | Kalendes, Pages Jaunes, Fresha, registre |
| Téléphone | 09 81 94 09 93 (+33 9 81 94 09 93) | Pages Jaunes, Kalendes |
| Instagram | @latypique_lorient | instagram.com/latypique_lorient |
| Facebook | « L'atypique institut de beauté » | facebook.com/p/Latypique-institut-de-beauté-100070547212556 |
| Réservation | en ligne via Kalendes | kalendes.com/platform/booking/latypique |

### Textes de présentation retrouvés (reformulés sur le site, faits inchangés)

1. *« Prendre soin de vous autrement : soins visage et corps aux produits
   100 % naturels, semi-permanent à base de manioc et de maïs, épilation à la
   cire végétale sans ingrédients controversés. Un moment beauté dans une
   ambiance chaleureuse. »* — Pages Jaunes / Kalendes.
2. *« L'atypique vous accueille à Lorient dans un cadre chaleureux pour vous
   offrir un moment unique dédié à votre bien-être. »* — Pages Jaunes,
   Offres en ville.
3. *« Une large gamme de soins du visage, des mains, des pieds, du corps et
   de soins minceur, adaptés à vos envies et à vos besoins. »* — Pages
   Jaunes, Offres en ville.
4. *« Une équipe attentionnée qui garantit une expérience de qualité,
   alliant expertise technique et écoute. »* — Offres en ville.
5. *« Parking facile d'accès pour votre confort dès l'arrivée. »* — Pages
   Jaunes, Offres en ville.
6. *« Un espace récemment rénové : deux cabines de soins modernisées et une
   cabine UV. »* — Offres en ville.
7. *« Un institut où bien-être et détente sont les maîtres-mots, pour se
   sentir mieux dans sa peau. »* — Pages Jaunes.

### Prestations citées

Soins du visage · soins du corps · soins minceur · beauté des mains
(manucure) · beauté des pieds (pédi-spa) · pose de vernis semi-permanent (à
base de manioc et de maïs) · épilation à la cire végétale · maquillage ·
cabine UV.

### Données légales (registre du commerce)

| | |
| --- | --- |
| Dénomination | L'ATYPIQUE |
| Forme | SARL unipersonnelle, capital 3 000 € |
| Création | 13/07/2021 |
| SIREN / SIRET | 901 208 744 / 901 208 744 00010 — RCS Lorient |
| Code APE | 96.02B — Soins de beauté |
| Gérance | Lucia Rideau |
| Siège | 14 rue du Général Dubail, 56100 Lorient |

## 3. Points à confirmer avec l'institut

| Sujet | Écart constaté | Choix provisoire sur le site |
| --- | --- | --- |
| **Horaires du samedi** | 10h–17h (Fresha, Instagram) · 10h–13h30 (une source) · « 9h–18h du mardi au samedi » (Pages Jaunes, probablement ancien) | 10h–17h |
| Horaires de la semaine | Lun 14h–18h, mar–ven 9h30–19h, dim fermé (Fresha, Unib-France, Instagram — concordants) | repris tels quels |
| Cabine UV | citée par une seule source | affichée, à confirmer |
| Note clients | 4,9/5 sur plus de 50 avis (Unib-France) · 5/5 sur 14 avis (Fresha) | « 4,9/5 · plus de 50 avis » |

Les horaires alimentent l'indicateur « Ouvert / Fermé » en temps réel : ils
doivent être validés avant la mise en ligne (`src/data/business.ts`).

## 4. Architecture

### Existant (Kalendes)

Une seule entrée, `#/welcome`, sur un mini-site générique Kalendes : page
d'accueil de l'établissement, carte des prestations, prise de rendez-vous.
L'identité de l'institut (slow cosmétique, naturel) n'y est pas mise en scène
et les URL appartiennent à Kalendes.

### Nouveau site

| URL | Rôle | H1 |
| --- | --- | --- |
| `/` | Accueil : qui, quoi, où, pourquoi, réserver | Prendre soin de vous, autrement. |
| `/soins` | Carte des soins par famille | La carte des soins |
| `/institut` | Slow cosmétique, l'espace, l'équipe | L'institut |
| `/infos-pratiques` | Accès, horaires, contact, FAQ | Infos pratiques |
| `/mentions-legales` | Obligations légales | Mentions légales |
| `/confidentialite` | Données personnelles | Politique de confidentialité |
| `/404` | Page introuvable | — |

**Redirections** : les anciennes URL sont sur le domaine de Kalendes, que le
nouveau site ne contrôle pas ; aucune redirection 301 n'est donc possible ni
nécessaire côté site. Kalendes reste le moteur de réservation : tous les
boutons « Prendre rendez-vous » y mènent. Dans l'espace pro Kalendes,
renseigner l'adresse du nouveau site comme site web de l'établissement.

## 5. Objectifs de conversion

1. **Prendre rendez-vous en ligne** (Kalendes) — CTA principal, partout.
2. **Appeler** l'institut — CTA secondaire, barre fixe sur mobile.
3. **Venir** (itinéraire) — carte, adresse, parking.
4. Découvrir la carte des soins — CTA de navigation.
