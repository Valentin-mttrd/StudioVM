# Audit de pro-paysages-56.fr — base de contenu de la refonte

> **Limite de l'audit.** Le réseau de l'environnement de travail bloque
> `pro-paysages-56.fr` (ainsi que PagesJaunes, societe.com, archive.org…).
> L'audit a donc été reconstruit à partir des extraits indexés par les moteurs
> de recherche, recoupés requête par requête. Chaque information ci-dessous
> indique sa source et son niveau de confiance. Rien n'a été inventé : ce qui
> n'a pas pu être vérifié est signalé **À VÉRIFIER** et n'apparaît pas sur le
> site, ou y apparaît sous forme d'emplacement clairement identifié.
>
> Dès que l'accès au site est ouvert (paramètres réseau de l'environnement →
> ajouter `pro-paysages-56.fr`), une passe de contrôle doit comparer mot pour
> mot le texte de chaque page avec `src/data/site.ts` et récupérer le logo et
> les photos.

## 1. Architecture du site actuel

Quatre pages sont indexées. Les URL longues, riches en mots-clés locaux, sont
typiques d'un site vitrine généré par une plateforme d'annuaire ; elles sont
**toutes conservées à l'identique** (barre finale comprise).

| Page | URL actuelle | Title indexé | Nouvelle URL |
|---|---|---|---|
| Accueil | `/` | Paysagiste à Ploemeur, Larmor-Plage, Quéven, Hennebont | `/` |
| Création | `/creation-de-jardin-ploemeur-pose-de-cloture-larmor-plage-queven-hennebont/` | Création de jardin Ploemeur - Pose de clôture Quéven Hennebont Larmor-Plage, | identique |
| Entretien | `/entretien-de-jardin-taille-de-haie-ploemeur-larmor-plage-queven-hennebont/` | Entretien de jardin et Taille de haie Ploemeur, Larmor-Plage, Quéven Hennebont | identique |
| Contact | `/contact/` | Nous contacter - PRO PAYSAGES | identique |
| Mentions légales | non indexée (URL inconnue) | — | `/mentions-legales/` (nouvelle) |

`public/_redirects` ajoute des 301 pour les variantes courantes (sans barre
finale, `/accueil`, `/index.php`, `/creation-de-jardin`, `/entretien-de-jardin`,
`/nous-contacter`…). Aucune URL existante n'est supprimée.

Navigation reconstituée : Accueil · Création de jardin / pose de clôture ·
Entretien de jardin / taille de haie · Contact.

## 2. Contenu recensé

