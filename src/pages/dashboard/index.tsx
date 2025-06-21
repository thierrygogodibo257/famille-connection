import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Users, TreePine, Plus, Settings, User, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { ROUTES } from '@/lib/constants/routes';
import { api } from '@/services/api';
import { StatsChart } from '@/components/dashboard/StatsChart';

interface FamilyStats {
  totalMembers: number;
  generations: number;
  activeBranches: number;
  patriarchs: number;
  matriarchs: number;
  admins: number;
  averageAge: number;
  ageDistribution: Record<string, number>;
  locations: Record<string, number>;
  statusDistribution: Record<string, number>;
  relationshipDistribution: Record<string, number>;
  recentMembers: number;
  connectedMembers: number;
  isolatedMembers: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [stats, setStats] = useState<FamilyStats>({
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
  });
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setStatsError(null);
      const familyStats = await api.stats.getFamilyStats();
      setStats(familyStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setStatsError('Erreur lors du chargement des statistiques');
      // En cas d'erreur, on garde les valeurs par défaut (0)
      setStats({
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
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await api.profiles.getProfileById(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          // En cas d'erreur, utiliser les métadonnées utilisateur
          setUserProfile({
            first_name: user.user_metadata?.first_name,
            last_name: user.user_metadata?.last_name,
            avatar_url: user.user_metadata?.photo_url,
            photo_url: user.user_metadata?.photo_url,
            is_admin: user.user_metadata?.is_admin,
            is_patriarch: user.user_metadata?.is_patriarch,
            email: user.email,
            phone: user.user_metadata?.phone
          });
        }
      }
    };

    fetchStats();
    fetchUserProfile();

    // Rafraîchir les statistiques toutes les 5 minutes
    const statsInterval = setInterval(fetchStats, 5 * 60 * 1000);

    return () => {
      clearInterval(statsInterval);
    };
  }, [user]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardItems.map((item) => {
          const Icon = item.icon;
          const isHovered = hoveredCard === item.id;

          return (
            <Card
              key={item.id}
              className={cn(
                'p-6 cursor-pointer transition-all duration-300 hover-lift glass-effect',
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

        {/* Carte Profil Utilisateur */}
        <Card
          className={cn(
            'p-6 cursor-pointer transition-all duration-300 hover-lift glass-effect',
            hoveredCard === 'profile' && 'transform -translate-y-2 shadow-xl'
          )}
          onMouseEnter={() => setHoveredCard('profile')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => navigate(ROUTES.DASHBOARD.PROFILE)}
        >
          <div className="flex items-center space-x-4 mb-4">
            <UserAvatar
              user={userProfile || {
                first_name: user?.user_metadata?.first_name || 'Utilisateur',
                last_name: user?.user_metadata?.last_name || '',
                email: user?.email || '',
                avatar_url: user?.user_metadata?.photo_url,
                photo_url: user?.user_metadata?.photo_url
              }}
              size="lg"
              className="w-20 h-20 ring-2 ring-purple-200"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {userProfile?.first_name || user?.user_metadata?.first_name || 'Utilisateur'} {userProfile?.last_name || user?.user_metadata?.last_name || ''}
              </h3>
              <p className="text-sm text-gray-600 flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                {userProfile?.email || user?.email}
              </p>
              {(userProfile?.phone || user?.user_metadata?.phone) && (
                <p className="text-sm text-gray-600 flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  {userProfile?.phone || user?.user_metadata?.phone}
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

          {/* Badge Patriarche ou Affiliation */}
          <div className="mt-2 flex items-center justify-center">
            {(userProfile?.is_patriarch || user?.user_metadata?.is_patriarch) ? (
              <span className="px-4 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold shadow-lg text-md border-2 border-yellow-300 animate-bounce-in-3d">
                Patriarche
              </span>
            ) : (userProfile?.relationship_type || user?.user_metadata?.relationship_type) ? (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold shadow text-sm border border-blue-300 animate-bounce-in-3d">
                {(userProfile?.relationship_type || user?.user_metadata?.relationship_type).charAt(0).toUpperCase() + (userProfile?.relationship_type || user?.user_metadata?.relationship_type).slice(1)}
              </span>
            ) : null}
          </div>

          <p className="text-gray-600 text-sm mt-2">
            Gérez vos informations personnelles
          </p>
        </Card>

        {/* Carte Ajouter un membre en dernier */}
        <Card
          key={inviteCard.id}
          className={cn(
            'p-6 cursor-pointer transition-all duration-300 hover-lift glass-effect',
            hoveredCard === inviteCard.id && 'transform -translate-y-2 shadow-xl'
          )}
          onMouseEnter={() => setHoveredCard(inviteCard.id)}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => navigate(inviteCard.path)}
        >
          <div className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300',
            inviteCard.color,
            hoveredCard === inviteCard.id && 'animate-bounce'
          )}>
            <Plus className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {inviteCard.title}
          </h3>
          <p className="text-gray-600 text-sm">
            {inviteCard.description}
          </p>
        </Card>
      </div>

      {/* Section Statistiques */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Statistiques de la Famille
          </h2>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-whatsapp-500 text-white rounded-lg hover:bg-whatsapp-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Chargement...' : 'Actualiser'}</span>
          </button>
        </div>

        {/* Message d'erreur */}
        {statsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700">{statsError}</span>
              </div>
              <button
                onClick={fetchStats}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center hover-lift transition-all duration-300">
            <div className="text-3xl font-bold text-whatsapp-600 mb-2">
              {loading ? (
                <div className="animate-pulse bg-whatsapp-200 h-8 w-16 mx-auto rounded"></div>
              ) : (
                stats.totalMembers
              )}
            </div>
            <div className="text-gray-600">Membres Totaux</div>
            {stats.recentMembers > 0 && (
              <div className="text-xs text-green-600 mt-1">
                +{stats.recentMembers} ce mois
              </div>
            )}
          </Card>
          <Card className="p-6 text-center hover-lift transition-all duration-300">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {loading ? (
                <div className="animate-pulse bg-blue-200 h-8 w-16 mx-auto rounded"></div>
              ) : (
                stats.generations
              )}
            </div>
            <div className="text-gray-600">Générations</div>
            {stats.averageAge > 0 && (
              <div className="text-xs text-blue-600 mt-1">
                Âge moyen: {stats.averageAge} ans
              </div>
            )}
          </Card>
          <Card className="p-6 text-center hover-lift transition-all duration-300">
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              {loading ? (
                <div className="animate-pulse bg-emerald-200 h-8 w-16 mx-auto rounded"></div>
              ) : (
                stats.activeBranches
              )}
            </div>
            <div className="text-gray-600">Branches Actives</div>
            <div className="text-xs text-emerald-600 mt-1">
              {stats.connectedMembers} connectés
            </div>
          </Card>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-4 text-center hover-lift transition-all duration-300">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {loading ? '...' : stats.patriarchs}
            </div>
            <div className="text-sm text-gray-600">Patriarches</div>
          </Card>
          <Card className="p-4 text-center hover-lift transition-all duration-300">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {loading ? '...' : stats.matriarchs}
            </div>
            <div className="text-sm text-gray-600">Matriarches</div>
          </Card>
          <Card className="p-4 text-center hover-lift transition-all duration-300">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {loading ? '...' : stats.admins}
            </div>
            <div className="text-sm text-gray-600">Administrateurs</div>
          </Card>
          <Card className="p-4 text-center hover-lift transition-all duration-300">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {loading ? '...' : stats.isolatedMembers}
            </div>
            <div className="text-sm text-gray-600">Membres Isolés</div>
          </Card>
        </div>

        {/* Distribution par âge */}
        {Object.keys(stats.ageDistribution).length > 0 && (
          <div className="mb-8">
            <StatsChart
              title="Distribution par Âge"
              data={stats.ageDistribution}
              color="bg-indigo-500"
              maxBars={5}
            />
          </div>
        )}

        {/* Top localisations */}
        {Object.keys(stats.locations).length > 0 && (
          <div className="mb-8">
            <StatsChart
              title="Localisations Principales"
              data={stats.locations}
              color="bg-green-500"
              maxBars={6}
            />
          </div>
        )}

        {/* Distribution par relation */}
        {Object.keys(stats.relationshipDistribution).length > 0 && (
          <div className="mb-8">
            <StatsChart
              title="Types de Relations"
              data={stats.relationshipDistribution}
              color="bg-teal-500"
              maxBars={8}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
