
import { useState, useCallback, useEffect } from 'react';
import { api } from '@/services/api';
import type { FamilyMember } from '@/types/family';

export const useFamilyMembers = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await api.profiles.getAll();

      const familyMembers: FamilyMember[] = data.map(profile => ({
        id: profile.id,
        profile_id: profile.id,
        tree_id: 1, // Default tree ID
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        title: profile.title,
        relationship_type: profile.relationship_type,
        birth_date: profile.birth_date,
        birth_place: profile.birth_place,
        current_location: profile.current_location,
        situation: profile.situation,
        avatar_url: profile.avatar_url || profile.photo_url,
        photo_url: profile.photo_url,
        father_id: profile.father_name, // Map father_name to father_id for compatibility
        mother_id: profile.mother_name, // Map mother_name to mother_id for compatibility
        is_admin: profile.is_admin,
        is_patriarch: profile.is_patriarch,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        connections: [] // Initialize connections as empty array
      }));

      console.log('[useFamilyMembers] Fetched members:', familyMembers);
      setMembers(familyMembers);
    } catch (err) {
      console.error('Erreur lors de la récupération des membres:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les membres automatiquement au montage
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = useCallback(async (memberData: Partial<FamilyMember>) => {
    try {
      setIsLoading(true);
      const result = await api.profiles.createProfile({
        id: crypto.randomUUID(),
        user_id: crypto.randomUUID(),
        email: memberData.email || '',
        first_name: memberData.first_name || '',
        last_name: memberData.last_name || '',
        phone: memberData.phone,
        current_location: memberData.current_location,
        birth_place: memberData.birth_place,
        avatar_url: memberData.avatar_url,
        relationship_type: memberData.relationship_type,
        father_id: memberData.father_id, // This will be mapped to father_name in the API
        mother_id: memberData.mother_id, // This will be mapped to mother_name in the API
        is_admin: memberData.is_admin || false,
        birth_date: memberData.birth_date,
        title: memberData.title,
        situation: memberData.situation,
        is_patriarch: memberData.is_patriarch || false
      });

      await fetchMembers(); // Rafraîchir la liste
      return result;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du membre:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMembers]);

  return {
    members,
    isLoading,
    error,
    fetchMembers,
    addMember
  };
};
