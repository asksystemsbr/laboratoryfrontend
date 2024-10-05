//src/app/tabelaPrecoItens/tabelaPrecoItenscreate.tsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { TabelaPrecoItens } from '../../models/tabelaPrecoItens'; // Interface fornecida
import { Exame } from '../../models/exame';
import { formatDecimal } from '@/utils/numbers';
import { SnackbarState } from '@/models/snackbarState';
import  {Snackbar}  from '../snackbar';


interface TabelaPrecoItensComponentProps {
  tabelaPrecoId: number;
  //onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const TabelaPrecoItensComponent = ({ tabelaPrecoId,onClose }: TabelaPrecoItensComponentProps) => {
  const [items, setItems] = useState<TabelaPrecoItens[]>([]);
  const [filtered, setFiltered] = useState<TabelaPrecoItens[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItems, setEditingItems] = useState<TabelaPrecoItens[]>([]);
  const [exames, setExames] = useState<Exame[]>([]);
  const [snackbar, setSnackbar] = useState(new SnackbarState());
  const [progress, setProgress] = useState(100); // Para a barra de progresso


  // Mostrar o Snackbar
  // const showSnackbar = (message: string, type: 'success' | 'error') => {
  //   snackbar.showSnackbar(message, type);
  //   setSnackbarState(new SnackbarState(message, type, true)); // Atualiza o estado
  // };

  // Função para esconder o Snackbar
  // const hideSnackbar = () => {
  //   setSnackbarState(new SnackbarState()); // Esconde o Snackbar
  // };

      // Função para fechar o Snackbar
      const hideSnackbar = () => {
        setSnackbar((prev) => {
          const newSnackbarState = new SnackbarState(prev.message, prev.type, false); // Cria uma nova instância de SnackbarState
          return newSnackbarState;
        });
      };
    // Função para carregar a lista de exames do backend
    const loadExames = useCallback(async () => {
      try {
        const response = await axios.get('/api/Exame'); // Endpoint para obter os exames
        setExames(response.data);
      } catch (error) {
        console.error('Erro ao carregar lista de exames:', error);
        setSnackbar(new SnackbarState('Erro ao carregar dados!', 'error', true));
      }
    }, []); // Sem dependências, essa função é estável

 // Função para carregar os dados do backend
 const loadItems = useCallback(async () => {
  try {
    const response = await axios.get(`/api/TabelaPrecoItens/getByPriceTable/${tabelaPrecoId}`);
    const itemsData  = response.data || [];

    // Nova lista para armazenar os itens com exame
    const itemsWithExames: TabelaPrecoItens[] = [];

    // Percorre todos os exames
    exames.forEach((exame) => {
      // Verifica se já existe um item na tabela de preço para este exame
      const itemExistente = itemsData.find((item: TabelaPrecoItens) => item.exameId === exame.id);

      if (itemExistente) {
        // Se o item já existe, atualizamos o nome do exame
        itemsWithExames.push({
          ...itemExistente,
          tabelaPrecoId: tabelaPrecoId, // Atribui o tabelaPrecoId vindo da prop
          nomeExame: exame.nomeExame, // Adiciona o nome do exame ao item existente
        });
      } else {
        // Se o item não existe, criamos um novo com valores padrão
        itemsWithExames.push({
          tabelaPrecoId: tabelaPrecoId, // ou qualquer ID padrão
          exameId: exame.id ?? 0, // Associar o exameId ao novo item
          valor: 0,
          custoOperacional: 0,
          custoHorario: 0,
          filme: 0,
          codigoArnb: "N/A",
          nomeExame: exame.nomeExame, // Adiciona o nome do exame
        });
      }
    });

    setItems(itemsWithExames);
    setFiltered(itemsWithExames); // Inicia com todos os itens
    setEditingItems(itemsWithExames); // Cria uma cópia editável dos itens
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    setSnackbar(new SnackbarState('Erro ao carregar dados!', 'error', true));
  }
}, [exames, tabelaPrecoId]); // Recarregar os itens quando exames ou tabelaPrecoId mudar;


  // Carrega os exames assim que o componente é montado
  useEffect(() => {
    loadExames(); // Garante que exames são carregados primeiro
  }, [loadExames]);

  // Carregar itens da tabela de preço somente quando os exames estiverem carregados
  useEffect(() => {
    if (exames.length > 0) {
      loadItems();
    }
  }, [exames, loadItems]); // Quando `exames` ou `loadItems` mudar, recarregar os itens


