//src/app/materialApoio/materialApoiocreate.tsx
"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { MaterialApoio } from '../../models/materialApoio';
import { SnackbarState } from '@/models/snackbarState';

interface MaterialApoioCreateFormProps  {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const MaterialApoioCreateForm  = ({ onSave, onClose,setSnackbar  }: MaterialApoioCreateFormProps ) => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm<MaterialApoio>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: MaterialApoio) => {
    if (isSubmitting) return;
    try {
        setIsSubmitting(true); 
        await axios.post('/api/MaterialApoio', data);
        reset();
        onSave();
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao criar o registro!', 'error', true)); // Exibe erro via snackbar
      }
      finally {
        setIsSubmitting(false); 
      }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Novo Material de Apoio</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Código do Material</label>
        <input
          {...register('codigoMaterial')}
          className="border rounded w-full py-2 px-3 mt-1"
          placeholder="Código opcional"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Nome do Material</label>
        <input
          {...register('nomeMaterial', { required: 'O nome do material é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.nomeMaterial && <p className="text-red-500 text-sm">{errors.nomeMaterial?.message}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Descrição do Material</label>
        <input
          {...register('materialApoioDescricao', { required: 'A descrição do material é obrigatória' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.materialApoioDescricao && <p className="text-red-500 text-sm">{errors.materialApoioDescricao?.message}</p>}
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
