import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { Camera, Loader2, Save, Edit, X } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { useToast } from '@/hooks/use-toast';
import { FormHeader } from '@/components/shared/FormHeader';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/services/api';

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
  avatar_url?: string;
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

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await api.profiles.getCurrent();
        setProfile(userProfile);
        setFormData(userProfile);
        setProfilePhoto(userProfile.avatar_url || userProfile.photo_url || '');
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        // En cas d'erreur, créer le profil à partir des métadonnées utilisateur
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
          avatar_url: metadata.photo_url || '',
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
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setProfilePhoto(result);
        setFormData({ ...formData, avatar_url: result, photo_url: result });
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

      // Mettre à jour le profil dans la base de données
      const updatedProfile = await api.profiles.update(profile.id, {
        ...formData,
        updated_at: new Date().toISOString(),
      });

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
          photo_url: formData.avatar_url || formData.photo_url,
          updated_at: new Date().toISOString(),
        }
      });

      if (updateError) {
        throw updateError;
      }

      // Mettre à jour l'état local
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
                <UserAvatar
                  user={profile}
                  size="xl"
                  className="w-32 h-32"
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
            {isEditing && (
              <p className="text-xs text-gray-500">
                Cliquez sur l'icône caméra pour changer votre photo
              </p>
            )}
          </div>

          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                value={formData.first_name || ''}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                value={formData.last_name || ''}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email || ''}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          {/* Informations personnelles */}
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

          <div>
            <Label htmlFor="birth_place">Lieu de naissance</Label>
            <Input
              id="birth_place"
              value={formData.birth_place || ''}
              onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="current_location">Lieu de résidence</Label>
            <Input
              id="current_location"
              value={formData.current_location || ''}
              onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="situation">Situation familiale</Label>
            <Select
              value={formData.situation || ''}
              onValueChange={(value) => setFormData({ ...formData, situation: value })}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre situation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="célibataire">Célibataire</SelectItem>
                <SelectItem value="marié">Marié</SelectItem>
                <SelectItem value="divorcé">Divorcé</SelectItem>
                <SelectItem value="veuf">Veuf</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="role">Profession</Label>
            <Input
              id="role"
              value={formData.role || ''}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="biography">Biographie</Label>
            <Textarea
              id="biography"
              value={formData.biography || ''}
              onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
              disabled={!isEditing}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            {isEditing ? (
              <>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Sauvegarder
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profile);
                    setProfilePhoto(profile.avatar_url || profile.photo_url || '');
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
