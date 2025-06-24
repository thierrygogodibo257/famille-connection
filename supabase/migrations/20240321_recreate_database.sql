-- =====================================================
-- RECRÉATION COMPLÈTE DE LA BASE DE DONNÉES
-- Basée sur le formulaire d'inscription FamilyRegisterForm
-- =====================================================

-- 1. SUPPRIMER TOUTES LES TABLES EXISTANTES
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- 2. CRÉER LES ENUMS
CREATE TYPE family_title AS ENUM (
    'Patriarche', 'Matriarche', 'Père', 'Mère', 'Fils', 'Fille',
    'Grand-père', 'Grand-mère', 'Petit-fils', 'Petite-fille',
    'Oncle', 'Tante', 'Neveu', 'Nièce', 'Cousin', 'Cousine',
    'Époux', 'Épouse', 'Beau-père', 'Belle-mère', 'Beau-fils',
    'Belle-fille', 'Frère', 'Sœur'
);

CREATE TYPE relationship_type AS ENUM (
    'fils', 'fille', 'père', 'mère', 'cousin', 'cousine',
    'tante', 'oncle', 'neveu', 'nièce', 'petit-fils',
    'petite-fille', 'grand-père', 'grande-mère', 'époux',
    'épouse', 'patriarche'
);

-- 3. CRÉER LA TABLE PROFILES (basée sur ProfileData du formulaire)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    profession TEXT,
    current_location TEXT,
    birth_place TEXT,
    avatar_url TEXT,
    photo_url TEXT,
    relationship_type relationship_type,
    father_name TEXT,
    mother_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    birth_date DATE,
    title family_title,
    situation TEXT,
    is_patriarch BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRÉER LA TABLE FAMILY_TREES
CREATE TABLE family_trees (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Arbre Familial',
    description TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CRÉER LA TABLE FAMILY_MEMBERS (liaison profiles <-> family_trees)
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tree_id INTEGER REFERENCES family_trees(id) ON DELETE CASCADE,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, tree_id)
);

-- 6. CRÉER LA TABLE RELATIONSHIPS (relations entre membres)
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    person2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    relationship_type relationship_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(person1_id, person2_id)
);

