//src/utils/numbers.ts
// Função para limitar casas decimais   
export  const formatDecimal = (value: number, decimalPlaces: number) => {
    return parseFloat(value.toFixed(decimalPlaces));
  };
  