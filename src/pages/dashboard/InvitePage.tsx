
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchMembers } from '@/components/family/SearchMembers';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { Loader2, UserPlus, Users } from 'lucide-react';
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
        id: crypto.randomUUID(),
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

      const result = await api.createProfile(profileData);

      toast({
        title: "Succès",
        description: "Membre ajouté avec succès à la famille",
      });
      navigate(ROUTES.DASHBOARD.MEMBERS);
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
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-50 via-white to-whatsapp-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header identique aux formulaires d'inscription */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-whatsapp-500 to-whatsapp-600 rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce-in">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ajouter un membre
          </h1>
          <p className="text-gray-600">
            Ajoutez un nouveau membre à votre arbre familial
          </p>
        </div>

        {/* Formulaire avec le même style que l'inscription */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Titre *
              </Label>
              <Select value={formData.title} onValueChange={(value) => setFormData(prev => ({ ...prev, title: value }))}>
                <SelectTrigger className="w-full bg-white/50">
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
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  Prénom *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Prénom"
                  className="bg-white/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Nom *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Nom de famille"
                  className="bg-white/50"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemple.com"
                className="bg-white/50"
                required
              />
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Téléphone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="6 12 34 56 78"
                className="bg-white/50"
              />
            </div>

            {/* Relation familiale */}
            <div className="space-y-2">
              <Label htmlFor="relationship" className="text-sm font-medium text-gray-700">
                Relation familiale
              </Label>
              <Select value={formData.relationship} onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}>
                <SelectTrigger className="bg-white/50">
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
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Père (optionnel)
              </Label>
              <SearchMembers
                placeholder="Rechercher le père..."
                onMemberSelect={handleFatherSelect}
              />
            </div>

            {/* Recherche Mère */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Mère (optionnel)
              </Label>
              <SearchMembers
                placeholder="Rechercher la mère..."
                onMemberSelect={handleMotherSelect}
              />
            </div>

            {/* Date de naissance */}
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
                Date de naissance
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                className="bg-white/50"
              />
            </div>

            {/* Lieu de naissance */}
            <div className="space-y-2">
              <Label htmlFor="birthPlace" className="text-sm font-medium text-gray-700">
                Lieu de naissance
              </Label>
              <Input
                id="birthPlace"
                value={formData.birthPlace}
                onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
                placeholder="ex: Lyon, France"
                className="bg-white/50"
              />
            </div>

            {/* Localisation actuelle */}
            <div className="space-y-2">
              <Label htmlFor="currentLocation" className="text-sm font-medium text-gray-700">
                Localisation actuelle
              </Label>
              <Input
                id="currentLocation"
                value={formData.currentLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, currentLocation: e.target.value }))}
                placeholder="ex: Paris, France"
                className="bg-white/50"
              />
            </div>

            {/* Situation */}
            <div className="space-y-2">
              <Label htmlFor="situation" className="text-sm font-medium text-gray-700">
                Situation
              </Label>
              <Select value={formData.situation} onValueChange={(value) => setFormData(prev => ({ ...prev, situation: value }))}>
                <SelectTrigger className="bg-white/50">
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

            {/* Bouton de soumission avec le même style */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-whatsapp-500 to-whatsapp-600 hover:from-whatsapp-600 hover:to-whatsapp-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Ajouter le membre
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
