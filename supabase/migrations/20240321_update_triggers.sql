-- Mettre à jour les triggers existants pour utiliser profile_id au lieu de member_id

-- 1. Désactiver temporairement les triggers existants
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Désactiver tous les triggers sur la table profiles
    FOR trigger_record IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'profiles'
    LOOP
        EXECUTE format('ALTER TABLE profiles DISABLE TRIGGER %I', trigger_record.trigger_name);
    END LOOP;
END $$;

-- 2. Supprimer les anciens triggers qui utilisent member_id
DROP TRIGGER IF EXISTS trigger_profiles_family_members ON profiles;
DROP TRIGGER IF EXISTS trigger_family_members_insert ON profiles;
DROP TRIGGER IF EXISTS trigger_family_members_update ON profiles;

-- 3. Supprimer les anciennes fonctions
DROP FUNCTION IF EXISTS handle_profiles_family_members() CASCADE;
DROP FUNCTION IF EXISTS handle_family_members_insert() CASCADE;
DROP FUNCTION IF EXISTS handle_family_members_update() CASCADE;

-- 4. Créer une nouvelle fonction pour gérer l'insertion automatique dans family_members
CREATE OR REPLACE FUNCTION handle_profile_family_members()
RETURNS TRIGGER AS $$
DECLARE
    family_tree_id INTEGER;
BEGIN
    -- Trouver ou créer un arbre familial
    SELECT id INTO family_tree_id
    FROM family_trees
    LIMIT 1;

    IF family_tree_id IS NULL THEN
        -- Créer un nouvel arbre familial si aucun n'existe
        INSERT INTO family_trees (name, created_by)
        VALUES ('Arbre Familial Principal', NEW.id)
        RETURNING id INTO family_tree_id;
    END IF;

    -- Insérer dans family_members avec profile_id (pas member_id)
    INSERT INTO family_members (profile_id, tree_id, role, created_at, updated_at)
    VALUES (
        NEW.id,  -- profile_id
        family_tree_id,
        COALESCE(NEW.relationship_type, 'membre'),
        NOW(),
        NOW()
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne pas faire échouer l'insertion du profil
        RAISE WARNING 'Erreur lors de l''insertion dans family_members: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer le nouveau trigger
CREATE TRIGGER trigger_profile_family_members
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_profile_family_members();

-- 6. Réactiver les autres triggers si nécessaire
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'profiles'
        AND trigger_name != 'trigger_profile_family_members'
    LOOP
        EXECUTE format('ALTER TABLE profiles ENABLE TRIGGER %I', trigger_record.trigger_name);
    END LOOP;
END $$;
