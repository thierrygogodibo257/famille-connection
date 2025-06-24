import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types/profile';
import { FamilyMember, NewFamilyMember } from '@/types/family';
import { api } from '@/services/api';

export const useFamilyMembers = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching family members...');
      const profiles = await api.profiles.getAll();

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found');
        setMembers([]);
        return;
      }

      // Convertir les profils en membres de famille avec des valeurs par défaut sécurisées
      const familyMembers: FamilyMember[] = profiles.map(profile => ({
        id: profile.id || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        civilite: (profile.civilite as FamilyMember['civilite']) || 'M.',
        birth_date: profile.birth_date || null,
        birth_place: profile.birth_place || null,
        current_location: profile.current_location || null,
        situation: profile.situation || null,
        avatar_url: profile.avatar_url || null,
        father_id: profile.father_id || null,
        mother_id: profile.mother_id || null,
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString()
      }));

      console.log('Family members loaded:', familyMembers.length);
      setMembers(familyMembers);
    } catch (err) {
      console.error('Error fetching family members:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setMembers([]); // S'assurer que members n'est jamais undefined
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = useCallback(async (memberData: NewFamilyMember) => {
    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            ...memberData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Convertir les données en type FamilyMember
      const newMember: FamilyMember = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        civilite: data.civilite as FamilyMember['civilite'],
        birth_date: data.birth_date,
        birth_place: data.birth_place,
        current_location: data.current_location,
        situation: data.situation,
        avatar_url: data.avatar_url,
        father_id: data.father_id,
        mother_id: data.mother_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setMembers(prev => [...prev, newMember]);
      return newMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur lors de l\'ajout du membre:', err);
      throw err;
    }
  }, []);

  const updateMember = useCallback(async (id: string, memberData: Partial<FamilyMember>) => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...memberData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Convertir les données en type FamilyMember
      const updatedMember: FamilyMember = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        civilite: data.civilite as FamilyMember['civilite'],
        birth_date: data.birth_date,
        birth_place: data.birth_place,
        current_location: data.current_location,
        situation: data.situation,
        avatar_url: data.avatar_url,
        father_id: data.father_id,
        mother_id: data.mother_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setMembers(prev => prev.map(member => member.id === id ? updatedMember : member));
      return updatedMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur lors de la mise à jour du membre:', err);
      throw err;
    }
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur lors de la suppression du membre:', err);
      throw err;
    }
  }, []);

  const updateParentChildRelationship = useCallback(async (childId: string, parentId: string | null, isFather: boolean) => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          [isFather ? 'father_id' : 'mother_id']: parentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', childId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Convertir les données en type FamilyMember
      const updatedMember: FamilyMember = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        civilite: data.civilite as FamilyMember['civilite'],
        birth_date: data.birth_date,
        birth_place: data.birth_place,
        current_location: data.current_location,
        situation: data.situation,
        avatar_url: data.avatar_url,
        father_id: data.father_id,
        mother_id: data.mother_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setMembers(prev => prev.map(member => member.id === childId ? updatedMember : member));
      return updatedMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur lors de la mise à jour de la relation parent-enfant:', err);
      throw err;
    }
  }, []);

  return {
    members,
    isLoading,
    error,
    fetchMembers,
    addMember,
    updateMember,
    deleteMember,
    updateParentChildRelationship
  };
};
