"use client";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import InputMask from 'react-input-mask-next';
import { useEffect, useCallback } from 'react';
import { Empresa } from '../../models/empresa';
import { SnackbarState } from '@/models/snackbarState';

interface EmpresaEditFormProps {
  empresaId: number;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const EmpresaEditForm = ({ empresaId, onSave, onClose, setSnackbar }: EmpresaEditFormProps) => {
  const { register, handleSubmit, setValue } = useForm<Empresa>();

  const loadEmpresa = useCallback(async () => {
    try {
      const { data } = await axios.get<Empresa>(`/api/Empresa/${empresaId}`);
      setValue('cnpj', data.cnpj);
      setValue('razaoSocial', data.razaoSocial);
      setValue('nomeFantasia', data.nomeFantasia);
      setValue('endereco', data.endereco);
      setValue('telefone', data.telefone);
      setValue('email', data.email);
      setValue('dataAbertura', data.dataAbertura);
      setValue('naturezaJuridica', data.naturezaJuridica);
      setValue('situacaoCadastral', data.situacaoCadastral);
      setValue('capitalSocial', data.capitalSocial);
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao carregar a empresa!', 'error', true));
    }
  }, [empresaId, setValue, setSnackbar]);

  useEffect(() => {
    loadEmpresa();
  }, [loadEmpresa]);

  const onSubmit = async (data: Empresa) => {
    try {
      await axios.put(`/api/Empresa/${empresaId}`, data);
      setSnackbar(new SnackbarState('Empresa editada com sucesso!', 'success', true));
      onSave();
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao editar a empresa!', 'error', true));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Empresa</h2>

      {/* Organizando os campos em grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CNPJ */}
        <div className="mb-4">
          <label className="block text-gray-700">CNPJ</label>
          <InputMask
            mask="99.999.999/9999-99"
            {...register('cnpj', { required: true })}
            className="border rounded w-full py-2 px-3 mt-1"
          />
        </div>

        {/* Razão Social */}
        <div className="mb-4">
          <label className="block text-gray-700">Razão Social</label>
          <input {...register('razaoSocial', { required: true })} className="border rounded w-full py-2 px-3 mt-1" />
        </div>

        {/* Nome Fantasia */}
        <div className="mb-4">
          <label className="block text-gray-700">Nome Fantasia</label>
          <input {...register('nomeFantasia', { required: true })} className="border rounded w-full py-2 px-3 mt-1" />
        </div>

        {/* Endereço */}
        <div className="mb-4">
          <label className="block text-gray-700">Endereço</label>
          <input {...register('endereco', { required: true })} className="border rounded w-full py-2 px-3 mt-1" />
        </div>

        {/* Telefone */}
        <div className="mb-4">
          <label className="block text-gray-700">Telefone</label>
          <InputMask
            mask="(99) 99999-9999"
            {...register('telefone', { required: true })}
            className="border rounded w-full py-2 px-3 mt-1"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input {...register('email', { required: true })} className="border rounded w-full py-2 px-3 mt-1" />
        </div>

        {/* Data de Abertura */}
        <div className="mb-4">
          <label className="block text-gray-700">Data de Abertura</label>
          <input type="date" {...register('dataAbertura', { required: true })} className="border rounded w-full py-2 px-3 mt-1" />
        </div>

        {/* Natureza Jurídica */}
        <div className="mb-4">
          <label className="block text-gray-700">Natureza Jurídica</label>
          <input {...register('naturezaJuridica', { required: true })} className="border rounded w-full py-2 px-3 mt-1" />
        </div>

        {/* Situação Cadastral */}
        <div className="mb-4">
          <label className="block text-gray-700">Situação Cadastral</label>
          <input {...register('situacaoCadastral', { required: true })} className="border rounded w-full py-2 px-3 mt-1" />
        </div>

        {/* Capital Social */}
        <div className="mb-4">
          <label className="block text-gray-700">Capital Social</label>
          <input type="number" step="0.01" {...register('capitalSocial', { required: true })} className="border rounded w-full py-2 px-3 mt-1" />
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
  );
};