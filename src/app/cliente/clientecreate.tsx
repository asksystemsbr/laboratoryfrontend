"use client";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Cliente } from '../../models/cliente';
import { SnackbarState } from '@/models/snackbarState';
import InputMask from 'react-input-mask'; // Importar a biblioteca para máscaras
import { useState } from 'react'; // Adicionar estado para controle dinâmico do CPF/CNPJ

interface ClienteCreateFormProps {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const ClienteCreateForm = ({ onSave, onClose, setSnackbar }: ClienteCreateFormProps) => {
  const { register, handleSubmit, reset } = useForm<Cliente>();
  
  // Estado para controlar se é CPF ou CNPJ
  const [isCNPJ, setIsCNPJ] = useState(false);

  const onSubmit = async (data: Cliente) => {
    try {
      await axios.post('/api/Cliente', data);
      reset();
      onSave();
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao criar o cliente!', 'error', true));
    }
  };

  // Alternar entre CPF e CNPJ
  const toggleMask = () => {
    setIsCNPJ(!isCNPJ); // Troca o valor entre CPF e CNPJ
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Novo Cliente</h2>

      <div className="mb-4">
        <label className="block text-gray-700">Nome</label>
        <input {...register('nome', { required: true })} className="border rounded w-full py-2 px-3 mt-1" />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Email</label>
        <input {...register('email', { required: true })} className="border rounded w-full py-2 px-3 mt-1" />
      </div>

      {/* Campo CPF/CNPJ com a máscara dinâmica */}
      <div className="mb-4">
        <label className="block text-gray-700">CPF/CNPJ</label>
        <div className="flex">
          <InputMask
            {...register('cpfCnpj', { required: true })}
            mask={isCNPJ ? '99.999.999/9999-99' : '999.999.999-99'}
            className="border rounded w-full py-2 px-3 mt-1"
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
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Endereço</label>
        <input {...register('endereco')} className="border rounded w-full py-2 px-3 mt-1" />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Telefone</label>
        <InputMask
          {...register('telefone')}
          mask="(99) 99999-9999"
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Data de Cadastro</label>
        <input
          {...register('dataCadastro', { required: true })}
          type="date"
          className="border rounded w-full py-2 px-3 mt-1"
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
  );
};