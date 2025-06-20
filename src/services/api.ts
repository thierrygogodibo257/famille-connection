import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { createClient } from '@supabase/supabase-js';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export const api = {
  profiles: {
    getCurrent: async (): Promise<Profile> => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error('Erreur d\'authentification');
      if (!user) throw new Error('Non authentifié');

      // D'abord essayer de récupérer le profil existant
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profil non trouvé, le créer à partir des métadonnées utilisateur
        console.log('Profil non trouvé, création à partir des métadonnées...');
        return await api.profiles.createFromUserMetadata(user);
      }

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        throw new Error(error.message);
      }
      if (!data) throw new Error('Profil non trouvé');

      return data;
    },

    createFromUserMetadata: async (user: any): Promise<Profile> => {
      const metadata = user.user_metadata;

      const profileData = {
        id: user.id,
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
        created_at: metadata.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du profil:', error);
        throw new Error(error.message);
      }

      return data;
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

      if (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        throw new Error(error.message);
      }
      if (!data) throw new Error('Profil non trouvé');

      return data;
    },

    getAll: async (): Promise<Profile[]> => {
      // Vérifier d'abord l'authentification
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Erreur d\'authentification:', userError);
        throw new Error('Erreur d\'authentification');
      }
      if (!user) {
        console.error('Utilisateur non authentifié');
        throw new Error('Non authentifié');
      }

      console.log('Utilisateur authentifié:', user.id);

      // Essayer de récupérer tous les profils
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des profils:', error);
        // Si l'erreur est liée aux permissions, essayer de récupérer seulement le profil de l'utilisateur connecté
        if (error.code === 'PGRST116' || error.message.includes('permission')) {
          console.log('Tentative de récupération du profil utilisateur uniquement...');
          const { data: userProfile, error: userProfileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (userProfileError) {
            console.error('Erreur lors de la récupération du profil utilisateur:', userProfileError);
            throw new Error('Impossible de récupérer les profils');
          }

          return userProfile ? [userProfile] : [];
        }
        throw new Error(error.message);
      }

      console.log('Profils récupérés:', data?.length || 0);
      return data || [];
    },

    getById: async (id: string): Promise<Profile> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        throw new Error(error.message);
      }
      if (!data) throw new Error('Profil non trouvé');

      return data;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du profil:', error);
        throw new Error(error.message);
      }
    },

    getAllForAdmin: async (): Promise<Profile[]> => {
      // Vérifier d'abord l'authentification
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Erreur d\'authentification:', userError);
        throw new Error('Erreur d\'authentification');
      }
      if (!user) {
        console.error('Utilisateur non authentifié');
        throw new Error('Non authentifié');
      }

      // Vérifier si l'utilisateur est admin
      let userProfile;
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profil non trouvé, le créer à partir des métadonnées utilisateur
        console.log('Profil admin non trouvé, création à partir des métadonnées...');
        userProfile = await api.profiles.createFromUserMetadata(user);
      } else if (profileError) {
        console.error('Erreur lors de la vérification du profil admin:', profileError);
        throw new Error('Impossible de vérifier les permissions administrateur');
      } else {
        userProfile = profileData;
      }

      if (!userProfile?.is_admin) {
        throw new Error('Accès refusé: Seuls les administrateurs peuvent voir tous les profils');
      }

      console.log('Admin authentifié, récupération de tous les profils...');

      // Récupérer tous les profils
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des profils:', error);
        throw new Error(error.message);
      }

      console.log('Profils récupérés:', data?.length || 0);
      return data || [];
    }
  },

  stats: {
    getFamilyStats: async () => {
      try {
        console.log('Début de récupération des statistiques...');

        // Vérifier l'authentification
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Erreur d\'authentification:', userError);
          throw new Error('Erreur d\'authentification');
        }
        if (!user) {
          console.error('Utilisateur non authentifié');
          throw new Error('Non authentifié');
        }

        console.log('Utilisateur authentifié:', user.id);

        // Essayer de récupérer seulement le profil de l'utilisateur connecté d'abord
        const { data: currentProfile, error: currentProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (currentProfileError) {
          console.error('Erreur lors de la récupération du profil actuel:', currentProfileError);
          throw new Error(currentProfileError.message);
        }

        console.log('Profil actuel récupéré:', currentProfile);

        // Maintenant essayer de récupérer tous les profils
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');

        if (profilesError) {
          console.error('Erreur lors de la récupération de tous les profils:', profilesError);
          // Si on ne peut pas récupérer tous les profils, on utilise seulement le profil actuel
          const totalMembers = 1;
          const generations = currentProfile.title ? 1 : 0;
          const activeBranches = currentProfile.is_patriarch ? 1 : 0;

          return {
            totalMembers,
            generations,
            activeBranches
          };
        }

        console.log('Tous les profils récupérés:', profiles?.length || 0);

        const totalMembers = profiles?.length || 0;

        // Calculer les générations (basé sur les titres)
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

        // Calculer les branches actives (basé sur les patriarches/matriarches)
        const activeBranches = profiles?.filter(profile =>
          profile.is_patriarch === true
        ).length || 0;

        console.log('Statistiques calculées:', { totalMembers, generations: generations.size, activeBranches });

        return {
          totalMembers,
          generations: generations.size,
          activeBranches
        };
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        // Retourner des valeurs par défaut en cas d'erreur
        return {
          totalMembers: 0,
          generations: 0,
          activeBranches: 0
        };
      }
    }
  },

  admin: {
    deleteAllUsers: async (password: string): Promise<{ success: boolean; message: string; deletedUsers: number }> => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete_all_users`, {
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
        console.error('Erreur lors de la suppression de tous les utilisateurs:', error);
        throw new Error(error instanceof Error ? error.message : 'Erreur inconnue');
      }
    },

    deleteUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete_user`, {
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
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        throw new Error(error instanceof Error ? error.message : 'Erreur inconnue');
      }
    },

    testConnection: async (): Promise<any> => {
      try {
        console.log('Test de connexion Supabase...');

        // Test 1: Vérifier l'authentification
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('Test auth:', { user: user?.id, error: userError });

        if (userError) {
          return { error: 'Erreur d\'authentification', details: userError };
        }

        if (!user) {
          return { error: 'Utilisateur non authentifié' };
        }

        // Test 2: Essayer de récupérer le profil utilisateur
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('Test profil:', { profile: profile?.id, error: profileError });

        if (profileError) {
          return { error: 'Erreur profil', details: profileError };
        }

        // Test 3: Essayer de récupérer tous les profils
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        console.log('Test tous profils:', { count: allProfiles?.length, error: allProfilesError });

        return {
          success: true,
          user: user.id,
          profile: profile?.id,
          isAdmin: profile?.is_admin,
          canAccessAllProfiles: !allProfilesError,
          allProfilesError: allProfilesError
        };

      } catch (error) {
        console.error('Erreur test connexion:', error);
        return { error: 'Erreur inattendue', details: error };
      }
    }
  },

  testConnection: async (): Promise<any> => {
    try {
      console.log('Test de connexion Supabase...');

      // Test 1: Vérifier l'authentification
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Test auth:', { user: user?.id, error: userError });

      if (userError) {
        return { error: 'Erreur d\'authentification', details: userError };
      }

      if (!user) {
        return { error: 'Utilisateur non authentifié' };
      }

      // Test 2: Essayer de récupérer le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Test profil:', { profile: profile?.id, error: profileError });

      if (profileError) {
        return { error: 'Erreur profil', details: profileError };
      }

      // Test 3: Essayer de récupérer tous les profils
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      console.log('Test tous profils:', { count: allProfiles?.length, error: allProfilesError });

      return {
        success: true,
        user: user.id,
        profile: profile?.id,
        isAdmin: profile?.is_admin,
        canAccessAllProfiles: !allProfilesError,
        allProfilesError: allProfilesError
      };

    } catch (error) {
      console.error('Erreur test connexion:', error);
      return { error: 'Erreur inattendue', details: error };
    }
  },

  // Méthodes pour l'administration
  blockUser: async (userId: string, isBlocked: boolean): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: isBlocked })
        .eq('id', userId);

      if (error) {
        throw new Error(`Erreur lors du ${isBlocked ? 'blocage' : 'déblocage'} de l'utilisateur: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur blockUser:', error);
      throw error;
    }
  },

  toggleAdmin: async (userId: string, isAdmin: boolean): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('id', userId);

      if (error) {
        throw new Error(`Erreur lors de la modification des privilèges admin: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur toggleAdmin:', error);
      throw error;
    }
  },
  createProfile: async (profile: object, token: string) => {
    try {
      // Essayer d'abord la fonction Edge
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Fonction Edge échouée, utilisation de la méthode directe:', errorData.error);
        // Fallback vers la méthode directe
        return await api.createProfileDirect(profile);
      }

      // Nous attendons un objet profil unique
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
      // Fallback vers la méthode directe
      return await api.createProfileDirect(profile);
    }
  },

  createProfileDirect: async (profile: any) => {
    try {
      console.log('Création directe du profil via Supabase client...');

      // Utiliser la fonction SQL qui contourne tous les triggers
      const { data: result, error: profileError } = await supabase
        .rpc('create_profile_no_triggers', {
          p_id: profile.id,
          p_email: profile.email,
          p_first_name: profile.first_name,
          p_last_name: profile.last_name,
          p_phone: profile.phone,
          p_current_location: profile.current_location,
          p_birth_place: profile.birth_place,
          p_avatar_url: profile.avatar_url,
          p_relationship_type: profile.relationship_type,
          p_father_id: profile.father_id,
          p_mother_id: profile.mother_id,
          p_is_admin: profile.is_admin,
          p_birth_date: profile.birth_date,
          p_title: profile.title,
          p_situation: profile.situation,
          p_is_patriarch: profile.is_patriarch
        });

      if (profileError) {
        console.error('Erreur détaillée Supabase:', profileError);
        throw profileError;
      }

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création du profil');
      }

      console.log('Profil créé avec succès:', result.profile);
      return { success: true, profile: result.profile };
    } catch (error) {
      console.error('Erreur lors de la création directe du profil:', error);
      throw new Error(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  },

  uploadAvatar: async (userId: string, file: File): Promise<string> => {
    const filePath = `${userId}/${Date.now()}_${file.name}`;

    // 1. Upload du fichier
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type // Ajout explicite du type MIME
      });

    if (error) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error);
      throw new Error(error.message);
    }

    // 2. Rendre le fichier public et récupérer l'URL
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
  },
};
