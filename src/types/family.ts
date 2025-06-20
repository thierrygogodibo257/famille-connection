
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
  id?: string;
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

export type RelationshipType = 
  | 'Père' 
  | 'Mère' 
  | 'Fils' 
  | 'Fille' 
  | 'Frère' 
  | 'Sœur' 
  | 'Grand-père' 
  | 'Grand-mère' 
  | 'Petit-fils' 
  | 'Petite-fille'
  | 'Oncle'
  | 'Tante'
  | 'Neveu'
  | 'Nièce'
  | 'Cousin'
  | 'Cousine'
  | 'Époux'
  | 'Épouse'
  | 'Gendre'
  | 'Belle-fille'
  | 'Beau-père'
  | 'Belle-mère'
  | 'Beau-frère'
  | 'Belle-sœur';

export type NewFamilyMember = Omit<FamilyMember, 'id' | 'created_at' | 'updated_at'>;
