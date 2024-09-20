//src/app/modalidade/modalidadeedit.tsx
"use client";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Modalidade } from '../../models/modalidade';
import { SnackbarState } from '@/models/snackbarState';

interface ModalidadeEditFormProps {
  modalidade: Modalidade;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const ModalidadeEditForm = ({ modalidade, onSave, onClose,setSnackbar  }: ModalidadeEditFormProps) => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm<Modalidade>({
    defaultValues: modalidade,
  });

  const onSubmit = async (data: Modalidade) => {
    try {
        await axios.put(`/api/Modalidade/${modalidade.id}`, data);
        reset();
        onSave();
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao editar o registro!', 'error', true)); // Exibe erro via snackbar
      }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Setor</h2>
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