-- 7. CRÉER LA TABLE MESSAGES
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    is_admin_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CRÉER LA TABLE NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CRÉER LA TABLE SITE_SETTINGS
CREATE TABLE site_settings (
    id SERIAL PRIMARY KEY,
    family_tree_title TEXT DEFAULT 'Arbre Familial',
    members_page_title TEXT DEFAULT 'Membres de la Famille',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. CRÉER LES INDEX POUR LES PERFORMANCES
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_family_members_profile_id ON family_members(profile_id);
CREATE INDEX idx_family_members_tree_id ON family_members(tree_id);
CREATE INDEX idx_relationships_person1 ON relationships(person1_id);
CREATE INDEX idx_relationships_person2 ON relationships(person2_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- 11. ACTIVER ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 12. CRÉER LES POLITIQUES RLS
-- Profiles: les utilisateurs peuvent voir leur propre profil et les admins peuvent tout voir
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Family trees: tout le monde peut voir, les admins peuvent modifier
CREATE POLICY "Everyone can view family trees" ON family_trees
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage family trees" ON family_trees
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Family members: les membres du même arbre peuvent voir
CREATE POLICY "Members can view family members in their tree" ON family_members
    FOR SELECT USING (
        tree_id IN (
            SELECT tree_id FROM family_members
            WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Admins can manage family members" ON family_members
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Relationships: les membres peuvent voir les relations de leur famille
CREATE POLICY "Members can view relationships" ON relationships
    FOR SELECT USING (
        person1_id IN (
            SELECT profile_id FROM family_members
            WHERE tree_id IN (
                SELECT tree_id FROM family_members
                WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
            )
        )
    );

CREATE POLICY "Admins can manage relationships" ON relationships
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Messages: tout le monde peut voir, les admins peuvent supprimer
CREATE POLICY "Everyone can view messages" ON messages
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage messages" ON messages
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Notifications: les utilisateurs peuvent voir leurs notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage notifications" ON notifications
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Site settings: tout le monde peut voir, les admins peuvent modifier
CREATE POLICY "Everyone can view site settings" ON site_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings" ON site_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- 13. CRÉER LES TRIGGERS AUTOMATIQUES
-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_trees_updated_at
    BEFORE UPDATE ON family_trees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at
    BEFORE UPDATE ON family_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationships_updated_at
    BEFORE UPDATE ON relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour créer automatiquement un arbre familial et lier le profil
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
DECLARE
    family_tree_id INTEGER;
BEGIN
    -- Trouver ou créer un arbre familial
    SELECT id INTO family_tree_id
    FROM family_trees
    LIMIT 1;

    IF family_tree_id IS NULL THEN
        -- Créer un nouvel arbre familial
        INSERT INTO family_trees (name, created_by)
        VALUES ('Arbre Familial Principal', NEW.id)
        RETURNING id INTO family_tree_id;
    END IF;

    -- Lier le profil à l'arbre familial
    INSERT INTO family_members (profile_id, tree_id, role)
    VALUES (
        NEW.id,
        family_tree_id,
        COALESCE(NEW.relationship_type::text, 'membre')
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne pas faire échouer l'insertion du profil
        RAISE WARNING 'Erreur lors de la liaison à l''arbre familial: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_profile
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- 14. INSÉRER LES DONNÉES INITIALES
INSERT INTO site_settings (family_tree_title, members_page_title)
VALUES ('Arbre Familial Gogos', 'Membres de la Famille');

-- 15. CRÉER LES FONCTIONS UTILITAIRES
-- Fonction pour créer un profil sans déclencher les triggers automatiques
CREATE OR REPLACE FUNCTION create_profile_safe(
    p_id UUID,
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT DEFAULT NULL,
    p_profession TEXT DEFAULT NULL,
    p_current_location TEXT DEFAULT NULL,
    p_birth_place TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_photo_url TEXT DEFAULT NULL,
    p_relationship_type relationship_type DEFAULT NULL,
    p_father_name TEXT DEFAULT NULL,
    p_mother_name TEXT DEFAULT NULL,
    p_is_admin BOOLEAN DEFAULT FALSE,
    p_birth_date DATE DEFAULT NULL,
    p_title family_title DEFAULT NULL,
    p_situation TEXT DEFAULT NULL,
    p_is_patriarch BOOLEAN DEFAULT FALSE
) RETURNS JSON AS $$
DECLARE
    new_profile profiles%ROWTYPE;
BEGIN
    -- Désactiver temporairement le trigger
    ALTER TABLE profiles DISABLE TRIGGER trigger_new_profile;

    -- Insérer le profil
    INSERT INTO profiles (
        id, user_id, email, first_name, last_name, phone, profession,
        current_location, birth_place, avatar_url, photo_url,
        relationship_type, father_name, mother_name, is_admin,
        birth_date, title, situation, is_patriarch
    ) VALUES (
        p_id, p_id, p_email, p_first_name, p_last_name, p_phone, p_profession,
        p_current_location, p_birth_place, p_avatar_url, p_photo_url,
        p_relationship_type, p_father_name, p_mother_name, p_is_admin,
        p_birth_date, p_title, p_situation, p_is_patriarch
    ) RETURNING * INTO new_profile;

    -- Réactiver le trigger
    ALTER TABLE profiles ENABLE TRIGGER trigger_new_profile;

    RETURN json_build_object(
        'success', true,
        'profile', row_to_json(new_profile)
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Réactiver le trigger en cas d'erreur
        ALTER TABLE profiles ENABLE TRIGGER trigger_new_profile;
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions
GRANT EXECUTE ON FUNCTION create_profile_safe(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, relationship_type, TEXT, TEXT, BOOLEAN, DATE, family_title, TEXT, BOOLEAN) TO authenticated;

-- 16. CRÉER LES VUES UTILES
CREATE VIEW family_tree_view AS
SELECT
    ft.id as tree_id,
    ft.name as tree_name,
    p.id as profile_id,
    p.first_name,
    p.last_name,
    p.email,
    p.civilite,
    p.relationship_type,
    p.is_patriarch,
    fm.role,
    p.created_at
FROM family_trees ft
JOIN family_members fm ON ft.id = fm.tree_id
JOIN profiles p ON fm.profile_id = p.id
ORDER BY ft.id, p.created_at;

-- 17. DONNER LES PERMISSIONS FINALES
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
