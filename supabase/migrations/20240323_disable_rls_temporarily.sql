-- =================================================================
-- MIGRATION TEMPORAIRE POUR DÉSACTIVER RLS SUR PROFILES
-- =================================================================

-- Désactiver temporairement RLS sur la table profiles pour éviter la récursion infinie
-- Cette migration sera remplacée par une solution plus robuste plus tard

-- 1. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow read access to all authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "users_can_manage_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_can_view_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.profiles;

-- 2. Supprimer la fonction problématique
DROP FUNCTION IF EXISTS public.is_current_user_admin();

-- 3. Désactiver RLS temporairement
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. Créer une politique simple pour les utilisateurs authentifiés
-- (sera appliquée quand RLS sera réactivé)
-- CREATE POLICY "simple_authenticated_access" ON public.profiles
-- FOR ALL
-- USING (auth.role() = 'authenticated')
-- WITH CHECK (auth.role() = 'authenticated');
