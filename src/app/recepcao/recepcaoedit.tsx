//src/app/recepcao/recepcaoedit.tsx
"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Recepcao } from '../../models/recepcao';
import { SnackbarState } from '@/models/snackbarState';

interface RecepcaoEditFormProps {
  recepcao: Recepcao;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const RecepcaoEditForm = ({ recepcao, onSave, onClose,setSnackbar  }: RecepcaoEditFormProps) => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm<Recepcao>({
    defaultValues: recepcao,
  });

  const onSubmit = async (data: Recepcao) => {
    try {
        await axios.put(`/api/Recepcao/${recepcao.id}`, data);
        reset();
        onSave();
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao editar o registro!', 'error', true)); // Exibe erro via snackbar
      }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Recepção</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Descrição</label>
        <textarea
          {...register('nomeRecepcao', { required: 'A descrição é obrigatória' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.nomeRecepcao && <p className="text-red-500 text-sm">{errors.nomeRecepcao?.message}</p>}
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
