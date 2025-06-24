import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Users, TreePine, Plus, Settings, User, Mail, Phone, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/shared/Avatar';
import { ROUTES } from '@/lib/constants/routes';
import { api } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';

interface FamilyStats {
  totalMembers: number;
  generations: number;
  activeBranches: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [stats, setStats] = useState<FamilyStats>({
    totalMembers: 0,
    generations: 0,
    activeBranches: 0
  });
  const [loading, setLoading] = useState(true);
  const [nonMemberCount, setNonMemberCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const familyStats = await api.stats.getFamilyStats();
        setStats(familyStats);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        // En cas d'erreur, on garde les valeurs par défaut (0)
        setStats({
          totalMembers: 0,
          generations: 0,
          activeBranches: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Amélioration : fetch des utilisateurs inscrits mais pas encore membres
    const fetchNonMembers = async () => {
      try {
        // Récupère tous les profils pour voir qui a un compte
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, created_at')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Erreur lors de la récupération des profils:', profilesError);
          setNonMemberCount(0);
          return;
        }

        // Compter les profils qui ne sont pas encore des membres actifs
        // (ceux qui n'ont pas de relation familiale définie)
        const { data: membersData, error: membersError } = await supabase
          .from('profiles')
          .select('id')
          .or('father_id.is.not.null,mother_id.is.not.null,is_patriarch.eq.true');

        if (membersError) {
          console.error('Erreur lors de la récupération des membres:', membersError);
          setNonMemberCount(profilesData?.length || 0);
          return;
        }

        const memberIds = new Set((membersData || []).map(p => p.id));
        const nonMembers = (profilesData || []).filter(p => !memberIds.has(p.id));

        setNonMemberCount(nonMembers.length);
        console.log('Utilisateurs inscrits mais non-membres:', nonMembers.length);
      } catch (e) {
        console.error('Erreur lors du calcul des non-membres:', e);
        setNonMemberCount(0);
      }
    };

    fetchNonMembers();
  }, []);

  const dashboardItems = [
    {
      id: 'tree',
      title: 'Arbre Généalogique',
      description: 'Visualisez et gérez votre arbre familial',
      icon: TreePine,
      path: '/dashboard/tree',
      color: 'bg-gradient-to-br from-whatsapp-500 to-whatsapp-600',
    },
    {
      id: 'members',
      title: 'Membres',
      description: 'Gérez les membres de votre famille',
      icon: Users,
      path: '/dashboard/members',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
  ];

  const inviteCard = {
    id: 'invite',
    title: 'Ajouter un membre',
    description: 'Ajoutez de nouveaux membres à la famille',
    icon: Plus,
    path: '/dashboard/invite',
    color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-600">
          Gérez votre arbre généalogique et votre famille
        </p>
      </div>

      {/* Layout des cartes du dashboard (haut) : */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Carte Profil Utilisateur en premier */}
        <Card
          className={cn(
            'p-6 min-w-[320px] cursor-pointer transition-all duration-300 hover-lift glass-effect',
            hoveredCard === 'profile' && 'transform -translate-y-2 shadow-xl'
          )}
          onMouseEnter={() => setHoveredCard('profile')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => navigate(ROUTES.DASHBOARD.PROFILE)}
        >
          <div className="flex items-center space-x-4 mb-4">
            <Avatar
              src={user?.user_metadata?.avatar_url}
              fallback={user?.user_metadata?.display_name?.[0] || user?.email?.[0] || 'U'}
              className="w-30 h-30 ring-2 ring-purple-200"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.user_metadata?.display_name}
              </h3>
              <p className="text-sm text-gray-600 flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                {user?.email}
              </p>
              {user?.user_metadata?.phone && (
                <p className="text-sm text-gray-600 flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  {user.user_metadata.phone}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">Profil</span>
            </div>
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300',
              'bg-gradient-to-br from-purple-500 to-purple-600',
              hoveredCard === 'profile' && 'animate-bounce'
            )}>
              <Settings className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-center">
            {user?.user_metadata?.is_patriarch ? (
              <span className="px-4 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold shadow-lg text-md border-2 border-yellow-300 animate-bounce-in-3d">
                Patriarche
              </span>
            ) : user?.user_metadata?.relationship ? (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold shadow text-sm border border-blue-300 animate-bounce-in-3d">
                {user.user_metadata.relationship.charAt(0).toUpperCase() + user.user_metadata.relationship.slice(1)}
              </span>
            ) : null}
          </div>
          <p className="text-gray-600 text-sm mt-2">
            Gérez vos informations personnelles
          </p>
        </Card>
        {/* Autres cartes dashboard */}
        {dashboardItems.map((item) => {
          const Icon = item.icon;
          const isHovered = hoveredCard === item.id;
          return (
            <Card
              key={item.id}
              className={cn(
                'p-6 min-w-[320px] cursor-pointer transition-all duration-300 hover-lift glass-effect',
                isHovered && 'transform -translate-y-2 shadow-xl'
              )}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate(item.path)}
            >
              <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300',
                item.color,
                isHovered && 'animate-bounce'
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {item.description}
              </p>
            </Card>
          );
        })}
        {/* Carte Vidéos événementielles en dernier */}
        <Card
          className={cn(
            'p-6 min-w-[320px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover-lift glass-effect',
            hoveredCard === 'videos' && 'transform -translate-y-2 shadow-xl'
          )}
          onMouseEnter={() => setHoveredCard('videos')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => {/* TODO: navigation vers la page vidéos */}}
        >
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br from-pink-500 to-yellow-500">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
            Ajouter vos vidéos événementielles
          </h3>
          <p className="text-gray-600 text-sm text-center">
            Toutes vos cérémonies, anniversaires et autres en Album interactif
          </p>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 glass-effect">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total des membres</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalMembers}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6 glass-effect">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TreePine className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Générations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.generations}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6 glass-effect">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Branches actives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.activeBranches}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6 glass-effect">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Utilisateurs inscrits (non-membres)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {nonMemberCount === null ? '...' : nonMemberCount}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
