import { z } from 'zod';
import { RelationshipType } from '@/types/family';

export const familyRegisterSchema = z.object({
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
  relationship: z.enum(['fils/fille', 'cousin/cousine', 'oncle/tante', 'petit-fils/petite-fille', 'neveux/nièce', 'conjoint', 'père/mère', 'patriarche', 'grand-parent', 'frère/sœur', 'époux/épouse'] as const),
  spouseName: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  birthDate: z.string().optional(),
});

export const familyRegistrationSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide"),
  password: z.string().min(4, "Le mot de passe doit contenir au moins 4 caractères"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().optional(),
  country: z.string().optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  currentLocation: z.string().optional(),
  title: z.string().min(1, "Le titre est requis"),
  situation: z.string().optional(),
  profession: z.string().optional(),
  photoUrl: z.string().optional(),
  father_id: z.string().optional(),
  mother_id: z.string().optional(),
  isAdmin: z.boolean().default(false),
});

export const loginSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().optional(),
  country: z.string().optional(),
  title: z.string().min(1, "Le titre est requis"),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  currentLocation: z.string().optional(),
  situation: z.string().optional(),
  profession: z.string().optional(),
  photoUrl: z.string().optional(),
});

export type FamilyRegistrationData = z.infer<typeof familyRegistrationSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
