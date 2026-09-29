# PRO PAYSAGES — refonte du site

Refonte de [pro-paysages-56.fr](https://pro-paysages-56.fr/), paysagiste à Ploemeur (56) :
création et entretien de jardins à Larmor-Plage, Quéven, Hennebont et alentours.
Site statique Astro 7, sans framework UI, pensé pour Netlify.

- **Contenu** : tout ce que le site affiche sur l'entreprise vient de `src/data/site.ts`.
  Les sources et le niveau de confiance de chaque information sont dans [`AUDIT.md`](./AUDIT.md).
- **Aucune information inventée** : pas d'avis, de chiffres, de prix, de labels ni de
  réalisations qui ne figurent pas sur le site actuel ou sur la fiche de l'entreprise.
  Les visuels manquants sont des emplacements « Photo à intégrer » clairement identifiés.

> Le projet vit pour l'instant dans le dossier `pro-paysages-56/` du dépôt Studio VM.
> Il est autonome (son propre `package.json`) : il peut rejoindre son propre dépôt tel
> quel, ou être déployé depuis ce dossier (Netlify → *Base directory* : `pro-paysages-56`).

## Crédit Studio VM

Le pied de page de chaque page affiche « Site réalisé par Studio VM » avec le logo
Studio VM, lien vers [studiovm-design.fr](https://www.studiovm-design.fr)
(`src/components/layout/StudioCredit.astro`, même composant que sur les autres sites du studio).

## Lancer le projet

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # astro check + build statique dans dist/
npm run preview   # sert dist/
```

## Direction artistique — « le jardin côtier, du plan à la haie taillée »

Un paysagiste vend un résultat qu'on ne voit qu'une fois fini. Le site le montre en
train de se faire, avec le vocabulaire du métier.

- **Une lisière de jardin breton en hero** : pins maritimes couchés par le vent,
  boules de buis taillées, hortensias, graminées et fougères, sur trois profondeurs.
  Générée au build (`src/lib/botany.ts`) et livrée en SVG statique. Les plantes
  sauvages ondulent, les plantes taillées ne bougent jamais : la main du jardinier.
- **La coupe de principe**, dessin de paysagiste en coupe (dallage sur lit de sable,
  muret, massif sur talus, gazon, arrosage enterré, arbre, haie, clôture sur plots).
  Trois états qui racontent la phrase du site « de la conception à la réalisation, en
  passant par l'entretien » : tracé sur papier quadrillé → matériaux posés → jardin en
  friche qu'une ligne d'entretien taille au passage (haie, arbustes, talus, tonte,
  ramassage, bordures).
- **Vues en plan** pour les deux métiers : piquetage en pointillés côté création,
  bandes de tonte et haies taillées côté entretien.
- **Matières et couleurs de la côte** : lin et sable, vert pin et mousse, le jaune
  de l'ajonc pour l'action, le bleu ardoise de la mer pour la géographie.
- **Typographie** : Fraunces (titres, italique pour l'émotion) + Figtree (texte).
- **Un seul langage de mouvement** : tout pousse depuis le sol (révélations qui
  montent ou se déroulent du bas, remplissage des boutons qui monte comme l'eau dans
  une tranchée). Tout s'arrête avec `prefers-reduced-motion` et hors écran.

Tokens (couleurs, espacements, typo, durées et courbes d'animation) : `src/styles/global.css`.

## Fonctionnalités

| Fonction | Où | Détail |
|---|---|---|
| Lisière en profondeur | Accueil, hero | parallaxe souris (pointeur précis uniquement) et défilement, pause hors écran |
| Coupe de principe racontée | Accueil | dessin épinglé pendant le défilement : concevoir → réaliser → entretenir |
| Coupe « glissez pour entretenir » | Page entretien | la ligne d'entretien suit le doigt ou la souris, flèches du clavier, lecteur d'écran |
| Coupe qui se dessine | Page création | tracé puis matériaux, une fois à l'arrivée à l'écran |
| « Intervenez-vous chez moi ? » | Accueil, création, entretien | combobox accessible, 315 communes, verdict selon les règles du site, point sur la carte, devis pré-rempli |
| Carte d'intervention | idem | une commune = un point (coordonnées réelles) : la côte se dessine d'elle-même |
| Devis gratuit en 3 étapes | `/contact/` | prestations à cocher, jardin, coordonnées, récapitulatif, photo facultative, fonctionne sans JS |
| Demande de rappel | `/contact/` | nom, téléphone, matin / après-midi |
| Liens « devis » ciblés | cartes de prestations, carte | `/contact/?projet=tonte`, `?commune=Guidel&cp=56520` pré-remplissent le formulaire |
| Réalisations | Accueil, création, entretien | filtres, visionneuse clavier/tactile, avant/après — s'activent dès qu'une photo existe |
| FAQ | Accueil, création, entretien | uniquement à partir des informations du site + données structurées `FAQPage` |
| Barre d'action mobile | toutes les pages | Appeler · Devis gratuit (s'efface pendant la saisie d'un formulaire) |

Les formulaires sont envoyés à **Netlify Forms** (aucun code serveur). Si l'envoi échoue
(hébergement différent, réseau…), le visiteur obtient un e-mail déjà rédigé vers
`propaysages56@orange.fr` : aucune demande n'est perdue.

## Ajouter les photos des réalisations

1. Déposer les photos dans `src/assets/realisations/`.
2. Les déclarer dans `src/data/realisations.ts` (exemple complet en commentaire dans le fichier).
3. `before` active le curseur avant/après ; `gallery` ajoute des vues à la visionneuse ;
   `group` (`creation` ou `entretien`) range la réalisation sur la bonne page.

Les emplacements « Photo à intégrer » disparaissent d'eux-mêmes dès qu'une réalisation existe.
Les images sont optimisées au build (formats et tailles responsives).

## Avant la mise en ligne

- [ ] Relire mot à mot les textes de `src/data/site.ts` face au site actuel (l'accès au site
      était bloqué pendant la refonte, cf. `AUDIT.md`), et récupérer toutes ses URL.
- [ ] Remplacer le mot-symbole provisoire par le logo officiel (`src/components/ui/Logo.astro`,
      `public/favicon.svg` puis `node scripts/make-icons.mjs`).
- [ ] Intégrer les photos des réalisations.
- [ ] Confirmer les horaires (issus de PagesJaunes) ou les masquer (`SITE.hours = null`).
- [ ] Confirmer le rayon de 50 km (fiche PagesJaunes) et, avec l'entreprise, les prestations
      vues uniquement sur `pro-paysages.fr` (terrasses bois, élagage, abattage).
- [ ] Mentions légales : capital social, ville du RCS, numéro de TVA ; vérifier l'adresse
      de l'hébergeur (`SITE.host`) sur le site de Netlify.
- [ ] Netlify : importer le projet (build `npm run build`, dossier `dist`), activer les
      notifications e-mail des formulaires vers `propaysages56@orange.fr`.
- [ ] Rediriger `pro-paysages.fr` (second domaine de l'entreprise) en 301 vers ce site.

## SEO

- URL identiques au site actuel (barre finale conservée) ; `public/_redirects` gère les variantes.
- Titles indexés conservés (virgule parasite retirée sur la page création, marque ajoutée
  sur l'accueil) ; meta descriptions ≤ 160 caractères, canonical, Open Graph par page.
- Un H1 par page, portant le mot-clé principal du title.
- Données structurées : `HomeAndConstructionBusiness` (adresse, SIRET, horaires, zone
  `GeoCircle` 50 km + villes, catalogue de prestations), `Service`, `BreadcrumbList`, `FAQPage`.
- Sitemap et `robots.txt` générés ; `/merci/` et la 404 en `noindex`.

## Données

- `src/data/communes.json` : communes du Morbihan et des départements voisins à moins de
  70 km de Ploemeur. Généré une fois par `scripts/build-communes.mjs` (Etalab pour la liste
  officielle et les codes postaux, GeoNames CC BY 4.0 pour les coordonnées — crédité dans
  les mentions légales). Chargé à la demande, uniquement quand le vérificateur est utilisé.

## Vérifications effectuées

- `astro check` : 0 erreur, 0 avertissement. Build statique : 7 pages.
- axe-core (WCAG 2.1 AA + bonnes pratiques) : 0 violation sur toutes les pages, mobile et desktop.
- Lighthouse (build de production, local) : Performance 99, Accessibilité 100,
  Bonnes pratiques 100, SEO 100 sur les pages testées ; CLS ≤ 0,01, TBT 0 ms.
- Tests fonctionnels (Playwright) : vérificateur de commune (suggestions, clavier, code
  postal, hors zone, introuvable), pré-remplissage et validation du devis, secours par
  e-mail, menu mobile (focus, Échap), galerie/visionneuse/avant-après avec données de
  test, 35 liens internes et ancres.
- `prefers-reduced-motion` : aucune animation, contenu complet d'emblée. Sans JavaScript :
  tout le contenu est visible, formulaires envoyés en natif vers `/merci/`.
