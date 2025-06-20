# 🧪 Test de l'authentification - Famille Connect

## ✅ Problème CORS résolu

Les tests montrent que **CORS fonctionne maintenant** :
- ✅ Test OPTIONS : 200 (succès)
- ✅ Test GET sans token : 401 (attendu)
- ✅ Access-Control-Allow-Origin: http://localhost:8080

## 🔍 Problème actuel : Authentification

Le problème n'est plus CORS mais **d'authentification**. L'utilisateur n'est pas connecté ou la session a expiré.

## 🛠️ Solutions de test

### Test 1 : Vérifier l'état de connexion

Ouvrez la console du navigateur (F12) et tapez :

```javascript
// Vérifier les variables d'environnement
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Site URL:', window.location.origin)

// Test d'authentification
const { data, error } = await supabase.auth.getUser()
console.log('Auth test:', { data, error })

// Vérifier la session
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

### Test 2 : Se connecter manuellement

1. **Allez sur** : http://localhost:8080/auth/login
2. **Connectez-vous** avec vos identifiants
3. **Vérifiez** que vous êtes redirigé vers le dashboard
4. **Testez** la page Administration

### Test 3 : Vérifier les cookies

```javascript
// Vérifier les cookies de session
console.log('Cookies:', document.cookie)

// Vérifier le localStorage
console.log('LocalStorage:', localStorage.getItem('family-tree-auth'))
```

### Test 4 : Test de l'API

```javascript
// Test de l'API de connexion
const result = await api.testConnection()
console.log('Test API:', result)
```

## 📋 Checklist de vérification

- [ ] CORS fonctionne (tests passés)
- [ ] Utilisateur connecté
- [ ] Session valide
- [ ] Profil admin chargé
- [ ] Page Administration accessible

## 🚨 Si l'authentification échoue

### Solution A : Se reconnecter
1. **Déconnectez-vous** : Cliquez sur l'avatar → Déconnexion
2. **Reconnectez-vous** : http://localhost:8080/auth/login
3. **Vérifiez** que vous êtes admin

### Solution B : Vérifier le profil admin
```javascript
// Vérifier si l'utilisateur est admin
const { data: profile } = await supabase
  .from('profiles')
  .select('is_admin')
  .eq('id', user.id)
  .single()

console.log('Est admin:', profile?.is_admin)
```

### Solution C : Créer un admin
Si aucun admin n'existe :
1. **Inscrivez-vous** avec le code admin "1432"
2. **Ou** utilisez le bouton "Delete All" puis créez un nouveau compte admin

## 🎯 Résultat attendu

Après authentification réussie :
- ✅ Page Administration accessible
- ✅ Liste des membres chargée
- ✅ Boutons d'action fonctionnels
- ✅ Test de connexion réussi

## 📞 Support

Si le problème persiste :
1. **Vérifiez les logs** dans la console
2. **Testez avec un autre navigateur**
3. **Vérifiez les extensions** de navigateur
4. **Consultez** `docs/supabase-auth-cors-fix.md`
