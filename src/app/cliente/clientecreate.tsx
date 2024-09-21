"use client";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Cliente } from '../../models/cliente';
import { SnackbarState } from '@/models/snackbarState';
import InputMask from 'react-input-mask-next';
import { useState } from 'react'; 

interface ClienteCreateFormProps {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const ClienteCreateForm = ({ onSave, onClose, setSnackbar }: ClienteCreateFormProps) => {
  const { register, handleSubmit, reset, formState: { errors }  } = useForm<Cliente>();

  // Estados locais para mocar os campos de endereço
  const [cep, setCep] = useState(''); 
  const [logradouro, setLogradouro] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [uf, setUf] = useState('');

  const [isCNPJ, setIsCNPJ] = useState(false); 

  // Função para buscar endereço na API ViaCep
  const buscarEnderecoViaCep = async (cep: string) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (response.data.erro) {
        setSnackbar(new SnackbarState('CEP não encontrado!', 'error', true));
      } else {
        // Preenche os campos de endereço com os dados retornados
        setLogradouro(response.data.logradouro);
        setComplemento(response.data.complemento);
        setBairro(response.data.bairro);
        setLocalidade(response.data.localidade);
        setUf(response.data.uf);
      }
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao buscar CEP!', 'error', true));
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cepDigitado = e.target.value.replace(/\D/g, ''); 
    setCep(cepDigitado); 
    if (cepDigitado.length === 8) {
      buscarEnderecoViaCep(cepDigitado); 
    }
  };

  const onSubmit = async (data: Cliente) => {
    try {
      await axios.post('/api/Cliente', data); 
      reset();
      onSave();
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao criar o cliente!', 'error', true));
    }
  };

  const toggleMask = () => {
    setIsCNPJ(!isCNPJ); 
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="p-6 max-w-3xl w-full bg-white rounded-lg shadow-lg overflow-y-auto max-h-screen">
        
        <h2 className="text-xl font-bold mb-4 text-gray-800">Novo Cliente</h2>

        {/* Campo Nome */}
        <div className="mb-4">
          <label className="block text-gray-800">Nome</label>
          <input 
            {...register('nome', { required: 'O nome é obrigatório' })} 
            className="border rounded w-full py-2 px-3 mt-1 text-gray-800" 
          />
          {errors.nome && <p className="text-red-500 text-sm">{errors.nome?.message}</p>}
        </div>

        {/* Campo Email */}
        <div className="mb-4">
          <label className="block text-gray-800">Email</label>
          <input 
            {...register('email', { 
              required: 'O e-mail é obrigatório',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'E-mail inválido'
              }
            })}
            className="border rounded w-full py-2 px-3 mt-1 text-gray-800" 
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email?.message}</p>}
        </div>

        {/* Campo CPF/CNPJ */}
        <div className="mb-4">
          <label className="block text-gray-800">CPF/CNPJ</label>
          <div className="flex">
            <InputMask
              {...register('cpfCnpj', { required: 'CPF/CNPJ é obrigatório' })}
              mask={isCNPJ ? '99.999.999/9999-99' : '999.999.999-99'}
              className="border rounded w-full py-2 px-3 mt-1 text-gray-800"
              placeholder={isCNPJ ? 'CNPJ' : 'CPF'}
            />
            <button
              type="button"
              onClick={toggleMask}
              className="ml-2 py-2 px-4 bg-blue-500 text-white rounded"
            >
              {isCNPJ ? 'Usar CPF' : 'Usar CNPJ'}
            </button>
          </div>
          {errors.cpfCnpj && <p className="text-red-500 text-sm">{errors.cpfCnpj?.message}</p>}
        </div>

        {/* Campo CEP */}
        <div className="mb-4">
          <label className="block text-gray-800">CEP</label>
          <InputMask
            value={cep} 
            mask="99999-999"
            className="border rounded w-full py-2 px-3 mt-1 text-gray-800"
            onChange={handleCepChange} 
          />
        </div>

        {/* Campo Logradouro (Rua) */}
        <div className="mb-4">
          <label className="block text-gray-800">Rua (Logradouro)</label>
          <input 
            value={logradouro} 
            className="border rounded w-full py-2 px-3 mt-1 text-gray-800" 
            readOnly 
          />
        </div>

        {/* Campo Complemento */}
        <div className="mb-4">
          <label className="block text-gray-800">Complemento</label>
          <input 
            value={complemento} 
            className="border rounded w-full py-2 px-3 mt-1 text-gray-800" 
            readOnly 
          />
        </div>

        {/* Campo Bairro */}
        <div className="mb-4">
          <label className="block text-gray-800">Bairro</label>
          <input 
            value={bairro} 
            className="border rounded w-full py-2 px-3 mt-1 text-gray-800" 
            readOnly 
          />
        </div>

        {/* Campo Cidade */}
        <div className="mb-4">
          <label className="block text-gray-800">Cidade</label>
          <input 
            value={localidade} 
            className="border rounded w-full py-2 px-3 mt-1 text-gray-800" 
            readOnly 
          />
        </div>

        {/* Campo UF */}
        <div className="mb-4">
          <label className="block text-gray-800">UF</label>
          <input 
            value={uf} 
            className="border rounded w-full py-2 px-3 mt-1 text-gray-800" 
            readOnly 
          />
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="mr-2 py-2 px-4 rounded bg-gray-500 text-white">
            Cancelar
          </button>
          <button type="submit" className="py-2 px-4 rounded bg-blue-500 text-white">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};