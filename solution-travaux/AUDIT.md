# Audit de solution-travaux.fr — base de contenu de la refonte

> **Limite de l'audit.** Le réseau de l'environnement de travail bloque
> `solution-travaux.fr` (ainsi que PagesJaunes, Facebook, societe.com…).
> L'audit a donc été reconstruit à partir des extraits indexés par les moteurs
> de recherche, recoupés requête par requête. Chaque information ci-dessous
> indique sa source et son niveau de confiance. Rien n'a été inventé : ce qui
> n'a pas pu être vérifié est signalé en **À VÉRIFIER** et n'apparaît pas sur le
> site, ou y apparaît sous forme d'emplacement clairement identifié.
>
> Dès que l'accès au site est ouvert (paramètres réseau de l'environnement →
> ajouter `solution-travaux.fr`), une passe de contrôle doit comparer mot pour
> mot le texte de chaque page avec `src/data/site.ts` et récupérer les photos.

## 1. Architecture du site actuel (WordPress)

| Page | URL actuelle | Title indexé | Nouvelle URL | Redirection |
|---|---|---|---|---|
| Accueil | `/` | Solution Travaux - Courtier en travaux à Etel (56) | `/` | — |
| Contact | `/contactez-nous/` | CONTACTEZ-NOUS – Solution Travaux | `/contactez-nous/` | — |
| Réalisations | `/nos-derniers-travaux/` | NOS RÉALISATIONS – Solution Travaux | `/nos-derniers-travaux/` | — |
| Artisans | `/devenir-partenaire` | DEVENIR PARTENAIRE – Solution Travaux | `/devenir-partenaire/` | 301 depuis la forme sans `/` |
| Rappel | `/demande-de-rappel/` | DEMANDE DE RAPPEL – Solution Travaux | `/demande-de-rappel/` | — |
| Mentions légales | `/mentions-legales/` | Mentions Légales – Solution Travaux | `/mentions-legales/` | — |

Toutes les URL existantes sont conservées à l'identique. `public/_redirects`
ajoute des 301 pour les variantes courantes (sans barre finale, `/contact`,
`/realisations`, flux et pages techniques WordPress).

## 2. Contenu recensé

### Entreprise
| Information | Valeur | Source | Confiance |
|---|---|---|---|
| Nom | Solution Travaux (SOLUTION TRAVAUX EURL sur PagesJaunes) | site, PagesJaunes | haute |
| Métier | Courtier en travaux / agence de courtage en travaux | title du site | haute |
| Création | « Créée depuis 2010 » | page d'accueil (extrait) | haute |
| Dirigeant | Franck L'HOURS, courtier en travaux | site, LinkedIn | haute |
| Expérience | « professionnel du bâtiment depuis plus de 20 ans » | page d'accueil (extrait) | haute |
| Engagement | « vérifie les assurances et les compétences de toutes les entreprises qu'il vous présente » | page d'accueil (extrait) | haute |
| Réseau | « SOLUTION TRAVAUX a sélectionné pour vous des entreprises dans tous les corps d'état et vous propose celles qui correspondent le mieux à votre besoin. » | page d'accueil (extrait) | haute |
| Promesse | « accompagnement commercial tout au long de la réalisation de votre projet, qu'il s'agisse de construction, d'agrandissement ou simplement de mise aux normes » | page d'accueil (extrait, reformulation minime possible) | moyenne-haute |
| SIRET | 520 600 032 00012 | mentions légales | haute |
| Forme juridique / capital | EURL (PagesJaunes) — capital non trouvé | — | **À VÉRIFIER** |

