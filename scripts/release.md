# Release — Rapport Umami

## Prérequis

- Vercel CLI authentifié : `bunx vercel login` (une seule fois)
- Le script `scripts/umami-report.py` doit être à jour
- Le projet Vercel `umami-deploy` doit exister dans `scripts/umami-deploy/`

## Étapes

### 1. Télécharger le dernier export Umami

1. Aller sur https://cloud.umami.is
2. Sélectionner le site **CMD Breizh**
3. Cliquer sur **Export** (en haut à droite du dashboard)
4. Attendre l'email avec le lien de téléchargement
5. Télécharger et décompresser le fichier `.csv.gz`
6. Récupérer le fichier `website_event.csv`

### 2. Générer le rapport HTML

```bash
python3 scripts/umami-report.py <chemin_vers_website_event.csv> scripts/umami-deploy/index.html
```

Exemple :
```bash
python3 scripts/umami-report.py ~/Downloads/0c513de4-ba72-45d0-aa50-ff81edd7d2b5/website_event.csv scripts/umami-deploy/index.html
```

### 3. Déployer sur Vercel (remplace l'ancien)

```bash
cd scripts/umami-deploy && bunx vercel --prod --yes && cd ../..
```

Vercel va afficher l'URL de déploiement (ex: `https://umami-deploy-xxx.vercel.app`).
Si le projet a déjà été déployé avant, l'URL reste la même.

### 4. Committer et pousser les changements

```bash
git add scripts/umami-report.py scripts/umami-deploy/index.html scripts/release.md
git commit -m "chore: update umami analytics report"
git push
```

## Notes

- Le rapport HTML est 100% autonome (CSS + JS inline, pas de dépendances externes)
- L'URL Vercel est partageable directement (Telegram, email, etc.)
- Le rapport s'adapte au mode sombre/clair du navigateur
- Les données sont figées au moment de l'export Umami (pas de mise à jour en temps réel)
