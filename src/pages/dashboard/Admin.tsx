import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { Loader2, Edit, Trash2, Shield, ShieldOff, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/shared/Avatar';
import { useToast } from '@/hooks/use-toast';
import { DeleteUserButton } from '@/components/family/DeleteUserButton';
import { EditUserDialog } from '@/components/family/EditUserDialog';
import type { Profile } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'member'>('all');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const isAdmin = user?.user_metadata?.is_admin || false;

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !currentUser) {
        setError('Vous devez être connecté pour accéder à cette page');
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentUser.id)
        .single();

      if (!profile?.is_admin) {
        setError('Accès refusé. Seuls les administrateurs peuvent accéder à cette page.');
        setLoading(false);
        return;
      }

      const result = await api.getAllForAdmin();
      setMembers(result);

    } catch (error: any) {
      console.error('Erreur lors de la récupération des membres:', error);

      if (error.message?.includes('authentification')) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError('Erreur lors de la récupération des membres: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      await api.blockUser(userId, !isBlocked);
      toast({
        title: "Succès",
        description: `Utilisateur ${isBlocked ? 'débloqué' : 'bloqué'} avec succès`,
      });
      fetchMembers(); // Rafraîchir la liste
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      await api.toggleAdmin(userId, !isAdmin);
      toast({
        title: "Succès",
        description: `Utilisateur ${isAdmin ? 'retiré des admins' : 'promu admin'} avec succès`,
      });
      fetchMembers(); // Rafraîchir la liste
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (member: Profile) => {
    setEditingUser(member);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = () => {
    fetchMembers(); // Rafraîchir la liste après édition
  };

  const handleTestConnection = async () => {
    try {
      const result = await api.testConnection();
      console.log('Résultat test connexion:', result);
      toast({
        title: "Test de connexion",
        description: result.success ?
          `Connecté: ${result.user}, Admin: ${result.isAdmin}, Accès tous profils: ${result.canAccessAllProfiles}` :
          `Erreur: ${result.error}`,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Erreur test connexion:', error);
      toast({
        title: "Erreur test",
        description: "Erreur lors du test de connexion",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    fetchMembers();
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === 'all' ||
      (filterRole === 'admin' && member.is_admin) ||
      (filterRole === 'member' && !member.is_admin);

    return matchesSearch && matchesRole;
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/auth/login'}>
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">Seuls les administrateurs peuvent accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des membres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Administration des Membres</h1>
        <p className="text-gray-600">Gérez tous les membres de la famille</p>
        <Button
          onClick={handleTestConnection}
          variant="outline"
          className="mt-2"
        >
          Test Connexion
        </Button>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterRole === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterRole('all')}
          >
            Tous ({members.length})
          </Button>
          <Button
            variant={filterRole === 'admin' ? 'default' : 'outline'}
            onClick={() => setFilterRole('admin')}
          >
            Admins ({members.filter(m => m.is_admin).length})
          </Button>
          <Button
            variant={filterRole === 'member' ? 'default' : 'outline'}
            onClick={() => setFilterRole('member')}
          >
            Membres ({members.filter(m => !m.is_admin).length})
          </Button>
        </div>
      </div>

      {/* Tableau des membres */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar
                        src={member.photo_url}
                        size="sm"
                        fallback={`${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`}
                        className="mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.title || 'Membre'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={member.is_admin ? 'default' : 'secondary'}>
                      {member.is_admin ? 'Administrateur' : 'Membre'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={member.is_blocked ? 'destructive' : 'default'}>
                      {member.is_blocked ? 'Bloqué' : 'Actif'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.created_at ? new Date(member.created_at).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {/* Bouton bloquer/débloquer */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBlockUser(member.id, member.is_blocked || false)}
                        className="flex items-center gap-1"
                      >
                        {member.is_blocked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {member.is_blocked ? 'Débloquer' : 'Bloquer'}
                      </Button>

                      {/* Bouton admin/membre */}
                      {member.id !== user?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAdmin(member.id, member.is_admin || false)}
                          className="flex items-center gap-1"
                        >
                          {member.is_admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          {member.is_admin ? 'Retirer Admin' : 'Promouvoir Admin'}
                        </Button>
                      )}

                      {/* Bouton éditer */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(member)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Éditer
                      </Button>

                      {/* Bouton supprimer */}
                      {member.id !== user?.id && (
                        <DeleteUserButton
                          userId={member.id}
                          userName={`${member.first_name} ${member.last_name}`}
                          isAdmin={isAdmin}
                          onDelete={fetchMembers}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun membre trouvé</p>
          </div>
        )}
      </div>

      {/* Dialogue d'édition */}
      <EditUserDialog
        user={editingUser}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingUser(null);
        }}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default Admin;
