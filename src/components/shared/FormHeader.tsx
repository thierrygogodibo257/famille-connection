import { TreePine, Star } from 'lucide-react';

export function FormHeader({ title, subtitle }: { title: string, subtitle?: string }) {
  return (
    <div className="text-center mb-8">
      <TreePine className="w-12 h-12 mx-auto mb-4 text-green-600 animate-pulse" />
      <h2 className="text-2xl font-bold mb-2 text-green-700 inline-flex items-center justify-center">
        {title}
       {/*  <sup className="ml-2 align-super">
          <Star className="w-10 h-10 text-yellow-400 drop-shadow-lg" style={{ filter: 'brightness(1.5)' }} />
        </sup> */}
      </h2>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
