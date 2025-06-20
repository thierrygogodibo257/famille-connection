-- 1. Recrée l'enum avec toutes les valeurs nécessaires
DROP TYPE IF EXISTS relationship_enum CASCADE;
CREATE TYPE relationship_enum AS ENUM (
  'fils',
  'petit-fils',
  'cousin',
  'neveux',
  'oncle',
  'époux',
  'patriarche'
);

-- 2. Vérifie le nom actuel de la colonne
DO $$
DECLARE
  column_name text;
BEGIN
  SELECT column_name INTO STRICT column_name
  FROM information_schema.columns
  WHERE table_name = 'profiles'
    AND column_name IN ('relationship', 'relationship_type');

  IF column_name = 'relationship' THEN
    -- Si la colonne s'appelle 'relationship', la renommer en 'relationship_type'
    EXECUTE 'ALTER TABLE profiles RENAME COLUMN relationship TO relationship_type';
  END IF;
END $$;

-- 3. Met à jour la colonne pour utiliser le nouvel enum
ALTER TABLE profiles
  ALTER COLUMN relationship_type TYPE relationship_enum
  USING relationship_type::relationship_enum;

-- 4. Ajoute une contrainte NOT NULL
ALTER TABLE profiles
  ALTER COLUMN relationship_type SET NOT NULL;

-- 5. Vérifie les valeurs valides de l'enum
DO $$
BEGIN
  RAISE NOTICE 'Valeurs valides de relationship_enum: %',
    (SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder)
     FROM pg_enum
     WHERE enumtypid = 'relationship_enum'::regtype);
END $$;
