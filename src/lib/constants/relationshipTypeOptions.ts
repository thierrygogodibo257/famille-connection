import { RelationshipType } from '../validations/relationshipSchema';

export const relationshipTypeOptions: {
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
