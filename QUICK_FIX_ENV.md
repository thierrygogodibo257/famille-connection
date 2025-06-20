# 🚨 RÉSOLUTION RAPIDE - Problème .env et CORS

## ❌ Problème identifié

Le fichier `.env` contient des caractères invalides qui empêchent le déploiement des Edge Functions.

## ✅ Solution immédiate

### Étape 1 : Corriger le fichier .env

Créez un nouveau fichier `.env` avec ce contenu **exact** :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://rrlixvlwsaeaugudwbiw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybGl4dmx3c2FlYXVndWR3Yml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjE2NjksImV4cCI6MjA2NTI5NzY2OX0.UgOxyIqwLWH5RGMiUW7ZB7AnvblVzi2uwUbNjV44_Vk
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybGl4dmx3c2FlYXVndWR3Yml3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyMTY2OSwiZXhwIjoyMDY1Mjk3NjY5fQ.mF208m1Nc1F5g-zzWsUTLnnuM71Z9y6gEb89WzT5Tko

# Admin Configuration
VITE_ADMIN_PASSWORD=S2024Mano

# Site Configuration
VITE_SITE_URL=http://localhost:8080
```

### Étape 2 : Déployer les Edge Functions

```bash
# Déployer toutes les fonctions
supabase functions deploy delete_all_users
supabase functions deploy delete_user
supabase functions deploy profiles
```

### Étape 3 : Vérifier la configuration Supabase

1. **Allez sur** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** : `rrlixvlwsaeaugudwbiw`
3. **Navigation** : `Settings` → `API` → `Auth Settings`
4. **Vérifiez** que ces URLs sont dans Site URL :
   ```
   http://localhost:8080
   http://localhost:5173
   http://localhost:3000
   ```

### Étape 4 : Tester

```bash
# Test CORS Auth
npm run test:auth-cors

# Test Admin
npm run test:admin

# Test Edge Functions
npm run test:cors
```

## 🔧 Solutions alternatives

### Solution A : Utiliser le port 5173
```bash
# Forcer le port 5173
npm run dev -- --port 5173
```

### Solution B : Configuration manuelle
Si le problème persiste, ajoutez dans `.env.local` :
```env
VITE_SUPABASE_URL=https://rrlixvlwsaeaugudwbiw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybGl4dmx3c2FlYXVndWR3Yml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MjE2NjksImV4cCI6MjA2NTI5NzY2OX0.UgOxyIqwLWH5RGMiUW7ZB7AnvblVzi2uwUbNjV44_Vk
```

## 📋 Checklist de résolution

- [ ] Fichier .env corrigé
- [ ] Edge Functions déployées
- [ ] Configuration Supabase vérifiée
- [ ] Tests CORS réussis
- [ ] Application fonctionne sur localhost:8080

## 🆘 Si le problème persiste

1. **Supprimez le fichier .env** et recréez-le
2. **Redémarrez le serveur** : `npm run dev`
3. **Vérifiez les logs** dans la console
4. **Testez avec un autre navigateur**

## 📞 Support

- **Documentation CORS** : `docs/supabase-auth-cors-fix.md`
- **Tests automatisés** : `npm run test:auth-cors`
- **Logs Supabase** : Dashboard → Logs
