-- Fix family_members table schema to match the types
-- Drop the table if it exists with wrong schema
DROP TABLE IF EXISTS family_members CASCADE;

-- Check and drop any triggers on profiles table that might reference family_members
DO $$
BEGIN
    -- Drop any triggers that might be causing automatic insertion
    DROP TRIGGER IF EXISTS trigger_family_members_insert ON profiles;
    DROP TRIGGER IF EXISTS trigger_family_members_update ON profiles;
    DROP TRIGGER IF EXISTS trigger_profiles_family_members ON profiles;

    -- Drop any functions that might be called by these triggers
    DROP FUNCTION IF EXISTS handle_family_members_insert() CASCADE;
    DROP FUNCTION IF EXISTS handle_family_members_update() CASCADE;
    DROP FUNCTION IF EXISTS trigger_profiles_family_members() CASCADE;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if functions/triggers don't exist
        NULL;
END $$;

-- Recreate the table with correct schema
CREATE TABLE family_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tree_id INTEGER REFERENCES family_trees(id) ON DELETE CASCADE,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_family_members_profile_id ON family_members(profile_id);
CREATE INDEX idx_family_members_tree_id ON family_members(tree_id);

-- Add RLS policies
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see family members in their tree
CREATE POLICY "Users can view family members in their tree" ON family_members
    FOR SELECT USING (
        tree_id IN (
            SELECT tree_id FROM family_members
            WHERE profile_id = auth.uid()
        )
    );

-- Policy to allow admins to manage family members
CREATE POLICY "Admins can manage family members" ON family_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
