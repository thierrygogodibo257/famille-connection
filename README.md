# Famille Connect - Arbre Généalogique

## Vue d'ensemble

Famille Connect est une application web moderne pour gérer et visualiser les arbres généalogiques familiaux. L'application utilise Supabase comme backend avec des Edge Functions pour les opérations administratives.

## Technologies utilisées

- **Frontend**: React, TypeScript, Vite
- **UI**: shadcn-ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Edge Functions**: Deno (TypeScript)
- **Déploiement**: Vercel/Netlify

## Configuration CORS

### Points importants

Depuis 2025, Supabase ne propose plus de configuration CORS via le tableau de bord. La gestion CORS doit être faite manuellement dans les Edge Functions.

### Bonnes pratiques implémentées

✅ **API REST Supabase** : Gestion automatique des en-têtes CORS
✅ **Edge Functions** : Gestion manuelle avec pattern standard
✅ **Tests CORS** : Scripts de validation et de test

### Pattern CORS pour les Edge Functions

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

// Gestion OPTIONS
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders })
}

// Réponse avec en-têtes CORS
return new Response(JSON.stringify(data), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
})
```

## Installation et développement

### Prérequis

- Node.js & npm
- Compte Supabase
- Supabase CLI

### Installation

```sh
# Cloner le repository
git clone <YOUR_GIT_URL>
cd modern-family-tree

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase

# Démarrer le serveur de développement
npm run dev
```

### Variables d'environnement

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Edge Functions

### Fonctions disponibles

1. **delete_all_users** : Suppression complète de tous les utilisateurs (admin)
2. **delete_user** : Suppression d'un utilisateur spécifique (admin)
3. **profiles** : Gestion des profils utilisateurs

### Déploiement des Edge Functions

```sh
# Validation CORS
node scripts/deploy-functions.js

# Tests CORS
node scripts/test-cors.js

# Déploiement manuel
supabase functions deploy delete_all_users
supabase functions deploy delete_user
supabase functions deploy profiles
```

### Tests CORS

```sh
# Test complet
node scripts/test-cors.js

# Test manuel avec curl
curl -X OPTIONS \
  -H "Origin: https://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type,x-admin-secret" \
  https://your-project.supabase.co/functions/v1/delete_all_users
```

## Structure du projet

```
modern-family-tree/
├── src/
│   ├── components/          # Composants React
│   ├── pages/              # Pages de l'application
│   ├── hooks/              # Hooks personnalisés
│   ├── services/           # Services API
│   └── types/              # Types TypeScript
├── supabase/
│   └── functions/          # Edge Functions
├── docs/
│   └── cors.md            # Documentation CORS
├── scripts/
│   ├── test-cors.js       # Tests CORS
│   └── deploy-functions.js # Déploiement
└── README.md
```

## Fonctionnalités

### Authentification
- Inscription/Connexion avec Supabase Auth
- Rôles utilisateur (Membre/Administrateur)
- Code secret pour les administrateurs

### Gestion des membres
- Ajout/modification de profils
- Relations familiales
- Photos de profil

### Arbre généalogique
- Visualisation interactive
- Navigation entre les générations
- Recherche de membres

### Administration
- Suppression d'utilisateurs
- Suppression complète (admin)
- Statistiques familiales

## Déploiement

### Frontend
```sh
npm run build
npm run preview
```

### Edge Functions
```sh
supabase functions deploy --project-ref your-project-ref
```

## Documentation

- [Guide CORS](docs/cors.md) - Bonnes pratiques CORS
- [Supabase Docs](https://supabase.com/docs) - Documentation officielle
- [Edge Functions](https://supabase.com/docs/guides/functions) - Guide des fonctions

## Support

Pour toute question ou problème :
1. Consultez la [documentation CORS](docs/cors.md)
2. Vérifiez les logs des Edge Functions dans le dashboard Supabase
3. Testez avec les scripts fournis

## Licence

Ce projet est sous licence MIT.
