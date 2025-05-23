//src/app/recipienteAmostra/recipienteAmostraedit.tsx
"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { RecipienteAmostra } from '../../models/recipienteAmostra';
import { SnackbarState } from '@/models/snackbarState';

interface RecipienteAmostraEditFormProps {
  recipienteAmostra: RecipienteAmostra;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const RecipienteAmostraEditForm = ({ recipienteAmostra, onSave, onClose,setSnackbar  }: RecipienteAmostraEditFormProps) => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm<RecipienteAmostra>({
    defaultValues: recipienteAmostra,
  });

  const onSubmit = async (data: RecipienteAmostra) => {
    try {
        await axios.put(`/api/RecipienteAmostra/${recipienteAmostra.id}`, data);
        reset();
        onSave();
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao editar o registro!', 'error', true)); // Exibe erro via snackbar
      }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Amostra Recipiente</h2>
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
