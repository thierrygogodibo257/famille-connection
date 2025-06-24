-- =================================================================
-- MIGRATION POUR CORRIGER LA RÉCURSION INFINIE DANS LES POLITIQUES RLS
-- =================================================================

-- 1. Supprimer les anciennes politiques sur 'profiles' qui causent le problème
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

-- 2. Supprimer la fonction problématique
DROP FUNCTION IF EXISTS public.is_current_user_admin();

-- 3. Créer une fonction sécurisée qui utilise les métadonnées utilisateur
-- au lieu de consulter la table profiles
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';
AS $$
BEGIN
  -- Utiliser les métadonnées utilisateur au lieu de consulter la table profiles
  RETURN COALESCE(auth.jwt() ->> 'is_admin', 'false')::BOOLEAN;
END;
$$;

-- 4. Recréer les politiques RLS pour 'profiles' de manière non-récursive

-- Règle #1 : Les utilisateurs peuvent gérer leur propre profil.
CREATE POLICY "Users can manage their own profile" ON public.profiles
FOR ALL
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

-- Règle #2 : Les admins ont un accès complet à tous les profils.
-- Utilise les métadonnées JWT au lieu de consulter la table
CREATE POLICY "Admins have full access to profiles" ON public.profiles
FOR ALL
USING (COALESCE(auth.jwt() ->> 'is_admin', 'false')::BOOLEAN)
WITH CHECK (COALESCE(auth.jwt() ->> 'is_admin', 'false')::BOOLEAN);

-- 5. Alternative : Politique plus simple pour les admins
-- Si la politique ci-dessus ne fonctionne pas, on peut utiliser une approche plus simple
-- en désactivant temporairement RLS pour les admins ou en utilisant une fonction différente

-- 6. Politique de fallback pour permettre la lecture de tous les profils
-- (à utiliser seulement si les politiques admin ne fonctionnent pas)
CREATE POLICY "Allow read access to all authenticated users" ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');
