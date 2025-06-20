import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { Loader2 } from 'lucide-react';
import { InteractiveFamilyTree } from './InteractiveFamilyTree';

export function FamilyTree() {
  const { user, session, isLoading: authLoading } = useAuth();
  const { members, isLoading: membersLoading, error, fetchMembers } = useFamilyMembers();

  useEffect(() => {
    console.log('FamilyTree mounted', { user, session, authLoading });
    if (user) {
      fetchMembers();
    }
  }, [user, session, authLoading, fetchMembers]);

  useEffect(() => {
    console.log('[FamilyTree] Members:', members);
    if (members.length > 0) {
      console.log(`[FamilyTree] Number of members: ${members.length}`);
      console.log('[FamilyTree] First member:', members[0]);
    }
  }, [members]);

  if (authLoading || membersLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    console.log('[FamilyTree] No user found in FamilyTree');
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <p className="text-lg text-muted-foreground">Veuillez vous connecter pour accéder à l'arbre familial</p>
      </div>
    );
  }

  if (error) {
    console.error('[FamilyTree] Error:', error);
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <p className="text-lg text-destructive">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="rounded-lg border bg-card p-8">
        <h1 className="mb-6 text-2xl font-bold">Arbre Familial</h1>
        {members.length === 0 ? (
          <div className="min-h-[400px] rounded-lg border border-dashed p-8">
            <p className="text-center text-muted-foreground">
              Aucun membre n'a encore été ajouté
            </p>
          </div>
        ) : (


            <InteractiveFamilyTree />

        )}
      </div>
    </div>
  );
}
