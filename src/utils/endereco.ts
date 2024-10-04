import { Endereco } from '@/models/endereco';
import axios from 'axios';


export const buscarEnderecoViaCep = async (cep: string): Promise<Endereco | null> => {
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

    if (response.data.erro) {
      return null; // CEP não encontrado, retorna null
    }

    // Retorna o endereço completo preenchido a partir do resultado da API
    return {
      cep: response.data.cep,
      rua: response.data.logradouro,
      complemento: response.data.complemento,
      bairro: response.data.bairro,
      cidade: response.data.localidade,
      uf: response.data.uf,
      numero: '', // O número será mantido pelo componente que invoca a função
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};
