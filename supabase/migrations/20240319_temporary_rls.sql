-- Désactiver temporairement toutes les politiques existantes
DROP POLICY IF EXISTS "Lecture des profils authentifiés" ON public.profiles;
DROP POLICY IF EXISTS "Création de profil pour soi-même" ON public.profiles;
DROP POLICY IF EXISTS "Mise à jour de son propre profil" ON public.profiles;
DROP POLICY IF EXISTS "Suppression de son propre profil" ON public.profiles;

-- Créer une politique temporaire permissive pour les tests
CREATE POLICY "Politique temporaire de test" ON public.profiles
FOR ALL USING (true)
WITH CHECK (true);

-- Activer RLS mais avec une politique permissive
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Accorder tous les privilèges pour les tests
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;

-- Log pour vérifier
DO $$
BEGIN
    RAISE NOTICE 'Politiques RLS temporaires mises en place pour les tests';
END $$;
