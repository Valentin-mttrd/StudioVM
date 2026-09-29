# Chez Pipon — site web

Site vitrine du restaurant **Chez Pipon**, 9 avenue de la Perrière, Lorient. Conçu par Studio VM.

- Astro 7 (100 % statique) + Tailwind CSS 4, aucune dépendance JavaScript côté navigateur.
- Polices auto-hébergées : Fraunces (titres, enseigne) et Instrument Sans (texte).
- ~5 Ko de JavaScript (gzip) : statut « ouvert maintenant », assistant de réservation, menu, carte.

L'audit de l'existant, les sources de chaque information et **la liste des points à confirmer
avant la mise en ligne** sont dans [AUDIT.md](./AUDIT.md).

## Lancer le projet

```sh
cd chez-pipon
npm install
npm run dev       # http://localhost:4321
npm run build     # astro check + build dans dist/
npm run preview
```

## Mettre à jour le contenu

Tout est dans **`src/data/site.ts`** — une seule source, reprise partout :

| Pour changer… | Modifier… |
| --- | --- |
| Les horaires | `HOURS` (le statut en direct, les tableaux, l'assistant de réservation et le JSON-LD suivent) |
| Le prix de la formule, le budget | `MENU` |
| Le téléphone, Instagram | `CONTACT` |
| Les textes du duo | `TEAM` |
| Distinctions, presse | `AWARDS`, `REVIEW_SUMMARY`, `ELSEWHERE` |
| Mentions légales | `LEGAL` |
| Le domaine | `src/data/site-url.mjs` et `public/robots.txt` |

### Ajouter les photos

Déposer les fichiers dans `src/assets/photos/` avec l'un de ces noms (jpg, png, webp ou avif) :

| Fichier | Emplacement |
| --- | --- |
| `devanture` | La devanture verte, à l'angle (section « Le lieu ») |
| `salle` | La salle |
| `assiette` | Une assiette de l'ardoise (section « La cuisine ») |
| `cuisine` | Victor en cuisine |
| `detail` | Un détail de table ou de comptoir |
| `victor` | Portrait de Victor (section « Le duo ») |
| `eileen` | Portrait d'Eileen |

Chaque photo remplace automatiquement son emplacement « Photo à venir », redimensionnée et convertie
en WebP au build. Utiliser uniquement les photos du restaurant, avec son accord.

## Choix de conception

- **La vitrine comme hero** : Gault&Millau décrit « un restaurant d'angle aux airs de brasserie, avec
  une large devanture verte et vitrée ». Le hero est cette devanture : l'enseigne dorée (le H1), les
  vitres éclairées de l'intérieur, et sur la porte la pancarte **Ouvert / Fermé calculée en direct**
  (heure de Paris), qui oscille quand elle change d'état.
- **L'ardoise** : la carte change tous les jours et est publiée sur Instagram. Le site n'invente pas
  de « plat du jour » : il montre le format (2/3/2), le prix, deux plats cités par le guide —
  signalés comme passés — et renvoie vers l'ardoise du jour.
- **Réservation honnête** : pas de faux module de réservation. L'assistant ne propose que les services
  réellement ouverts, rédige le message et le confie aux deux canaux du restaurant (message Instagram
  copié, ou appel). Rien n'est envoyé ni stocké par le site.
- **Carte Google Maps à la demande** : rien n'est chargé chez Google tant que le visiteur ne clique
  pas ; aucun cookie, aucune mesure d'audience.
- **Mouvement** : un seul langage — le rideau qui se lève (images), la craie (ardoise), la salle qui
  glisse sur la vitrine au défilement (CSS, sans JavaScript). Tout est désactivé avec
  `prefers-reduced-motion`.
- **Mobile** : barre d'actions au pouce (Appeler · Itinéraire · Réserver), menu plein écran, galerie
  à faire glisser, header qui s'efface en lisant.

## Vérifications effectuées

- `astro check` : 0 erreur ; build statique : 3 pages + sitemap.
- Aucun débordement horizontal de 320 px à 1920 px ; le hero n'est jamais rogné (1280×720 → 1920×1080).
- axe-core (WCAG 2.1 AA + bonnes pratiques) : 0 violation sur les 3 pages, mobile et desktop.
- Tests du statut en direct (lundi, mardi midi, fin de service, vendredi soir, week-end, visiteur dans
  un autre fuseau), de l'assistant (services proposés, heures, couverts 1–12, nom obligatoire,
  message, copie), du menu mobile (focus, `inert`, Échap) et de la carte à la demande.

## Déploiement (Netlify)

Créer un site Netlify distinct pointant sur ce dépôt avec **Base directory : `chez-pipon`** —
`netlify.toml` fournit la commande (`npm run build`), le dossier publié (`dist`) et les en-têtes de
cache. Ce projet peut aussi être déplacé dans son propre dépôt tel quel.
