//src/utils/validateDate.ts
export const validateDate = (value: string | Date | undefined): true | string => {
    if (!value || typeof value !== 'string') {
      return 'Data inválida';
    }
    
    const date = new Date(value);
    const year = date.getFullYear();

    if (isNaN(date.getTime()) || year < 1900 || year > 2999) {
        return 'Data deve estar entre 1900 e 2999';
    }

    return true;
  };
  