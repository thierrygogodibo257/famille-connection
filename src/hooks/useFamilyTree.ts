import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FamilyMember } from '@/types/family';

interface TreeNode {
  id: string;
  name: string;
  civilite: string;
  photoUrl?: string;
  attributes?: {
    birthDate?: string;
    currentLocation?: string;
    situation?: string;
  };
  children?: TreeNode[];
}

export const useFamilyTree = () => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildTree = (members: FamilyMember[]): TreeNode | null => {
    if (members.length === 0) return null;

    // Créer un map pour accès rapide aux membres
    const memberMap = new Map<string, FamilyMember>();
    members.forEach(member => memberMap.set(member.id, member));

    // Trouver le patriarche (membre sans père ni mère, ou avec civilite "Patriarche")
    const patriarch = members.find(member =>
      (!member.father_id && !member.mother_id) ||
      member.civilite.toLowerCase().includes('patriarche')
    );

    if (!patriarch) {
      // Si pas de patriarche trouvé, prendre le premier membre
      return buildNodeFromMember(members[0], memberMap);
    }

    return buildNodeFromMember(patriarch, memberMap);
  };

  const buildNodeFromMember = (member: FamilyMember, memberMap: Map<string, FamilyMember>): TreeNode => {
    // Trouver les enfants de ce membre
    const children: TreeNode[] = [];

    // Chercher tous les membres qui ont ce membre comme père ou mère
    memberMap.forEach(potentialChild => {
      if (potentialChild.father_id === member.id || potentialChild.mother_id === member.id) {
        children.push(buildNodeFromMember(potentialChild, memberMap));
      }
    });

    return {
      id: member.id,
      name: `${member.first_name} ${member.last_name}`,
      civilite: member.civilite,
      photoUrl: member.avatar_url,
      attributes: {
        birthDate: member.birth_date,
        currentLocation: member.current_location,
        situation: member.situation
      },
      children: children.length > 0 ? children : undefined
    };
  };

  const fetchFamilyData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      if (!profiles || profiles.length === 0) {
        // Utiliser les données mockées si pas de données en base
        const mockMembers: FamilyMember[] = [
          {
            id: '1',
            first_name: 'Pierre',
            last_name: 'Martin',
            civilite: 'Patriarche',
            birth_date: '1945-03-15',
            birth_place: 'Lyon, France',
            current_location: 'Lyon, France',
            avatar_url: '',
            situation: 'Marié',
            email: 'pierre.martin@example.com',
            father_id: null,
            mother_id: null,
            created_at: '2024-01-01',
            updated_at: '2024-01-01'
          },
          {
            id: '2',
            first_name: 'Marie',
            last_name: 'Martin',
            civilite: 'Matriarche',
            birth_date: '1948-07-22',
            birth_place: 'Lyon, France',
            current_location: 'Lyon, France',
            avatar_url: '',
            situation: 'Mariée',
            email: 'marie.martin@example.com',
            father_id: null,
            mother_id: null,
            created_at: '2024-01-01',
            updated_at: '2024-01-01'
          },
          {
            id: '3',
            first_name: 'Jean',
            last_name: 'Martin',
            civilite: 'Fils',
            birth_date: '1975-11-10',
            birth_place: 'Lyon, France',
            current_location: 'Paris, France',
            avatar_url: '',
            situation: 'Marié',
            email: 'jean.martin@example.com',
            father_id: '1',
            mother_id: '2',
            created_at: '2024-01-01',
            updated_at: '2024-01-01'
          },
          {
            id: '4',
            first_name: 'Sophie',
            last_name: 'Martin',
            civilite: 'Fille',
            birth_date: '1978-05-18',
            birth_place: 'Lyon, France',
            current_location: 'Nice, France',
            avatar_url: '',
            situation: 'Célibataire',
            email: 'sophie.martin@example.com',
            father_id: '1',
            mother_id: '2',
            created_at: '2024-01-01',
            updated_at: '2024-01-01'
          }
        ];
        const tree = buildTree(mockMembers);
        setTreeData(tree);
      } else {
        // Convertir les données profiles en FamilyMember
        const familyMembers: FamilyMember[] = profiles.map(profile => ({
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          civilite: profile.civilite || 'Fils' as const,
          birth_date: profile.birth_date || '',
          birth_place: profile.birth_place || '',
          current_location: profile.current_location || '',
          phone: profile.phone || '',
          email: profile.email,
          avatar_url: profile.avatar_url || '',
          father_id: profile.father_id || '',
          mother_id: profile.mother_id || '',
          situation: profile.situation || '',
          profession: '', // Pas dans profiles pour l'instant
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }));

        const tree = buildTree(familyMembers);
        setTreeData(tree);
      }
    } catch (err) {
      console.error('Error fetching family data:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  return {
    treeData,
    isLoading,
    error,
    refetch: fetchFamilyData
  };
};
