"use client";
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import InputMask from 'react-input-mask-next';
import { Empresa } from '../../models/empresa';
import { SnackbarState } from '@/models/snackbarState';

interface EmpresaEditFormProps {
  empresa: Empresa;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const EmpresaEditForm = ({ empresa, onSave, onClose, setSnackbar }: EmpresaEditFormProps) => {
  const { register, handleSubmit, setValue } = useForm<Empresa>({ defaultValues: empresa });

  useEffect(() => {
    if (empresa.dataAbertura) {
      const validDate = new Date(empresa.dataAbertura);
      if (!isNaN(validDate.getTime())) {
        const formattedDate = validDate.toISOString().split('T')[0];
        setValue('dataAbertura', formattedDate);
      }
    }
  }, [empresa.dataAbertura, setValue]);

  const onSubmit = async (data: Empresa) => {
    try {
      await axios.put(`/api/Empresa/${empresa.id}`, data);
      setSnackbar(new SnackbarState('Empresa editada com sucesso!', 'success', true));
      onSave();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao editar a empresa!', 'error', true));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-4 max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-y-auto max-h-screen"
      >
        <h2 className="text-xl font-bold mb-2 text-gray-800">Editar Empresa</h2>

        {/* CNPJ */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">CNPJ *</label>
            <InputMask
              mask="99.999.999/9999-99"
              {...register('cnpj', { required: true })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          {/* Razão Social */}
          <div>
            <label className="block text-gray-800">Razão Social *</label>
            <input
              {...register('razaoSocial', { required: true })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>
        </div>

        {/* Nome Fantasia e Endereço */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">Nome Fantasia *</label>
            <input
              {...register('nomeFantasia', { required: true })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-gray-800">Endereço *</label>
            <input
              {...register('endereco', { required: true })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>
        </div>

        {/* Telefone e Email */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">Telefone *</label>
            <InputMask
              mask="(99) 99999-9999"
              {...register('telefone', { required: true })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-gray-800">Email *</label>
            <input
              {...register('email', { required: true })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>
        </div>

        {/* Data de Abertura, Natureza Jurídica, Situação Cadastral e Capital Social */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">Data de Abertura *</label>
            <input
              type="date"
              {...register('dataAbertura', { required: true })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-gray-800">Natureza Jurídica *</label>
            <input
              {...register('naturezaJuridica', { required: true })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-gray-800">Situação Cadastral *</label>
            <input
              {...register('situacaoCadastral', { required: true })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-gray-800">Capital Social *</label>
            <input
              type="number"
              step="0.01"
              {...register('capitalSocial', { required: true })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>
        </div>

        {/* Botões */}
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