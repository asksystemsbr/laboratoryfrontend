//src/app/tabelaPreco/tablaPrecoedit.tsx
"use client";
import React,{ useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { TabelaPreco } from '../../models/tabelaPreco';
import { SnackbarState } from '@/models/snackbarState';
import TabelaPrecoItensComponent from '../tabelaPrecoItens/tabelaPrecoItenscreate'; // Importa o componente TabelaPrecoItensComponent

interface TabelaPrecoEditFormProps {
  tabelaPreco: TabelaPreco;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const TabelaPrecEditForm = ({ tabelaPreco, onSave, onClose,setSnackbar  }: TabelaPrecoEditFormProps) => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm<TabelaPreco>({
    defaultValues: tabelaPreco,
  });

  const [activeTab, setActiveTab] = useState<string>('info');

  const onSubmit = async (data: TabelaPreco) => {
    try {
        await axios.put(`/api/TabelaPreco/${tabelaPreco.id}`, data);
        reset();
        onSave();
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao editar o registro!', 'error', true)); // Exibe erro via snackbar
      }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      {/* Abas */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6"> {/* Ajusta a largura da modal */}
        <div className="mb-4">
          <button 
            onClick={() => setActiveTab('info')} 
            className={`py-2 px-4 ${activeTab === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Informações
          </button>
          <button 
            onClick={() => setActiveTab('tabelaPrecoItens')} 
            className={`py-2 px-4 ${activeTab === 'tabelaPrecoItens' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Exames da Tabela de Preço
          </button>
        </div>

        {/* Conteúdo da aba */}
        {activeTab === 'info' && (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4">
              <h2 className="text-xl font-bold mb-4">Editar Tabela de Preço</h2>
              <div className="mb-4">
                <label className="block text-gray-700">Descrição</label>
                <textarea
                  {...register('nome', { required: 'A descrição é obrigatória' })}
                  className="border rounded w-full py-2 px-3 mt-1"
                />
                {errors.nome && <p className="text-red-500 text-sm">{errors.nome?.message}</p>}
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
          </>
        )}

        {/* Aba de TabelaPrecoItens */}
        {activeTab === 'tabelaPrecoItens' && (
        <TabelaPrecoItensComponent tabelaPrecoId={tabelaPreco.id ?? 0} onClose={onClose} />
        )}
      </div>
    </div>
  );
};
