# Sprite Checklist

Application Vue 3 mobile-first pour suivre les Sprites Fortnite possédés et maîtrisés. Les données publiques sont importées depuis Fortnite.gg à l'aide d'un script séparé, puis l'interface lit uniquement le JSON généré.

## Commandes Bun

```bash
bun install
bun run dev
bun run test
bun run build
bun run fetch:sprites
```

Copier ensuite la configuration locale avant de lancer l’application :

```bash
cp .env.example .env.local
```

Variables nécessaires :

```dotenv
VITE_SUPABASE_URL=https://omdhxrdyystysrdmpazn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

La clé publishable se récupère dans le panneau **Connect** du projet Supabase. Ne jamais placer une clé `secret` ou `service_role` dans une variable `VITE_*`.

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
- synchronisation Supabase facultative, sans compte, activée par un code secret partageable entre appareils
- envoi automatique des changements après activation et au retour de la connexion réseau
- pages détail accessibles et responsive
- tests unitaires de la persistance, des bascules d'état, des filtres et du code de synchronisation

## Données

`scripts/fetchSprites.ts` limite volontairement la cadence des requêtes et continue l'import lorsqu'une fiche détail est temporairement indisponible. Le résultat est écrit dans `src/data/sprites.json`.

Fortnite est une marque d'Epic Games. Ce projet indépendant n'est ni affilié ni approuvé par Epic Games ou Fortnite.gg.

## Synchronisation Supabase

Le projet dédié est `sprite-checklist`, hébergé en région Paris (`eu-west-3`) avec la référence `omdhxrdyystysrdmpazn`.

Les migrations présentes dans `supabase/migrations/` créent :

- la table `sprite_collection_sync`, protégée par RLS et inaccessible directement depuis le navigateur ;
- la fonction RPC `sync_sprite_collection`, seule entrée autorisée pour enregistrer ou récupérer une collection ;
- la fonction minimale `sync_health`, utilisée par la CI.

### Fonctionnement

1. Le premier clic sur **Activer la sync** génère localement un identifiant et un secret aléatoire de 256 bits.
2. La collection courante est enregistrée dans Supabase.
3. Les modifications suivantes restent immédiatement écrites dans `localStorage`, puis sont envoyées à Supabase lorsque le réseau est disponible.
4. Sur un autre appareil, ouvrir les paramètres de synchronisation et importer le même code secret pour récupérer la collection.

Il n’existe aucun compte utilisateur, écran de connexion, e-mail ou mot de passe. Le code de synchronisation tient lieu de clé d’accès aux données : toute personne qui le possède peut lire et modifier la collection associée. Il doit donc rester privé et être conservé dans un endroit sûr. Supprimer les données du navigateur sans avoir sauvegardé ce code rend l’espace distant irrécupérable.

En cas de modifications concurrentes depuis plusieurs appareils, le serveur conserve la première version reçue et l’autre appareil récupère cette version. L’interface indique alors **Données récupérées**.

### Maintien en activité

Le workflow `.github/workflows/keep-supabase-active.yml` appelle `sync_health` deux fois par semaine. Ajouter les secrets suivants dans **GitHub → Settings → Secrets and variables → Actions** :

- `SUPABASE_URL` : `https://omdhxrdyystysrdmpazn.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY` : la clé publishable du projet

Déclencher ensuite manuellement le workflow **Keep Supabase active** une première fois afin de vérifier les secrets.

### Déploiement Vercel

Définir également `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` dans les variables d’environnement Vercel, puis relancer un déploiement. Le fichier `.env.local` est ignoré par Git et ne configure que le développement local.
