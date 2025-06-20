
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  title?: string;
}

interface SearchMembersProps {
  onMemberSelect?: (member: Member) => void;
  placeholder?: string;
}

export const SearchMembers: React.FC<SearchMembersProps> = ({
  onMemberSelect,
  placeholder = "Rechercher un membre..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = members.filter(member =>
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMembers(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredMembers([]);
      setIsOpen(false);
    }
  }, [searchTerm, members]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, title')
        .order('first_name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des membres:', error);
    }
  };

  const handleMemberSelect = (member: Member) => {
    setSearchTerm(`${member.first_name} ${member.last_name}`);
    setIsOpen(false);
    if (onMemberSelect) {
      onMemberSelect(member);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/50"
        />
      </div>
      
      {isOpen && filteredMembers.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => handleMemberSelect(member)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              <div className="font-medium">{member.first_name} {member.last_name}</div>
              <div className="text-sm text-gray-500">{member.email}</div>
              {member.title && (
                <div className="text-xs text-gray-400">{member.title}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
