
export interface FamilyMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  relationship_type?: string;
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
}

export interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  relationship_type?: string;
  birth_date?: string;
  birth_place?: string;
  current_location?: string;
  situation?: string;
  avatar_url?: string;
  father_id?: string;
  mother_id?: string;
  is_admin?: boolean;
  is_patriarch?: boolean;
}
