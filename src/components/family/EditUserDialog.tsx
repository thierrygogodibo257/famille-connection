import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import type { Profile } from '@/services/api';

interface EditUserDialogProps {
  user: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  isOpen,
  onClose,
  onSave
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    civilite: '',
    current_location: '',
    birth_place: '',
    situation: '',
    is_admin: false,
    is_blocked: false
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        civilite: user.civilite || '',
        current_location: user.current_location || '',
        birth_place: user.birth_place || '',
        situation: user.situation || '',
        is_admin: user.is_admin || false,
        is_blocked: user.is_blocked || false
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await api.profiles.update(user.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        civilite: formData.civilite as any,
        current_location: formData.current_location,
        birth_place: formData.birth_place,
        situation: formData.situation,
        is_admin: formData.is_admin,
        is_blocked: formData.is_blocked
      });

      toast({
        title: "Utilisateur mis à jour",
        description: "Les informations de l'utilisateur ont été mises à jour avec succès.",
      });

      onSave();
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="title">Titre</Label>
            <Select
              value={formData.civilite}
              onValueChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un titre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Patriarche">Patriarche</SelectItem>
                <SelectItem value="Matriarche">Matriarche</SelectItem>
                <SelectItem value="Père">Père</SelectItem>
                <SelectItem value="Mère">Mère</SelectItem>
                <SelectItem value="Fils">Fils</SelectItem>
                <SelectItem value="Fille">Fille</SelectItem>
                <SelectItem value="Grand-père">Grand-père</SelectItem>
                <SelectItem value="Grand-mère">Grand-mère</SelectItem>
                <SelectItem value="Petit-fils">Petit-fils</SelectItem>
                <SelectItem value="Petite-fille">Petite-fille</SelectItem>
                <SelectItem value="Oncle">Oncle</SelectItem>
                <SelectItem value="Tante">Tante</SelectItem>
                <SelectItem value="Neveu">Neveu</SelectItem>
                <SelectItem value="Nièce">Nièce</SelectItem>
                <SelectItem value="Cousin">Cousin</SelectItem>
                <SelectItem value="Cousine">Cousine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="current_location">Localisation actuelle</Label>
            <Input
              id="current_location"
              value={formData.current_location}
              onChange={(e) => setFormData(prev => ({ ...prev, current_location: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="birth_place">Lieu de naissance</Label>
            <Input
              id="birth_place"
              value={formData.birth_place}
              onChange={(e) => setFormData(prev => ({ ...prev, birth_place: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="situation">Situation</Label>
            <Input
              id="situation"
              value={formData.situation}
              onChange={(e) => setFormData(prev => ({ ...prev, situation: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_admin"
                checked={formData.is_admin}
                onChange={(e) => setFormData(prev => ({ ...prev, is_admin: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is_admin">Administrateur</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_blocked"
                checked={formData.is_blocked}
                onChange={(e) => setFormData(prev => ({ ...prev, is_blocked: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is_blocked">Bloqué</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
