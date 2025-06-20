import { RelationshipType } from '../validations/relationshipSchema';

export const baseRelationshipTypeOptions: {
  label: string;
  value: RelationshipType;
}[] = [
  { label: 'Fils', value: 'fils' },
  { label: 'Fille', value: 'fille' },
  { label: 'Père', value: 'père' },
  { label: 'Mère', value: 'mère' },
  { label: 'Cousin', value: 'cousin' },
  { label: 'Cousine', value: 'cousine' },
  { label: 'Tante', value: 'tante' },
  { label: 'Oncle', value: 'oncle' },
  { label: 'Neveu', value: 'neveu' },
  { label: 'Nièce', value: 'nièce' },
  { label: 'Petit-fils', value: 'petit-fils' },
  { label: 'Petite-fille', value: 'petite-fille' },
  { label: 'Grand-père', value: 'grand-père' },
  { label: 'Grande-mère', value: 'grande-mère' },
  { label: 'Époux', value: 'époux' },
  { label: 'Épouse', value: 'épouse' },
];

// Fonction pour générer les options de relation dynamiquement
export const getRelationshipTypeOptions = (
  title: 'M.' | 'Mme' = 'M.',
  patriarchExists: boolean = false
) => {
  const options = [...baseRelationshipTypeOptions];

  // Ajouter Patriarche/Matriarche seulement s'il n'en existe pas déjà
  if (!patriarchExists) {
    if (title === 'M.') {
      options.unshift({ label: 'Patriarche', value: 'patriarche' });
    } else {
      options.unshift({ label: 'Matriarche', value: 'matriarche' });
    }
  }

  return options;
};

// Export par défaut pour la compatibilité
export const relationshipTypeOptions = baseRelationshipTypeOptions;
