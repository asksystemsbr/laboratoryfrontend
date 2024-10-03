"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import InputMask from 'react-input-mask-next';
import { Empresa } from '../../models/empresa';
import { SnackbarState } from '@/models/snackbarState';

interface EmpresaCreateFormProps {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const EmpresaCreateForm = ({ onSave, onClose, setSnackbar }: EmpresaCreateFormProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Empresa>();

  const onSubmit = async (data: Empresa) => {
    try {
      await axios.post('/api/Empresa', data);
      reset();
      onSave();
    } catch (error) {
      console.log(error);
      setSnackbar(new SnackbarState('Erro ao criar a empresa!', 'error', true));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-4 max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-y-auto max-h-screen"
      >
        <h2 className="text-xl font-bold mb-2 text-gray-800">Nova Empresa</h2>

        {/* CNPJ e Razão Social */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">CNPJ *</label>
            <InputMask
              mask="99.999.999/9999-99"
              {...register('cnpj', { required: 'O CNPJ é obrigatório' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.cnpj && <p className="text-red-500 text-sm">{errors.cnpj?.message}</p>}
          </div>

          <div>
            <label className="block text-gray-800">Razão Social *</label>
            <input
              {...register('razaoSocial', { required: 'A Razão Social é obrigatória' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.razaoSocial && <p className="text-red-500 text-sm">{errors.razaoSocial?.message}</p>}
          </div>
        </div>

        {/* Nome Fantasia e Endereço */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">Nome Fantasia *</label>
            <input
              {...register('nomeFantasia', { required: 'O Nome Fantasia é obrigatório' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.nomeFantasia && <p className="text-red-500 text-sm">{errors.nomeFantasia?.message}</p>}
          </div>

          <div>
            <label className="block text-gray-800">Endereço *</label>
            <input
              {...register('endereco', { required: 'O Endereço é obrigatório' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.endereco && <p className="text-red-500 text-sm">{errors.endereco?.message}</p>}
          </div>
        </div>

        {/* Telefone e Email */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">Telefone *</label>
            <InputMask
              mask="(99) 99999-9999"
              {...register('telefone', { required: 'O Telefone é obrigatório' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone?.message}</p>}
          </div>

          <div>
            <label className="block text-gray-800">Email *</label>
            <input
              {...register('email', { required: 'O Email é obrigatório' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email?.message}</p>}
          </div>
        </div>

        {/* Data de Abertura, Natureza Jurídica, Situação Cadastral e Capital Social */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">Data de Abertura *</label>
            <input
              type="date"
              {...register('dataAbertura', { required: 'A Data de Abertura é obrigatória' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.dataAbertura && <p className="text-red-500 text-sm">{errors.dataAbertura?.message}</p>}
          </div>

          <div>
            <label className="block text-gray-800">Natureza Jurídica *</label>
            <input
              {...register('naturezaJuridica', { required: 'A Natureza Jurídica é obrigatória' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.naturezaJuridica && <p className="text-red-500 text-sm">{errors.naturezaJuridica?.message}</p>}
          </div>

          <div>
            <label className="block text-gray-800">Situação Cadastral *</label>
            <input
              {...register('situacaoCadastral', { required: 'A Situação Cadastral é obrigatória' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.situacaoCadastral && <p className="text-red-500 text-sm">{errors.situacaoCadastral?.message}</p>}
          </div>

          <div>
            <label className="block text-gray-800">Capital Social *</label>
            <input
              type="number"
              step="0.01"
              {...register('capitalSocial', { required: 'O Capital Social é obrigatório' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.capitalSocial && <p className="text-red-500 text-sm">{errors.capitalSocial?.message}</p>}
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