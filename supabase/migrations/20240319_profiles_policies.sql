-- Supprime les politiques existantes pour profiles
DROP POLICY IF EXISTS "Permettre la lecture des profils pour tous" ON public.profiles;

-- Politique pour la lecture des profils
CREATE POLICY "Lecture des profils authentifiés" ON public.profiles
FOR SELECT USING (
  -- Permet la lecture pour :
  -- 1. Les utilisateurs authentifiés
  -- 2. Les utilisateurs non authentifiés pendant l'inscription (pour la recherche de membres)
  auth.role() = 'authenticated' OR
  (auth.role() = 'anon' AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
  ))
);

-- Politique pour la création de profil
CREATE POLICY "Création de profil pour soi-même" ON public.profiles
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Politique pour la mise à jour de profil
CREATE POLICY "Mise à jour de son propre profil" ON public.profiles
FOR UPDATE USING (
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);

-- Politique pour la suppression de profil
CREATE POLICY "Suppression de son propre profil" ON public.profiles
FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND is_admin = true
  )
);

-- Active RLS sur la table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Accorde les privilèges nécessaires
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
