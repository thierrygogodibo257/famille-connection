import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar } from '@/components/shared/Avatar';
import { Camera, Loader2, Save, Edit, X } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { useToast } from '@/hooks/use-toast';
import { FormHeader } from '@/components/shared/FormHeader';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birth_date?: string;
  birth_place?: string;
  current_location?: string;
  situation?: string;
  role?: string;
  biography?: string;
  photo_url?: string;
  title?: string;
  is_admin?: boolean;
  is_patriarch?: boolean;
  created_at?: string;
  updated_at?: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [profilePhoto, setProfilePhoto] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.AUTH.LOGIN);
      return;
    }

    // Créer le profil à partir des métadonnées utilisateur
    const createProfileFromMetadata = () => {
      try {
        const metadata = user.user_metadata;
        const profileData: ProfileData = {
          id: user.id,
          email: user.email || '',
          first_name: metadata.first_name || '',
          last_name: metadata.last_name || '',
          phone: metadata.phone || '',
          birth_date: metadata.birth_date || '',
          birth_place: metadata.birth_place || '',
          current_location: metadata.current_location || '',
          situation: metadata.situation || '',
          role: metadata.profession || '',
          photo_url: metadata.photo_url || '',
          title: metadata.title || 'Membre',
          is_admin: metadata.is_admin || false,
          is_patriarch: metadata.is_patriarch || false,
          created_at: metadata.created_at || new Date().toISOString(),
          updated_at: metadata.updated_at || new Date().toISOString(),
        };

        setProfile(profileData);
        setFormData(profileData);
        setProfilePhoto(metadata.photo_url || '');
        setLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Une erreur est survenue';
        setError(message);
        setLoading(false);
      }
    };

    createProfileFromMetadata();
  }, [user, navigate]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setProfilePhoto(result);
        setFormData({ ...formData, photo_url: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;

    try {
      setLoading(true);
      setError(null);

      // Mettre à jour les métadonnées utilisateur
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          birth_date: formData.birth_date,
          birth_place: formData.birth_place,
          current_location: formData.current_location,
          situation: formData.situation,
          profession: formData.role,
          photo_url: formData.photo_url,
          updated_at: new Date().toISOString(),
        }
      });

      if (updateError) {
        throw updateError;
      }

      // Mettre à jour l'état local
      const updatedProfile = { ...profile, ...formData };
      setProfile(updatedProfile);
      setIsEditing(false);

      toast({
        title: 'Succès',
        description: 'Profil mis à jour avec succès',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(message);
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-whatsapp-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Profil non trouvé</p>
        <Button onClick={() => navigate(ROUTES.DASHBOARD.ROOT)}>Retour au tableau de bord</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <FormHeader
        title="Mon Profil"
        subtitle="Gérez vos informations personnelles"
      />

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo de profil */}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <Avatar
                  src={profilePhoto || profile.photo_url}
                  size="lg"
                  fallback={profile.first_name ? profile.first_name[0].toUpperCase() : '?'}
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-6 h-6 bg-whatsapp-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-whatsapp-600 transition-colors">
                    <Camera className="w-3 h-3 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {isEditing ? 'Cliquez sur l\'icône pour changer la photo' : 'Photo de profil'}
            </p>
          </div>

          {/* Nom et Prénom */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Prénom *</Label>
              <Input
                id="first_name"
                value={formData.first_name || ''}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                disabled={!isEditing}
                placeholder="Prénom"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Nom *</Label>
              <Input
                id="last_name"
                value={formData.last_name || ''}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                disabled={!isEditing}
                placeholder="Nom de famille"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              disabled
              className="bg-gray-50"
              placeholder="votre@email.com"
            />
          </div>

          {/* Téléphone */}
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              placeholder="6 12 34 56 78"
            />
          </div>

          {/* Date de naissance */}
          <div>
            <Label htmlFor="birth_date">Date de naissance</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date || ''}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          {/* Lieu de naissance */}
          <div>
            <Label htmlFor="birth_place">Lieu de naissance</Label>
            <Input
              id="birth_place"
              value={formData.birth_place || ''}
              onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
              disabled={!isEditing}
              placeholder="ex: Lyon, France"
            />
          </div>

          {/* Localisation actuelle */}
          <div>
            <Label htmlFor="current_location">Localisation actuelle</Label>
            <Input
              id="current_location"
              value={formData.current_location || ''}
              onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
              disabled={!isEditing}
              placeholder="ex: Paris, France"
            />
          </div>

          {/* Situation */}
          <div>
            <Label htmlFor="situation">Situation</Label>
            <Select
              value={formData.situation || ''}
              onValueChange={(value) => setFormData({ ...formData, situation: value })}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre situation" />
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

          {/* Rôle */}
          <div>
            <Label htmlFor="role">Rôle</Label>
            <Input
              id="role"
              value={formData.role || ''}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              disabled={!isEditing}
              placeholder="ex: Médecin, Retraité, Étudiant..."
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-4">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profile);
                    setProfilePhoto(profile.photo_url || '');
                  }}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Annuler</span>
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-whatsapp-500 to-whatsapp-600 hover:from-whatsapp-600 hover:to-whatsapp-700 flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Enregistrer</span>
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-whatsapp-500 to-whatsapp-600 hover:from-whatsapp-600 hover:to-whatsapp-700 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
