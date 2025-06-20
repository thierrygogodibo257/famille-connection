import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export const api = {
  profiles: {
    getCurrent: async (): Promise<Profile> => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('Erreur d\'authentification');
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        return await api.profiles.createFromUserMetadata(user);
      }
      if (error) throw new Error(error.message);
      if (!data) throw new Error('Profil non trouvé');
      return data;
    },

    createFromUserMetadata: async (user: any): Promise<Profile> => {
      const metadata = user.user_metadata;
      const profileData = {
        id: user.id,
        user_id: user.id,
        email: user.email,
        first_name: metadata.first_name || '',
        last_name: metadata.last_name || '',
        phone: metadata.phone || '',
        title: metadata.title || 'Membre',
        photo_url: metadata.photo_url || '',
        birth_date: metadata.birth_date || null,
        birth_place: metadata.birth_place || '',
        current_location: metadata.current_location || '',
        situation: metadata.situation || '',
        is_patriarch: metadata.is_patriarch || false,
        is_admin: metadata.is_admin || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },

    getAll: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },

    getAllForAdmin: async (): Promise<Profile[]> => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Non authentifié');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        const userProfile = await api.profiles.createFromUserMetadata(user);
        if (!userProfile?.is_admin) {
          throw new Error('Accès refusé: Seuls les administrateurs peuvent voir tous les profils');
        }
      } else if (profileError) {
        throw new Error('Impossible de vérifier les permissions administrateur');
      } else if (!profileData?.is_admin) {
        throw new Error('Accès refusé: Seuls les administrateurs peuvent voir tous les profils');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },

    update: async (id: string, updates: Partial<Profile>): Promise<Profile> => {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error('Profil non trouvé');
      return data;
    },

    getById: async (id: string): Promise<Profile> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error('Profil non trouvé');
      return data;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
    }
  },

  stats: {
    getFamilyStats: async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) {
          return { totalMembers: 0, generations: 0, activeBranches: 0 };
        }

        const totalMembers = profiles?.length || 0;
        const generations = new Set();
        profiles?.forEach(profile => {
          if (profile.title) {
            if (profile.title.includes('Patriarche') || profile.title.includes('Matriarche')) {
              generations.add('1');
            } else if (profile.title.includes('Père') || profile.title.includes('Mère')) {
              generations.add('2');
            } else if (profile.title.includes('Fils') || profile.title.includes('Fille')) {
              generations.add('3');
            } else if (profile.title.includes('Petit-fils') || profile.title.includes('Petite-fille')) {
              generations.add('4');
            }
          }
        });

        const activeBranches = profiles?.filter(profile => profile.is_patriarch === true).length || 0;

        return {
          totalMembers,
          generations: generations.size,
          activeBranches
        };
      } catch (error) {
        return { totalMembers: 0, generations: 0, activeBranches: 0 };
      }
    }
  },

  admin: {
    deleteAllUsers: async (password: string): Promise<{ success: boolean; message: string; deletedUsers: number }> => {
      try {
        const response = await fetch(`https://aaxfvyorhasbwlaovrdf.supabase.co/functions/v1/delete_all_users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': password
          },
          body: JSON.stringify({ password })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la suppression de tous les utilisateurs');
        }

        const result = await response.json();
        return result;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Erreur inconnue');
      }
    },

    deleteUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await fetch(`https://aaxfvyorhasbwlaovrdf.supabase.co/functions/v1/delete_user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': '1432'
          },
          body: JSON.stringify({ userId })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la suppression de l\'utilisateur');
        }

        const result = await response.json();
        return result;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Erreur inconnue');
      }
    }
  },

  testConnection: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      const isAdmin = profile?.is_admin || false;

      let canAccessAllProfiles = false;
      if (isAdmin) {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        canAccessAllProfiles = !!data;
      }

      return {
        success: true,
        user: user.email,
        isAdmin,
        canAccessAllProfiles
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  },

  blockUser: async (userId: string, isBlocked: boolean): Promise<void> => {
<<<<<<< HEAD
    // NOTE: La colonne `is_blocked` n'existe pas dans le schéma `profiles`.
    // La fonctionnalité est désactivée en attendant une migration de la base de données.
    // const { error } = await supabase
    //   .from('profiles')
    //   .update({ is_blocked: isBlocked })
    //   .eq('id', userId);
=======
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !isBlocked })
      .eq('id', userId);
>>>>>>> a3eaafc4c312991cc6d24df804d6d129625ca5e8

    // if (error) {
    //   throw new Error(`Erreur lors du ${isBlocked ? 'blocage' : 'déblocage'} de l'utilisateur: ${error.message}`);
    // }
  },

  toggleAdmin: async (userId: string, isAdmin: boolean): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId);

    if (error) {
      throw new Error(`Erreur lors de la modification des privilèges admin: ${error.message}`);
    }
  },
  createProfile: async (profile: any): Promise<any> => {
    try {
      const { data: result, error: rpcError } = await supabase
        .rpc('create_profile_safe', {
          p_id: profile.id,
          p_user_id: profile.user_id,
          p_email: profile.email,
          p_first_name: profile.first_name,
          p_last_name: profile.last_name,
          p_phone: profile.phone,
          p_profession: profile.profession,
          p_current_location: profile.current_location,
          p_birth_place: profile.birth_place,
          p_avatar_url: profile.avatar_url,
          p_photo_url: profile.photo_url,
          p_relationship_type: profile.relationship_type,
          p_father_name: profile.father_name,
          p_mother_name: profile.mother_name,
          p_is_admin: profile.is_admin,
          p_birth_date: profile.birth_date,
          p_title: profile.title,
          p_situation: profile.situation,
          p_is_patriarch: profile.is_patriarch
        });

      if (rpcError) {
        throw rpcError;
      }

      if ((result as any)?.success) {
        return (result as any).profile;
      } else {
        throw new Error((result as any)?.error || 'La création du profil a échoué via RPC.');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erreur inconnue lors de la création du profil.');
    }
  },

  uploadAvatar: async (userId: string, file: File): Promise<string> => {
    const filePath = `${userId}/${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath, {
        download: false,
        transform: {
          width: 200,
          height: 200,
          resize: 'cover'
        }
      });

    if (!publicUrlData.publicUrl) {
      throw new Error('Impossible de générer l\'URL publique');
    }

    return publicUrlData.publicUrl;
  }
};
