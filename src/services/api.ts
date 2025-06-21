import { supabase } from '@/integrations/supabase/client';
import type { FamilyMember, ProfileData } from '@/types/family';

export const api = {
  async getCurrentUser() {
    return supabase.auth.getUser();
  },

  async login(email: string, password: string) {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async logout() {
    return supabase.auth.signOut();
  },

  async createProfile(profile: ProfileData) {
    return supabase
      .from('profiles')
      .insert([profile])
  },

  async updateProfile(id: string, updates: UpdateProfile) {
    return supabase
      .from('profiles')
      .update(updates)
      .eq('id', id);
  },

  async getProfileById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Erreur lors de la récupération du profil :", error);
      throw error;
    }

    return data;
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const filePath = `avatars/${userId}/${file.name}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erreur lors de l\'upload du fichier:', error);
        throw error;
      }

      const publicURL = `https://aaxfvyorhasbwlaovrdf.supabase.co/storage/v1/object/public/${data.path}`;
      return publicURL;
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error);
      throw error;
    }
  },

  async getAllProfiles(): Promise<FamilyMember[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération tous les profils:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur récupération tous les profils:', error);
      throw error;
    }
  },

  async getAllForAdmin(): Promise<FamilyMember[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération profiles admin:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur récupération profiles admin:', error);
      throw error;
    }
  },

  async searchMembers(query: string): Promise<{ id: string; first_name: string; last_name: string; title?: string; }[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, title')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(10);

      if (error) {
        console.error('Erreur lors de la recherche de membres:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche de membres:', error);
      return [];
    }
  },

  async deleteUser(userId: string) {
    try {
      // Supprimer l'utilisateur de l'authentification Supabase
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('Erreur lors de la suppression de l\'utilisateur (auth) :', authError);
        throw authError;
      }

      // Supprimer le profil de la table "profiles"
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Erreur lors de la suppression du profil :', profileError);
        throw profileError;
      }

      return { success: true, message: 'Utilisateur supprimé avec succès.' };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur :', error);
      return { success: false, message: 'Erreur lors de la suppression de l\'utilisateur.' };
    }
  },

  async deleteAllUsers(password: string) {
    try {
      const response = await fetch(`https://aaxfvyorhasbwlaovrdf.supabase.co/functions/v1/delete_all_users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  },
};

type UpdateProfile = {
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
  title: string;
  birthDate?: string;
  birthPlace?: string;
  currentLocation?: string;
  situation?: string;
  profession?: string;
  photoUrl?: string;
}
