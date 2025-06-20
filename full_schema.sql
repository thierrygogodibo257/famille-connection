-- =====================================================
-- SCHEMA COMPLET POUR LA RECONSTRUCTION DE LA BASE DE DONNÉES
-- Ce script est une consolidation des migrations.
-- =====================================================

-- 1. SUPPRIMER TOUT CE QUI EXISTE ET RECRÉER LE SCHEMA
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. CRÉER LES TYPES ENUM
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

-- 3. CRÉER LES TABLES
CREATE TABLE public.profiles (
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
    relationship_type public.relationship_type,
    father_name TEXT,
    mother_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    birth_date DATE,
    title public.family_title,
    situation TEXT,
    is_patriarch BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.family_trees (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Arbre Familial',
    description TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tree_id INTEGER REFERENCES public.family_trees(id) ON DELETE CASCADE,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, tree_id)
);

CREATE TABLE public.relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    person2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship_type public.relationship_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(person1_id, person2_id)
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_admin_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.site_settings (
    id SERIAL PRIMARY KEY,
    family_tree_title TEXT DEFAULT 'Arbre Familial',
    members_page_title TEXT DEFAULT 'Membres de la Famille',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRÉER LES INDEX POUR LES PERFORMANCES
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_family_members_profile_id ON public.family_members(profile_id);
CREATE INDEX idx_family_members_tree_id ON public.family_members(tree_id);
CREATE INDEX idx_relationships_person1 ON public.relationships(person1_id);
CREATE INDEX idx_relationships_person2 ON public.relationships(person2_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);

-- 5. ACTIVER ROW LEVEL SECURITY (RLS) SUR TOUTES LES TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 6. CRÉER LES POLITIQUES RLS (VERSION CORRIGÉE ET FINALE)

-- 6.1. Fonction sécurisée pour vérifier le statut d'admin (évite la récursion)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';
AS $$
DECLARE
  is_admin_status BOOLEAN;
BEGIN
  SELECT p.is_admin INTO is_admin_status
  FROM public.profiles p
  WHERE p.user_id = auth.uid();
  RETURN COALESCE(is_admin_status, false);
END;
$$;

-- 6.2. Politiques pour la table 'profiles'
CREATE POLICY "Users can manage their own profile" ON public.profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full access to profiles" ON public.profiles
FOR ALL
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- 6.3. Politiques pour les autres tables
-- Family trees
CREATE POLICY "Everyone can view family trees" ON public.family_trees
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage family trees" ON public.family_trees
    FOR ALL USING (auth.role() = 'authenticated');

-- Family members
CREATE POLICY "Everyone can view family members" ON public.family_members
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage family members" ON public.family_members
    FOR ALL USING (auth.role() = 'authenticated');

-- Relationships
CREATE POLICY "Everyone can view relationships" ON public.relationships
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage relationships" ON public.relationships
    FOR ALL USING (auth.role() = 'authenticated');

-- Messages
CREATE POLICY "Everyone can view messages" ON public.messages
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage messages" ON public.messages
    FOR ALL USING (auth.role() = 'authenticated');

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated users can manage notifications" ON public.notifications
    FOR ALL USING (auth.role() = 'authenticated');

-- Site settings
CREATE POLICY "Everyone can view site settings" ON public.site_settings
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage site settings" ON public.site_settings
    FOR ALL USING (auth.role() = 'authenticated');


-- 7. CRÉER LES TRIGGERS ET FONCTIONS ASSOCIÉES

-- 7.1. Trigger pour mettre à jour la colonne 'updated_at'
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_family_trees_updated_at BEFORE UPDATE ON public.family_trees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE ON public.relationships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7.2. Trigger pour lier un nouveau profil à un arbre familial
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
DECLARE
    family_tree_id INTEGER;
BEGIN
    SELECT id INTO family_tree_id FROM public.family_trees LIMIT 1;
    IF family_tree_id IS NULL THEN
        INSERT INTO public.family_trees (name, created_by)
        VALUES ('Arbre Familial Principal', NEW.id)
        RETURNING id INTO family_tree_id;
    END IF;

    INSERT INTO public.family_members (profile_id, tree_id, role)
    VALUES (NEW.id, family_tree_id, COALESCE(NEW.relationship_type::text, 'membre'));
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Erreur lors de la liaison à l''arbre familial: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_profile AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- 8. INSÉRER LES DONNÉES INITIALES
INSERT INTO public.site_settings (family_tree_title, members_page_title)
VALUES ('Arbre Familial Gogos', 'Membres de la Famille');

-- 9. CRÉER LES VUES
CREATE VIEW public.family_tree_view AS
SELECT
    ft.id as tree_id,
    ft.name as tree_name,
    p.id as profile_id,
    p.first_name,
    p.last_name,
    p.email,
    p.title,
    p.relationship_type,
    p.is_patriarch,
    fm.role,
    p.created_at
FROM public.family_trees ft
JOIN public.family_members fm ON ft.id = fm.tree_id
JOIN public.profiles p ON fm.profile_id = p.id
ORDER BY ft.id, p.created_at;

-- 10. DÉFINIR LES PERMISSIONS FINALES
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
