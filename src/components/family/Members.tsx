import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function Members() {
  const { user, session, isLoading } = useAuth();

  useEffect(() => {
    console.log('Members mounted', { user, session, isLoading });
  }, [user, session, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    console.log('No user found in Members');
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <p className="text-lg text-muted-foreground">Veuillez vous connecter pour accéder à la liste des membres</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="rounded-lg border bg-card p-8">
        <h1 className="mb-6 text-2xl font-bold">Liste des Membres</h1>
        <div className="min-h-[400px] rounded-lg border border-dashed p-8">
          <p className="text-center text-muted-foreground">
            La liste des membres sera affichée ici
          </p>
        </div>
      </div>
    </div>
  );
}
