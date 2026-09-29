# Chez Pipon — audit de l'existant

_Audit réalisé le 29 septembre 2026, avant la conception du site._

## 1. Ce qui existait

**Chez Pipon n'a pas de site internet.** Sa présence en ligne se compose de :

| Canal | Adresse | Rôle actuel |
| --- | --- | --- |
| Instagram (canal principal) | [@chezpipon](https://www.instagram.com/chezpipon/) | Ardoise du jour, nouvelles, **réservation par message** |
| Téléphone | 06 98 33 63 15 | **Réservation** |
| Gault&Millau | [fiche « Chez PiPon »](https://fr.gaultmillau.com/fr/restaurants/chez-pi-pon) | Critique, note, budget |
| Office de tourisme | [Lorient Bretagne Sud Tourisme](https://www.lorientbretagnesudtourisme.fr/fr/fiche/chez-pipon-lorient_TFOTCHEZPIPON/) | Description, horaires, contact |
| Tripadvisor | [fiche](https://www.tripadvisor.fr/Restaurant_Review-g196530-d34442199-Reviews-Chez_Pipon-Lorient_Morbihan_Brittany.html) | Avis clients, horaires |
| Acceslibre | [fiche accessibilité](https://acceslibre.beta.gouv.fr/app/56-lorient/a/restaurant/erp/chez-pipon/) | Accès, marche, transports |
| En Boîte Le Plat | [fiche commerce](https://www.enboiteleplat.fr/commerces-utilisateurs/chez-pipon) | Vente à emporter en boîtes consignées |
| Annuaire des entreprises | [EILVIC (CHEZ PIPON)](https://annuaire-entreprises.data.gouv.fr/entreprise/991517301) | Informations légales |
| Presse | Le Télégramme, Ouest-France / Maville, Le Bouillon, Les Nouvelles Gastronomiques, 7 Jours | Ouverture, distinctions, portrait |

Aucune URL existante n'est donc à préserver : **pas de redirection 301 nécessaire**. Le jour où le
domaine est choisi, il suffit de mettre le lien du site dans la bio Instagram et sur la fiche Google.

### Limites de l'audit

Depuis l'environnement de travail, Instagram et les pages sources ci-dessus étaient **bloqués par la
politique réseau** : les informations ont été relevées via les extraits indexés par le moteur de
recherche, en recoupant plusieurs sources. Aucune photo n'a pu être récupérée. Les points marqués ⚠️
ci-dessous doivent être validés avec Victor et Eileen avant la mise en ligne.

## 2. Inventaire du contenu et où il se trouve sur le nouveau site

Tous les faits vivent dans un seul fichier, `src/data/site.ts`, d'où ils alimentent chaque section,
le statut « ouvert maintenant », l'assistant de réservation et les données structurées.

| Information | Source(s) | Section du site |
| --- | --- | --- |
| Nom « Chez Pipon » (écrit « Chez PiPon » par le restaurant) | Instagram, Gault&Millau | Logo, hero (H1), partout |
| 9 avenue de la Perrière, 56100 Lorient — « à l'entrée de l'avenue de la Perrière » | Office de tourisme, Acceslibre | Hero, Infos pratiques, footer |
| 06 98 33 63 15 | Office de tourisme, presse | Réservation, barre mobile, footer, menu |
| Réservation par téléphone ou message Instagram | Presse locale | Réservation (+ assistant) |
| Cuisine créative et maison, produits frais, locaux, de saison, agriculture locale ou productions raisonnées | Office de tourisme, Instagram | Hero, La cuisine |
| Carte courte : 2 entrées, 3 plats dont 1 végétarien, 2 desserts, tout fait maison, évolue au fil des arrivages et de l'inspiration du chef | Office de tourisme, Tripadvisor | Hero, L'ardoise |
| Pas de menu fixe, produits du jour des producteurs locaux, « bibliothèque » de préparations et cuissons | Le Bouillon | La cuisine |
| Entrée · plat · dessert : 22 € le midi en semaine | Tripadvisor, Office de tourisme | Hero, L'ardoise, Infos |
| Budget 19,50 € à 22 € hors boissons | Gault&Millau 2026 | L'ardoise, Infos, JSON-LD |
| Formule idéale pour une pause rapide, un déjeuner pro ou entre amis | Office de tourisme | Le lieu |
| Midi souvent complet : réserver | Avis clients (Tripadvisor) | Infos, Réservation |
| Terrine de campagne porto-pistache & pickles ; filet de dorade rôti, crème de pois cassés et potimarron | Gault&Millau 2026 | L'ardoise (« déjà passés à l'ardoise ») |
| Restaurant d'angle aux airs de brasserie, large devanture verte et vitrée, cadre décontracté et lumineux | Gault&Millau 2026 | Hero (concept visuel), Le lieu |
| Cadre chaleureux et convivial | Office de tourisme | Le lieu |
| 35 couverts par service, à deux | Gault&Millau 2026 | Le duo, Le lieu |
| Victor Chaigneau : Ferrandi, maisons étoilées, ancien gérant du Café Parisien (rue Monge, Paris 5e) | Presse locale, Dohrnii | Le duo |
| Eileen Wallet : musique (piano, jazz, punk) puis fleuriste ; énergie et bonne humeur en salle | Gault&Millau 2026 | Le duo |
| Rencontre dans le 5e, départ de Paris, reprise de l'ancien Paihia Kitchen, ouverture le 1er décembre 2025 | Presse locale, Le Télégramme | Le duo |
| Une toque Gault&Millau Bretagne 2026 (Victor) | Gault&Millau, Dohrnii, Instagram | Hero, Distinctions, JSON-LD |
| Jeune Talent en salle 2026 (Eileen), remis le 1er juin 2026 au Domaine du Liziec, Vannes | Les Nouvelles Gastronomiques, 7 Jours, Le Télégramme | Hero, Distinctions |
| Valeurs écoresponsables, zéro déchet visé | Presse locale | La cuisine |
| Vente à emporter en boîtes en verre consignées (réseau En Boîte Le Plat) | En Boîte Le Plat | L'ardoise, Infos |
| Accès : arrêt Beaux Arts ; pas de parking privé, places à proximité dont PMR ; entrée visible, porte vitrée battante manuelle, 1 marche | Acceslibre (25/12/2025) | Infos pratiques |
| EILVIC, SARL au capital de 10 000 €, SIREN 991 517 301, siège 9 av. de la Perrière | Annuaire des entreprises | Mentions légales, footer, JSON-LD |

## 3. Points à confirmer avant la mise en ligne ⚠️

1. **Horaires — les sources se contredisent.**
   - À l'ouverture (office de tourisme, presse, déc. 2025) : midi du lundi au vendredi 11h30–15h
     (14h dans un article), plus le lundi soir 19h–22h.
   - Plus récent (Gault&Millau 2026 : « le midi et le vendredi soir » ; Tripadvisor) : fermé le
     lundi, midi du mardi au vendredi 11h30–15h, vendredi soir 19h–22h.
   - **Le site affiche la version la plus récente.** Une seule ligne à modifier dans
     `src/data/site.ts` (`HOURS`) si besoin — le statut live, les tableaux, l'assistant et le JSON-LD
     suivent.
   - Des « afterworks » jeudi et vendredi (17h30–21h) étaient annoncés à l'ouverture : non repris,
     faute de confirmation.
2. **Note et toque Gault&Millau** : « une toque » et « Jeune Talent en salle » sont repris ; la note
   chiffrée (11/20 selon une source) n'est pas affichée.
3. **Texte de la critique Gault&Millau** : le site en donne un résumé, sans guillemets. Remplacer par
   la citation exacte une fois vérifiée sur la fiche (`REVIEW_SUMMARY`).
4. **Prix** : 22 € (entrée · plat · dessert) et budget 19,50–22 € — à confirmer, ainsi que
   l'existence éventuelle d'une formule à 19,50 €.
5. **Vente à emporter** : la fiche En Boîte Le Plat la mentionne ; à confirmer qu'elle est toujours
   proposée.
6. **Orthographe de la marque** : « Chez PiPon » (Instagram, Gault&Millau) pour le logo, « Chez
   Pipon » dans les textes et le référencement. Si le restaurant a un logo, le fournir.
7. **Domaine** : `chezpipon.fr` est un exemple (`src/data/site-url.mjs`, `public/robots.txt`).
8. **Mentions légales** : directeur de la publication et crédits photo à compléter ; hébergeur à
   confirmer (Netlify par défaut).
9. **Photos** : aucune photo n'a pu être récupérée. Les emplacements sont clairement marqués « Photo à
   venir » — voir le README pour les ajouter (avec l'accord du restaurant).

### Informations trouvées mais non intégrées

- Médaille de vermeil de la Ville de Paris (mars 2024) pour Victor Chaigneau : une seule source (blog
  d'une marque partenaire). À ajouter au duo si Victor le confirme.
- Note Google (4,9/5) et nombre d'avis : chiffres qui changent chaque semaine et non vérifiables ici ;
  le site renvoie vers Tripadvisor plutôt que d'afficher un chiffre figé.
- Aucun avis client n'est cité mot pour mot : aucun n'a pu être lu dans sa version complète.

## 4. Objectifs et parcours

- **Objectif n° 1 : remplir la salle le midi** → réserver (téléphone, message Instagram).
- **Objectif n° 2 : venir** → adresse, itinéraire, horaires en direct, accès.
- **Objectif n° 3 : donner confiance** → cuisine, duo, distinctions, presse.

CTA : principal « Réserver une table » (header, hero, infos, réservation, barre mobile, menu, footer) ;
secondaire « Découvrir l'ardoise » / « L'ardoise du jour sur Instagram » ; tertiaire « Appeler »,
« Itinéraire ».

## 5. SEO

- Title : « Chez Pipon — Restaurant de cuisine maison à Lorient ».
- H1 : « Restaurant Chez PiPon Lorient » (l'enseigne), H2 par section, H3 pour les blocs.
- Données structurées `Restaurant` (adresse, téléphone, horaires, prix, distinctions, équipe,
  `sameAs` vers Instagram, Gault&Millau, Tripadvisor, office de tourisme) et `WebSite`.
- Open Graph + image 1200×630, sitemap, robots.txt, canonical, mentions légales en noindex.
- SEO local : nom + ville + adresse dans le title, le H1, la description, le JSON-LD et le pied de page.
  Prochaine étape conseillée : fiche Google Business Profile à jour avec le lien du site.
