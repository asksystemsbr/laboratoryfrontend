//src/utils/phone.ts
export const validatePhone = (phone: string): boolean => {
    phone = phone.replace(/\D/g, ''); // Remove tudo que não for número
    
  
  // Verifica se o telefone tem 10 ou 11 dígitos
  if (phone.length === 10) {
    // Valida telefone fixo (formato (XX) XXXX-XXXX)
    const ddd = phone.substring(0, 2);
    const prefixo = phone.substring(2, 6);
    const sufixo = phone.substring(6);

    // Verifica se o DDD é válido e o prefixo tem formato de número fixo (não pode começar com 9)
    return /^[1-9]{2}$/.test(ddd) && /^[2-8]\d{3}$/.test(prefixo) && /^\d{4}$/.test(sufixo);
  } else if (phone.length === 11) {
    // Valida telefone móvel (formato (XX) 9XXXX-XXXX)
    const ddd = phone.substring(0, 2);
    const prefixo = phone.substring(2, 7);
    const sufixo = phone.substring(7);

    // Verifica se o DDD é válido e o prefixo tem formato de número móvel (deve começar com 9)
    return /^[1-9]{2}$/.test(ddd) && /^9\d{4}$/.test(prefixo) && /^\d{4}$/.test(sufixo);
  }

  // Se não tem 10 ou 11 dígitos, não é válido
  return false;
  };