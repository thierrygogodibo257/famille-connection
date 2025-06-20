import React, { useEffect, useState } from 'react';
import { Combobox } from '@/components/ui/combobox';
import { useFormContext } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { RelationshipType } from '@/lib/validations/relationshipSchema';

type Option = {
  value: string;
  label: string;
};

interface ComboboxMembreProps {
  name: string;
  placeholder?: string;
  relationship?: string;
}

export const ComboboxMembre = ({
  name,
  placeholder = "Sélectionnez un membre",
  relationship
}: ComboboxMembreProps) => {
  const { setValue, watch } = useFormContext();
  const [options, setOptions] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Query plus simple pour éviter les problèmes de RLS
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, title')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erreur lors du chargement des membres:', error);
          return;
        }

        if (!data || data.length === 0) {
          setOptions([]);
          return;
        }

        // Met les patriarches/matriarches en haut et trie le reste
        const leaders = data.filter(m => m.title === 'Patriarche' || m.title === 'Matriarche');
        const otherMembers = data.filter(m => m.title !== 'Patriarche' && m.title !== 'Matriarche');

        const sorted = [...leaders, ...otherMembers];

        const mapped = sorted.map(member => ({
          value: `${member.first_name} ${member.last_name}`,
          label: `${member.first_name} ${member.last_name} (${member.title})`
        }));

        setOptions(mapped);
      } catch (err) {
        console.error('Erreur lors du chargement des membres:', err);
        setOptions([]);
      }
    };

    if (open && options.length === 0) {
      fetchMembers();
    }
  }, [open, options.length]);

  const customPlaceholder = relationship === 'époux'
    ? "Rechercher votre conjoint(e)..."
    : "Rechercher votre parent...";

  return (
    <Combobox
      items={options}
      value={watch(name)}
      onChange={(value) => setValue(name, value, { shouldValidate: true })}
      onSearch={() => {}} // La recherche est gérée côté client
      placeholder={placeholder || customPlaceholder}
      onFocus={() => setOpen(true)}
    />
  );
};
