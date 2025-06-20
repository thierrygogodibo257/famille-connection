# 🚨 MIGRATION URGENTE - Fonction RPC Manquante

## Problème
L'erreur 404 indique que la fonction RPC `create_profile_safe` n'existe pas dans votre base de données Supabase.

## Solution Immédiate

### 1. Accédez à votre Dashboard Supabase
- Allez sur https://supabase.com/dashboard
- Sélectionnez votre projet
- Allez dans l'onglet "SQL Editor"

### 2. Exécutez cette migration SQL

```sql
-- Ajouter 'Matriarche' à l'enum family_title
ALTER TYPE family_title ADD VALUE IF NOT EXISTS 'Matriarche';

-- Ajouter 'matriarche' à l'enum relationship_type
ALTER TYPE relationship_type ADD VALUE IF NOT EXISTS 'matriarche';

-- Créer la fonction create_profile_safe
CREATE OR REPLACE FUNCTION public.create_profile_safe(
    p_id UUID,
    p_user_id UUID,
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT DEFAULT NULL,
    p_profession TEXT DEFAULT NULL,
    p_current_location TEXT DEFAULT NULL,
    p_birth_place TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_photo_url TEXT DEFAULT NULL,
    p_relationship_type public.relationship_type DEFAULT NULL,
    p_father_name TEXT DEFAULT NULL,
    p_mother_name TEXT DEFAULT NULL,
    p_is_admin BOOLEAN DEFAULT FALSE,
    p_birth_date DATE DEFAULT NULL,
    p_title public.family_title DEFAULT NULL,
    p_situation TEXT DEFAULT NULL,
    p_is_patriarch BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
    new_profile public.profiles%ROWTYPE;
BEGIN
    -- Désactiver le trigger temporairement
    ALTER TABLE public.profiles DISABLE TRIGGER trigger_new_profile;

    INSERT INTO public.profiles (
        id, user_id, email, first_name, last_name, phone, profession,
        current_location, birth_place, avatar_url, photo_url,
        relationship_type, father_name, mother_name, is_admin,
        birth_date, title, situation, is_patriarch
    ) VALUES (
        p_id, p_user_id, p_email, p_first_name, p_last_name, p_phone, p_profession,
        p_current_location, p_birth_place, p_avatar_url, p_photo_url,
        p_relationship_type, p_father_name, p_mother_name, p_is_admin,
        p_birth_date, p_title, p_situation, p_is_patriarch
    ) RETURNING * INTO new_profile;

    -- Réactiver le trigger
    ALTER TABLE public.profiles ENABLE TRIGGER trigger_new_profile;

    RETURN json_build_object(
        'success', true,
        'profile', row_to_json(new_profile)
    );
EXCEPTION
    WHEN OTHERS THEN
        -- S'assurer de réactiver le trigger en cas d'erreur
        ALTER TABLE public.profiles ENABLE TRIGGER trigger_new_profile;
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions
GRANT EXECUTE ON FUNCTION public.create_profile_safe(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, public.relationship_type, TEXT, TEXT, BOOLEAN, DATE, public.family_title, TEXT, BOOLEAN) TO authenticated;
```

### 3. Vérification
Après avoir exécuté le SQL, testez à nouveau l'inscription. L'erreur 404 devrait disparaître.

## Alternative Temporaire
Si vous préférez une solution plus simple temporairement, vous pouvez aussi désactiver RLS sur la table profiles :

```sql
-- Solution temporaire : désactiver RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

## Note
Cette migration ajoute le support pour les matriarches et crée la fonction RPC manquante. Une fois exécutée, l'inscription devrait fonctionner correctement.
