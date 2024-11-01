//src/utils/formatDateForInput.ts
export const formatDateForInput = (date: Date | string | undefined): string => {
    if (!date) return '';
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Meses são base 0
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  export const formatDateTimeForGrid = (date: Date | string | undefined): string => {
    if (!date) return '';
    
    const parsedDate = new Date(date);
    
    // Extrair e formatar as partes da data
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Meses são base 0
    const year = parsedDate.getFullYear();
    
    // Extrair e formatar as partes da hora
    const hours = String(parsedDate.getHours()).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
    const seconds = String(parsedDate.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};