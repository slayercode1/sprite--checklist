# Sprite Checklist

Application Vue 3 mobile-first pour suivre les Sprites Fortnite possédés et maîtrisés. Les données publiques sont importées depuis Fortnite.gg à l'aide d'un script séparé, puis l'interface lit uniquement le JSON généré.

## Commandes Bun

```bash
bun install
bun run fetch:sprites
bun run dev
bun run test
bun run build
```

## Déploiement Vercel

Importer le dépôt dans Vercel. La configuration `vercel.json` impose Bun pour l'installation et le build, publie le dossier `dist` et redirige les routes de la SPA vers `index.html`.

```text
Framework Preset : Vite
Install Command  : bun ci
Build Command    : bun run build
Output Directory : dist
```

## Fonctionnalités

- 117 fiches Sprite importées avec images, rareté, variante, description et informations disponibles
- recherche tolérante, filtres combinables et tris
- vues grille et liste mémorisées
- états possédé et maîtrisé indépendants, sauvegardés dans `localStorage`
- pages détail accessibles et responsive
- import, export et réinitialisation de la collection utilisateur
- tests unitaires de la persistance, des bascules d'état et des filtres

## Données

`scripts/fetchSprites.ts` limite volontairement la cadence des requêtes et continue l'import lorsqu'une fiche détail est temporairement indisponible. Le résultat est écrit dans `src/data/sprites.json`.

Fortnite est une marque d'Epic Games. Ce projet indépendant n'est ni affilié ni approuvé par Epic Games ou Fortnite.gg.
