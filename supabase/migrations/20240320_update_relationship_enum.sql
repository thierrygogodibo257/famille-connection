-- Migration pour créer l'enum relationship_type avec toutes les valeurs nécessaires
-- Suivant le guide de bonnes pratiques

-- 1. Recrée l'enum avec toutes les valeurs nécessaires
DROP TYPE IF EXISTS relationship_type CASCADE;
CREATE TYPE relationship_type AS ENUM (
  'fils', 'fille',
  'père', 'mère',
  'cousin', 'cousine',
  'tante', 'oncle',
  'neveu', 'nièce',
  'petit-fils', 'petite-fille',
  'grand-père', 'grande-mère',
  'époux', 'épouse',
  'patriarche'
);

-- 2. Met à jour la colonne pour utiliser le nouvel enum
ALTER TABLE profiles
  ALTER COLUMN relationship_type TYPE relationship_type
  USING relationship_type::relationship_type;

-- 3. Met à jour les valeurs existantes pour correspondre aux nouvelles
UPDATE profiles
SET relationship_type = 'époux'::relationship_type
WHERE relationship_type = 'époux/épouse';

UPDATE profiles
SET relationship_type = 'fils'::relationship_type
WHERE relationship_type = 'fils/fille';

UPDATE profiles
SET relationship_type = 'petit-fils'::relationship_type
WHERE relationship_type = 'petit-fils/petite-fille';

UPDATE profiles
SET relationship_type = 'cousin'::relationship_type
WHERE relationship_type = 'cousin/cousine';

UPDATE profiles
SET relationship_type = 'neveu'::relationship_type
WHERE relationship_type = 'neveux/nièce';

UPDATE profiles
SET relationship_type = 'oncle'::relationship_type
WHERE relationship_type = 'oncle/tante';

-- 4. Vérifie les valeurs valides de l'enum
DO $$
BEGIN
  RAISE NOTICE 'Valeurs valides de relationship_type: %',
    (SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder)
     FROM pg_enum
     WHERE enumtypid = 'relationship_type'::regtype);
END $$;
