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


-- 2. Créer une fonction sécurisée pour vérifier le statut d'admin
-- Cette fonction utilise 'SECURITY DEFINER' pour s'exécuter avec des droits élevés,
-- ce qui lui permet de consulter la table 'profiles' sans redéclencher les politiques RLS.
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
-- 'search_path' est une mesure de sécurité pour éviter des attaques
SET search_path = '';
AS $$
DECLARE
  is_admin_status BOOLEAN;
BEGIN
  SELECT p.is_admin INTO is_admin_status
  FROM public.profiles p
  WHERE p.user_id = auth.uid();

  RETURN COALESCE(is_admin_status, false);
END;
$$;


-- 3. Recréer les politiques RLS pour 'profiles' de manière non-récursive

-- Règle #1 : Les utilisateurs peuvent gérer leur propre profil.
CREATE POLICY "Users can manage their own profile" ON public.profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Règle #2 : Les admins ont un accès complet à tous les profils.
-- Elle utilise notre nouvelle fonction sécurisée pour éviter la récursion.
CREATE POLICY "Admins have full access to profiles" ON public.profiles
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());
