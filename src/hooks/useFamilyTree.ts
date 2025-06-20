import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FamilyMember } from '@/types/family';

interface TreeNode {
  id: string;
  name: string;
  title: string;
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

    // Trouver le patriarche (membre sans père ni mère, ou avec title "Patriarche")
    const patriarch = members.find(member =>
      (!member.fatherId && !member.motherId) ||
      member.title.toLowerCase().includes('patriarche')
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
      if (potentialChild.fatherId === member.id || potentialChild.motherId === member.id) {
        children.push(buildNodeFromMember(potentialChild, memberMap));
      }
    });

    return {
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      title: member.title,
      photoUrl: member.photoUrl,
      attributes: {
        birthDate: member.birthDate,
        currentLocation: member.currentLocation,
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
            firstName: 'Pierre',
            lastName: 'Martin',
            title: 'Patriarche',
            birthDate: '1945-03-15',
            currentLocation: 'Lyon, France',
            photoUrl: '',
            situation: 'Marié',
            email: 'pierre.martin@example.com',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          },
          {
            id: '2',
            firstName: 'Marie',
            lastName: 'Martin',
            title: 'Matriarche',
            birthDate: '1948-07-22',
            currentLocation: 'Lyon, France',
            photoUrl: '',
            situation: 'Mariée',
            email: 'marie.martin@example.com',
            spouseId: '1',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          },
          {
            id: '3',
            firstName: 'Jean',
            lastName: 'Martin',
            title: 'Fils',
            birthDate: '1975-11-10',
            currentLocation: 'Paris, France',
            photoUrl: '',
            situation: 'Marié',
            email: 'jean.martin@example.com',
            fatherId: '1',
            motherId: '2',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          },
          {
            id: '4',
            firstName: 'Sophie',
            lastName: 'Martin',
            title: 'Fille',
            birthDate: '1978-05-18',
            currentLocation: 'Nice, France',
            photoUrl: '',
            situation: 'Célibataire',
            email: 'sophie.martin@example.com',
            fatherId: '1',
            motherId: '2',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          }
        ];
        const tree = buildTree(mockMembers);
        setTreeData(tree);
      } else {
        // Convertir les données profiles en FamilyMember
        const familyMembers: FamilyMember[] = profiles.map(profile => ({
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          title: profile.title || 'Fils' as const,
          birthDate: profile.birth_date || '',
          birthPlace: profile.birth_place || '',
          currentLocation: profile.current_location || '',
          phone: profile.phone || '',
          email: profile.email,
          photoUrl: profile.avatar_url || '',
          fatherId: profile.father_id || '',
          motherId: profile.mother_id || '',
          situation: profile.situation || '',
          profession: '', // Pas dans profiles pour l'instant
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
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
