//src/utils/numbers.ts
// Função para limitar casas decimais   
export  const formatDecimal = (value: number, decimalPlaces: number) => {
    return parseFloat(value.toFixed(decimalPlaces));
  };

  export const formatCurrencyBRL = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  