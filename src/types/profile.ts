import { RelationshipType } from './family';

export interface Profile {
  id: string;
  user_id: string; // ID de l'utilisateur Supabase
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profession?: string;
  current_location?: string;
  birth_place?: string;
  avatar_url?: string;
  photo_url?: string;
  relationship_type?: 'fils' | 'fille' | 'père' | 'mère' | 'cousin' | 'cousine' | 'tante' | 'oncle' | 'neveu' | 'nièce' | 'petit-fils' | 'petite-fille' | 'grand-père' | 'grande-mère' | 'époux' | 'épouse' | 'patriarche';
  father_name?: string;
  mother_name?: string;
  is_admin?: boolean;
  birth_date?: string;
  civilite?: 'M.' | 'Mme';
  situation?: string;
  is_patriarch?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  civilite?: string;
  photoUrl?: string;
  birthDate?: string;
  birthPlace?: string;
  currentLocation?: string;
  situation?: string;
  profession?: string;
}

export interface ProfileData {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  profession: string;
  current_location: string;
  birth_place: string;
  avatar_url: string;
  photo_url: string;
  relationship_type: RelationshipType | null;
  father_name: string;
  mother_name: string;
  is_admin: boolean;
  birth_date: string | null;
  civilite: string;
  situation: string;
  is_patriarch: boolean;
  created_at: string;
  updated_at: string;
  spouse_id?: string;
  father_id?: string;
  mother_id?: string;
}
