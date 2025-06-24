import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FamilyMember } from '@/types/family';

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberData: Partial<FamilyMember>) => Promise<void>;
  existingMembers: FamilyMember[];
}

export const AddMemberDialog = ({
  isOpen,
  onClose,
  onSubmit,
  existingMembers
}: AddMemberDialogProps) => {
  const [formData, setFormData] = useState<Partial<FamilyMember>>({
    first_name: '',
    last_name: '',
    email: '',
    civilite: 'Fils',
    parent_id: undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        civilite: 'Fils',
        parent_id: undefined
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau membre</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="civilite">Rôle</Label>
            <Select
              value={formData.civilite}
              onValueChange={(value) => setFormData({ ...formData, civilite: value as FamilyMember['civilite'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
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
                <SelectItem value="Beau-père">Beau-père</SelectItem>
                <SelectItem value="Belle-mère">Belle-mère</SelectItem>
                <SelectItem value="Beau-frère">Beau-frère</SelectItem>
                <SelectItem value="Belle-sœur">Belle-sœur</SelectItem>
                <SelectItem value="Frère">Frère</SelectItem>
                <SelectItem value="Sœur">Sœur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_id">Parent</Label>
            <Select
              value={formData.parent_id}
              onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un parent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun parent</SelectItem>
                {existingMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Ajouter</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
