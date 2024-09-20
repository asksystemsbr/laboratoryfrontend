//src/app/exame/examecreate.tsx
"use client";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Exame } from '../../models/exame';
import { Especialidade } from '../../models/especialidade';
import { Setor } from '../../models/setor';
import { MaterialApoio } from '../../models/materialApoio';
import { SnackbarState } from '@/models/snackbarState';
import { useEffect, useState } from 'react';

interface ExameCreateFormProps {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const ExameCreateForm = ({ onSave, onClose, setSnackbar }: ExameCreateFormProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Exame>();
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [materialApoio, setMaterialApoio] = useState<MaterialApoio[]>([]);  // Estado para material de apoio

  useEffect(() => {
    const loadEspecialidades = async () => {
      try {
        const response = await axios.get('/api/Especialidade');
        setEspecialidades(response.data);
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
      }
    };

    const loadSetores = async () => {
      try {
        const response = await axios.get('/api/Setor');
        setSetores(response.data);
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao carregar setores!', 'error', true));
      }
    };

    const loadMaterialApoio = async () => {
      try {
        const response = await axios.get('/api/MaterialApoio');  // Chamada API para Material de Apoio
        setMaterialApoio(response.data);
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao carregar material de apoio!', 'error', true));
      }
    };

    loadEspecialidades();
    loadSetores();
    loadMaterialApoio();
  }, [setSnackbar]);

  const onSubmit = async (data: Exame) => {
    try {
      await axios.post('/api/Exame', data);
      reset();
      onSave();
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao criar o registro!', 'error', true));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Novo Exame</h2>

      {/* Código do Exame */}
      <div className="mb-4">
        <label className="block text-gray-700">Código do Exame</label>
        <input
          {...register('codigo_exame', { required: 'O código do exame é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
          placeholder="Código opcional"
        />
        {errors.codigo_exame && <p className="text-red-500 text-sm">{errors.codigo_exame?.message}</p>}
      </div>

      {/* Nome do Exame */}
      <div className="mb-4">
        <label className="block text-gray-700">Nome do Exame</label>
        <input
          {...register('exame', { required: 'O nome do exame é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.exame && <p className="text-red-500 text-sm">{errors.exame?.message}</p>}
      </div>

      {/* Prazo */}
      <div className="mb-4">
        <label className="block text-gray-700">Prazo</label>
        <input
          type="number"
          {...register('prazo', { required: 'O prazo é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.prazo && <p className="text-red-500 text-sm">{errors.prazo?.message}</p>}
      </div>

      {/* Método */}
      <div className="mb-4">
        <label className="block text-gray-700">Método</label>
        <input
          {...register('metodo')}
          className="border rounded w-full py-2 px-3 mt-1"
          placeholder="Método do exame"
        />
      </div>

      {/* Preparo */}
      <div className="mb-4">
        <label className="block text-gray-700">Preparo</label>
        <input
          {...register('preparo')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      {/* PreparoF */}
      <div className="mb-4">
        <label className="block text-gray-700">Preparo Feminino</label>
        <input
          {...register('preparof')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      {/* PreparoC */}
      <div className="mb-4">
        <label className="block text-gray-700">Preparo Crianças</label>
        <input
          {...register('preparoc')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      {/* Destino */}
      <div className="mb-4">
        <label className="block text-gray-700">Destino</label>
        <input
          {...register('destino')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      {/* Instruções de Preparo */}
      <div className="mb-4">
        <label className="block text-gray-700">Instruções de Preparo</label>
        <input
          {...register('instrucoesdepreparo')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      {/* Coleta */}
      <div className="mb-4">
        <label className="block text-gray-700">Coleta</label>
        <input
          {...register('coleta')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      {/* Lembretes */}
      <div className="mb-4">
        <label className="block text-gray-700">Lembretes</label>
        <input
          {...register('lembretes')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      {/* Técnica de Coleta */}
      <div className="mb-4">
        <label className="block text-gray-700">Técnica de Coleta</label>
        <input
          {...register('tecnicadecoleta')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      {/* Alertas Recepção */}
      <div className="mb-4">
        <label className="block text-gray-700">Alertas Recepção</label>
        <input
          {...register('alertasrecep')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      {/* TUSS */}
      <div className="mb-4">
        <label className="block text-gray-700">TUSS</label>
        <input
          {...register('TUSS')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      {/* Meios de Coleta */}
      <div className="mb-4">
        <label className="block text-gray-700">Meios de Coleta</label>
        <input
          {...register('MEIOS_DE_COLETA')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      {/* Coleta Paciente */}
      <div className="mb-4">
        <label className="block text-gray-700">Coleta Paciente</label>
        <input
          {...register('COLETAPAC')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      {/* Coleta Paciente F */}
      <div className="mb-4">
        <label className="block text-gray-700">Coleta Paciente Feminino</label>
        <input
          {...register('COLETAPACF')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      {/* Coleta Paciente C */}
      <div className="mb-4">
        <label className="block text-gray-700">Coleta Paciente Criança</label>
        <input
          {...register('COLETAPACC')}
          className="border rounded w-full py-2 px-3 mt-1"
        />
      </div>

      {/* Especialidade */}
      <div className="mb-4">
        <label className="block text-gray-700">Especialidade</label>
        <select
          {...register('estabilidade', { required: 'A especialidade é obrigatória' })}
          className="border rounded w-full py-2 px-3 mt-1"
        >
          <option value="">Selecione uma especialidade</option>
          {especialidades.map((especialidade) => (
            <option key={especialidade.id} value={especialidade.id}>
              {especialidade.descricao}
            </option>
          ))}
        </select>
        {errors.estabilidade && <p className="text-red-500 text-sm">{errors.estabilidade?.message}</p>}
      </div>

      {/* Setor */}
      <div className="mb-4">
        <label className="block text-gray-700">Setor</label>
        <select
          {...register('setor_id', { required: 'O setor é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        >
          <option value="">Selecione um setor</option>
          {setores.map((setor) => (
            <option key={setor.id} value={setor.id}>
              {setor.descricao}
            </option>
          ))}
        </select>
        {errors.setor_id && <p className="text-red-500 text-sm">{errors.setor_id?.message}</p>}
      </div>

      {/* Material de Apoio */}
      <div className="mb-4">
        <label className="block text-gray-700">Material de Apoio</label>
        <select
          {...register('material_apoio_id', { required: 'O material de apoio é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        >
          <option value="">Selecione um material de apoio</option>
          {materialApoio.map((material) => (
            <option key={material.id} value={material.id}>
              {material.nomeMaterial}
            </option>
          ))}
        </select>
        {errors.material_apoio_id && <p className="text-red-500 text-sm">{errors.material_apoio_id?.message}</p>}
      </div>

      {/* Valor Atual */}
      <div className="mb-4">
        <label className="block text-gray-700">Valor Atual</label>
        <input
          type="number"
          step="0.01"
          {...register('slexamesref_tabela_valor', { required: 'O valor atual é obrigatório' })}
          className="border rounded w-full py-2 px-3 mt-1"
        />
        {errors.slexamesref_tabela_valor && <p className="text-red-500 text-sm">{errors.slexamesref_tabela_valor?.message}</p>}
      </div>

      {/* Botões de Ação */}
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

