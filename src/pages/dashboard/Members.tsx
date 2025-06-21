
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { Loader2 } from 'lucide-react';
import { MemberCard } from '@/components/family/MemberCard';
import { DeleteAllButton } from '@/components/family/DeleteAllButton';
import { MemberSearch } from '@/components/family/MemberSearch';
import type { FamilyMember } from '@/types/family';

const Members = () => {
  const { user, session, isLoading: authLoading } = useAuth();
  const { members, isLoading: membersLoading, error, fetchMembers } = useFamilyMembers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filteredMembers, setFilteredMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    if (session) {
      fetchMembers();
    }
  }, [session, fetchMembers]);

  useEffect(() => {
    let filtered = members;

    // Appliquer la recherche
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Appliquer le filtre
    switch (selectedFilter) {
      case 'admin':
        filtered = filtered.filter(member => member.is_admin);
        break;
      case 'patriarch':
        filtered = filtered.filter(member => member.is_patriarch);
        break;
      case 'recent':
        filtered = filtered.sort((a, b) =>
          new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        ).slice(0, 10);
        break;
    }

    setFilteredMembers(filtered);
  }, [members, searchTerm, selectedFilter]);

  const isAdmin = user?.user_metadata?.is_admin || false;

  if (authLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Membres de la famille</h1>
          <p className="text-gray-600 mt-2">
            {filteredMembers.length} membre{filteredMembers.length !== 1 ? 's' : ''}
            {searchTerm && ` trouvé${filteredMembers.length !== 1 ? 's' : ''} pour "${searchTerm}"`}
          </p>
        </div>
        <DeleteAllButton isAdmin={isAdmin} onDelete={fetchMembers} />
      </div>

      <MemberSearch
        searchTerm={searchTerm}
        selectedFilter={selectedFilter}
        onSearchChange={setSearchTerm}
        onFilterChange={setSelectedFilter}
      />

      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'Aucun membre trouvé pour cette recherche' : 'Aucun membre trouvé'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              // On retire le variant compact pour utiliser le layout vertical par défaut
              isAdmin={isAdmin}
              onDelete={fetchMembers}
              // On peut aussi passer un style personnalisé si besoin
              // style={{ minWidth: 320, maxWidth: 400 }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Members;
