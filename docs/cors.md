# Guide CORS pour Famille Connect

## Vue d'ensemble

Ce document résume les bonnes pratiques CORS (Cross-Origin Resource Sharing) pour notre application Famille Connect, basée sur les changements de Supabase depuis 2025.

## Points clés

### 1. API REST Supabase (PostgREST)
- ✅ **Gestion automatique** : Les en-têtes CORS sont définis automatiquement
- ✅ **Fonctionne généralement** si :
  - Domaine frontend en HTTPS
  - En-têtes standards (Content-Type, Authorization)
  - Pas de `withCredentials` ou requêtes complexes

### 2. Edge Functions Supabase
- ❌ **Gestion manuelle requise** : Nous devons définir les en-têtes CORS
- ✅ **Pattern obligatoire** : Gérer les requêtes OPTIONS et ajouter les en-têtes appropriés

### 3. Contrôle avancé
- 🔧 **Proxy recommandé** : Cloudflare Workers, Vercel Edge, AWS CloudFront
- 🔒 **Sécurité** : Remplacer `*` par le domaine spécifique en production

## Implémentation dans notre projet

### Pattern pour toutes nos Edge Functions

```typescript
// supabase/functions/example/index.ts
export default async function handler(req: Request) {
  // 1. Gestion des requêtes OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*", // Remplacer par votre domaine en prod
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-secret-key",
      },
    })
  }

  // 2. Logique de la fonction
  try {
    // ... votre code ici ...

    // 3. Réponse avec en-têtes CORS
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  }
}
```

### En-têtes spécifiques pour notre projet

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // À remplacer par votre domaine
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-secret-key",
  "Content-Type": "application/json",
}
```

## Edge Functions à vérifier/corriger

1. `supabase/functions/delete_all_users/index.ts`
2. `supabase/functions/delete_user/index.ts`
3. `supabase/functions/profiles/index.ts`

## Tests CORS

### Vérification dans le navigateur
```javascript
// Test depuis la console du navigateur
fetch('https://your-project.supabase.co/functions/v1/delete_all_users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token',
    'x-secret-key': 'your-secret'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('CORS Error:', error))
```

### Test avec curl
```bash
# Test preflight
curl -X OPTIONS \
  -H "Origin: https://your-frontend.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  https://your-project.supabase.co/functions/v1/delete_all_users

# Test réel
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -H "x-secret-key: your-secret" \
  https://your-project.supabase.co/functions/v1/delete_all_users
```

## Checklist de déploiement

- [ ] Toutes les Edge Functions ont la gestion OPTIONS
- [ ] En-têtes CORS ajoutés à toutes les réponses
- [ ] Tests CORS effectués en développement
- [ ] Domaine spécifique configuré pour la production
- [ ] Gestion d'erreurs avec en-têtes CORS

## Ressources

- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Cloudflare Workers CORS](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)
