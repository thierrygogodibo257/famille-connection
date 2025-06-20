
# Famille Connection

Une application moderne pour connecter les familles, créer des arbres généalogiques et partager des souvenirs.

## 🚀 Technologies utilisées

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase
- **Validation:** Zod + React Hook Form
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **State Management:** TanStack Query

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

1. Configurez votre instance Supabase
2. Ajoutez vos variables d'environnement dans `.env`
3. Lancez le projet en développement

```bash
npm run dev
```

## 🏗️ Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── auth/           # Composants d'authentification
│   ├── family/         # Composants famille
│   ├── layout/         # Composants de mise en page
│   ├── shared/         # Composants partagés
│   └── ui/             # Composants UI de base
├── hooks/              # Hooks personnalisés
├── integrations/       # Intégrations externes
├── lib/                # Utilitaires et configurations
├── pages/              # Pages de l'application
├── services/           # Services API
└── types/              # Types TypeScript
```

## 🔒 Sécurité

Ce projet utilise Supabase pour l'authentification et la gestion des données avec des politiques de sécurité au niveau des lignes (RLS).

## 📝 Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run lint` - Vérifie la qualité du code
- `npm run test:cors` - Teste la configuration CORS

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez consulter les guidelines de contribution.

## 📄 Licence

Ce projet est sous licence MIT.
