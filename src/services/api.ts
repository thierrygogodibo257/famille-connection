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

        // Si le profil n'existe pas, essayer de le créer à partir des métadonnées utilisateur
        if (error.code === 'PGRST116') {
          console.log("Profil non trouvé, tentative de création automatique...");

          // Récupérer les informations de l'utilisateur
          const { data: userData, error: userError } = await supabase.auth.getUser();

          if (userError || !userData.user) {
            throw new Error('Utilisateur non connecté');
          }

          const user = userData.user;
          const metadata = user.user_metadata;

          // Créer le profil automatiquement avec des données minimales
          const profileData = {
            id: user.id,
            user_id: user.id,
            email: user.email,
            first_name: metadata.first_name || 'Utilisateur',
            last_name: metadata.last_name || '',
            phone: metadata.phone || '',
            title: metadata.title || 'Fils' as Database['public']['Enums']['family_title'],
            relationship_type: (metadata.relationship_type || 'fils').toLowerCase() as Database['public']['Enums']['relationship_type'],
            photo_url: metadata.photo_url || '',
            avatar_url: metadata.photo_url || '',
            birth_date: metadata.birth_date || null,
            birth_place: metadata.birth_place || '',
            current_location: metadata.current_location || '',
            situation: metadata.situation || '',
            profession: metadata.profession || '',
            is_patriarch: metadata.is_patriarch || false,
            is_admin: metadata.is_admin || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            father_name: metadata.father_name || null,
            mother_name: metadata.mother_name || null,
          };

          try {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([profileData])
              .select()
              .single();

            if (createError) {
              console.error("Erreur lors de la création automatique du profil :", createError);
              // Si c'est un conflit de clé primaire, essayer de récupérer le profil existant
              if (createError.code === '23505') {
                console.log("Profil déjà existant, tentative de récupération...");
                const { data: existingProfile, error: fetchError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', id)
                  .single();

                if (fetchError) {
                  throw fetchError;
                }
                return existingProfile;
              }
              throw createError;
            }

            console.log("Profil créé automatiquement avec succès");
            return newProfile;
          } catch (createError) {
            console.error("Erreur lors de la création automatique du profil :", createError);
            throw createError;
          }
        }

        throw error;
      }

      return data;
    },

    async createProfile(profile: ProfileData) {
      try {
        const data = {
          ...profile,
          relationship_type: profile.relationship_type?.toLowerCase() as Database['public']['Enums']['relationship_type'],
          title: profile.title || 'Fils' as Database['public']['Enums']['family_title'],
          father_name: profile.father_id || null,
          mother_name: profile.mother_id || null
        };

        console.log('Données à insérer dans la base:', data);

        const { data: result, error } = await supabase
          .from('profiles')
          .insert([data])
          .select()
          .single();

        if (error) {
          console.error('Erreur lors de la création du profil:', error);
          throw error;
        }

        console.log('Profil créé avec succès:', result);
        return { data: result, error: null };
      } catch (error) {
        console.error('Erreur dans createProfile:', error);
        throw error;
      }
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

  stats: {
    async getFamilyStats() {
      try {
        console.log('[getFamilyStats] Début du calcul des statistiques');

        const { data, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) {
          console.error('[getFamilyStats] Erreur lors de la récupération des profils:', error);
          throw error;
        }

        const members = data || [];
        console.log('[getFamilyStats] Nombre de membres récupérés:', members.length);
        console.log('[getFamilyStats] Membres:', members.map(m => ({ id: m.id, name: `${m.first_name} ${m.last_name}`, title: m.title })));

        const totalMembers = members.length;

        // Calculer les générations basées sur les relations
        const generations = this.calculateGenerations(members);
        console.log('[getFamilyStats] Générations calculées:', generations);

        // Calculer les branches actives (membres avec des enfants)
        const activeBranches = this.calculateActiveBranches(members);
        console.log('[getFamilyStats] Branches actives calculées:', activeBranches);

        // Nouvelles métriques
        const stats = {
          totalMembers,
          generations,
          activeBranches,
          // Statistiques par genre/titre
          patriarchs: members.filter(m => m.is_patriarch || m.title?.toLowerCase().includes('patriarche')).length,
          matriarchs: members.filter(m => m.title?.toLowerCase().includes('matriarche')).length,
          admins: members.filter(m => m.is_admin).length,
          // Statistiques par âge
          averageAge: this.calculateAverageAge(members),
          ageDistribution: this.calculateAgeDistribution(members),
          // Statistiques par localisation
          locations: this.getLocationStats(members),
          // Statistiques par statut
          statusDistribution: this.getStatusDistribution(members),
          // Statistiques par relation
          relationshipDistribution: this.getRelationshipDistribution(members),
          // Statistiques temporelles
          recentMembers: members.filter(m => {
            const createdDate = new Date(m.created_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdDate > thirtyDaysAgo;
          }).length,
          // Statistiques de connectivité
          connectedMembers: this.calculateConnectedMembers(members),
          isolatedMembers: this.calculateIsolatedMembers(members)
        };

        console.log('[getFamilyStats] Statistiques calculées:', stats);
        return stats;
      } catch (error) {
        console.error('[getFamilyStats] Erreur lors du calcul des statistiques:', error);
        return {
          totalMembers: 0,
          generations: 0,
          activeBranches: 0,
          patriarchs: 0,
          matriarchs: 0,
          admins: 0,
          averageAge: 0,
          ageDistribution: {},
          locations: {},
          statusDistribution: {},
          relationshipDistribution: {},
          recentMembers: 0,
          connectedMembers: 0,
          isolatedMembers: 0
        };
      }
    },

    calculateGenerations(members: Profile[]): number {
      if (members.length === 0) return 0;

      // Trouver les racines (membres sans parents)
      const roots = members.filter(member =>
        !member.father_name && !member.mother_name
      );

      if (roots.length === 0) return 1; // Au moins une génération

      // Calculer la profondeur maximale
      const maxDepth = Math.max(...roots.map(root =>
        this.getMemberDepth(root, members)
      ));

      return Math.max(1, maxDepth);
    },

    getMemberDepth(member: Profile, allMembers: Profile[], visited = new Set<string>()): number {
      if (visited.has(member.id)) return 0;
      visited.add(member.id);

      // Trouver les enfants de ce membre
      const children = allMembers.filter(m =>
        m.father_name === member.first_name || m.mother_name === member.first_name
      );

      if (children.length === 0) return 1;

      const maxChildDepth = Math.max(...children.map(child =>
        this.getMemberDepth(child, allMembers, visited)
      ));

      return 1 + maxChildDepth;
    },

    calculateActiveBranches(members: Profile[]): number {
      return members.filter(member => {
        // Un membre a une branche active s'il a des enfants
        return members.some(m =>
          m.father_name === member.first_name || m.mother_name === member.first_name
        );
      }).length;
    },

    calculateAverageAge(members: Profile[]): number {
      const membersWithAge = members.filter(m => m.birth_date);
      if (membersWithAge.length === 0) return 0;

      const totalAge = membersWithAge.reduce((sum, member) => {
        const birthDate = new Date(member.birth_date!);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return sum + age;
      }, 0);

      return Math.round(totalAge / membersWithAge.length);
    },

    calculateAgeDistribution(members: Profile[]): Record<string, number> {
      const distribution: Record<string, number> = {
        '0-18': 0,
        '19-30': 0,
        '31-50': 0,
        '51-70': 0,
        '70+': 0
      };

      members.forEach(member => {
        if (member.birth_date) {
          const birthDate = new Date(member.birth_date);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();

          if (age <= 18) distribution['0-18']++;
          else if (age <= 30) distribution['19-30']++;
          else if (age <= 50) distribution['31-50']++;
          else if (age <= 70) distribution['51-70']++;
          else distribution['70+']++;
        }
      });

      return distribution;
    },

    getLocationStats(members: Profile[]): Record<string, number> {
      const locations: Record<string, number> = {};

      members.forEach(member => {
        if (member.current_location) {
          const location = member.current_location.trim();
          if (location) {
            locations[location] = (locations[location] || 0) + 1;
          }
        }
      });

      return locations;
    },

    getStatusDistribution(members: Profile[]): Record<string, number> {
      const status: Record<string, number> = {};

      members.forEach(member => {
        const memberStatus = member.situation || 'Non spécifié';
        status[memberStatus] = (status[memberStatus] || 0) + 1;
      });

      return status;
    },

    getRelationshipDistribution(members: Profile[]): Record<string, number> {
      const relationships: Record<string, number> = {};

      members.forEach(member => {
        const relationship = member.relationship_type || 'Non spécifié';
        relationships[relationship] = (relationships[relationship] || 0) + 1;
      });

      return relationships;
    },

    calculateConnectedMembers(members: Profile[]): number {
      return members.filter(member =>
        member.father_name || member.mother_name
      ).length;
    },

    calculateIsolatedMembers(members: Profile[]): number {
      return members.filter(member =>
        !member.father_name && !member.mother_name
      ).length;
    },
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

      // Construire l'URL publique correctement
      const publicURL = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath).data.publicUrl;

      console.log('URL publique générée:', publicURL);
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
