import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ROUTES } from '@/lib/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { FormHeader } from '@/components/shared/FormHeader';

const InvitePage = () => {
  const [activeTab, setActiveTab] = useState<'email' | 'link'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleInviteByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('join_requests')
        .insert([
          {
            requester_id: user?.id,
            status: 'pending',
            tree_id: null
          }
        ]);

      if (error) throw error;

      toast({
        title: "Invitation envoyée",
        description: "L'invitation a été envoyée avec succès.",
      });

      setEmail('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de l'invitation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteByLink = async () => {
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .insert([
          {
            requester_id: user?.id,
            status: 'pending',
            tree_id: null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const inviteLink = `${window.location.origin}${ROUTES.AUTH.REGISTER}?invite=${data.id}`;

      await navigator.clipboard.writeText(inviteLink);

      toast({
        title: "Lien copié",
        description: "Le lien d'invitation a été copié dans le presse-papier.",
      });
    } catch (error) {
      console.error('Erreur lors de la génération du lien:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du lien.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-50 via-green-50 to-emerald-50 flex items-center justify-center p-4 pt-32">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="p-6">
          <FormHeader
            title="Inviter un membre"
            subtitle="Choisissez votre méthode d'invitation"
          />

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'email'
                  ? 'bg-whatsapp-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Par email
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'link'
                  ? 'bg-whatsapp-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Par lien
            </button>
          </div>

          {/* Email Form */}
          {activeTab === 'email' && (
            <form onSubmit={handleInviteByEmail} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="exemple@email.com"
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-whatsapp-500 to-whatsapp-600 hover:from-whatsapp-600 hover:to-whatsapp-700"
                disabled={isLoading}
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
              </Button>
            </form>
          )}

          {/* Link Form */}
          {activeTab === 'link' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Générez un lien d'invitation unique que vous pourrez partager avec les membres de votre famille.
                </p>
              </div>
              <Button
                onClick={handleInviteByLink}
                className="w-full bg-gradient-to-r from-whatsapp-500 to-whatsapp-600 hover:from-whatsapp-600 hover:to-whatsapp-700"
              >
                Générer et copier le lien
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
