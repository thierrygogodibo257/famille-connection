-- Ajouter les colonnes manquantes pour les relations
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS spouse_id TEXT,
ADD COLUMN IF NOT EXISTS father_id TEXT,
ADD COLUMN IF NOT EXISTS mother_id TEXT;

-- Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN profiles.spouse_id IS 'Nom du conjoint (pour les époux)';
COMMENT ON COLUMN profiles.father_id IS 'Nom du père (pour les fils)';
COMMENT ON COLUMN profiles.mother_id IS 'Nom de la mère';

-- Vérifier que les colonnes ont été ajoutées
DO $$
BEGIN
  RAISE NOTICE 'Colonnes ajoutées à la table profiles:';
  RAISE NOTICE '- spouse_id: %', (SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'spouse_id');
  RAISE NOTICE '- father_id: %', (SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'father_id');
  RAISE NOTICE '- mother_id: %', (SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'mother_id');
END $$;
