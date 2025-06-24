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
  civilite: z.enum(['M.', 'Mme']),
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

// Schéma simplifié pour le formulaire d'inscription utilisateur
export const FamilyRegisterSchema = z.object({
  display_name: z.string().min(1, "Le nom à afficher est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe minimum 6 caractères"),
  phone_code: z.string().default('+225'),
  phone: z.string().min(6, "Numéro de téléphone requis"),
  avatar_url: z.string().min(1, "La photo de profil est obligatoire"),
  civilite: z.enum(['M.', 'Mme']),
  role: z.enum(['user', 'admin']).default('user'),
});

export type RelationshipType = z.infer<typeof RelationshipEnum>;
export type ProfileFormData = z.infer<typeof ProfileSchema>;
export type FamilyRegisterData = z.infer<typeof FamilyRegisterSchema>;
