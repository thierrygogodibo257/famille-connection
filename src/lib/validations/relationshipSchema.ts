import { z } from 'zod';

export const RelationshipEnum = z.enum([
  'fils', 'fille',
  'père', 'mère',
  'cousin', 'cousine',
  'tante', 'oncle',
  'neveu', 'nièce',
  'petit-fils', 'petite-fille',
  'grand-père', 'grande-mère',
  'époux', 'épouse',
  'patriarche',
]);

export const ProfileSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  relationship_type: RelationshipEnum,
  phone: z.string().optional(),
  profession: z.string().optional(),
  current_location: z.string().optional(),
  birth_place: z.string().optional(),
  birth_date: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  spouse_name: z.string().optional(),
  photo_url: z.string().optional(),
});

// Schéma étendu pour le formulaire d'inscription
export const FamilyRegisterSchema = z.object({
  title: z.enum(['M.', 'Mme']),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe minimum 6 caractères"),
  phoneCode: z.string().optional(),
  phone: z.string().optional(),
  profession: z.string().optional(),
  currentLocation: z.string().optional(),
  birthPlace: z.string().optional(),
  photoUrl: z.string().optional(),
  relationship: RelationshipEnum,
  spouseName: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  birthDate: z.string().optional(),
});

export type RelationshipType = z.infer<typeof RelationshipEnum>;
export type ProfileFormData = z.infer<typeof ProfileSchema>;
export type FamilyRegisterData = z.infer<typeof FamilyRegisterSchema>;
