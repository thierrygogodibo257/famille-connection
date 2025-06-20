import React from 'react';
import { Avatar } from '@/components/shared/Avatar';

interface UserAvatarProps {
  user: {
    avatar_url?: string | null;
    photo_url?: string | null;
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  isOnline?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  showStatus = false,
  isOnline = true
}) => {
  // Obtenir l'URL de l'avatar en priorité avatar_url puis photo_url
  const getAvatarUrl = (): string | null => {
    if (!user) return null;
    if (user.avatar_url) return user.avatar_url;
    if (user.photo_url) return user.photo_url;
    return null;
  };

  // Obtenir le nom complet de l'utilisateur
  const getUserFullName = (): string => {
    if (!user) return 'Utilisateur';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email || 'Utilisateur';
  };

  // Obtenir les initiales pour le fallback
  const getUserInitials = (): string => {
    const fullName = getUserFullName();
    if (fullName === 'Utilisateur') return 'U';
    return fullName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative">
      <Avatar
        src={getAvatarUrl()}
        fallback={getUserInitials()}
        size={size}
        className={className}
      />
      {showStatus && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
        }`} />
      )}
    </div>
  );
};
