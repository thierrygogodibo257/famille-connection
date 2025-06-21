import { useCallback, useState, useEffect } from 'react';
import { FamilyMember } from '@/types/family';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { Loader2, Calendar, MapPin, Crown, Star } from 'lucide-react';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { motion, AnimatePresence } from 'framer-motion';

interface TreeNode {
  id: string;
  name: string;
  title: string;
  avatar_url?: string;
  photo_url?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_patriarch?: boolean;
  is_admin?: boolean;
  attributes?: {
    birthDate?: string;
    currentLocation?: string;
    situation?: string;
  };
  birthDate?: string;
  currentLocation?: string;
  situation?: string;
  children?: TreeNode[];
  level: number;
  position: { x: number; y: number };
  x: number;
  y: number;
  connections?: string[];
}

export const InteractiveFamilyTree = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const { members, isLoading, error } = useFamilyMembers();

  // Fonction pour construire l'arbre familial
  const buildTree = useCallback((members: FamilyMember[]): TreeNode | null => {
    if (members.length === 0) return null;

    // Créer un map pour accès rapide aux membres
    const memberMap = new Map<string, FamilyMember>();
    members.forEach(member => memberMap.set(member.id, member));

    // Trouver le patriarche ou matriarche (priorité patriarche)
    const patriarch = members.find(member =>
      member.is_patriarch === true ||
      (member.title?.toLowerCase().includes('patriarche') || member.title?.toLowerCase().includes('matriarche'))
    );

    // Si pas de patriarche/matriarche, trouver le plus ancien membre
    const oldestMember = members.reduce((oldest, current) => {
      const oldestDate = new Date(oldest.birth_date || '2999-12-31');
      const currentDate = new Date(current.birth_date || '2999-12-31');
      return currentDate < oldestDate ? current : oldest;
    }, members[0]);

    const rootMember = patriarch || oldestMember;

    return buildNodeFromMember(rootMember, memberMap, 0, { x: 0, y: 0 });
  }, []);

  const buildNodeFromMember = (
    member: FamilyMember,
    memberMap: Map<string, FamilyMember>,
    level: number,
    position: { x: number; y: number }
  ): TreeNode => {
    // Trouver les enfants de ce membre en utilisant father_id et mother_id
    // qui contiennent maintenant les noms des parents
    const children: TreeNode[] = [];
    const childMembers = Array.from(memberMap.values()).filter(potentialChild =>
      potentialChild.father_id === member.first_name || potentialChild.mother_id === member.first_name
    );

    // Calculer les positions des enfants
    const childSpacing = 200;
    const totalWidth = (childMembers.length - 1) * childSpacing;
    const startX = -totalWidth / 2;

    childMembers.forEach((child, index) => {
      const childPosition = {
        x: startX + index * childSpacing,
        y: level * 250 + 250
      };
      children.push(buildNodeFromMember(child, memberMap, level + 1, childPosition));
    });

    return {
      id: member.id,
      name: `${member.first_name} ${member.last_name}`,
      title: member.title || 'Membre',
      avatar_url: member.avatar_url,
      photo_url: member.photo_url,
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      is_patriarch: member.is_patriarch,
      is_admin: member.is_admin,
      attributes: {
        birthDate: member.birth_date,
        currentLocation: member.current_location,
        situation: member.situation
      },
      children,
      level,
      position: {
        x: position.x,
        y: position.y
      },
      x: position.x,
      y: position.y,
      connections: member.connections || [] // Ajout des connexions
    };
  };

  useEffect(() => {
    if (members.length > 0) {
      const tree = buildTree(members);
      setTreeData(tree);
    }
  }, [members, buildTree]);

  const renderNode = (node: TreeNode) => {
    const isSelected = selectedNode === node.id;
    const isPatriarch = node.is_patriarch || node.title?.toLowerCase().includes('patriarche') || node.title?.toLowerCase().includes('matriarche');

    // Créer un objet utilisateur pour UserAvatar
    const userData = {
      avatar_url: node.avatar_url,
      photo_url: node.photo_url,
      first_name: node.first_name || node.name.split(' ')[0],
      last_name: node.last_name || node.name.split(' ').slice(1).join(' '),
      email: node.email || ''
    };

    return (
      <motion.div
        key={node.id}
        className="absolute"
        style={{
          left: `${node.position.x}px`,
          top: `${node.position.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: node.level * 0.1,
          type: "spring",
          stiffness: 200
        }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setSelectedNode(isSelected ? null : node.id)}
      >
        {/* Connecteurs vers les enfants */}
        {node.children && node.children.map((child, index) => (
          <svg
            key={`connector-${node.id}-${child.id}`}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: -1 }}
          >
            <motion.path
              d={`M 0 0 L ${child.position.x - node.position.x} ${child.position.y - node.position.y}`}
              stroke="url(#gradient)"
              strokeWidth="3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 + node.level * 0.1 }}
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          </svg>
        ))}

        {/* Bulle du membre */}
        <div className="relative">
          {/* Badge Patriarche/Matriarche */}
          {isPatriarch && (
            <motion.div
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 + node.level * 0.1 }}
            >
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
                <Crown className="w-3 h-3" />
                <span>{node.title}</span>
              </div>
            </motion.div>
          )}

          {/* Bulle principale */}
          <motion.div
            className={`
              relative w-32 h-32 rounded-full cursor-pointer transition-all duration-300
              ${isSelected
                ? 'ring-4 ring-whatsapp-400 shadow-2xl'
                : 'ring-2 ring-white/50 shadow-lg hover:shadow-xl'
              }
              ${isPatriarch
                ? 'bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300'
                : 'bg-gradient-to-br from-white via-gray-50 to-gray-100'
              }
              backdrop-blur-sm
            `}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
            }}
          >
            {/* Avatar au centre */}
            <div className="absolute inset-2">
              <UserAvatar
                user={userData}
                size="lg"
                className="w-full h-full"
              />
            </div>

            {/* Effet de brillance */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-50" />

            {/* Bordure animée pour patriarche */}
            {isPatriarch && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-yellow-400"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(251, 191, 36, 0.7)",
                    "0 0 0 10px rgba(251, 191, 36, 0)",
                    "0 0 0 0 rgba(251, 191, 36, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* Informations du membre (visible au survol ou sélection) */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 z-20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white rounded-lg shadow-xl p-4 min-w-64 border border-gray-200">
                  <div className="text-center space-y-2">
                    <h3 className="font-bold text-gray-900 text-lg">{node.name}</h3>
                    <p className="text-whatsapp-600 font-medium text-sm">{node.title}</p>

                    {node.attributes?.situation && (
                      <p className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        {node.attributes.situation}
                      </p>
                    )}

                    <div className="space-y-1 text-xs text-gray-600">
                      {node.attributes?.birthDate && (
                        <div className="flex items-center justify-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(node.attributes.birthDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}

                      {node.attributes?.currentLocation && (
                        <div className="flex items-center justify-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{node.attributes.currentLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const renderTreeNodes = (node: TreeNode): JSX.Element[] => {
    const nodes = [renderNode(node)];
    if (node.children) {
      node.children.forEach(child => {
        nodes.push(...renderTreeNodes(child));
      });
    }
    return nodes;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-whatsapp-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  if (!treeData) {
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

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 relative overflow-hidden">
      {/* Définition du gradient pour les connecteurs */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#059669" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Conteneur de l'arbre avec centrage automatique */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative">
          {renderTreeNodes(treeData)}
        </div>
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-300 border-2 border-yellow-400"></div>
            <span>Patriarche/Matriarche</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-white to-gray-100 border-2 border-gray-300"></div>
            <span>Membre</span>
          </div>
        </div>
      </div>
    </div>
  );
};
