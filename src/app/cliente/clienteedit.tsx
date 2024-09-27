"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useEffect, useState,useCallback  } from 'react';
import { Cliente } from '../../models/cliente';
import { SnackbarState } from '@/models/snackbarState';
import InputMask from 'react-input-mask-next';

interface ClienteEditFormProps {
  clienteId: number; // ID do cliente que está sendo editado
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const ClienteEditForm = ({ clienteId, onSave, onClose, setSnackbar }: ClienteEditFormProps) => {
  const { register, handleSubmit, setValue,formState: { errors } } = useForm<Cliente>();
  const [isCNPJ, setIsCNPJ] = useState(false); // Estado para controlar máscara CPF/CNPJ


  const loadCliente = useCallback(async () => {
    try {
      const { data } = await axios.get<Cliente>(`/api/Cliente/${clienteId}`);

      // Format 'dataCadastro' to 'YYYY-MM-DD' format
      if (data.dataCadastro) {
        const validDate = new Date(data.dataCadastro);
        if (!isNaN(validDate.getTime())) {
          const formattedDate = new Date(data.dataCadastro).toISOString().split('T')[0]; // Extract only the date part
          setValue('dataCadastro', formattedDate);
        }
      }
      // Pre-fill the form with data from the API
      Object.keys(data).forEach((key) => {
        if (key !== 'dataCadastro') {
          setValue(key as keyof Cliente, data[key as keyof Cliente]);
        }
      })
      
      if (data.cpfCnpj) {
        setIsCNPJ(data.cpfCnpj.length > 14);
      }
    } catch (error) {
      console.error(error);
      setSnackbar(new SnackbarState('Erro ao carregar o cliente!', 'error', true));
    }
  }, [clienteId, setValue, setSnackbar]);

  useEffect(() => {
    loadCliente();
  }, [loadCliente]);

  const toggleMask = () => setIsCNPJ((prev) => !prev);


  const onSubmit = async (data: Cliente) => {
    try {
      if (typeof data.dataCadastro === 'string') {
        data.dataCadastro = new Date(data.dataCadastro); 
      }
      await axios.put(`/api/Cliente/${clienteId}`, data);
      setSnackbar(new SnackbarState('Cliente editado com sucesso!', 'success', true));
      onSave();
    } catch (error) {
      console.error(error);
      setSnackbar(new SnackbarState('Erro ao editar o cliente!', 'error', true));
    }
  };

  // Styles
  const inputStyle = 'border rounded w-full py-2 px-3 mt-1';
  const textColor = { color: '#333' };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
       <h2 className="text-xl font-bold mb-4" style={textColor}>Editar Cliente</h2>

      <div className="mb-4">
        <label className="block" style={textColor}>Nome</label>
        <input {...register('nome', { required: 'O nome é obrigatório' })} 
              className={inputStyle} 
              style={textColor} 
        />
         {errors.nome && <p className="text-red-500 text-sm">{errors.nome?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block" style={{ color: '#333' }}>Email</label>
        <input {...register('email', {             
            required: 'O e-mail é obrigatório',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'E-mail inválido'
            } 
          })} 
              className={inputStyle} 
              style={textColor} 
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block" style={textColor}>CPF/CNPJ</label>
        <div className="flex">
          <InputMask
            {...register('cpfCnpj', { required: 'CPF/CNPJ é obrigatório'  })}
            mask={isCNPJ ? '99.999.999/9999-99' : '999.999.999-99'}
            className={inputStyle}
            style={textColor}// Define a cor da fonte
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

      <div className="mb-4">
      <label className="block" style={textColor}>Endereço</label>
        <input {...register('enderecoId',{required: 'O endereço é obrigatório'})} 
               className={inputStyle} 
               style={textColor} // Define a cor da fonte
        />
        {errors.enderecoId && <p className="text-red-500 text-sm">{errors.enderecoId?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block" style={textColor}>Telefone</label>
        <InputMask
          {...register('telefone', { required: 'O telefone é obrigatório' })}
          mask="(99) 99999-9999"
          className={inputStyle}
          style={textColor} // Define a cor da fonte
        />
        {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block" style={textColor}>Data de Cadastro</label>
        <input
          {...register('dataCadastro', { required: 'A data de cadastro é obrigatória' })}
          type="date"
          className={inputStyle}
          style={textColor} // Define a cor da fonte
        />
        {errors.dataCadastro && <p className="text-red-500 text-sm">{errors.dataCadastro?.message}</p>}
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