### Entreprise
| Information | Valeur | Source | Confiance |
|---|---|---|---|
| Nom | PRO PAYSAGES | site (title de la page contact) | haute |
| Métier | Paysagiste : création et entretien de jardins | site (titles, accueil) | haute |
| Implantation | « Située à Ploemeur » | accueil | haute |
| Clientèle | « Au service des particuliers et des professionnels » | accueil | haute |
| Ancienneté | « depuis plus de 11 ans » (accueil) ; « depuis 2012 » (fiche PagesJaunes de l'entreprise) ; création 2012 (registre) | accueil, PagesJaunes, societe.com | haute |
| Qualification | « notre paysagiste qualifié met son expertise à votre disposition » ; « artisans qualifiés » ; « équipe qualifiée » | accueil, création, entretien | haute |
| Promesse | « vous offrir un espace extérieur qui reflète votre style et répond à vos besoins » | accueil | haute |
| Engagement | « Notre engagement en tant que paysagiste va au-delà du simple travail de création d'espaces extérieurs ou d'entretien de jardin […] nous déployons tous nos efforts pour concevoir un aménagement qui vous ressemble » | accueil (extrait, coupure `[…]`) | moyenne-haute |
| Méthode | « Communication ouverte et transparente : pour comprendre vos besoins et envies » ; solutions sur mesure | accueil (extrait) | moyenne-haute |
| Écoute | « à votre écoute pour trouver le jardin qui correspond le mieux à votre image » | fiche PagesJaunes | moyenne |
| Forme juridique | SARL | registre (paysagiste.info, societe.com) | haute |
| SIREN / SIRET | 749 903 365 / 749 903 365 00015 | societe.com, verif.com | haute |
| Gérant | nom trouvé dans un annuaire, **non confirmé** | — | **À VÉRIFIER** — non affiché |
| Capital, TVA intracommunautaire | non trouvés | — | **À VÉRIFIER** |

« Depuis plus de 11 ans » était vrai à la rédaction du site actuel ; en 2026,
l'entreprise créée en 2012 en compte 14. La refonte écrit **« depuis 2012 »** :
même fait, formulation qui ne vieillit pas.

### Coordonnées
| Information | Valeur | Source |
|---|---|---|
| Adresse | Route du Quartz, PA de Kergantic, 56270 Ploemeur | page contact (« PA de Kergantic 56270 Ploemeur ») + registre (« Route du Quartz ») |
| Téléphone | 06 16 46 75 24 | accueil, entretien, contact (plusieurs extraits concordants) |
| E-mail | propaysages56@orange.fr | page contact |
| Horaires | lundi–vendredi 8 h–12 h / 13 h 30–18 h 30, fermé le week-end | fiche PagesJaunes de l'entreprise — **absents du site actuel, à confirmer** (affichés, faciles à retirer : `SITE.hours`) |
| Réseaux sociaux | aucun trouvé | — |

Autres numéros rencontrés, **non repris** : 02 97 50 75 67 (ancienne fiche liée
à `pro-paysages.fr`), 06 73 21 75 51 et « 26 Kervinio » (annuaire 118712,
vraisemblablement obsolète).

### Zone d'intervention
- Villes citées sur le site : **Ploemeur, Larmor-Plage, Quéven, Hennebont** « et alentours ».
- « notre équipe qualifiée est disponible dans **tout le Morbihan**, notamment à
  Ploemeur, Larmor-Plage, Quéven et Hennebont » (page entretien).
- « intervient dans un **rayon de 50 km autour de Ploemeur** » (fiche
  PagesJaunes de l'entreprise, reprise par plusieurs annuaires).

Aucune autre commune n'est présentée comme zone d'intervention. Le
vérificateur « Intervenez-vous chez moi ? » applique exactement ces deux
règles (Morbihan, ou moins de 50 km de Ploemeur à vol d'oiseau) à partir des
coordonnées publiques des communes (GeoNames, CC BY 4.0).

### Prestations — création (page création + fiche de l'entreprise)
Du site :
- création de jardin, « de la conception à la réalisation » ;
- « artisans qualifiés pour la **pose de clôture**, la **création de massifs** et
  différents travaux de **maçonnerie paysagère** » ;
- « Pour l'**engazonnement**, la **plantation de fleurs et d'arbustes**, la
  **création de massifs floraux** ou la mise en place d'un **système d'arrosage
  automatisé**, nos paysagistes expérimentés vous accompagnent de A à Z »
  (confiance moyenne-haute : deux extraits concordants).

De la fiche PagesJaunes de l'entreprise (même vocabulaire, confiance moyenne) :
création de jardins et de parcs, maçonnerie paysagère, construction de
clôtures, **dallage, pavage**, engazonnement, création de massifs.

### Prestations — entretien (page entretien + fiche de l'entreprise)
Du site :
- « Pour la **taille de haie**, la **tonte de pelouse** et bien d'autres
  interventions, notre équipe qualifiée est disponible dans tout le Morbihan » ;
- « En plus de notre expérience en création de jardin, nous proposons des
  services complets pour maintenir votre espace extérieur dans un état optimal » ;
- « l'entretien régulier de votre espace vert » (accueil).

De la fiche de l'entreprise : entretien de jardins et de parcs, tonte de
pelouse, **débroussaillage, découpe de bordures, taille d'arbustes, de talus,
de massifs, ramassage des feuilles mortes ou des branches cassées**.

### Page contact
« Pour toutes vos demandes ou suggestions […], remplissez tous les champs du
formulaire ci-dessous, nous vous répondrons dans les plus brefs délais. »
Coordonnées : adresse, téléphone, e-mail (voir ci-dessus).

### Appel à l'action récurrent
« Pour un **devis gratuit** ou plus d'informations, contactez-nous au
06 16 46 75 24. » (accueil et entretien)

### Non trouvé (donc non affiché, jamais inventé)
- Logo, photos, légendes et liste des réalisations.
- Avis / témoignages clients (« pas encore d'avis » selon PagesJaunes), note Google.
- Tarifs, certifications, labels, garanties, assurances.
- Meta descriptions et H1 d'origine.
- Mentions légales d'origine (éditeur, hébergeur).

### Présent ailleurs, non repris sans validation
Un second site de l'entreprise, `pro-paysages.fr` (« jardins et parcs, élagage,
abattage »), mentionne aussi **terrasses bois, élagage et abattage**. Ces
prestations n'apparaissent pas sur `pro-paysages-56.fr` : **à confirmer avec
l'entreprise** avant de les ajouter (`SERVICES` dans `src/data/site.ts`). Le
second domaine devrait, à terme, rediriger en 301 vers le site principal.

## 3. Objectifs de conversion
1. **Demande de devis gratuit** (CTA principal) — formulaire guidé en 4 étapes.
2. **Appel téléphonique** — 06 16 46 75 24 (bouton dans l'en-tête, barre d'action fixe sur mobile).
3. **Demande de rappel** (CTA secondaire) — formulaire court sur la page contact.
4. **Découvrir les prestations** — pages création et entretien.
5. **Vérifier la zone** — « Intervenez-vous chez moi ? », qui pré-remplit la commune du devis.

## 4. Emplacements réservés (à remplacer par les vrais fichiers)
| Emplacement | Fichier / donnée | Remarque |
|---|---|---|
| Logo | `src/components/ui/Logo.astro` | mot-symbole typographique provisoire |
| Réalisations | `src/data/realisations.ts` | tableau vide : cadres « Photo à intégrer » ; galerie, filtres, visionneuse et avant/après s'activent dès qu'une entrée existe |
| Horaires | `src/data/site.ts` → `hours` | issus de PagesJaunes, à confirmer (`null` = non affichés) |
| Avis clients | non prévu tant qu'aucun avis vérifiable n'est fourni | |

## 5. Textes ajoutés par la refonte (à valider par le client)
Aucun fait nouveau n'a été ajouté. Seuls des textes de présentation, de
navigation ou des obligations légales standard ont été rédigés :
- accroches de section (« Un seul interlocuteur, du premier croquis au coup de sécateur »…) ;
- une phrase de description par prestation, à partir du vocabulaire du site ;
- le déroulé d'un projet (échange → devis gratuit → conception → réalisation →
  entretien), qui ordonne des éléments cités par le site sans rien y ajouter ;
- FAQ : chaque réponse reprend une information du tableau ci-dessus ;
- mentions légales : droits RGPD, absence de cookies de mesure d'audience
  (vrai pour le nouveau site), propriété intellectuelle ;
- questions et messages des formulaires.

## 6. Chiffres affichés et leur origine
| Affiché | Origine |
|---|---|
| 2012 | « depuis 2012 » (fiche de l'entreprise), création au registre ; « plus de 11 ans » sur le site |
| 50 km | « rayon de 50 km autour de Ploemeur » (fiche de l'entreprise) |
| distances des communes | calcul à vol d'oiseau depuis le centre de Ploemeur (coordonnées GeoNames) |

## 7. SEO — relevé et décisions
| Élément | Site actuel | Refonte |
|---|---|---|
| Title accueil | Paysagiste à Ploemeur, Larmor-Plage, Quéven, Hennebont | conservé, suivi de « – PRO PAYSAGES » |
| Title création | Création de jardin Ploemeur - Pose de clôture Quéven Hennebont Larmor-Plage, | conservé (virgule finale retirée) |
| Title entretien | Entretien de jardin et Taille de haie Ploemeur, Larmor-Plage, Quéven Hennebont | conservé |
| Title contact | Nous contacter - PRO PAYSAGES | conservé |
| Meta descriptions | non récupérées | rédigées par page (≤ 155 caractères) |
| H1 | non récupérés | un H1 par page reprenant le mot-clé principal du title |
| Données structurées | non relevées | `HomeAndConstructionBusiness`, `Service`, `BreadcrumbList`, `FAQPage` |
| Sitemap / robots | non relevés | générés (`/sitemap-index.xml`, `robots.txt`) |
| Domaine | `https://pro-paysages-56.fr` (sans www) | canonical sur le même domaine |
