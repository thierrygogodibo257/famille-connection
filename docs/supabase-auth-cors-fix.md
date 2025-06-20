# Résolution du problème CORS Supabase Auth

## 🚨 Problème identifié

L'erreur CORS vient de l'API Auth de Supabase (`/auth/v1/user`), pas de nos Edge Functions.

**Erreur** :
```
Access to fetch at 'https://rrlixvlwsaeaugudwbiw.supabase.co/auth/v1/user'
from origin 'http://localhost:8081' has been blocked by CORS policy
```

## 🔧 Solutions

### Solution 1 : Configuration Supabase Dashboard (Recommandée)

1. **Accéder au Dashboard Supabase**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Configurer les origines autorisées**
   - Navigation : `Settings` → `API`
   - Section : `Auth Settings`
   - Ajoutez ces URLs dans `Site URL` :
     ```
     http://localhost:5173
     http://localhost:8080
     http://localhost:8081
     http://localhost:3000
     https://your-production-domain.com
     ```

3. **Configurer les redirects**
   - Section : `URL Configuration`
   - Ajoutez dans `Redirect URLs` :
     ```
     http://localhost:5173/**
     http://localhost:8080/**
     http://localhost:8081/**
     http://localhost:3000/**
     https://your-production-domain.com/**
     ```

### Solution 2 : Variables d'environnement locales

Créez/modifiez `.env.local` :

```env
VITE_SUPABASE_URL=https://rrlixvlwsaeaugudwbiw.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SITE_URL=http://localhost:8081
```

### Solution 3 : Configuration client Supabase

Modifiez `src/integrations/supabase/client.ts` :

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Ajouter ces options pour le développement
    debug: import.meta.env.DEV,
  },
  global: {
    headers: {
      'X-Client-Info': 'famille-connect-web',
    },
  },
})
```

### Solution 4 : Script de test de connectivité

```bash
# Test de connectivité Auth
curl -X GET \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  "https://rrlixvlwsaeaugudwbiw.supabase.co/auth/v1/user"
```

## 🧪 Tests de validation

### Test 1 : Vérifier la configuration
```javascript
// Dans la console du navigateur
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Site URL:', window.location.origin)
```

### Test 2 : Test d'authentification
```javascript
// Test simple d'authentification
const { data, error } = await supabase.auth.getUser()
console.log('Auth test:', { data, error })
```

### Test 3 : Test de session
```javascript
// Vérifier la session
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

## 🚀 Déploiement en production

Pour la production, assurez-vous d'ajouter votre domaine dans Supabase :

1. **Site URL** : `https://your-domain.com`
2. **Redirect URLs** : `https://your-domain.com/**`
3. **CORS Origins** : `https://your-domain.com`

## 📋 Checklist de résolution

- [ ] Configurer les origines dans Supabase Dashboard
- [ ] Ajouter les redirects appropriés
- [ ] Vérifier les variables d'environnement
- [ ] Tester l'authentification
- [ ] Vérifier la session utilisateur
- [ ] Tester en production

## 🔍 Debugging avancé

### Logs détaillés
```typescript
// Activer les logs de debug
const supabase = createClient(url, key, {
  auth: {
    debug: true,
    logger: (level, message, data) => {
      console.log(`[${level}] ${message}`, data)
    }
  }
})
```

### Vérification des cookies
```javascript
// Vérifier les cookies de session
console.log('Cookies:', document.cookie)
```

## 📞 Support

Si le problème persiste :
1. Vérifiez les logs dans le dashboard Supabase
2. Testez avec un autre navigateur
3. Vérifiez les extensions de navigateur
4. Contactez le support Supabase
