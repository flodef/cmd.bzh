# Release — Rapport Umami

## Prérequis

- Vercel CLI authentifié : `bunx vercel login` (une seule fois)
- Le script `scripts/umami-report.py` doit être à jour
- Le projet Vercel `umami-deploy` doit exister dans `scripts/umami-deploy/`

## Étapes

### 1. Télécharger le dernier export Umami

1. Aller sur https://cloud.umami.is/settings/data
2. Cliquer **Export**
3. Sélectionner le site **CMD Breizh** + **Last 12 month**
4. Attendre l'email de Umami (quelques minutes) avec le lien de téléchargement
5. Télécharger le fichier `.csv.gz`
6. Décompresser le fichier :
   ```bash
   gunzip ~/Downloads/<fichier>.csv.gz
   ```
   Ou simplement double-cliquer pour le décompresser
7. Récupérer le fichier `website_event.csv` (dans le dossier décompressé)

### 2. Merger avec l'historique existant

Umami Cloud ne permet d'exporter que les 12 derniers mois. Pour conserver
l'historique au-delà, on merge chaque nouvel export avec le fichier cumulé.

```bash
python3 scripts/umami-merge.py scripts/data/merged.csv \
  scripts/data/merged.csv \
  <chemin_vers_website_event.csv>
```

Le script déduplique par `event_id` — les events déjà présents sont ignorés.
Le fichier `scripts/data/merged.csv` grandit à chaque export.

### 3. Générer le rapport HTML

```bash
python3 scripts/umami-report.py scripts/data/merged.csv scripts/umami-deploy/index.html
```

Ou directement depuis un export seul (sans merge) :

```bash
python3 scripts/umami-report.py <chemin_vers_website_event.csv> scripts/umami-deploy/index.html
```

### 4. Déployer sur Vercel (remplace l'ancien)

```bash
cd scripts/umami-deploy && bunx vercel --prod --yes && cd ../..
```

Vercel va afficher l'URL de déploiement (ex: `https://umami-deploy-xxx.vercel.app`).
Si le projet a déjà été déployé avant, l'URL reste la même.

### 5. Committer et pousser les changements

```bash
git add scripts/umami-report.py scripts/umami-merge.py scripts/data/merged.csv scripts/umami-deploy/index.html scripts/release.md
git commit -m "chore: update umami analytics report"
git push
```

## Notes

- Le rapport HTML est 100% autonome (CSS + JS inline, pas de dépendances externes)
- L'URL Vercel est partageable directement (Telegram, email, etc.)
- Le rapport s'adapte au mode sombre/clair du navigateur
- Les données sont figées au moment de l'export Umami (pas de mise à jour en temps réel)
