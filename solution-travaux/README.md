# Solution Travaux — refonte du site

Refonte de [solution-travaux.fr](https://solution-travaux.fr/), courtier en travaux à Étel (56).
Site statique Astro 7, sans framework UI, pensé pour Netlify.

- **Contenu** : tout ce que le site affiche sur l'entreprise vient de `src/data/site.ts`.
  Les sources et le niveau de confiance de chaque information sont dans [`AUDIT.md`](./AUDIT.md).
- **Aucune information inventée** : pas d'avis, de chiffres, de prix ni de réalisations
  qui ne figurent pas sur le site actuel. Les visuels manquants sont des emplacements
  « Photo à intégrer » clairement identifiés.

## Lancer le projet

```bash
cd solution-travaux
npm install
npm run dev       # http://localhost:4321
npm run build     # astro check + build statique dans dist/
npm run preview   # sert dist/
```

## Direction artistique — « le plan et la matière »

Le métier d'un courtier est invisible : visite, cahier des charges, choix du bon
professionnel pour chaque lot. Le site le dessine.

- **Dessins d'architecte codés en SVG** : élévation d'une maison néo-bretonne (hero),
  coupe par corps d'état, plan de situation radial de la zone d'intervention.
- **Vocabulaire du chantier** : cartouches de planche (`01 — Le principe`), lots numérotés,
  « à créer » en couleur comme sur un plan de projet.
- **Matières de la Ria d'Étel** : papier enduit à la chaux, ardoise, granit, et le rouge
  tanné des anciennes voiles comme couleur d'action.
- **Typographie** : Archivo (variable, axe de chasse pour les titres) + IBM Plex Mono
  pour les annotations.

Tokens (couleurs, espacements, typo, durées et courbes d'animation) : `src/styles/global.css`.

## Fonctionnalités

| Fonction | Où | Détail |
|---|---|---|
| Élévation interactive | Accueil, hero | chaque zone = un type de projet, lien vers le formulaire pré-rempli (`?projet=`) |
| Méthode en 7 étapes | Accueil | suivi « Votre dossier » qui se coche au fil du scroll |
| Coupe par corps d'état | Accueil | les 30 métiers du site, la famille active s'allume dans la coupe |
| Zone d'intervention | Accueil | caps réels, distances à vol d'oiseau calculées depuis Étel |
| FAQ | Accueil | construite uniquement à partir des informations du site + données structurées `FAQPage` |
| Formulaire de projet en 4 étapes | `/contactez-nous/` | validation en français, récapitulatif, fonctionne sans JS |
| Demande de rappel | `/demande-de-rappel/` | formulaire court |
| Candidature artisan | `/devenir-partenaire/` | corps d'état, attestations d'assurance |
| Réalisations | `/nos-derniers-travaux/` | filtres, avant/après au clavier et au doigt, visionneuse |
| Barre d'action mobile | toutes les pages | Appeler · Être rappelé · Demander un devis |

Les formulaires sont envoyés à **Netlify Forms** (aucun code serveur). Si l'envoi échoue
(hébergement différent, réseau…), le visiteur obtient un e-mail déjà rédigé vers
`solutiontravaux56@gmail.com` : aucune demande n'est perdue.

## Ajouter les photos des réalisations

1. Déposer les photos dans `src/assets/realisations/`.
2. Les déclarer dans `src/data/realisations.ts` (exemple en commentaire dans le fichier).
3. `before` active le curseur avant/après ; `gallery` ajoute des vues à la visionneuse.

Les emplacements « Photo à intégrer » disparaissent d'eux-mêmes dès qu'une réalisation existe.

## Avant la mise en ligne

- [ ] Relire mot à mot les textes de `src/data/site.ts` face au site actuel (l'accès au site
      était bloqué pendant la refonte, cf. `AUDIT.md`).
- [ ] Remplacer le mot-symbole provisoire par le logo officiel (`src/components/ui/Logo.astro`).
- [ ] Intégrer les photos des réalisations et le portrait de Franck L'HOURS.
- [ ] Confirmer le lien Facebook, la forme juridique et le capital pour les mentions légales.
- [ ] Mettre à jour l'hébergeur dans `SITE.host` si le site quitte OVH.
- [ ] Netlify : *Base directory* = `solution-travaux`, activer les notifications e-mail des formulaires.

## SEO

- URL identiques au site actuel (barre finale conservée) ; `public/_redirects` gère les variantes.
- Title de l'accueil conservé tel quel ; titles, descriptions, canonical, Open Graph par page.
- Données structurées : `HomeAndConstructionBusiness` (adresse, zone, SIRET, fondateur),
  `BreadcrumbList`, `FAQPage`. Sitemap et `robots.txt` générés.

## Vérifications effectuées

- `astro check` : 0 erreur. Build statique : 8 pages.
- axe-core (WCAG 2.1 AA + bonnes pratiques) : 0 violation sur toutes les pages, mobile et desktop.
- Lighthouse (build de production, local) : Performance 99–100, Accessibilité 100,
  Bonnes pratiques 100, SEO 100 ; CLS 0, TBT 0 ms.
- 344 liens internes et ancres vérifiés.
- `prefers-reduced-motion` : toutes les animations sont coupées, le contenu est complet d'emblée.
