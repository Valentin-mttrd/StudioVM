# L'atypique — site de l'institut

Site de **L'atypique**, institut de beauté slow cosmétique au 14 rue du Général
Dubail à Lorient. Il remplace le mini-site générique Kalendes
(`kalendes.com/latypique/#/welcome`) comme vitrine ; **Kalendes reste le
moteur de réservation** : tous les boutons « Prendre rendez-vous » y mènent.

Audit du site d'origine, sources de chaque information et points à confirmer :
[`AUDIT.md`](./AUDIT.md).

## Démarrer

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # astro check + build statique dans dist/
npm run preview   # sert dist/
```

Node 22. Aucune variable d'environnement n'est requise ; `SITE_URL` fixe le
domaine (URL canoniques, Open Graph, JSON-LD, sitemap, robots.txt).

## Avant la mise en ligne

Tout le contenu factuel est centralisé dans `src/data/` : aucune adresse,
aucun horaire ni numéro n'est écrit en dur ailleurs.

| À faire | Où |
| --- | --- |
| Valider les **horaires** (le samedi diffère selon les sources) — ils pilotent l'indicateur « Ouvert / Fermé » en temps réel | `src/data/business.ts` → `hours` |
| Saisir la **carte des prestations** (nom, durée, prix) depuis Kalendes : un tableau de tarifs s'affiche alors automatiquement dans chaque famille | `src/data/soins.ts` → `prestations` |
| Ajouter les **photos** de l'institut (voir ci-dessous) | `src/assets/photos/` |
| Renseigner l'**e-mail** de contact | `src/data/business.ts` → `email` |
| Compléter **hébergeur** et **médiateur de la consommation** | `src/pages/mentions-legales.astro` |
| Fixer le **nom de domaine** | variable `SITE_URL` (défaut provisoire dans `astro.config.mjs`) |
| Confirmer la **cabine UV** et la **note clients** | `src/data/business.ts` |
| Remplacer le logotype typographique par le **logo** de l'institut s'il existe | `src/components/ui/Wordmark.astro` |
| Dans l'espace pro Kalendes, indiquer l'adresse du nouveau site | — |

Format d'une prestation (valeurs à reprendre telles quelles de Kalendes) :

```ts
prestations: [
  { name: '<intitulé exact>', duration: '<durée>', price: '<prix>', description: '<facultatif>' },
],
```

### Photos

Chaque emplacement photo affiche aujourd'hui un placeholder étiqueté
« Photo à venir — … » qui décrit la photo attendue. Pour le remplacer :

```astro
---
import cabine from '@/assets/photos/cabine-1.jpg';
---
<Photo image={cabine} alt="Cabine de soins aux tons argile, table de soin" label="Cabine de soins n°1" />
```

Astro génère alors des AVIF/WebP responsives aux dimensions fixées (pas de
décalage de mise en page). Pour masquer les étiquettes sans photos (lancement
anticipé) : `src/data/site.ts` → `showPhotoPlaceholderLabels: false`.

## Déploiement (Netlify)

Créer un site Netlify dédié sur ce dépôt avec **Base directory = `latypique`**.
`netlify.toml` fournit la commande de build, le cache long des polices et
assets, et les en-têtes de sécurité (dont une CSP vérifiée page par page).

## Structure

```
src/
  data/          business.ts (identité, contact, horaires) · soins.ts · faq.ts · nav.ts · site.ts
  lib/           hours.ts (statut ouvert/fermé, fuseau Europe/Paris) · seo.ts (JSON-LD)
  layouts/       Base.astro (meta, Open Graph, JSON-LD, en-tête, pied de page)
  components/
    layout/      Header (menu <dialog>), Footer, MobileBar (Appeler · Itinéraire · Réserver)
    home/        Hero, Manifesto, Engagements, SoinsIndex, InstitutTeaser
    shared/      PageHeader, Visit, HoursTable, MapEmbed, Faq
    ui/          Button, Icon, Pebble, Photo, OpenStatus, Stars, Wordmark
  pages/         / · /soins · /institut · /infos-pratiques · mentions légales · confidentialité · 404 · robots.txt
scripts/
  build-fonts.py       sous-ensemble + instanciation des polices → public/fonts
  render-assets.cjs    image Open Graph, favicon, icônes (Playwright)
```

## Direction artistique

**La slow cosmétique, mise en page.** L'institut se distingue par ce qu'il
applique sur la peau : produits 100 % naturels, semi-permanent à base de
manioc et de maïs, cire végétale sans ingrédients controversés. Le site
reprend ce réflexe de *lire la composition* :

- **Étiquettes d'apothicaire** : numéros `N°01`, filets fins, petites
  capitales espacées, encarts « Composition » sur chaque famille de soins.
- **Matière plutôt que photos de stock** : des galets polis (argile, maïs,
  cire, sauge…) en CSS pur, un par engagement et par famille de soins. Ils ne
  pèsent rien et ne se font jamais passer pour des réalisations.
- **Palette** lin, argile, mousse et crème ; tous les textes ≥ 4,5:1 (WCAG AA).
- **Typographie** : Fraunces (titres, italique « wonky » : l'accent
  *atypique*) et Instrument Sans (texte). Deux familles, auto-hébergées,
  réduites à ≈ 140 Ko.
- **Mouvement lent** : tout se pose, rien ne claque (courbe
  `--ease-settle`). Chaque animation sert la lecture : titre révélé ligne à
  ligne, manifeste qui « s'encre » au rythme du défilement, engagements
  présentés un par un. Tout est coupé avec `prefers-reduced-motion`, et le
  contenu reste entièrement visible sans JavaScript.

## Qualité mesurée

- Lighthouse mobile : Performance 99, Accessibilité 100, Bonnes pratiques 100,
  SEO 100 — ≈ 170 Ko par page, CLS ≈ 0, aucun blocage du rendu.
- axe-core (WCAG 2.1 AA + bonnes pratiques) : 0 violation sur toutes les pages,
  desktop et mobile.
- Aucun lien interne ni ancre cassés, aucun débordement horizontal à 390 px.
- JavaScript : ≈ 10 Ko par page, sans framework ; HTML ≈ 20 Ko compressé (CSS inclus).
- SEO local : titres et descriptions uniques, H1 par page, URL canoniques,
  sitemap, robots.txt, JSON-LD `BeautySalon` (adresse, horaires, catalogue de
  soins, action de réservation), `FAQPage`, `BreadcrumbList`.
