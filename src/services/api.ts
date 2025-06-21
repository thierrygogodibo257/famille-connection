import { supabase } from '@/integrations/supabase/client';
import type { FamilyMember, ProfileData, Title, RelationshipType } from '@/types/family';
import type { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

type UpdateProfile = {
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
  title: Database['public']['Enums']['family_title'];
  relationship_type?: Database['public']['Enums']['relationship_type'];
  birth_date?: string;
  birth_place?: string;
  current_location?: string;
  situation?: string;
  profession?: string;
  photo_url?: string;
  father_name?: string;
  mother_name?: string;
}

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

  profiles: {
    async getAll(): Promise<Profile[]> {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },

    async getCurrent() {
      const user = await api.getCurrentUser();
      if (!user.data?.user) throw new Error('Utilisateur non connecté');
      return this.getProfileById(user.data.user.id);
    },

    async getProfileById(id: string): Promise<Profile> {
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

    async createProfile(profile: ProfileData) {
      const data = {
        ...profile,
        relationship_type: profile.relationship_type?.toLowerCase() as Database['public']['Enums']['relationship_type'],
        title: profile.title || 'Fils' as Database['public']['Enums']['family_title'],
        father_name: profile.father_id || null,
        mother_name: profile.mother_id || null
      };
      return supabase
        .from('profiles')
        .insert([data])
        .select()
        .single();
    },

    async updateProfile(id: string, updates: UpdateProfile) {
      const data = {
        ...updates,
        relationship_type: updates.relationship_type?.toLowerCase() as Database['public']['Enums']['relationship_type'],
        title: updates.title || 'Fils' as Database['public']['Enums']['family_title']
      };
      return supabase
        .from('profiles')
        .update(data)
        .eq('id', id)
        .select()
        .single();
    },

    async createFromUserMetadata(user: any): Promise<Profile> {
      const metadata = user.user_metadata;
      const profileData = {
        id: user.id,
        user_id: user.id,
        email: user.email,
        first_name: metadata.first_name || '',
        last_name: metadata.last_name || '',
        phone: metadata.phone || '',
        title: metadata.title || 'Fils' as Database['public']['Enums']['family_title'],
        relationship_type: (metadata.relationship_type || 'fils').toLowerCase() as Database['public']['Enums']['relationship_type'],
        photo_url: metadata.photo_url || '',
        birth_date: metadata.birth_date || null,
        birth_place: metadata.birth_place || '',
        current_location: metadata.current_location || '',
        situation: metadata.situation || '',
        is_patriarch: metadata.is_patriarch || false,
        is_admin: metadata.is_admin || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        father_name: metadata.father_name || null,
        mother_name: metadata.mother_name || null,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }
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

  async getAllProfiles(): Promise<Profile[]> {
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

  async getAllForAdmin(): Promise<Profile[]> {
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
