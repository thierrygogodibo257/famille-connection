# 🚨 SOLUTIONS CORS - Problème persistant

## ❌ Problème actuel

Le problème CORS persiste malgré la configuration. Voici plusieurs solutions alternatives :

## 🔧 Solution 1 : Proxy CORS public (Recommandée)

### Étape 1 : Installer les dépendances
```bash
npm install express cors http-proxy-middleware
```

### Étape 2 : Lancer le proxy local
```bash
node scripts/cors-proxy.js
```

### Étape 3 : Modifier l'URL Supabase temporairement
Dans `.env.local` ou `.env` :
```env
VITE_SUPABASE_URL=http://localhost:3001
```

## 🔧 Solution 2 : Utiliser un proxy public

Modifiez temporairement `src/integrations/supabase/client.ts` :

```typescript
// URL temporaire avec proxy CORS
const SUPABASE_URL = "https://cors-anywhere.herokuapp.com/https://rrlixvlwsaeaugudwbiw.supabase.co";
```

## 🔧 Solution 3 : Configuration alternative Supabase

### Étape 1 : Vérifier la configuration
1. **Allez sur** : https://supabase.com/dashboard
2. **Projet** : `rrlixvlwsaeaugudwbiw`
3. **Settings** → `API` → `Auth Settings`
4. **Site URL** : Ajoutez `http://localhost:8080`
5. **Redirect URLs** : Ajoutez `http://localhost:8080/**`

### Étape 2 : Vider le cache
```bash
# Vider le cache du navigateur
# Ou utiliser un autre navigateur
# Ou mode navigation privée
```

## 🔧 Solution 4 : Utiliser le port 5173

```bash
# Forcer le port 5173
npm run dev -- --port 5173
```

Puis ajoutez `http://localhost:5173` dans Supabase Dashboard.

## 🔧 Solution 5 : Configuration de développement

Créez `.env.development` :
```env
VITE_SUPABASE_URL=https://rrlixvlwsaeaugudwbiw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybGl4dmx3c2FlYXVndWR3Yml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjE2NjksImV4cCI6MjA2NTI5NzY2OX0.UgOxyIqwLWH5RGMiUW7ZB7AnvblVzi2uwUbNjV44_Vk
VITE_DEV_MODE=true
```

## 🧪 Tests de validation

### Test 1 : Vérifier la configuration
```javascript
// Dans la console du navigateur
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Origin:', window.location.origin)
```

### Test 2 : Test d'authentification
```javascript
// Test simple
const { data, error } = await supabase.auth.getUser()
console.log('Auth test:', { data, error })
```

### Test 3 : Test avec curl
```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization,apikey,content-type" \
  https://rrlixvlwsaeaugudwbiw.supabase.co/auth/v1/user
```

## 📋 Checklist de résolution

- [ ] Configuration Supabase vérifiée
- [ ] Cache navigateur vidé
- [ ] Proxy local ou public configuré
- [ ] Tests de validation réussis
- [ ] Application fonctionne

## 🆘 Solutions d'urgence

### Solution A : Mode développement simplifié
Désactivez temporairement l'authentification pour tester l'application.

### Solution B : Utiliser un autre projet Supabase
Créez un nouveau projet Supabase avec la configuration CORS correcte.

### Solution C : Déploiement en production
Testez sur un domaine en production où CORS fonctionne.

## 📞 Support

- **Documentation CORS** : `docs/supabase-auth-cors-fix.md`
- **Scripts de test** : `npm run test:auth-cors`
- **Proxy local** : `node scripts/cors-proxy.js`
- **Logs Supabase** : Dashboard → Logs
