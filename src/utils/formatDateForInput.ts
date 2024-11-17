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
    
    // Aplicar ajuste para GMT-3
    const gmt3Date = new Date(parsedDate.getTime() - 0 * 60 * 60 * 1000); // Subtrai 3 horas

    // Extrair e formatar as partes da data
    const day = String(gmt3Date.getDate()).padStart(2, '0');
    const month = String(gmt3Date.getMonth() + 1).padStart(2, '0'); // Meses são base 0
    const year = gmt3Date.getFullYear();

    // Extrair e formatar as partes da hora
    const hours = String(gmt3Date.getHours()).padStart(2, '0');
    const minutes = String(gmt3Date.getMinutes()).padStart(2, '0');
    const seconds = String(gmt3Date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};