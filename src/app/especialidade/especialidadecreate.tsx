//src/app/especialidade/especialidadecreate.tsx
"use client";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Especialidade } from '../../models/especialidade';
import { SnackbarState } from '@/models/snackbarState';

interface EspecialidadeCreateFormProps {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const EspecialidadeCreateForm = ({ onSave, onClose,setSnackbar  }: EspecialidadeCreateFormProps) => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm<Especialidade>();

  const onSubmit = async (data: Especialidade) => {
    try {
        await axios.post('/api/Especialidade', data);
        reset();
        onSave();
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao criar o registro!', 'error', true)); // Exibe erro via snackbar
      }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Nova Especialidade</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Descrição</label>
        <textarea
          {...register('descricao', { required: 'A descrição é obrigatória' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
         {errors.descricao && <p className="text-red-500 text-sm">{errors.descricao?.message}</p>}
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
