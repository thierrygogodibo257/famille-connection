
import { format, formatDistance, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatString = 'dd/MM/yyyy') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatString, { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatDateDistance = (date: string | Date) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return formatDistance(dateObj, new Date(), { 
      addSuffix: true, 
      locale: fr 
    });
  } catch (error) {
    console.error('Error formatting date distance:', error);
    return '';
  }
};

export const calculateAge = (birthDate: string | Date) => {
  try {
    const dateObj = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
    if (!isValid(dateObj)) return null;
    
    const today = new Date();
    let age = today.getFullYear() - dateObj.getFullYear();
    const monthDiff = today.getMonth() - dateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
};

export const isValidDate = (date: string) => {
  try {
    const dateObj = parseISO(date);
    return isValid(dateObj);
  } catch {
    return false;
  }
};
