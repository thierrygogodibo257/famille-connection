# 🚨 RÉSOLUTION RAPIDE - Problème CORS Supabase Auth

## ❌ Problème actuel
```
Access to fetch at 'https://rrlixvlwsaeaugudwbiw.supabase.co/auth/v1/user'
from origin 'http://localhost:8081' has been blocked by CORS policy
```

## ✅ Solution immédiate

### Étape 1 : Configurer Supabase Dashboard

1. **Allez sur** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** : `rrlixvlwsaeaugudwbiw`
3. **Navigation** : `Settings` → `API`
4. **Section Auth Settings** :

#### Site URL
Ajoutez ces URLs :
```
http://localhost:5173
http://localhost:8080
http://localhost:8081
http://localhost:3000
```

#### Redirect URLs
Ajoutez ces patterns :
```
http://localhost:5173/**
http://localhost:8080/**
http://localhost:8081/**
http://localhost:3000/**
```

### Étape 2 : Tester la configuration

```bash
# Test Auth CORS
npm run test:auth-cors

# Ou test manuel
curl -X OPTIONS \
  -H "Origin: http://localhost:8081" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization,apikey,content-type" \
  https://rrlixvlwsaeaugudwbiw.supabase.co/auth/v1/user
```

### Étape 3 : Redémarrer l'application

1. **Arrêtez le serveur** (Ctrl+C)
2. **Redémarrez** : `npm run dev`
3. **Testez** : Allez sur http://localhost:8081

## 🔧 Solutions alternatives

### Solution A : Utiliser le port 5173
```bash
# Forcer le port 5173
npm run dev -- --port 5173
```

### Solution B : Configuration locale
Créez `.env.local` :
```env
VITE_SUPABASE_URL=https://rrlixvlwsaeaugudwbiw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybGl4dmx3c2FlYXVndWR3Yml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjE2NjksImV4cCI6MjA2NTI5NzY2OX0.UgOxyIqwLWH5RGMiUW7ZB7AnvblVzi2uwUbNjV44_Vk
VITE_SITE_URL=http://localhost:8081
```

### Solution C : Debug en console
```javascript
// Dans la console du navigateur
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Site URL:', window.location.origin)

// Test d'authentification
const { data, error } = await supabase.auth.getUser()
console.log('Auth test:', { data, error })
```

## 📋 Checklist de vérification

- [ ] Site URL configuré dans Supabase Dashboard
- [ ] Redirect URLs configurés
- [ ] Serveur redémarré
- [ ] Test Auth CORS réussi
- [ ] Application fonctionne sur localhost:8081

## 🆘 Si le problème persiste

1. **Vérifiez les logs** dans le dashboard Supabase
2. **Testez avec un autre navigateur**
3. **Désactivez les extensions** de navigateur
4. **Utilisez le port 5173** par défaut
5. **Contactez le support** Supabase

## 📞 Support

- **Documentation complète** : `docs/supabase-auth-cors-fix.md`
- **Scripts de test** : `npm run test:auth-cors`
- **Logs Supabase** : Dashboard → Logs
