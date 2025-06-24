import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/shared/Avatar';
import { Camera, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FamilyRegisterSchema, FamilyRegisterData } from '@/lib/validations/relationshipSchema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const FamilyRegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [adminCode, setAdminCode] = useState('');
  const [roleError, setRoleError] = useState('');
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const methods = useForm<FamilyRegisterData>({
    resolver: zodResolver(FamilyRegisterSchema),
    defaultValues: {
      display_name: '',
      email: '',
      password: '',
      phone_code: '+225',
      phone: '',
      avatar_url: '',
      civilite: 'M.',
      role: 'user',
    }
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setProfilePhoto(result);
        methods.setValue('avatar_url', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoleChange = (value: 'user' | 'admin') => {
    setRoleError('');
    if (value === 'admin') {
      setIsAdminDialogOpen(true);
    } else {
      setRole('user');
      setAdminCode('');
      setRoleError('');
    }
    methods.setValue('role', value);
  };

  const onSubmit = async (data: FamilyRegisterData) => {
    setIsLoading(true);
    setRoleError('');
    if (!data.avatar_url) {
      toast({ title: "Photo obligatoire", description: "Merci de sélectionner une photo de profil.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (role === 'admin' && adminCode !== '1432') {
      setRoleError('Code administrateur incorrect');
      setIsLoading(false);
      return;
    }
    try {
      const fullPhone = `${data.phone_code}${data.phone}`;

      // Créer l'utilisateur avec les métadonnées de base
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.display_name,
            phone: fullPhone,
            role: data.role,
            civilite: data.civilite,
            avatar_url: '', // Sera mis à jour après l'upload
          }
        }
      });

      if (authError) throw authError;

      // Upload de l'avatar si disponible
      if (data.avatar_url && data.avatar_url.startsWith('data:') && authData.user) {
        try {
          // Convertir le data URL en blob
          const response = await fetch(data.avatar_url);
          const blob = await response.blob();

          // Créer un nom de fichier unique
          const fileExt = blob.type.split('/')[1] || 'png';
          const fileName = `${authData.user.id}/avatar.${fileExt}`;

          // Upload dans le bucket avatars
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('avatars')
            .upload(fileName, blob, {
              upsert: true,
              contentType: blob.type
            });

          if (uploadError) {
            console.error('Erreur upload avatar:', uploadError);
            throw uploadError;
          }

          // Récupérer l'URL publique
          const { data: publicUrlData } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(fileName);

          // Mettre à jour les métadonnées utilisateur avec l'URL de l'avatar
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              avatar_url: publicUrlData.publicUrl
            }
          });

          if (updateError) {
            console.error('Erreur mise à jour avatar:', updateError);
          }

        } catch (uploadError) {
          console.error('Erreur lors de l\'upload de l\'avatar:', uploadError);
          // Continuer sans avatar si l'upload échoue
        }
      }

      toast({
        title: "Inscription réussie !",
        description: "Votre compte a été créé avec succès. Vérifiez vos emails pour valider votre inscription.",
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      toast({
        title: "Erreur d'inscription",
        description: error.message || 'Une erreur est survenue lors de l\'inscription',
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
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Photo de profil (obligatoire) */}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <Avatar
                  src={profilePhoto}
                  size="lg"
                  fallback={methods.watch('display_name') ? methods.watch('display_name')[0].toUpperCase() : '?'}
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
            <p className="text-xs text-gray-500">Photo de profil <span className="text-red-500">*</span></p>
            {methods.formState.errors.avatar_url && (
              <p className="text-sm text-red-600 mt-1">{methods.formState.errors.avatar_url.message}</p>
            )}
          </div>

          {/* Nom à afficher */}
          <div>
            <Label htmlFor="display_name" className="font-semibold">Nom à afficher</Label>
            <Input
              id="display_name"
              {...methods.register('display_name')}
              placeholder="Nom à afficher"
            />
            {methods.formState.errors.display_name && (
              <p className="text-sm text-red-600 mt-1">{methods.formState.errors.display_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="font-semibold">Email</Label>
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
            <Label htmlFor="password" className="font-semibold">Mot de passe</Label>
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-whatsapp-600 bg-transparent p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-whatsapp-500"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {methods.formState.errors.password && (
              <p className="text-sm text-red-600 mt-1">{methods.formState.errors.password.message}</p>
            )}
          </div>

          {/* Indicatif pays + téléphone */}
          <div className="flex gap-2">
            <div className="w-1/3">
              <Label htmlFor="phone_code" className="font-semibold">Indicatif</Label>
              <Input
                id="phone_code"
                {...methods.register('phone_code')}
                placeholder="+225"
                maxLength={5}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="phone" className="font-semibold">Téléphone</Label>
              <Input
                id="phone"
                {...methods.register('phone')}
                placeholder="ex: 0700000000"
              />
            </div>
          </div>
          {methods.formState.errors.phone && (
            <p className="text-sm text-red-600 mt-1">{methods.formState.errors.phone.message}</p>
          )}

          {/* Civilité */}
          <div>
            <Label htmlFor="civilite" className="font-semibold">Civilité</Label>
            <Select
              value={methods.watch('civilite')}
              onValueChange={(value) => methods.setValue('civilite', value as 'M.' | 'Mme')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisissez votre civilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M.">M.</SelectItem>
                <SelectItem value="Mme">Mme</SelectItem>
              </SelectContent>
            </Select>
            {methods.formState.errors.civilite && (
              <p className="text-sm text-red-600 mt-1">{methods.formState.errors.civilite.message}</p>
            )}
          </div>

          {/* Sélecteur de rôle */}
          <div>
            <Label htmlFor="role" className="font-semibold">Rôle</Label>
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choisissez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Utilisateur</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isAdminDialogOpen} onOpenChange={open => {
            if (!open) {
              setIsAdminDialogOpen(false);
              setRole('user');
              setAdminCode('');
              setRoleError('');
            }
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Code Administrateur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Label htmlFor="admin-code" className="font-semibold">Veuillez entrer le code secret pour devenir administrateur :</Label>
                <Input
                  id="admin-code"
                  type="password"
                  value={adminCode}
                  onChange={e => setAdminCode(e.target.value)}
                  placeholder="Code admin"
                  autoFocus
                />
                {roleError && <p className="text-sm text-red-600 mt-1">{roleError}</p>}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAdminDialogOpen(false);
                      setRole('user');
                      setAdminCode('');
                      setRoleError('');
                    }}
                  >Annuler</Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (adminCode === '1432') {
                        setRole('admin');
                        setIsAdminDialogOpen(false);
                        setRoleError('');
                      } else {
                        setRoleError('Code administrateur incorrect');
                      }
                    }}
                  >Valider</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            type="submit"
            className="w-full bg-whatsapp-600 hover:bg-whatsapp-700 text-white rounded-md py-2 px-4 font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-whatsapp-500 focus:ring-offset-2 disabled:opacity-60"
            disabled={isLoading || (role === 'admin' && adminCode !== '1432')}
          >
            {isLoading ? (
              <span className="mr-2">Inscription...</span>
            ) : (
              <><UserPlus className="inline-block w-5 h-5 mr-2 align-middle" />Créer mon compte</>
            )}
          </Button>
        </form>
      </div>
    </FormProvider>
  );
};