  // Filtrar a listagem conforme o termo de busca
  useEffect(() => {
    if (items.length > 0 && exames.length > 0) {
      const filteredItems = items.filter((item) => {
        const exame = exames.find((ex) => ex.id === item.exameId);
        return (
          exame?.nomeExame.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.codigoArnb.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFiltered(filteredItems);
    }
  }, [searchTerm, items, exames]);

  useEffect(() => {
    if (snackbar.show) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev > 0 ? prev - 1 : 0)); // Reduz progressivamente
      }, 50);

      const timer = setTimeout(() => {
        snackbar.hideSnackbar(); // Esconde o Snackbar
        setSnackbar(new SnackbarState()); // Atualiza para uma nova instância
        setProgress(100); // Reset progress
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [snackbar]);

  // Atualiza os campos editados
  const handleInputChange = (id: number, field: keyof TabelaPrecoItens, value: string | number) => {
    const updatedItems = editingItems.map((item) =>
      item.exameId === id ? { ...item, [field]: value } : item
    );
    setEditingItems(updatedItems);
  };

  // Função para salvar as alterações
  const handleSave = async () => {
    try {
      await axios.post('/api/TabelaPrecoItens', editingItems);
      setSnackbar(new SnackbarState('Registro salvo com sucesso!', 'success', true));
      loadItems(); // Recarrega os dados após salvar
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      setSnackbar(new SnackbarState('Erro ao carregar dados!', 'error', true));
    }
  };

  // Função para cancelar as alterações
  // const handleCancel = () => {
  //   setEditingItems(items); // Reseta as alterações para o estado inicial
  // };

  // Obter o nome do exame com base no exameId
  const getExameNome = (exameId: number): string => {
    const exame = exames.find((ex) => ex.id === exameId);
    return exame ? exame.nomeExame : 'Exame não encontrado';
  };

  return (
    <div className="container mx-auto p-8">
      {/* Campo de busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar Exame"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg py-2 px-4 w-full"
        />
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-between mb-4">
        <button
          onClick={handleSave}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Salvar
        </button>
        <button type="button" onClick={onClose} className="mr-2 py-2 px-4 rounded bg-gray-500 text-white">
          Fechar
        </button>
      </div>

        {/* Snackbar de feedback */}
        {snackbar.show && (
          <Snackbar message={snackbar.message} type={snackbar.type} progress={progress} onClose={hideSnackbar} />
        )}

      {/* Listagem de exames */}
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 text-left">Exame</th>
            <th className="py-2 px-4 text-left">Valor</th>
            <th className="py-2 px-4 text-left">Custo Operacional</th>
            <th className="py-2 px-4 text-left">Custo Horário</th>
            <th className="py-2 px-4 text-left">Filme</th>
            <th className="py-2 px-4 text-left">Código ARNB</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(filtered) && filtered.length > 0 ? (
            filtered.map((item) => (
              <tr key={item.exameId} className="border-t border-gray-200">
                <td className="py-2 px-4 w-40">{getExameNome(item.exameId)}</td> {/* Nome do Exame */}
                <td className="py-2 px-4 text-sm">
                  <input
                    type="number"
                    step="0.01" // Permite 2 casas decimais
                    min="0.01" // Valor mínimo
                    value={formatDecimal(editingItems.find((i) => i.exameId === item.exameId)?.valor || 0, 2)}
                    onChange={(e) => handleInputChange(item.exameId, 'valor', formatDecimal(parseFloat(e.target.value), 2))}
                    className="border border-gray-300 rounded py-1 px-2 text-sm w-20"
                  />
                </td>
                <td className="py-2 px-4 text-sm">
                  <input
                    type="number"
                    step="0.0001" // Permite 4 casas decimais
                    min="0.0001" // Valor mínimo
                    value={formatDecimal(editingItems.find((i) => i.exameId === item.exameId)?.custoOperacional || 0, 4)}
                    onChange={(e) => handleInputChange(item.exameId, 'custoOperacional', formatDecimal(parseFloat(e.target.value), 4))}
                    className="border border-gray-300 rounded py-1 px-2 text-sm w-20"
                  />
                </td>
                <td className="py-2 px-4 text-sm">
                  <input
                    type="number"
                    step="0.0001" // Permite 4 casas decimais
                    min="0.0001" // Valor mínimo
                    value={formatDecimal(editingItems.find((i) => i.exameId === item.exameId)?.custoHorario || 0, 4)}
                    onChange={(e) => handleInputChange(item.exameId, 'custoHorario', formatDecimal(parseFloat(e.target.value), 4))}
                    className="border border-gray-300 rounded py-1 px-2 text-sm w-20"
                  />
                </td>
                <td className="py-2 px-4 text-sm">
                  <input
                    type="number"
                    step="0.0001" // Permite 4 casas decimais
                    min="0.0001" // Valor mínimo
                    value={formatDecimal(editingItems.find((i) => i.exameId === item.exameId)?.filme || 0, 4)}
                    onChange={(e) => handleInputChange(item.exameId, 'filme', formatDecimal(parseFloat(e.target.value), 4))}
                    className="border border-gray-300 rounded py-1 px-2 text-sm w-20"
                  />
                </td>
                <td className="py-2 px-4 text-sm">
                  <input
                    type="text"
                    value={editingItems.find((i) => i.exameId === item.exameId)?.codigoArnb || ''}
                    onChange={(e) => handleInputChange(item.exameId, 'codigoArnb', e.target.value)}
                    className="border border-gray-300 rounded py-1 px-2 text-sm w-20"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-2">Nenhum item encontrado</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaPrecoItensComponent;
