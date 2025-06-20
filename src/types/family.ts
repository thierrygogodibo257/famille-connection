import { Database } from '@/integrations/supabase/types';

// 🔵 Typage des ENUMs
export type FamilyTitle = Database['public']['Enums']['family_title'];
export type RelationshipType = Database['public']['Enums']['relationship_type'];

// 👤 Représente un membre de la famille
export interface FamilyMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  title: FamilyTitle | null;
  birth_date: string | null;
  birth_place: string | null;
  current_location: string | null;
  situation: string | null;
  avatar_url: string | null;
  father_id: string | null;
  mother_id: string | null;
  created_at: string;
  updated_at: string;
}

// ➕ Type pour la création d'un nouveau membre
export type NewFamilyMember = Pick<FamilyMember, 'id' | 'first_name' | 'last_name' | 'email'> & Partial<FamilyMember>;

// 🔗 Représente une relation entre deux membres
export interface FamilyRelation {
  id: string;
  type: 'father' | 'mother' | 'spouse' | 'child' | 'sibling';
  fromMemberId: string;
  toMemberId: string;
  createdAt: string;
}

// 🌳 Structure de l'arbre familial
export interface Family {
  id: string;
  name: string;
  patriarchId: string;
  members: FamilyMember[];
  relations: FamilyRelation[];
  createdAt: string;
  updatedAt: string;
}

// 🧩 Options pour la liste déroulante du type de lien
export const relationshipTypeOptions: {
  label: string;
  value: RelationshipType;
}[] = [
  { label: 'Fils', value: 'fils' },
  { label: 'Fille', value: 'fille' },
  { label: 'Père', value: 'père' },
  { label: 'Mère', value: 'mère' },
  { label: 'Cousin', value: 'cousin' },
  { label: 'Cousine', value: 'cousine' },
  { label: 'Tante', value: 'tante' },
  { label: 'Oncle', value: 'oncle' },
  { label: 'Neveu', value: 'neveu' },
  { label: 'Nièce', value: 'nièce' },
  { label: 'Petit-fils', value: 'petit-fils' },
  { label: 'Petite-fille', value: 'petite-fille' },
  { label: 'Grand-père', value: 'grand-père' },
  { label: 'Grande-mère', value: 'grande-mère' },
  { label: 'Époux', value: 'époux' },
  { label: 'Épouse', value: 'épouse' },
  { label: 'Patriarche', value: 'patriarche' },
];
