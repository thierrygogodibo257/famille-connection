-- =================================================================
-- MIGRATION FINALE POUR CORRIGER LA RÉCURSION INFINIE RLS
-- =================================================================

-- 1. Supprimer toutes les politiques existantes sur profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON public.profiles;

-- 2. Supprimer la fonction problématique
DROP FUNCTION IF EXISTS public.is_current_user_admin();

-- 3. Solution simple : Politiques RLS basiques sans récursion
-- Politique pour permettre aux utilisateurs de voir et modifier leur propre profil
CREATE POLICY "users_can_manage_own_profile" ON public.profiles
FOR ALL
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

-- Politique pour permettre aux utilisateurs authentifiés de voir tous les profils
-- (nécessaire pour les fonctionnalités comme l'arbre familial)
CREATE POLICY "authenticated_users_can_view_profiles" ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Politique pour permettre l'insertion de nouveaux profils
CREATE POLICY "users_can_insert_own_profile" ON public.profiles
FOR INSERT
WITH CHECK (auth.uid()::text = id);

-- 4. Alternative : Désactiver temporairement RLS si les problèmes persistent
-- Décommentez la ligne suivante si les politiques ci-dessus ne fonctionnent pas
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 5. Vérifier que RLS est activé
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
