import { useState, useEffect, useRef } from 'react';
import supabase from '../supabaseClient'; // Import initialisé de Supabase

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
};

type Suggestion = {
  label: string;
  value: string; // ID du profil
};

const SearchMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const skipNextSearch = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchProfiles = async () => {
      if (skipNextSearch.current) {
        skipNextSearch.current = false;
        return;
      }

      const term = searchTerm.trim();

      if (!term) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
          .limit(10);

        if (error) throw error;

        const results: Suggestion[] = (data || []).map(profile => ({
          label: `${profile.first_name} ${profile.last_name}`,
          value: profile.id
        }));

        setSuggestions(results);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProfiles, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    skipNextSearch.current = true;
    setSearchTerm(suggestion.label);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center border rounded-lg shadow-sm overflow-hidden">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Rechercher un membre..."
          className="w-full px-4 py-2 focus:outline-none"
          aria-autocomplete="list"
          aria-controls="suggestions-list"
        />
        {isLoading && (
          <div className="px-3">
            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {showSuggestions && (
        <div
          id="suggestions-list"
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden border"
          role="listbox"
        >
          {suggestions.length > 0 ? (
            <ul>
              {suggestions.map(suggestion => (
                <li
                  key={suggestion.value}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseDown={(e) => e.preventDefault()} // Empêche le blur immédiat
                  role="option"
                  aria-selected="false"
                >
                  {suggestion.label}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-gray-500 italic">
              {searchTerm && !isLoading ? 'Aucun membre trouvé' : 'Commencez à taper...'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchMembers;
