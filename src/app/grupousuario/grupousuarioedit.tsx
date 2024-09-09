//src/app/grupousuario/grupousuarioedit.tsx
"use client";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { GrupoUsuario } from '../../models/grupoUsuario';
import { SnackbarState } from '@/models/snackbarState';

interface GrupoUsuarioEditFormProps {
  grupoUsuario: GrupoUsuario;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const GrupoUsuarioEditForm = ({ grupoUsuario, onSave, onClose,setSnackbar  }: GrupoUsuarioEditFormProps) => {
  const { register, handleSubmit, reset } = useForm<GrupoUsuario>({
    defaultValues: grupoUsuario,
  });

  const onSubmit = async (data: GrupoUsuario) => {
    try {
        await axios.put(`/api/GrupoUsuario/${grupoUsuario.id}`, data);
        reset();
        onSave();
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao editar o grupo!', 'error', true)); // Exibe erro via snackbar
      }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Grupo</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Descrição</label>
        <textarea
          {...register('descricao', { required: true })}
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
