-- Fonction pour créer un profil sans déclencher les triggers automatiques
CREATE OR REPLACE FUNCTION create_profile_safe(
    p_id UUID,
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT DEFAULT NULL,
    p_current_location TEXT DEFAULT NULL,
    p_birth_place TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_relationship_type TEXT DEFAULT NULL,
    p_father_id UUID DEFAULT NULL,
    p_mother_id UUID DEFAULT NULL,
    p_is_admin BOOLEAN DEFAULT FALSE,
    p_birth_date DATE DEFAULT NULL,
    p_title TEXT DEFAULT NULL,
    p_situation TEXT DEFAULT NULL,
    p_is_patriarch BOOLEAN DEFAULT FALSE
) RETURNS JSON AS $$
DECLARE
    new_profile profiles%ROWTYPE;
BEGIN
    -- Insérer directement dans profiles sans déclencher les triggers
    INSERT INTO profiles (
        id,
        email,
        first_name,
        last_name,
        phone,
        current_location,
        birth_place,
        avatar_url,
        relationship_type,
        father_id,
        mother_id,
        is_admin,
        birth_date,
        title,
        situation,
        is_patriarch,
        created_at,
        updated_at
    ) VALUES (
        p_id,
        p_email,
        p_first_name,
        p_last_name,
        p_phone,
        p_current_location,
        p_birth_place,
        p_avatar_url,
        p_relationship_type,
        p_father_id,
        p_mother_id,
        p_is_admin,
        p_birth_date,
        p_title,
        p_situation,
        p_is_patriarch,
        NOW(),
        NOW()
    ) RETURNING * INTO new_profile;

    RETURN json_build_object(
        'success', true,
        'profile', row_to_json(new_profile)
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION create_profile_safe(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, UUID, BOOLEAN, DATE, TEXT, TEXT, BOOLEAN) TO authenticated;
