
import type { Database } from '@/integrations/supabase/types';

export interface FamilyMember {
  id: string;
  profile_id: string;
  tree_id: number;
  parent_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title: Database['public']['Enums']['family_title'];
  relationship_type: Database['public']['Enums']['relationship_type'];
  birth_date?: string;
  birth_place?: string;
  current_location?: string;
  situation?: string;
  avatar_url?: string;
  photo_url?: string;
  father_id?: string;
  mother_id?: string;
  is_admin?: boolean;
  is_patriarch?: boolean;
  created_at?: string;
  updated_at?: string;
  connections?: string[];
}

export type Title = Database['public']['Enums']['family_title'];

export const DEFAULT_TITLE = 'Fils';

export type RelationshipType = Database['public']['Enums']['relationship_type'];

export interface ProfileData {
  id?: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  title?: Database['public']['Enums']['family_title'];
  relationship_type?: Database['public']['Enums']['relationship_type'];
  birth_date?: string;
  birth_place?: string;
  current_location?: string;
  situation?: string;
  photo_url?: string;
  avatar_url?: string;
  father_id?: string;
  mother_id?: string;
  is_admin?: boolean;
  is_patriarch?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type NewFamilyMember = Omit<FamilyMember, 'id' | 'created_at' | 'updated_at'>;
