"use client";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Cliente } from '../../models/cliente';
import { SnackbarState } from '@/models/snackbarState';

interface ClienteEditFormProps {
  cliente: Cliente;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const ClienteEditForm = ({ cliente, onSave, onClose, setSnackbar }: ClienteEditFormProps) => {
  const { register, handleSubmit, reset } = useForm<Cliente>({
    defaultValues: cliente,
  });

  const onSubmit = async (data: Cliente) => {
    try {
      await axios.put(`/api/Cliente/${cliente.id}`, data);
      reset();
      onSave();
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao editar o cliente!', 'error', true));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Cliente</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Nome</label>
        <input {...register('nome', { required: true })} className="border rounded w-full py-2 px-3 mt-1" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Email</label>
        <input {...register('email', { required: true })} className="border rounded w-full py-2 px-3 mt-1" />
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