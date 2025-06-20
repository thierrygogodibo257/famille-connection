import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
  isAdmin: boolean;
  onDelete?: () => void;
}

export const DeleteUserButton: React.FC<DeleteUserButtonProps> = ({
  userId,
  userName,
  isAdmin,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!isAdmin) {
      toast({
        title: "Accès refusé",
        description: "Seuls les administrateurs peuvent supprimer des utilisateurs.",
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ? Cette action est irréversible.`)) {
      return;
    }

    if (!window.confirm(`ATTENTION : Cette action supprimera définitivement ${userName} et toutes ses relations familiales, messages et notifications. Continuer ?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await api.admin.deleteUser(userId);

      if (result.success) {
        toast({
          title: "Utilisateur supprimé",
          description: `${userName} a été supprimé avec succès.`,
        });

        // Appeler la fonction de callback pour rafraîchir la liste
        if (onDelete) {
          onDelete();
        }
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Erreur lors de la suppression de l'utilisateur",
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
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center gap-2"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
      {isDeleting ? 'Suppression...' : 'Supprimer'}
    </Button>
  );
};
