"use client";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Cliente } from '../../models/cliente';
import { SnackbarState } from '@/models/snackbarState';
import InputMask from 'react-input-mask';

interface ClienteEditFormProps {
  clienteId: number; // ID do cliente que está sendo editado
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const ClienteEditForm = ({ clienteId, onSave, onClose, setSnackbar }: ClienteEditFormProps) => {
  const { register, handleSubmit, reset, setValue } = useForm<Cliente>();
  const [isCNPJ, setIsCNPJ] = useState(false); // Estado para controlar máscara CPF/CNPJ

  useEffect(() => {
    // Carregar os dados do cliente para edição
    const fetchCliente = async () => {
      try {
        const response = await axios.get(`/api/Cliente/${clienteId}`);
        const cliente = response.data;

        // Preencher o formulário com os dados do cliente
        setValue('nome', cliente.nome);
        setValue('email', cliente.email);
        setValue('cpfCnpj', cliente.cpfCnpj);
        setValue('endereco', cliente.endereco);
        setValue('telefone', cliente.telefone);
        setValue('dataCadastro', cliente.dataCadastro);

        // Ajusta a máscara do CPF/CNPJ baseado no tamanho do valor
        setIsCNPJ(cliente.cpfCnpj.length > 14);
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao carregar o cliente!', 'error', true));
      }
    };

    fetchCliente();
  }, [clienteId, setValue, setSnackbar]);

  const toggleMask = () => {
    setIsCNPJ(!isCNPJ); // Alterna entre CPF e CNPJ
  };

  const onSubmit = async (data: Cliente) => {
    try {
      await axios.put(`/api/Cliente/${clienteId}`, data);
      onSave();
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao editar o cliente!', 'error', true));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4" style={{ color: '#333' }}>Editar Cliente</h2>

      <div className="mb-4">
        <label className="block" style={{ color: '#333' }}>Nome</label>
        <input {...register('nome', { required: true })} 
               className="border rounded w-full py-2 px-3 mt-1" 
               style={{ color: '#333' }} // Define a cor da fonte
        />
      </div>

      <div className="mb-4">
        <label className="block" style={{ color: '#333' }}>Email</label>
        <input {...register('email', { required: true })} 
               className="border rounded w-full py-2 px-3 mt-1" 
               style={{ color: '#333' }} // Define a cor da fonte
        />
      </div>

      <div className="mb-4">
        <label className="block" style={{ color: '#333' }}>CPF/CNPJ</label>
        <div className="flex">
          <InputMask
            {...register('cpfCnpj', { required: true })}
            mask={isCNPJ ? '99.999.999/9999-99' : '999.999.999-99'}
            className="border rounded w-full py-2 px-3 mt-1"
            style={{ color: '#333' }} // Define a cor da fonte
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
        <label className="block" style={{ color: '#333' }}>Endereço</label>
        <input {...register('endereco')} 
               className="border rounded w-full py-2 px-3 mt-1" 
               style={{ color: '#333' }} // Define a cor da fonte
        />
      </div>

      <div className="mb-4">
        <label className="block" style={{ color: '#333' }}>Telefone</label>
        <InputMask
          {...register('telefone')}
          mask="(99) 99999-9999"
          className="border rounded w-full py-2 px-3 mt-1"
          style={{ color: '#333' }} // Define a cor da fonte
        />
      </div>

      <div className="mb-4">
        <label className="block" style={{ color: '#333' }}>Data de Cadastro</label>
        <input
          {...register('dataCadastro', { required: true })}
          type="date"
          className="border rounded w-full py-2 px-3 mt-1"
          style={{ color: '#333' }} // Define a cor da fonte
        />
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={onClose} 
                className="mr-2 py-2 px-4 rounded bg-gray-500 text-white">
          Cancelar
        </button>
        <button type="submit" 
                className="py-2 px-4 rounded bg-blue-500 text-white">
          Salvar
        </button>
      </div>
    </form>
  );
};