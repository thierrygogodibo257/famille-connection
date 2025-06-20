import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { Loader2 } from 'lucide-react';
import { MemberCard } from '@/components/family/MemberCard';

const Members = () => {
  const { user, session, isLoading: authLoading } = useAuth();
  const { members, isLoading: membersLoading, error, fetchMembers } = useFamilyMembers();

  useEffect(() => {
    if (session) {
      fetchMembers();
    }
  }, [session, fetchMembers]);

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
      <h1 className="text-3xl font-bold mb-8">Membres de la famille</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            isAdmin={isAdmin}
            onDelete={fetchMembers}
          />
        ))}
      </div>
    </div>
  );
};

export default Members;
