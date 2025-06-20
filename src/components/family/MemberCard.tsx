import { Calendar, MapPin, User } from 'lucide-react';
import { Avatar } from '@/components/shared/Avatar';
import { FamilyMember } from '@/types/family';
import { cn } from '@/lib/utils';
import { DeleteUserButton } from './DeleteUserButton';

interface MemberCardProps {
  member: FamilyMember;
  isSelected?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  isAdmin?: boolean;
  onDelete?: () => void;
}

export const MemberCard = ({
  member,
  isSelected = false,
  onClick,
  variant = 'default',
  isAdmin = false,
  onDelete
}: MemberCardProps) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
          isSelected && 'ring-2 ring-whatsapp-500 border-whatsapp-300',
          'animate-fade-in'
        )}
        onClick={onClick}
      >
        <div className="flex items-center space-x-3">
          <Avatar
            src={member.avatar_url}
            size="md"
            fallback={getInitials(member.first_name, member.last_name)}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {member.first_name} {member.last_name}
            </h3>
            <p className="text-sm text-whatsapp-600 truncate">{member.title}</p>
          </div>
          {isAdmin && (
            <div onClick={(e) => e.stopPropagation()}>
              <DeleteUserButton
                userId={member.id}
                userName={`${member.first_name} ${member.last_name}`}
                isAdmin={isAdmin}
                onDelete={onDelete}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-6 rounded-xl glass-effect cursor-pointer transition-all duration-300 hover-lift relative',
        isSelected && 'ring-2 ring-whatsapp-500 border-whatsapp-300',
        'animate-bounce-in'
      )}
      onClick={onClick}
    >
      {/* Bouton de suppression pour les admins */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
          <DeleteUserButton
            userId={member.id}
            userName={`${member.first_name} ${member.last_name}`}
            isAdmin={isAdmin}
            onDelete={onDelete}
          />
        </div>
      )}

      <div className="flex flex-col items-center text-center space-y-4">
        <Avatar
          src={member.avatar_url}
          size="xl"
          fallback={getInitials(member.first_name, member.last_name)}
          className="ring-4 ring-white/50"
        />

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">
            {member.first_name} {member.last_name}
          </h3>
          <p className="text-whatsapp-600 font-medium">{member.title}</p>

          {member.situation && (
            <p className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {member.situation}
            </p>
          )}
        </div>

        <div className="w-full space-y-3 text-sm">
          {member.birth_date && (
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(member.birth_date).toLocaleDateString('fr-FR')}</span>
            </div>
          )}

          {member.current_location && (
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{member.current_location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
