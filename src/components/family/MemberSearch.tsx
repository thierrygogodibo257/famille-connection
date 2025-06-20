
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MemberSearchProps {
  onSearchChange: (searchTerm: string) => void;
  onFilterChange: (filter: string) => void;
  searchTerm: string;
  selectedFilter: string;
}

export const MemberSearch = ({ 
  onSearchChange, 
  onFilterChange, 
  searchTerm, 
  selectedFilter 
}: MemberSearchProps) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearchTerm);
  };

  const clearSearch = () => {
    setLocalSearchTerm('');
    onSearchChange('');
  };

  return (
    <div className="mb-6 space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {localSearchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <Button type="submit" variant="outline">
          Rechercher
        </Button>
      </form>

      <div className="flex gap-4 items-center">
        <label className="text-sm font-medium">Filtrer par :</label>
        <Select value={selectedFilter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les membres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les membres</SelectItem>
            <SelectItem value="admin">Administrateurs</SelectItem>
            <SelectItem value="patriarch">Patriarches</SelectItem>
            <SelectItem value="recent">Récents</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
