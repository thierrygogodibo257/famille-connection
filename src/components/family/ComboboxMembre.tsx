
import React, { useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Combobox } from '@/components/ui/combobox';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ComboboxMembreProps {
  name: string;
  placeholder?: string;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  title?: string;
}

export const ComboboxMembre: React.FC<ComboboxMembreProps> = ({ 
  name, 
  placeholder = "Rechercher un membre..." 
}) => {
  const { setValue, watch } = useFormContext();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentValue = watch(name);

  const searchMembers = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setMembers([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await api.searchMembers(query);
      setMembers(results);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      setMembers([]);
      toast({
        title: "Erreur",
        description: "Impossible de charger les membres. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleMemberSelect = useCallback((memberId: string) => {
    const selectedMember = members.find(m => m.id === memberId);
    if (selectedMember) {
      const displayName = `${selectedMember.title || ''} ${selectedMember.first_name} ${selectedMember.last_name}`.trim();
      setValue(name, displayName);
    }
  }, [members, setValue, name]);

  const memberOptions = members.map(member => ({
    value: member.id,
    label: `${member.title || ''} ${member.first_name} ${member.last_name}`.trim()
  }));

  return (
    <Combobox
      items={memberOptions}
      onSearch={searchMembers}
      onChange={handleMemberSelect}
      value={currentValue}
      placeholder={placeholder}
      disabled={isLoading}
    />
  );
};
