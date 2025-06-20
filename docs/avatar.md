# Documentation - Composant UserAvatar

## Vue d'ensemble

Le composant `UserAvatar` est un composant réutilisable qui standardise l'affichage des images de profil dans toute l'application. Il gère intelligemment la priorité entre `avatar_url` et `photo_url`, avec un fallback approprié basé sur les initiales de l'utilisateur.

## Localisation

```
src/components/shared/UserAvatar.tsx
```

## Fonctionnalités

### Priorité des images
1. **avatar_url** (priorité haute)
2. **photo_url** (priorité basse)
3. **Initiales** (fallback automatique)

### Tailles disponibles
- `sm` : Petite taille (24px)
- `md` : Taille moyenne (32px) - par défaut
- `lg` : Grande taille (48px)
- `xl` : Très grande taille (64px)

### Indicateur de statut
- Affichage optionnel d'un indicateur de statut en ligne/hors ligne
- Animation de pulsation pour le statut en ligne

## Interface TypeScript

```typescript
interface UserAvatarProps {
  user: {
    avatar_url?: string | null;
    photo_url?: string | null;
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  isOnline?: boolean;
}
```

## Utilisation

### Import
```typescript
import { UserAvatar } from '@/components/shared/UserAvatar';
```

### Exemple de base
```typescript
<UserAvatar
  user={userProfile}
  size="md"
  className="ring-2 ring-white/20"
/>
```

### Avec indicateur de statut
```typescript
<UserAvatar
  user={userProfile}
  size="lg"
  showStatus={true}
  isOnline={true}
  className="w-32 h-32"
/>
```

## Implémentation dans le projet

### 1. Header (`src/components/shared/Header.tsx`)
- Affichage de l'avatar utilisateur dans le menu déroulant
- Récupération du profil complet via `api.profiles.getCurrent()`
- Indicateur de statut en ligne

### 2. Dashboard (`src/pages/dashboard/index.tsx`)
- Carte profil utilisateur avec avatar large
- Récupération du profil complet pour affichage cohérent

### 3. Page Profile (`src/pages/dashboard/Profile.tsx`)
- Avatar extra-large pour la page de profil
- Gestion de l'upload de photo avec mise à jour des deux champs (`avatar_url` et `photo_url`)

### 4. Arbre Familial (`src/components/family/FamilyNode.tsx`)
- Nœuds de l'arbre familial avec avatars
- Support des données utilisateur complètes

### 5. Arbre Interactif (`src/components/family/InteractiveFamilyTree.tsx`)
- Nœuds de l'arbre familial interactif avec avatars
- Intégration dans la bibliothèque react-d3-tree
- Support des données utilisateur complètes dans les nœuds

### 6. Cartes Membres (`src/components/family/MemberCard.tsx`)
- Affichage des membres avec avatars
- Variantes compacte et détaillée

## Migration des données

### Structure de données attendue
```typescript
interface UserData {
  avatar_url?: string | null;  // URL de l'avatar (priorité haute)
  photo_url?: string | null;   // URL de la photo (priorité basse)
  first_name?: string;         // Prénom pour les initiales
  last_name?: string;          // Nom pour les initiales
  email?: string;              // Email pour le fallback
}
```

### Conversion des données existantes
Pour les composants qui utilisaient l'ancien système :

```typescript
// Ancien système
<Avatar
  src={user.photo_url}
  fallback={getInitials(user.first_name, user.last_name)}
  size="md"
/>

// Nouveau système
<UserAvatar
  user={user}
  size="md"
/>
```

## Gestion des erreurs

### Fallback automatique
1. Si `avatar_url` existe → utilise `avatar_url`
2. Si `avatar_url` n'existe pas mais `photo_url` existe → utilise `photo_url`
3. Si aucune image n'existe → génère les initiales automatiquement

### Génération des initiales
- Utilise `first_name` et `last_name` si disponibles
- Utilise `email` si les noms ne sont pas disponibles
- Limite à 2 caractères maximum
- Conversion en majuscules automatique

## Avantages

### 1. Cohérence
- Affichage uniforme dans toute l'application
- Gestion centralisée de la logique d'avatar

### 2. Flexibilité
- Support de multiples sources d'images
- Fallback intelligent
- Personnalisation via props

### 3. Performance
- Pas de duplication de logique
- Composant optimisé et réutilisable

### 4. Maintenabilité
- Code centralisé et documenté
- Facile à modifier et étendre

## Bonnes pratiques

### 1. Récupération des données
```typescript
// Toujours récupérer le profil complet
const userProfile = await api.profiles.getCurrent();
```

### 2. Gestion des erreurs
```typescript
try {
  const profile = await api.profiles.getCurrent();
  setUserProfile(profile);
} catch (error) {
  // Fallback vers les métadonnées utilisateur
  setUserProfile({
    first_name: user.user_metadata?.first_name,
    last_name: user.user_metadata?.last_name,
    avatar_url: user.user_metadata?.photo_url,
    photo_url: user.user_metadata?.photo_url,
    email: user.email
  });
}
```

### 3. Upload d'images
```typescript
// Mettre à jour les deux champs pour la compatibilité
const updatedProfile = await api.profiles.update(profile.id, {
  avatar_url: newImageUrl,
  photo_url: newImageUrl,
  updated_at: new Date().toISOString(),
});
```

### 4. Intégration avec react-d3-tree
```typescript
// Pour les nœuds d'arbre familial
const userData = {
  avatar_url: nodeDatum.avatar_url || nodeDatum.photoUrl,
  photo_url: nodeDatum.photo_url || nodeDatum.photoUrl,
  first_name: nodeDatum.first_name || nodeDatum.name.split(' ')[0],
  last_name: nodeDatum.last_name || nodeDatum.name.split(' ').slice(1).join(' '),
  email: nodeDatum.email || ''
};

<UserAvatar
  user={userData}
  size="lg"
  className="ring-4 ring-white/50"
/>
```

## Migration complète

Tous les composants suivants ont été migrés vers `UserAvatar` :

- ✅ Header
- ✅ Dashboard
- ✅ Page Profile
- ✅ FamilyNode (Arbre familial)
- ✅ InteractiveFamilyTree (Arbre interactif)
- ✅ MemberCard (Cartes membres)

## Tests recommandés

1. **Test avec avatar_url uniquement**
2. **Test avec photo_url uniquement**
3. **Test sans image (fallback initiales)**
4. **Test avec données incomplètes**
5. **Test des différentes tailles**
6. **Test de l'indicateur de statut**
7. **Test dans l'arbre familial interactif**

## Évolutions futures

- Support des images SVG
- Lazy loading des images
- Cache des avatars
- Support des avatars animés (GIF)
- Intégration avec des services d'avatar (Gravatar, etc.)
