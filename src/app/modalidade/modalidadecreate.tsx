//src/app/modalidade/modalidadecreate.tsx
"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Modalidade } from '../../models/modalidade';
import { SnackbarState } from '@/models/snackbarState';

interface ModalidadeCreateFormProps {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const ModalidadeCreateForm = ({ onSave, onClose,setSnackbar  }: ModalidadeCreateFormProps) => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm<Modalidade>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: Modalidade) => {
    if (isSubmitting) return;
    try {
        setIsSubmitting(true); 
        await axios.post('/api/Modalidade', data);
        reset();
        onSave();
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao criar o registro!', 'error', true)); // Exibe erro via snackbar
      }finally {
        setIsSubmitting(false); 
      }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Nova Modalidade</h2>
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
