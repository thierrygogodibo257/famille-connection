import { useCallback, useState } from 'react';
import Tree from 'react-d3-tree';
import { FamilyMember } from '@/types/family';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { Loader2, Calendar, MapPin } from 'lucide-react';

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

export const InteractiveFamilyTree = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { members, isLoading, error } = useFamilyMembers();

  const buildTree = useCallback((members: FamilyMember[]): TreeNode | null => {
    if (members.length === 0) return null;

    // Créer un map pour accès rapide aux membres
    const memberMap = new Map<string, FamilyMember>();
    members.forEach(member => memberMap.set(member.id, member));

    // Trouver le patriarche (membre sans parent)
    const patriarch = members.find(member => !member.father_id && !member.mother_id);

    if (!patriarch) {
      // Si pas de patriarche trouvé, prendre le premier membre
      return buildNodeFromMember(members[0], memberMap);
    }

    return buildNodeFromMember(patriarch, memberMap);
  }, []);

  const buildNodeFromMember = (member: FamilyMember, memberMap: Map<string, FamilyMember>): TreeNode => {
    // Trouver les enfants de ce membre
    const children: TreeNode[] = [];

    // Chercher tous les membres qui ont ce membre comme parent
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

  const renderCustomNodeElement = useCallback(({ nodeDatum, toggleNode }: any) => (
    <g>
      <foreignObject width="280" height="200" x="-140" y="-100">
        <div className="relative w-64 p-4 rounded-xl glass-effect cursor-pointer transition-all duration-300 hover-lift animate-fade-in">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative rounded-full overflow-hidden bg-gradient-to-br from-whatsapp-100 to-whatsapp-200 flex items-center justify-center border-2 border-white shadow-md w-16 h-16 ring-4 ring-white/50">
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-whatsapp-400 to-whatsapp-500 text-white font-semibold">
                {nodeDatum.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">{nodeDatum.name}</h3>
              <p className="text-whatsapp-600 font-medium text-sm">{nodeDatum.civilite}</p>
              {nodeDatum.attributes?.situation && (
                <p className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  {nodeDatum.attributes.situation}
                </p>
              )}
            </div>

            <div className="w-full space-y-2 text-xs">
              {nodeDatum.attributes?.birthDate && (
                <div className="flex items-center justify-center space-x-1 text-gray-600">
                  <Calendar className="w-3 h-3" />
                  <span>{nodeDatum.attributes.birthDate}</span>
                </div>
              )}
              {nodeDatum.attributes?.currentLocation && (
                <div className="flex items-center justify-center space-x-1 text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>{nodeDatum.attributes.currentLocation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </foreignObject>
    </g>
  ), []);

  console.log('[InteractiveFamilyTree] members:', members);
  const treeData = buildTree(members);
  console.log('[InteractiveFamilyTree] treeData:', treeData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-whatsapp-500" />
      </div>
    );
  }

  if (error) {
    console.error('[InteractiveFamilyTree] Error:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  if (!treeData) {
    console.warn('[InteractiveFamilyTree] No treeData to render!');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <span className="text-gray-400 text-2xl">👨‍👩‍👧‍👦</span>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600 font-medium">Aucune donnée familiale trouvée</p>
            <p className="text-gray-500 text-sm">Commencez par ajouter des membres à votre famille</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('[InteractiveFamilyTree] Rendering Tree with data:', treeData);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <Tree
        key={treeData.id}
        data={treeData}
        translate={{ x: 400, y: 150 }}
        orientation="vertical"
        pathFunc="diagonal"
        renderCustomNodeElement={renderCustomNodeElement}
        separation={{ siblings: 1.5, nonSiblings: 2 }}
        nodeSize={{ x: 300, y: 250 }}
        zoom={0.8}
        scaleExtent={{ min: 0.3, max: 2 }}
        enableLegacyTransitions
        transitionDuration={500}
        onNodeClick={(nodeData) => {
          console.log('Node clicked:', nodeData);
          setSelectedNode(nodeData.id);
        }}
      />
    </div>
  );
};
