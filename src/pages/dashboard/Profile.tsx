import { useState, useEffect, useRef } from 'react';
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
  civilite: string;
  role_radio: string;
  affiliation: string;
  affiliated_member: any;
}

const AFFILIATIONS = [
  'Fils', 'Fille', 'Cousin', 'Cousine', 'Oncle', 'Tante', 'Père', 'Mère', 'Frère', 'Sœur', 'Grand-père', 'Grand-mère', 'Neveu', 'Nièce', 'Autre'
];

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
  const [isUploading, setIsUploading] = useState(false);
  const [civility, setCivility] = useState('M.');
  const [roleRadio, setRoleRadio] = useState('Membre');
  const [affiliation, setAffiliation] = useState('');
  const [affiliatedMember, setAffiliatedMember] = useState<any>(null);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [searchAffiliated, setSearchAffiliated] = useState('');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const prof = await api.profiles.getCurrent();
        if (!isMounted) return;
        setProfile(prof);
        setProfileId(prof.id);
        setFormData(prof);
        setProfilePhoto(prof.photo_url || '');
        setCivility(prof.civility || 'M.');
        setRoleRadio(prof.role_radio || 'Membre');
        setAffiliation(prof.affiliation || '');
        setAffiliatedMember(prof.affiliated_member || null);
      } catch (err: any) {
        // Fallback sur Auth si profil inexistant
        if (user) {
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
            photo_url: metadata.avatar_url || '',
            civilite: metadata.civilite || 'Membre',
            is_admin: metadata.is_admin || false,
            is_patriarch: metadata.is_patriarch || false,
            created_at: metadata.created_at || new Date().toISOString(),
            updated_at: metadata.updated_at || new Date().toISOString(),
            civility: metadata.civility || 'M.',
            role_radio: metadata.role_radio || 'Membre',
            affiliation: metadata.affiliation || '',
            affiliated_member: metadata.affiliated_member || null,
          };
          setProfile(profileData);
          setProfileId(null);
          setFormData(profileData);
          setProfilePhoto(metadata.avatar_url || '');
          setCivility(metadata.civility || 'M.');
          setRoleRadio(metadata.role_radio || 'Membre');
          setAffiliation(metadata.affiliation || '');
          setAffiliatedMember(metadata.affiliated_member || null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [user, navigate]);

  // Nouvelle logique d'autocomplétion robuste
  useEffect(() => {
    if (!searchAffiliated || !isEditing) {
      setMembersList([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .or(`first_name.ilike.%${searchAffiliated}%,last_name.ilike.%${searchAffiliated}%,email.ilike.%${searchAffiliated}%`)
        .neq('id', user?.id);
      if (!error && data) setMembersList(data);
      else setMembersList([]);
    }, 300);
  }, [searchAffiliated, isEditing, user?.id]);

  // Logique rôle dépendant de civilité/radio
  const getRole = () => {
    if (civility === 'M.' && roleRadio === 'Patriarche') return 'Patriarche';
    if (civility === 'Mme' && roleRadio === 'Matriarche') return 'Matriarche';
    return 'Membre';
  };

  // Upload avatar dans Supabase Storage et update metadata
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    try {
      const fileExt = file.type.split('/')[1] || 'png';
      const fileName = `${user.id}/photo.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(fileName);
      // Met à jour photo_url dans le profil et dans Auth
      setProfilePhoto(publicUrlData.publicUrl);
      setFormData({ ...formData, photo_url: publicUrlData.publicUrl });
      await supabase.auth.updateUser({
        data: { ...user.user_metadata, photo_url: publicUrlData.publicUrl }
      });
      toast({ title: 'Photo de profil mise à jour !' });
    } catch (err) {
      toast({ title: 'Erreur upload photo', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const role = getRole();
      // Préparer les données à sauvegarder
      const updates = {
        ...formData,
        civility,
        role_radio: roleRadio,
        role,
        affiliation,
        affiliated_member: affiliatedMember,
        photo_url: profilePhoto,
      };
      let savedProfile;
      if (profileId) {
        // Update dans profiles
        savedProfile = await api.profiles.update(profileId, updates);
      } else {
        // Insert dans profiles
        savedProfile = await api.profiles.createFromUserMetadata({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            ...updates,
          }
        });
      }
      setProfile(savedProfile);
      setProfileId(savedProfile.id);
      setFormData(savedProfile);
      // Synchroniser les champs principaux dans Auth
      await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          first_name: savedProfile.first_name,
          last_name: savedProfile.last_name,
          phone: savedProfile.phone,
          birth_date: savedProfile.birth_date,
          birth_place: savedProfile.birth_place,
          current_location: savedProfile.current_location,
          situation: savedProfile.situation,
          profession: savedProfile.role,
          avatar_url: savedProfile.photo_url,
          civility,
          role_radio: roleRadio,
          role,
          affiliation,
          affiliated_member: affiliatedMember,
          updated_at: new Date().toISOString(),
        }
      });
      setIsEditing(false);
      toast({ title: 'Profil mis à jour avec succès' });
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
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
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      {/* Section 1 : Infos principales */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative group">
          <Avatar
            src={profilePhoto || formData.photo_url}
            size="xl"
            fallback={formData.first_name ? formData.first_name[0].toUpperCase() : '?'}
            className="w-32 h-32 ring-4 ring-whatsapp-200 shadow-lg object-cover"
          />
          {isEditing && (
            <label className="absolute bottom-2 right-2 w-8 h-8 bg-whatsapp-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-whatsapp-600 transition-colors shadow-lg">
              {isUploading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          )}
        </div>
        <h2 className="text-2xl font-bold mt-4 mb-1 text-gray-900">{formData.first_name} {formData.last_name}</h2>
        <p className="text-gray-500 text-sm mb-2">{formData.civilite || 'Membre'}</p>
        <p className="text-gray-600 text-sm flex items-center"><span className="font-semibold mr-1">Email:</span> {formData.email}</p>
        {formData.phone && (
          <p className="text-gray-600 text-sm flex items-center"><span className="font-semibold mr-1">Téléphone:</span> {formData.phone}</p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 : Infos principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="civility">Civilité</Label>
            <select
              id="civility"
              value={civility}
              onChange={e => setCivility(e.target.value)}
              disabled={!isEditing}
              className="w-full border rounded px-3 py-2"
            >
              <option value="M.">M.</option>
              <option value="Mme">Mme</option>
            </select>
          </div>
          <div>
            <Label htmlFor="first_name">Prénom *</Label>
            <Input
              id="first_name"
              value={formData.first_name || ''}
              onChange={e => setFormData({ ...formData, first_name: e.target.value })}
              disabled={!isEditing}
              placeholder="Prénom"
            />
          </div>
          <div>
            <Label htmlFor="last_name">Nom *</Label>
            <Input
              id="last_name"
              value={formData.last_name || ''}
              onChange={e => setFormData({ ...formData, last_name: e.target.value })}
              disabled={!isEditing}
              placeholder="Nom de famille"
            />
          </div>
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
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              placeholder="6 12 34 56 78"
            />
          </div>
        </div>
        {/* Section 2 : Statut familial */}
        <div className="border-t pt-4 mt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <Label>Rôle</Label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-1">
                  <input type="radio" value="Patriarche" checked={roleRadio === 'Patriarche'} onChange={() => setRoleRadio('Patriarche')} disabled={!isEditing || civility !== 'M.'} /> Patriarche
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" value="Matriarche" checked={roleRadio === 'Matriarche'} onChange={() => setRoleRadio('Matriarche')} disabled={!isEditing || civility !== 'Mme'} /> Matriarche
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" value="Membre" checked={roleRadio === 'Membre'} onChange={() => setRoleRadio('Membre')} disabled={!isEditing} /> Membre
                </label>
              </div>
            </div>
            <div>
              <Label htmlFor="affiliation">Affiliation</Label>
              <select
                id="affiliation"
                value={affiliation}
                onChange={e => setAffiliation(e.target.value)}
                disabled={!isEditing}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Sélectionner</option>
                {AFFILIATIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          {/* Membre affilié autocomplete */}
          <div className="mt-2">
            <Label htmlFor="affiliated_member">Membre affilié</Label>
            {affiliatedMember ? (
              <div className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                <span>{affiliatedMember.first_name} {affiliatedMember.last_name} <span className="text-xs text-gray-400">({affiliatedMember.email})</span></span>
                <button type="button" onClick={() => setAffiliatedMember(null)} className="text-red-500 hover:underline text-xs">Retirer</button>
              </div>
            ) : (
              <>
                <input
                  id="affiliated_member"
                  type="text"
                  value={searchAffiliated}
                  onChange={e => setSearchAffiliated(e.target.value)}
                  disabled={!isEditing}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Rechercher un membre (nom, prénom, email)..."
                  autoComplete="off"
                />
                {isEditing && searchAffiliated && membersList.length > 0 && (
                  <ul className="border rounded bg-white shadow max-h-40 overflow-y-auto mt-1 z-10">
                    {membersList.map(m => (
                      <li
                        key={m.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setAffiliatedMember(m);
                          setSearchAffiliated('');
                        }}
                      >
                        {m.first_name} {m.last_name} <span className="text-xs text-gray-400">({m.email})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
        {/* Section 3 : Infos complémentaires */}
        <div className="border-t pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="birth_date">Date de naissance</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date || ''}
              onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="birth_place">Lieu de naissance</Label>
            <Input
              id="birth_place"
              value={formData.birth_place || ''}
              onChange={e => setFormData({ ...formData, birth_place: e.target.value })}
              disabled={!isEditing}
              placeholder="ex: Lyon, France"
            />
          </div>
          <div>
            <Label htmlFor="current_location">Localisation actuelle</Label>
            <Input
              id="current_location"
              value={formData.current_location || ''}
              onChange={e => setFormData({ ...formData, current_location: e.target.value })}
              disabled={!isEditing}
              placeholder="ex: Paris, France"
            />
          </div>
          <div>
            <Label htmlFor="situation">Situation</Label>
            <select
              id="situation"
              value={formData.situation || ''}
              onChange={e => setFormData({ ...formData, situation: e.target.value })}
              disabled={!isEditing}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Sélectionnez votre situation</option>
              <option value="Célibataire">Célibataire</option>
              <option value="Marié(e)">Marié(e)</option>
              <option value="Divorcé(e)">Divorcé(e)</option>
              <option value="Veuf/Veuve">Veuf/Veuve</option>
              <option value="En couple">En couple</option>
            </select>
          </div>
          <div>
            <Label htmlFor="profession">Profession</Label>
            <Input
              id="profession"
              value={formData.profession || ''}
              onChange={e => setFormData({ ...formData, profession: e.target.value })}
              disabled={!isEditing}
              placeholder="ex: Médecin, Retraité, Étudiant..."
            />
          </div>
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
                  setProfilePhoto(profile?.photo_url || '');
                }}
                className="flex items-center space-x-2"
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
                <span>Annuler</span>
              </Button>
              <Button
                type="submit"
                disabled={loading || isUploading}
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
  );
};

export default ProfilePage;
