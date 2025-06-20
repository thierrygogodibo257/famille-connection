
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchMembers } from '@/components/family/SearchMembers';
import { FormHeader } from '@/components/shared/FormHeader';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { Loader2, UserPlus } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  title?: string;
}

const InvitePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: 'M.',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    relationship: '',
    birthDate: '',
    birthPlace: '',
    currentLocation: '',
    situation: '',
    fatherId: '',
    motherId: '',
  });

  const handleFatherSelect = (member: Member) => {
    setFormData(prev => ({ ...prev, fatherId: member.id }));
  };

  const handleMotherSelect = (member: Member) => {
    setFormData(prev => ({ ...prev, motherId: member.id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        relationship_type: formData.relationship,
        birth_date: formData.birthDate,
        birth_place: formData.birthPlace,
        current_location: formData.currentLocation,
        situation: formData.situation,
        father_id: formData.fatherId || null,
        mother_id: formData.motherId || null,
        title: formData.title,
        is_admin: false,
        is_patriarch: false,
      };

      const result = await api.createProfileDirect(profileData);

      if (result.success) {
        toast({
          title: "Succès",
          description: "Membre ajouté avec succès à la famille",
        });
        navigate(ROUTES.DASHBOARD.MEMBERS);
      } else {
        throw new Error(result.error || 'Erreur lors de la création du profil');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du membre:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout du membre",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <FormHeader
        title="Ajouter un membre"
        subtitle="Ajoutez un nouveau membre à votre arbre familial"
        icon={<UserPlus className="w-6 h-6" />}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Titre */}
        <div>
          <Label htmlFor="title">Titre *</Label>
          <Select value={formData.title} onValueChange={(value) => setFormData(prev => ({ ...prev, title: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un titre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M.">M.</SelectItem>
              <SelectItem value="Mme">Mme</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Prénom et Nom */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="Prénom"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Nom de famille"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="email@exemple.com"
            required
          />
        </div>

        {/* Téléphone */}
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="6 12 34 56 78"
          />
        </div>

        {/* Relation familiale */}
        <div>
          <Label htmlFor="relationship">Relation familiale</Label>
          <Select value={formData.relationship} onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez la relation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fils">Fils</SelectItem>
              <SelectItem value="fille">Fille</SelectItem>
              <SelectItem value="père">Père</SelectItem>
              <SelectItem value="mère">Mère</SelectItem>
              <SelectItem value="époux">Époux</SelectItem>
              <SelectItem value="épouse">Épouse</SelectItem>
              <SelectItem value="cousin">Cousin</SelectItem>
              <SelectItem value="cousine">Cousine</SelectItem>
              <SelectItem value="oncle">Oncle</SelectItem>
              <SelectItem value="tante">Tante</SelectItem>
              <SelectItem value="neveu">Neveu</SelectItem>
              <SelectItem value="nièce">Nièce</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Recherche Père */}
        <div>
          <Label>Père (optionnel)</Label>
          <SearchMembers
            placeholder="Rechercher le père..."
            onMemberSelect={handleFatherSelect}
          />
        </div>

        {/* Recherche Mère */}
        <div>
          <Label>Mère (optionnel)</Label>
          <SearchMembers
            placeholder="Rechercher la mère..."
            onMemberSelect={handleMotherSelect}
          />
        </div>

        {/* Date de naissance */}
        <div>
          <Label htmlFor="birthDate">Date de naissance</Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
          />
        </div>

        {/* Lieu de naissance */}
        <div>
          <Label htmlFor="birthPlace">Lieu de naissance</Label>
          <Input
            id="birthPlace"
            value={formData.birthPlace}
            onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
            placeholder="ex: Lyon, France"
          />
        </div>

        {/* Localisation actuelle */}
        <div>
          <Label htmlFor="currentLocation">Localisation actuelle</Label>
          <Input
            id="currentLocation"
            value={formData.currentLocation}
            onChange={(e) => setFormData(prev => ({ ...prev, currentLocation: e.target.value }))}
            placeholder="ex: Paris, France"
          />
        </div>

        {/* Situation */}
        <div>
          <Label htmlFor="situation">Situation</Label>
          <Select value={formData.situation} onValueChange={(value) => setFormData(prev => ({ ...prev, situation: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez la situation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Célibataire">Célibataire</SelectItem>
              <SelectItem value="Marié(e)">Marié(e)</SelectItem>
              <SelectItem value="Divorcé(e)">Divorcé(e)</SelectItem>
              <SelectItem value="Veuf/Veuve">Veuf/Veuve</SelectItem>
              <SelectItem value="En couple">En couple</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bouton de soumission */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-whatsapp-500 to-whatsapp-600 hover:from-whatsapp-600 hover:to-whatsapp-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Ajout en cours...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Ajouter le membre
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default InvitePage;
