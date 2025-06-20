
import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

export const Avatar = ({ src, alt, size = 'md', className, fallback }: AvatarProps) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={cn(
      'relative rounded-full overflow-hidden bg-gradient-to-br from-whatsapp-100 to-whatsapp-200 flex items-center justify-center border-2 border-white shadow-md',
      sizeClasses[size],
      className
    )}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : fallback ? (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-whatsapp-400 to-whatsapp-500 text-white font-semibold">
          {fallback}
        </div>
      ) : (
        <User className={cn('text-whatsapp-600', iconSizes[size])} />
      )}
    </div>
  );
};
