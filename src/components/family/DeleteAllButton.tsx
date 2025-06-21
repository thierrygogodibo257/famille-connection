
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeleteAllButtonProps {
  isAdmin: boolean;
  onDelete?: () => void;
}

export const DeleteAllButton: React.FC<DeleteAllButtonProps> = ({
  isAdmin,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleDeleteAll = async () => {
    if (!isAdmin) {
      toast({
        title: "Accès refusé",
        description: "Seuls les administrateurs peuvent supprimer tous les utilisateurs.",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Mot de passe requis",
        description: "Veuillez entrer le mot de passe administrateur.",
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer TOUS les utilisateurs ? Cette action est irréversible.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await api.admin.deleteAllUsers(password);

      if (result.success) {
        toast({
          title: "Suppression réussie",
          description: `${result.deletedUsers} utilisateurs ont été supprimés.`,
        });

        setIsOpen(false);
        setPassword('');

        // Appeler la fonction de callback pour rafraîchir la liste
        if (onDelete) {
          onDelete();
        }

        // Rediriger vers la page de connexion après un délai
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Erreur lors de la suppression de tous les utilisateurs",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer tous les utilisateurs
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suppression de tous les utilisateurs</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible et supprimera TOUS les utilisateurs de la base de données.
            Veuillez entrer le mot de passe administrateur pour confirmer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <Label htmlFor="admin-password">Mot de passe administrateur</Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez le mot de passe administrateur"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            setPassword('');
            setIsOpen(false);
          }}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAll}
            disabled={isDeleting || !password}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Confirmer la suppression
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
