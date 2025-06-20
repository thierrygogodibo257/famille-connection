import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar } from '@/components/shared/Avatar';
import { Camera, Eye, EyeOff, ThumbsUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ProfileData } from '@/types/profile';
import { api } from '@/services/api';
import { ComboboxMembre } from '@/components/family/ComboboxMembre';
import { FamilyRegisterSchema, FamilyRegisterData, RelationshipType } from '@/lib/validations/relationshipSchema';
import { relationshipTypeOptions } from '@/lib/constants/relationshipTypeOptions';

// Relations qui nécessitent des informations supplémentaires
const RELATIONS_REQUIRING_INFO = ['époux', 'épouse', 'fils', 'fille'] as const;

export const FamilyRegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [role, setRole] = useState<'Membre' | 'Administrateur'>('Membre');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [patriarchExists, setPatriarchExists] = useState(false);

  const methods = useForm<FamilyRegisterData>({
    resolver: zodResolver(FamilyRegisterSchema),
    defaultValues: {
      title: 'M.',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneCode: '+225',
      phone: '',
      profession: '',
      currentLocation: '',
      birthPlace: '',
      photoUrl: '',
      relationship: 'fils',
      spouseName: '',
      fatherName: '',
      motherName: '',
      birthDate: '',
    }
  });

  const fetchAllMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, title, relationship_type')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedResults = data?.map(member => ({
        value: member.id,
        label: `${member.first_name} ${member.last_name} (${member.title})`,
        relationship: member.relationship_type
      })) || [];

      setSearchResults(mappedResults);
    } catch (err) {
      console.error('Erreur lors du chargement des membres:', err);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger la liste des membres",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Vérifie s'il existe déjà un patriarche dans la table profiles
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_patriarch', true)
        .limit(1);
      setPatriarchExists(!!(data && data.length > 0));
    })();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setProfilePhoto(result);
        methods.setValue('photoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const searchFamilyMembers = async (query: string) => {
    if (!query || query.length < 2) {
      console.log('Query trop courte:', query);
      setSearchResults([]);
      return;
    }

    try {
      console.log('Début recherche avec query:', query);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, title')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(5);

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      console.log('Résultats bruts:', data);
      const mappedResults = data?.map(member => ({
        value: member.id,
        label: `${member.first_name} ${member.last_name} (${member.title})`
      })) || [];
      console.log('Résultats mappés:', mappedResults);
      setSearchResults(mappedResults);
    } catch (err) {
      console.error('Erreur détaillée:', err);
      toast({
        title: "Erreur de recherche",
        description: "Impossible de rechercher les membres",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = (value: 'Membre' | 'Administrateur') => {
    setRole(value);
    if (value === 'Administrateur') {
      setShowAdminModal(true);
    } else {
      setIsAdmin(false);
    }
  };
  const onSubmit = async (data: FamilyRegisterData) => {
    setIsLoading(true);

    try {
      // Vérifier la connexion internet
      if (!navigator.onLine) {
        toast({
          title: "Pas de connexion internet",
          description: "Vérifiez votre connexion internet et réessayez.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Vérifier si l'email existe déjà d'une manière plus appropriée
      const { data: userExists, error: userCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();

      if (userCheckError) {
        console.error('Erreur lors de la vérification email:', userCheckError);
        if (userCheckError.message.includes('fetch')) {
          toast({
            title: "Problème de connexion",
            description: "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      if (userExists) {
        toast({
          title: "Email déjà utilisé",
          description: "Cette adresse email est déjà associée à un compte. Veuillez utiliser une autre adresse ou vous connecter.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Vérifier si un membre lié est requis mais non fourni
      if (RELATIONS_REQUIRING_INFO.includes(data.relationship as any) && !data.spouseName && !data.fatherName && !data.motherName) {
        toast({
          title: "Informations supplémentaires requises",
          description: `Veuillez fournir les informations nécessaires pour la relation ${data.relationship === 'époux' ? 'conjugalité' : 'parentale'}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // 1. Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone ? `${data.phoneCode}${data.phone}` : '',
            profession: data.profession || '',
            current_location: data.currentLocation || '',
            birth_place: data.birthPlace || '',
            photo_url: '',
            relationship_type: data.relationship as RelationshipType,
            father_name: data.fatherName || '',
            mother_name: data.motherName || '',
            is_admin: isAdmin,
            birth_date: data.birthDate || null,
            title: data.title === 'Mme' ? 'Fille' : 'Fils',
            situation: '',
            is_patriarch: data.relationship === 'patriarche',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }
      });

      if (authError) {
        console.error('Erreur auth:', authError);
        if (authError.message.includes('fetch') || authError.message.includes('network')) {
          throw new Error('Problème de connexion internet. Vérifiez votre connexion et réessayez.');
        }
        throw authError;
      }

      // 2. Forcer la connexion pour récupérer le token JWT
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        console.error('Erreur signin:', signInError);
        if (signInError.message.includes('fetch') || signInError.message.includes('network')) {
          throw new Error('Problème de connexion internet. Vérifiez votre connexion et réessayez.');
        }
        throw signInError;
      }

      const accessToken = signInData.session?.access_token;
      if (!accessToken) throw new Error('Token JWT manquant après connexion.');

      // 3. Upload avatar si besoin
      let avatarUrl = '';
      if (data.photoUrl && data.photoUrl.startsWith('data:')) {
        try {
          const res = await fetch(data.photoUrl);
          const blob = await res.blob();
          const file = new File([blob], `avatar_${signInData.user.id}.png`, { type: blob.type });
          avatarUrl = await api.uploadAvatar(signInData.user.id, file);
        } catch (uploadError) {
          console.error('Erreur upload avatar:', uploadError);
          // Continue sans avatar si l'upload échoue
        }
      }

      // 4. Créer le profil dans la table via edge function
      const profileData: ProfileData = {
        id: signInData.user.id,
        user_id: signInData.user.id,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone ? `${data.phoneCode}${data.phone}` : '',
        profession: data.profession || '',
        current_location: data.currentLocation || '',
        birth_place: data.birthPlace || '',
        avatar_url: avatarUrl,
        photo_url: avatarUrl,
        relationship_type: data.relationship as RelationshipType,
        father_name: data.fatherName || '',
        mother_name: data.motherName || '',
        is_admin: isAdmin,
        birth_date: data.birthDate || null,
        title: data.title === 'Mme' ? 'Fille' : 'Fils',
        situation: '',
        is_patriarch: data.relationship === 'patriarche',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Données du profil à créer:', profileData);

      // Ajouter les relations spéciales si nécessaire
      // if (data.spouseName) {
      //   profileData.spouse_id = data.spouseName;
      // }
      // if (data.fatherName) {
      //   profileData.father_id = data.fatherName;
      // }
      // if (data.motherName) {
      //   profileData.mother_id = data.motherName;
      // }

      try {
        await api.createProfile(profileData, accessToken);
        console.log('Profil créé avec succès');
      } catch (error) {
        console.error('Erreur détaillée lors de la création du profil:', error);
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error('Problème de connexion internet lors de la création du profil. Vérifiez votre connexion et réessayez.');
        }
        throw error;
      }

      toast({
        title: "Inscription réussie !",
        description: "Votre compte et profil ont été créés avec succès. Vous pouvez maintenant accéder au tableau de bord.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      let errorMessage = "Une erreur est survenue lors de l'inscription";

      if (error.message?.includes('internet') || error.message?.includes('fetch') || error.message?.includes('network')) {
        errorMessage = "Problème de connexion internet. Vérifiez votre connexion et réessayez.";
      } else if (error.message?.includes('User already registered')) {
        errorMessage = "Cette adresse email est déjà utilisée. Veuillez en utiliser une autre ou vous connecter.";
      } else if (error.message?.includes('Connection closed')) {
        errorMessage = "Problème de connexion au serveur. Veuillez vérifier votre connexion internet et réessayer.";
      } else if (error.status === 422) {
        errorMessage = "Les données fournies sont invalides. Veuillez vérifier vos informations.";
      }

      toast({
        title: "Erreur d'inscription",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            methods.handleSubmit(onSubmit)(e);
          }}
          className="space-y-4"
        >
          {/* Photo de profil */}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <Avatar
                  src={profilePhoto}
                  size="lg"
                  fallback={methods.watch('firstName') ? methods.watch('firstName')[0].toUpperCase() : '?'}
                />
                <label className="absolute bottom-0 right-0 w-6 h-6 bg-whatsapp-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-whatsapp-600 transition-colors">
                  <Camera className="w-3 h-3 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-500">Photo de profil (optionnel)</p>
          </div>

          {/* Civilité */}
          <div>
            <Label htmlFor="title">Civilité *</Label>
            <Select
              value={methods.watch('title')}
              onValueChange={(value) => methods.setValue('title', value as 'M.' | 'Mme')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre civilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M.">M.</SelectItem>
                <SelectItem value="Mme">Mme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ComboBox pour le rôle */}
          <div>
            <Label htmlFor="role">Rôle</Label>
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choisissez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Membre">Membre</SelectItem>
                <SelectItem value="Administrateur">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Modal pour le code admin */}
          <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Code Administrateur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Label htmlFor="admin-code">Veuillez entrer le code secret pour devenir administrateur :</Label>
                <Input
                  id="admin-code"
                  type="password"
                  value={adminCode}
                  onChange={e => setAdminCode(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAdminModal(false);
                      setRole('Membre');
                      setAdminCode('');
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (adminCode === '1432') {
                        setIsAdmin(true);
                        setShowAdminModal(false);
                      } else {
                        setIsAdmin(false);
                        alert('Code incorrect');
                      }
                    }}
                  >
                    Valider
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Nom et Prénom */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                {...methods.register('firstName')}
                placeholder="Prénom"
              />
              {methods.formState.errors.firstName && (
                <p className="text-sm text-red-600 mt-1">{methods.formState.errors.firstName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                {...methods.register('lastName')}
                placeholder="Nom de famille"
              />
              {methods.formState.errors.lastName && (
                <p className="text-sm text-red-600 mt-1">{methods.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...methods.register('email')}
              placeholder="votre@email.com"
            />
            {methods.formState.errors.email && (
              <p className="text-sm text-red-600 mt-1">{methods.formState.errors.email.message}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <Label htmlFor="password">Mot de passe *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...methods.register('password')}
                placeholder="Mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {methods.formState.errors.password && (
              <p className="text-sm text-red-600 mt-1">{methods.formState.errors.password.message}</p>
            )}
          </div>

          {/* Téléphone */}
          <div className="grid grid-cols-3 gap-4">
          <div>
              <Label htmlFor="phoneCode">Indicatif</Label>
              <Input
                id="phoneCode"
                {...methods.register('phoneCode')}
                placeholder="+33"
              />
            </div>
            <div className="col-span-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              {...methods.register('phone')}
                placeholder="6 12 34 56 78"
            />
            </div>
          </div>

          {/* Profession */}
          <div>
            <Label htmlFor="profession">Profession/Activité</Label>
            <Input
              id="profession"
              {...methods.register('profession')}
              placeholder="ex: Médecin, Retraité, Étudiant..."
            />
          </div>

          {/* Localisation actuelle */}
          <div>
            <Label htmlFor="currentLocation">Localisation actuelle</Label>
            <Input
              id="currentLocation"
              {...methods.register('currentLocation')}
              placeholder="ex: Paris, France"
            />
          </div>

          {/* Lieu de naissance */}
          <div>
            <Label htmlFor="birthPlace">Lieu de naissance</Label>
            <Input
              id="birthPlace"
              {...methods.register('birthPlace')}
              placeholder="ex: Lyon, France"
            />
          </div>

          {/* Affiliation */}
          <div className="space-y-2">
            <Label htmlFor="relationship">
              Affiliation avec le Patriarche ou un autre membre *
            </Label>
            <Select
              value={methods.watch('relationship')}
              onValueChange={(value) => {
                methods.setValue('relationship', value as RelationshipType);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre relation" />
              </SelectTrigger>
              <SelectContent>
                {relationshipTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
                {!patriarchExists && <SelectItem value="patriarche">Patriarche</SelectItem>}
              </SelectContent>
            </Select>
            {methods.formState.errors.relationship && (
              <p className="text-sm text-red-600 mt-1">{methods.formState.errors.relationship.message}</p>
            )}
          </div>

          {/* Champs conditionnels pour les relations spéciales */}
          {RELATIONS_REQUIRING_INFO.includes(methods.watch('relationship') as any) && (
            <div className="space-y-4">
              {(methods.watch('relationship') === 'époux' || methods.watch('relationship') === 'épouse') && (
                <div>
                  <Label htmlFor="spouseName">Nom du conjoint</Label>
                  <Input
                    id="spouseName"
                    {...methods.register('spouseName')}
                    placeholder="Nom et prénom de votre conjoint(e)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Indiquez le nom complet de la personne à qui vous êtes marié(e)
                  </p>
                </div>
              )}

              {(methods.watch('relationship') === 'fils' || methods.watch('relationship') === 'fille') && (
                <div>
                  <Label htmlFor="fatherName">Nom du père</Label>
                  <Input
                    id="fatherName"
                    {...methods.register('fatherName')}
                    placeholder="Nom et prénom de votre père"
                  />
                  <p className="text-sm text-muted-foreground">
                    Indiquez le nom complet de votre père
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Parents (toujours affichés) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fatherName">Nom du Père</Label>
              <div className="relative">
                <Input
                  id="fatherName"
                  {...methods.register('fatherName')}
                  placeholder="Nom du père"
                />
                <ThumbsUp className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              </div>
            </div>

            <div>
              <Label htmlFor="motherName">Nom de la Mère</Label>
              <div className="relative">
                <Input
                  id="motherName"
                  {...methods.register('motherName')}
                  placeholder="Nom de la mère"
                />
                <ThumbsUp className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !methods.watch('photoUrl')}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {role === 'Administrateur' ? 'Création en cours...' : 'Inscription en cours...'}
              </>
            ) : (
              'Créer mon profil familial'
            )}
          </Button>
        </form>
      </div>
    </FormProvider>
  );
};