### Coordonnées
| Information | Valeur | Source |
|---|---|---|
| Adresse | 26 rue du Maréchal Foch, 56410 Étel | site (plusieurs pages) |
| Téléphone | 02 97 55 27 48 | site (contact, rappel) |
| Mobile (Franck L'HOURS) | 06 74 01 92 82 | site (contact) |
| E-mail | solutiontravaux56@gmail.com | site (contact) |
| Facebook | facebook.com/p/Solution-Travaux-à-ETEL-100063631987144 | résultats de recherche — lien depuis le site **À VÉRIFIER** |
| Horaires | non trouvés | **À VÉRIFIER** — non affichés |

Note : un extrait Facebook indique « 56140 Etel » ; le code postal d'Étel est
56410, c'est lui qui est utilisé.

### Zone d'intervention
« Rayon de 50 km environ autour d'Etel, entre Lorient et Vannes en passant par
Carnac, Quiberon, Auray. » Communes citées sur le site : Auray, Étel, Erdeven,
Merlevenez, Plouhinec, Riantec, Gâvres, Plouharnel, Carnac, Quiberon,
La Trinité-sur-Mer, Vannes (+ Lorient comme borne). Aucune commune ajoutée.

### Types de travaux (page d'accueil)
« pour tous vos travaux quelle qu'en soit l'ampleur : rénovation, extension,
aménagement de combles, salle de bain, jardin, terrasse, muret, clôture… »
+ construction, agrandissement, mise aux normes (phrase d'accroche).
Mots-clés de navigation/pied de page relevés : courtage travaux, devis travaux,
extension maison, combles, économies d'énergie, salle de bain, devis habitat,
rénovation, agrandissement.

### Corps d'état (liste du site, ordre conservé)
Architectes, plans, terrassement, assainissement, maçonnerie, charpente,
couverture, menuiserie extérieure, fenêtres, enduit, électricité, plomberie,
chauffage, sanitaire, isolation, cloisons, plaquistes, portes, menuiserie
intérieure, chapes, carrelage, revêtement de sol, parquets, escaliers,
agencement, peintures, portails, clôtures, décorateurs, paysage.
La refonte les regroupe par phase de chantier (présentation uniquement ; la
liste est intégrale).

### Méthode (page d'accueil — ordre reconstitué à partir de plusieurs extraits)
1. Le courtier se déplace chez vous sous 48 h maximum.
2. Nous définissons ensemble votre projet de travaux et vérifions sa faisabilité.
3. Nous établissons un cahier des charges.
4. Nous présentons votre projet aux entreprises sélectionnées.
5. Si besoin, réunion sur place avec tous les intervenants pour étudier la faisabilité selon les exigences.
6. Nous récupérons tous les devis détaillés, les vérifions et vous les présentons avec explications.
7. Vous validez les devis s'ils vous conviennent et les travaux démarrent.

Libellés exacts **À VÉRIFIER** (le fond est confirmé par plusieurs extraits).

### Devenir partenaire (artisans)
- Cible : artisans qui veulent trouver de nouveaux chantiers et ne peuvent pas
  ou ne savent pas consacrer assez de temps à la prospection.
- Avantages : projets pré-évalués ; adéquation du projet avec le budget
  contrôlée par Solution Travaux ; gain de temps sur le développement
  commercial pour se concentrer sur ses chantiers et ses clients.
- Conditions de référencement : attestations d'assurance à jour (« RC et DC »,
  interprété comme responsabilité civile et décennale — **À VÉRIFIER**) ;
  justifier de la qualité du travail (qualifications, respect des normes).
- Commission : un extrait générique évoque 10 à 15 % — **non attribuable au
  site, non repris**.

### Demande de rappel
« Laissez votre numéro, Solution Travaux vous rappelle dans les plus brefs
délais » (sens confirmé, libellé exact **À VÉRIFIER**).

### Mentions légales
- Éditeur / responsable éditorial : Solution Travaux, 26 rue du Maréchal Foch, 56410 Étel.
- SIRET 520600032 00012.
- Hébergeur : OVH, 2 rue Kellermann – 59100 Roubaix – France.
  → **à mettre à jour** si le nouveau site est hébergé ailleurs (Netlify, etc.).
- Données personnelles : pour certains services, l'internaute peut fournir
  nom, fonction, société, e-mail, téléphone, notamment via le formulaire de
  contact.

### Non trouvé (donc non affiché, jamais inventé)
- Photos, logo, visuels, légendes et liste des réalisations.
- Avis / témoignages clients, note Google.
- Horaires d'ouverture.
- Tarifs, conditions financières (« gratuit », « sans engagement » : **non
  confirmés sur le site actuel** — un communiqué de 2010 parle d'un service
  gratuit, mais sous l'enseigne Activ Travaux ; non repris).
- Certifications, labels, garanties chiffrées.
- Meta descriptions d'origine.

## 3. Objectifs de conversion
1. **Demande de devis / projet** (CTA principal) — formulaire de projet guidé.
2. **Appel téléphonique** — fixe 02 97 55 27 48, mobile 06 74 01 92 82
   (barre d'action fixe sur mobile).
3. **Demande de rappel** (CTA secondaire, page dédiée existante).
4. **Voir les réalisations** (réassurance).
5. **Recrutement d'artisans partenaires** (cible B2B, page dédiée).

## 4. Emplacements réservés (à remplacer par les vrais fichiers)
| Emplacement | Fichier / donnée | Remarque |
|---|---|---|
| Logo | `src/components/ui/Logo.astro` | mot-symbole typographique en attendant le logo officiel |
| Portrait de Franck L'HOURS | `src/components/sections/Broker.astro` | cadre « photo à intégrer » |
| Réalisations | `src/data/realisations.ts` | tableau vide : la page affiche un état vide honnête ; le composant gère photos, avant/après et légendes |
| Horaires | `src/data/site.ts` → `hours` | `null` = non affiché |
| Avis clients | non prévu tant qu'aucun avis vérifiable n'est fourni | |

## 5. Textes ajoutés par la refonte (à valider par le client)
Aucun fait nouveau n'a été ajouté. Seuls des textes de présentation ou des
obligations légales standard ont été rédigés :
- accroches de section (« De la première visite au démarrage du chantier. »…) ;
- courtes descriptions des types de projets (« Gagner des mètres carrés au sol »…) ;
- FAQ : chaque réponse reprend une information du tableau ci-dessus ;
- mentions légales : droits RGPD (accès, rectification, effacement, CNIL),
  absence de cookies de mesure d'audience (vrai pour le nouveau site),
  propriété intellectuelle ;
- messages des formulaires (validation, confirmation, échec d'envoi).

## 6. Chiffres affichés et leur origine
| Affiché | Origine |
|---|---|
| 2010 | « Créée depuis 2010 » |
| 48 h | « sous 48h maximum » |
| 50 km | « rayon de 50 km environ » |
| +20 ans | « professionnel du bâtiment depuis plus de 20 ans » |
| 30 métiers | nombre de corps d'état de la liste du site |
| distances des communes | calcul à vol d'oiseau depuis le centre d'Étel (coordonnées publiques des communes) |
