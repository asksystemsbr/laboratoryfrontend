//src/app/exameApoio/exameApoiocreate.tsx
"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { ExameApoio } from '../../models/exameApoio';
import { Especialidade } from '../../models/especialidade';
import { Setor } from '../../models/setor';
import { SnackbarState } from '@/models/snackbarState';
import { useEffect, useState } from 'react';

interface ExameApoioCreateFormProps   {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const ExameApoioCreateForm   = ({ onSave, onClose,setSnackbar  }: ExameApoioCreateFormProps  ) => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm<ExameApoio>();
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadEspecialidades = async () => {
      try {
        const response = await axios.get('/api/Especialidade');
        setEspecialidades(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
      }
    };

    const loadSetores = async () => {
      try {
        const response = await axios.get('/api/Setor');
        setSetores(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar setores!', 'error', true));
      }
    };

    loadEspecialidades();
    loadSetores();
  }, [setSnackbar]);

  const onSubmit = async (data: ExameApoio) => {
    
   if (isSubmitting) return;
    try {
      setIsSubmitting(true); 
        await axios.post('/api/ExameApoio', data);
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
       <h2 className="text-xl font-bold mb-4">Novo Exame de Apoio</h2>
       <div className="mb-4">
        <label className="block text-gray-700">Código do Exame</label>
        <input
          {...register('codigoExame')}
          className="border rounded w-full py-2 px-3 mt-1"
          placeholder="Código opcional"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Nome do Exame</label>
        <input
          {...register('nomeExame', { required: 'O nome do exame é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.nomeExame && <p className="text-red-500 text-sm">{errors.nomeExame?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Apoio</label>
        <input
          {...register('apoio', { required: 'O apoio é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.apoio && <p className="text-red-500 text-sm">{errors.apoio?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Dias</label>
        <input
          type="number"
          {...register('dias', { required: 'O número de dias é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.dias && <p className="text-red-500 text-sm">{errors.dias?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Especialidade</label>
        <select
          {...register('especialidadeExameId', { required: 'A especialidade é obrigatória' })}
          className="border rounded w-full py-2 px-3 mt-1"
        >
          <option value="">Selecione uma especialidade</option>
          {especialidades.map((especialidade) => (
            <option key={especialidade.id} value={especialidade.id}>
              {especialidade.descricao}
            </option>
          ))}
        </select>
        {errors.especialidadeExameId && <p className="text-red-500 text-sm">{errors.especialidadeExameId?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Setor</label>
        <select
          {...register('setorExameId', { required: 'O setor é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        >
          <option value="">Selecione um setor</option>
          {setores.map((setor) => (
            <option key={setor.id} value={setor.id}>
              {setor.descricao}
            </option>
          ))}
        </select>
        {errors.setorExameId && <p className="text-red-500 text-sm">{errors.setorExameId?.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Valor Atual</label>
        <input
          type="number"
          step="0.01"
          {...register('valorAtual', { required: 'O valor atual é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.valorAtual && <p className="text-red-500 text-sm">{errors.valorAtual?.message}</p>}
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
