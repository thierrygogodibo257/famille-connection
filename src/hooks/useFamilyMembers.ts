import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FamilyMember, NewFamilyMember } from '@/types/family';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useFamilyMembers = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      console.log('[useFamilyMembers] Fetching members...');
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      console.log('[useFamilyMembers] Supabase response:', { data, error: fetchError });

      if (!data || data.length === 0) {
        console.warn('[useFamilyMembers] No family members found in database!');
      } else {
        console.log(`[useFamilyMembers] ${data.length} members fetched.`);
        console.log('[useFamilyMembers] First member:', data[0]);
      }

      if (fetchError) {
        throw fetchError;
      }

      // Convertir les données en type FamilyMember
      const familyMembers: FamilyMember[] = (data || []).map(member => ({
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        title: member.title as FamilyMember['title'],
        birth_date: member.birth_date,
        birth_place: member.birth_place,
        current_location: member.current_location,
        situation: member.situation,
        avatar_url: member.avatar_url,
        father_id: member.father_id,
        mother_id: member.mother_id,
        created_at: member.created_at,
        updated_at: member.updated_at
      }));

      setMembers(familyMembers);
      console.log('[useFamilyMembers] Members updated:', familyMembers);
    } catch (err) {
      console.error('[useFamilyMembers] Erreur lors de la récupération des membres:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
      console.log('[useFamilyMembers] Fetch finished.');
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
        title: data.title as FamilyMember['title'],
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
        title: data.title as FamilyMember['title'],
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
        title: data.title as FamilyMember['title'],
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
