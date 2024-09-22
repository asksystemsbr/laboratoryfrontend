//src/app/laboratorioApoio/laboratorioApoiocreate.tsx
"use client";
import { useForm } from 'react-hook-form';
// import { useState, useEffect } from 'react';
import axios from 'axios';
import { LaboratorioApoio } from '../../models/laboratorioApoio';
// import { MaterialApoio } from '../../models/materialApoio'; // Model para MaterialApoio
// import { ExameApoio } from '../../models/exameApoio'; // Model para ExameApoio
import { SnackbarState } from '@/models/snackbarState';

interface LaboratorioApoioCreateFormProps   {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const LaboratorioApoioCreateForm   = ({ onSave, onClose,setSnackbar  }: LaboratorioApoioCreateFormProps  ) => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm<LaboratorioApoio>();

  // Listas dinâmicas para adicionar materiais e exames
  // const [materiais, setMateriais] = useState<MaterialApoio[]>([]);
  // const [exames, setExames] = useState<ExameApoio[]>([]);

  // Listas de opções para selects
  // const [availableMateriais, setAvailableMateriais] = useState<MaterialApoio[]>([]);
  // const [availableExames, setAvailableExames] = useState<ExameApoio[]>([]);

// Estados para controlar abas
  //const [activeTab, setActiveTab] = useState<'info' | 'materiais' | 'exames'>('info'); // Define abas

  // Efeito para carregar Materiais e Exames
  // useEffect(() => {
  //   const loadMateriais = async () => {
  //     try {
  //       const response = await axios.get('/api/MaterialApoio');
  //       setAvailableMateriais(response.data);
  //     } catch (error) {
  //       setSnackbar(new SnackbarState('Erro ao carregar materiais!', 'error', true));
  //     }
  //   };

  //   const loadExames = async () => {
  //     try {
  //       const response = await axios.get('/api/ExameApoio');
  //       setAvailableExames(response.data);
  //     } catch (error) {
  //       setSnackbar(new SnackbarState('Erro ao carregar exames!', 'error', true));
  //     }
  //   };

  //   if (activeTab === 'materiais') {
  //     loadMateriais();
  //   } else if (activeTab === 'exames') {
  //     loadExames();
  //   }
  // }, [activeTab, setSnackbar]);

  // Para adicionar MaterialApoio
  // const addMaterial = (materialId: number) => {
  //   const selectedMaterial = availableMateriais.find(m => m.id === materialId);
  //   if (selectedMaterial && !materiais.find(m => m.id === materialId)) {
  //     setMateriais([...materiais, selectedMaterial]);
  //   }
  // };

  // // Para adicionar ExameApoio
  // const addExame = (exameId: number) => {
  //   const selectedExame = availableExames.find(e => e.id === exameId);
  //   if (selectedExame && !exames.find(e => e.id === exameId)) {
  //     setExames([...exames, selectedExame]);
  //   }
  // };

  // Para remover Material da lista
  // const removeMaterial = (event: React.MouseEvent<HTMLButtonElement>, materialId: number) => {
  //   event.preventDefault(); // Evita que o botão dispare o submit do formulário
  //   setMateriais(materiais.filter(m => m.id !== materialId));
  // };

  // // Para remover Exame da lista
  // const removeExame = (event: React.MouseEvent<HTMLButtonElement>, exameId: number) => {
  //   event.preventDefault(); // Evita que o botão dispare o submit do formulário
  //   setExames(exames.filter(e => e.id !== exameId));
  // };

  const onSubmit = async (data: LaboratorioApoio) => {
    try {
        // Primeiro salva o LaboratorioApoio
        const response = await axios.post('/api/LaboratorioApoio', data);
        console.log(response);
        //const laboratorioId = response.data.id; // Assume que o backend retorna o ID

        // // Salvar LaboratorioApoioMateriais
        // for (const material of materiais) {
        //   await axios.post(`/api/LaboratorioApoioMateriais`, {
        //     laboratorioApoioId: laboratorioId,
        //     materialApoioId: material.id,
        //   });
        // }
  
        // // Salvar LaboratorioApoioExameApoio
        // for (const exame of exames) {
        //   await axios.post(`/api/LaboratorioApoioExameApoio`, {
        //     laboratorioApoioId: laboratorioId,
        //     exameApoioId: exame.id,
        //   });
        // }

        reset();
        onSave();
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao criar o registro!', 'error', true)); // Exibe erro via snackbar
      }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Novo Laboratório de Apoio</h2>

     
        <div className="mb-4">
          <label className="block text-gray-700">Nome do Laboratório</label>
          <input
            {...register('nomeLaboratorio', { required: 'O nome do laboratório é obrigatório' })}
            className="border rounded w-full py-2 px-3 mt-1"
          />
          {errors.nomeLaboratorio && <p className="text-red-500 text-sm">{errors.nomeLaboratorio?.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Logradouro</label>
          <input
            {...register('logradouro', { required: 'O logradouro é obrigatório' })}
            className="border rounded w-full py-2 px-3 mt-1"
          />
          {errors.logradouro && <p className="text-red-500 text-sm">{errors.logradouro?.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Número</label>
          <input
            {...register('numero', { required: 'O número é obrigatório' })}
            className="border rounded w-full py-2 px-3 mt-1"
          />
          {errors.numero && <p className="text-red-500 text-sm">{errors.numero?.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Complemento</label>
          <input
            {...register('complemento')}
            className="border rounded w-full py-2 px-3 mt-1"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Bairro</label>
          <input
            {...register('bairro', { required: 'O bairro é obrigatório' })}
            className="border rounded w-full py-2 px-3 mt-1"
          />
          {errors.bairro && <p className="text-red-500 text-sm">{errors.bairro?.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">CEP</label>
          <input
            {...register('cep', { required: 'O CEP é obrigatório' })}
            className="border rounded w-full py-2 px-3 mt-1"
          />
          {errors.cep && <p className="text-red-500 text-sm">{errors.cep?.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Cidade</label>
          <input
            {...register('cidade', { required: 'A cidade é obrigatória' })}
            className="border rounded w-full py-2 px-3 mt-1"
          />
          {errors.cidade && <p className="text-red-500 text-sm">{errors.cidade?.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">UF</label>
          <input
            {...register('uf', { required: 'A UF é obrigatória' })}
            className="border rounded w-full py-2 px-3 mt-1"
          />
          {errors.uf && <p className="text-red-500 text-sm">{errors.uf?.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">URL da API</label>
          <input
            {...register('urlApi')}
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
