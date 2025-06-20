import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { FamilyMember, NewFamilyMember } from '@/types/family';
import { v4 as uuidv4 } from 'uuid';

export default function AddMember() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    title: '',
    birth_date: '',
    current_location: '',
    situation: '',
  });
  const { user } = useAuth();
  const { addMember } = useFamilyMembers();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const memberData: NewFamilyMember = {
        id: uuidv4(),
        ...formData,
        title: (formData.title as any) || null,
        birth_date: formData.birth_date || null,
        current_location: formData.current_location || null,
        situation: formData.situation || null,
      };

      await addMember(memberData);
      toast({
        title: 'Membre ajouté',
        description: 'Le nouveau membre a été ajouté avec succès !',
      });

      // Réinitialiser le formulaire
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        title: '',
        birth_date: '',
        current_location: '',
        situation: '',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-effect rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Ajouter un membre
            </h1>
            <p className="text-gray-600">
              Invitez un nouveau membre à rejoindre votre arbre familial
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-gray-700">Prénom</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  disabled={isLoading}
                  className="bg-white/80 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-gray-700">Nom</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  disabled={isLoading}
                  className="bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700">Titre</Label>
              <Input
                id="title"
                placeholder="ex: Père, Mère, Frère, Sœur..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isLoading}
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date" className="text-gray-700">Date de naissance</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                disabled={isLoading}
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_location" className="text-gray-700">Lieu de résidence</Label>
              <Input
                id="current_location"
                placeholder="ex: Paris, France"
                value={formData.current_location}
                onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                disabled={isLoading}
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="situation" className="text-gray-700">Situation</Label>
              <Input
                id="situation"
                placeholder="ex: Marié(e), Célibataire..."
                value={formData.situation}
                onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                disabled={isLoading}
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-whatsapp-500 to-whatsapp-600 hover:from-whatsapp-600 hover:to-whatsapp-700 text-white py-3 rounded-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                'Ajouter le membre'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
