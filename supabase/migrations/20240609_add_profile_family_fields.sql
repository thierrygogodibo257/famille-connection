-- Ajout des champs familiaux et de profil avancé pour la table profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS civility text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_radio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliation text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliated_member jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parent_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_parent boolean;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS father_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mother_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profession text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url text;
-- Harmonisation : on garde avatar_url comme champ principal pour la photo
-- Les autres champs déjà existants sont conservés
