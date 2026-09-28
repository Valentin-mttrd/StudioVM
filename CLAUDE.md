# Studio VM — consignes permanentes

Ce dépôt est le site de Studio VM (studio web de Valentin Mottard, Lorient).
Il sert aussi de point de départ pour les sites clients réalisés par le studio.

## Règle obligatoire pour tout site client réalisé par Studio VM

- Le pied de page de **toutes les pages** affiche la mention
  **« Site réalisé par Studio VM »**, accompagnée du **logo Studio VM**.
- Le logo et la mention sont un lien vers **https://www.studiovm-design.fr**
  (nouvel onglet, `rel="noopener"`, texte « (nouvel onglet) » pour les lecteurs d'écran).
- Logo : `src/assets/logo/mark.svg` de ce dépôt (utilise `currentColor`, s'adapte
  aux fonds clairs et sombres). Le copier dans le projet client.
- Implémentation de référence : `StudioCredit.astro` du dépôt
  Valentin-mttrd/Solution-Travaux (`src/components/layout/StudioCredit.astro`).
