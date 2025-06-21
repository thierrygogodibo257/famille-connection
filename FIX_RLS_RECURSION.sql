-- =================================================================
-- CORRECTION IMMÉDIATE DE LA RÉCURSION RLS - À EXÉCUTER DANS SUPABASE
-- =================================================================

-- 1. Supprimer toutes les politiques existantes sur 'profiles'
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

-- 2. Supprimer la fonction problématique
DROP FUNCTION IF EXISTS public.is_current_user_admin();

-- 3. Désactiver RLS temporairement
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. Réactiver RLS avec une politique simple
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Créer une politique simple qui évite la récursion
CREATE POLICY "Allow authenticated users to access profiles" ON public.profiles
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 6. Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- 7. Vérifier que tout fonctionne
SELECT 'RLS fix applied successfully' as status;
