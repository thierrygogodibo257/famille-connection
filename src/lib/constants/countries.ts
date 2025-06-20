
export const countries = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳' },
  { code: 'DZ', name: 'Algérie', flag: '🇩🇿' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
];

export const getCountryByCode = (code: string) => {
  return countries.find(country => country.code === code);
};

export const getCountryFlag = (code: string) => {
  const country = getCountryByCode(code);
  return country ? country.flag : '🌍';
};
