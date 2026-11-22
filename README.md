# Mes Objectifs du Mois

Un petit site au style manga pour noter mes objectifs chaque mois :

- **Animes** : où j'en suis et jusqu'à quel épisode je veux aller
- **Sourates** : combien j'en apprends ce mois-ci, et le total sur 114
- **Salle** : les séances (calendrier) et mes objectifs de perf
- **Argent** : épargne, dépenses par catégorie (camembert), budget, abonnements ajoutés tout seuls chaque mois, cagnottes
- **Autres objectifs** et **notes du mois**
- **Animes** : affiches, nombre d'épisodes et dates de sortie récupérés sur AniList, planning de la semaine, liste « à regarder plus tard », note sur 10
- **Rang RPG** (XP et niveaux), **séries** 🔥 et une page **Bilan** avec les graphiques mois par mois
- **Habitudes du jour** (grille à cocher, plusieurs fois par jour possible, ex. prières 5/5)
- **Révision des sourates** : celles pas révisées depuis le plus longtemps sont proposées en premier
- **Mangas** : chapitres, couvertures et parution via AniList
- **Quêtes de la semaine** (3 par semaine, +40 XP) et **29 succès** à débloquer
- **Callisthénie** : 24 figures dessinées (de la suspension à l'équilibre sur un bras), rangées en 5 niveaux, avec objectif, conseil et record (`cali.js`)
- **Appli** : installable sur l'écran d'accueil du téléphone (logo dans `icons/`, source dans `icons/logo.html`), marche sans internet

Tout est enregistré dans le navigateur (localStorage).
Le bouton « Sauvegarder un fichier » télécharge une copie de secours, et « Charger » la remet.

## Synchro téléphone ↔ PC

Le bouton « Synchro tél ↔ PC » garde les données dans un gist secret de mon compte GitHub.
Il faut une clé GitHub avec seulement le droit `gist`, collée une fois sur chaque appareil.
La clé reste dans le navigateur de l'appareil et n'est jamais mise dans le code ni dans les sauvegardes.
Si les deux appareils ont changé quelque chose, c'est la modification la plus récente qui gagne.

Fait en HTML, CSS et JavaScript, sans librairie.
