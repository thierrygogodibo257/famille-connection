
import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  fallback = '?', 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-20 h-20 text-xl',
    xl: 'w-32 h-32 text-3xl'
  };

  // Vérifier si l'URL est valide et accessible
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    
    // Vérifier si c'est une URL Supabase valide
    if (url.includes('supabase.co/storage/v1/object/public/avatars/')) {
      return true;
    }
    
    // Vérifier si c'est une URL data valide
    if (url.startsWith('data:image/')) {
      return true;
    }
    
    // Vérifier si c'est une URL HTTP/HTTPS valide
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const showImage = isValidImageUrl(src);

  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br from-whatsapp-400 to-whatsapp-600 flex items-center justify-center text-white font-semibold overflow-hidden',
      sizeClasses[size],
      className
    )}>
      {showImage ? (
        <img 
          src={src!} 
          alt="Avatar" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // En cas d'erreur de chargement, masquer l'image et afficher le fallback
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextSibling) {
              (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
            }
          }}
        />
      ) : null}
      <div 
        className={cn(
          'w-full h-full flex items-center justify-center',
          showImage ? 'hidden' : 'flex'
        )}
      >
        {fallback}
      </div>
    </div>
  );
};
