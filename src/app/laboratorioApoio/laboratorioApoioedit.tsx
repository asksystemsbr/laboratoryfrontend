//src/app/laboratorioApoio/laboratorioApoioedit.tsx
"use client";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { LaboratorioApoio } from '../../models/laboratorioApoio'
import { SnackbarState } from '@/models/snackbarState';

interface LaboratorioApoioEditFormProps   {
  laboratorioApoio: LaboratorioApoio;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const LaboratorioApoioEditForm   = ({ laboratorioApoio, onSave, onClose,setSnackbar  }: LaboratorioApoioEditFormProps  ) => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm<LaboratorioApoio>({
    defaultValues: laboratorioApoio,
  });

  const onSubmit = async (data: LaboratorioApoio) => {
    try {
        await axios.put(`/api/LaboratorioApoio/${laboratorioApoio.id}`, data);
        reset();
        onSave();
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao editar o registro!', 'error', true)); // Exibe erro via snackbar
      }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Laboratório de Apoio</h2>

      <div className="mb-4">
        <label className="block text-gray-700">Nome do Laboratório</label>
        <input
          {...register('nomeLaboratorio', { required: 'O nome do laboratório é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.nomeLaboratorio && <p className="text-red-500 text-sm">{errors.nomeLaboratorio?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Logradouro</label>
        <input
          {...register('logradouro', { required: 'O logradouro é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.logradouro && <p className="text-red-500 text-sm">{errors.logradouro?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Número</label>
        <input
          {...register('numero', { required: 'O número é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.numero && <p className="text-red-500 text-sm">{errors.numero?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Complemento</label>
        <input
          {...register('complemento')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Bairro</label>
        <input
          {...register('bairro', { required: 'O bairro é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.bairro && <p className="text-red-500 text-sm">{errors.bairro?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">CEP</label>
        <input
          {...register('cep', { required: 'O CEP é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.cep && <p className="text-red-500 text-sm">{errors.cep?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Cidade</label>
        <input
          {...register('cidade', { required: 'A cidade é obrigatória' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.cidade && <p className="text-red-500 text-sm">{errors.cidade?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">UF</label>
        <input
          {...register('uf', { required: 'A UF é obrigatória' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.uf && <p className="text-red-500 text-sm">{errors.uf?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">URL da API</label>
        <input
          {...register('urlApi')}
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
