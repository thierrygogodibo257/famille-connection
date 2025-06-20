
import { Calendar, MapPin } from 'lucide-react';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { cn } from '@/lib/utils';

interface FamilyNodeProps {
  nodeDatum: {
    id: string;
    name: string;
    title: string;
    photoUrl?: string;
    avatar_url?: string;
    photo_url?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    attributes?: {
      birthDate?: string;
      currentLocation?: string;
      situation?: string;
    };
  };
  onClick?: () => void;
  isSelected?: boolean;
}

export const FamilyNode = ({ nodeDatum, onClick, isSelected = false }: FamilyNodeProps) => {
  // Créer un objet utilisateur pour UserAvatar
  const userData = {
    avatar_url: nodeDatum.avatar_url || nodeDatum.photoUrl,
    photo_url: nodeDatum.photo_url || nodeDatum.photoUrl,
    first_name: nodeDatum.first_name || nodeDatum.name.split(' ')[0],
    last_name: nodeDatum.last_name || nodeDatum.name.split(' ').slice(1).join(' '),
    email: nodeDatum.email || ''
  };

  return (
    <div
      className={cn(
        'relative w-64 p-4 rounded-xl glass-effect cursor-pointer transition-all duration-300 hover-lift',
        isSelected && 'ring-2 ring-whatsapp-500 border-whatsapp-300',
        'animate-fade-in'
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <UserAvatar
          user={userData}
          size="lg"
          className="ring-4 ring-white/50"
        />

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900">
            {nodeDatum.name}
          </h3>
          <p className="text-whatsapp-600 font-medium text-sm">{nodeDatum.title}</p>

          {nodeDatum.attributes?.situation && (
            <p className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {nodeDatum.attributes.situation}
            </p>
          )}
        </div>

        <div className="w-full space-y-2 text-xs">
          {nodeDatum.attributes?.birthDate && (
            <div className="flex items-center justify-center space-x-1 text-gray-600">
              <Calendar className="w-3 h-3" />
              <span>{new Date(nodeDatum.attributes.birthDate).toLocaleDateString('fr-FR')}</span>
            </div>
          )}

          {nodeDatum.attributes?.currentLocation && (
            <div className="flex items-center justify-center space-x-1 text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>{nodeDatum.attributes.currentLocation}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
