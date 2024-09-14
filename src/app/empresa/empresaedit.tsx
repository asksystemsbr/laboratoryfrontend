"use client";
import { useForm } from 'react-hook-form';
import axios from 'axios';
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
  //const [isCNPJ, setIsCNPJ] = useState(false);

  const loadEmpresa = useCallback(async () => {
    try {
      const { data } = await axios.get<Empresa>(`/api/Empresa/${empresaId}`);
      setValue('cnpj', data.cnpj);
      setValue('razaoSocial', data.razaoSocial);
      // Definir outros valores
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
      <div className="mb-4">
        <label className="block text-gray-700">CNPJ</label>
        <input {...register('cnpj', { required: true })} className="border rounded w-full py-2 px-3 mt-1" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Razão Social</label>
        <input {...register('razaoSocial', { required: true })} className="border rounded w-full py-2 px-3 mt-1" />
      </div>
      {/* Outros campos */}
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