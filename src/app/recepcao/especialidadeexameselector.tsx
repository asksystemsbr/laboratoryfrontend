import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { SnackbarState } from '../../models/snackbarState';

interface Especialidade {
  id: number;
  descricao: string;
}

interface Exame {
  id: number;
  especialidadeId: number;
  nomeExame: string;
}

interface EspecialidadeExameSelectorProps {
  onSave: (selectedData: { especialidadeId: number; examesId: number[] }[]) => void;
  recepcaoId?: number;
  setSnackbar: (snackbar: SnackbarState) => void;
}

interface SelectedDataResponse {
  especialidadeId: number;
  exames: number[];
}

const EspecialidadeExameSelector: React.FC<EspecialidadeExameSelectorProps> = ({ onSave, recepcaoId, setSnackbar }) => {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [exames, setExames] = useState<Exame[]>([]);
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<{ [key: number]: boolean }>({});
  const [selectedExames, setSelectedExames] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar seleção de especialidades e exames com base nos dados carregados
  const initializeSelection = useCallback((especialidadesData: Especialidade[], examesData: Exame[], selectedData: SelectedDataResponse[]) => {
    const newSelectedEspecialidades: { [key: number]: boolean } = {};
    const newSelectedExames: { [key: number]: boolean } = {};

    selectedData.forEach(item => {
      item.exames.forEach(exameId => {
        newSelectedExames[exameId] = true;
      });
      const examesDaEspecialidade = examesData.filter(exame => exame.especialidadeId === item.especialidadeId);
      const allExamesSelected = examesDaEspecialidade.every(exame => newSelectedExames[exame.id]);
      newSelectedEspecialidades[item.especialidadeId] = allExamesSelected;
    });

    setSelectedEspecialidades(newSelectedEspecialidades);
    setSelectedExames(newSelectedExames);
    setIsLoading(false);
  }, []);

  // Carregar dados das especialidades, exames e seleção inicial da recepção
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [especialidadesResponse, examesResponse, selectedDataResponse] = await Promise.all([
          axios.get<Especialidade[]>('/api/Especialidade'),
          axios.get<Exame[]>('/api/Exame'),
          recepcaoId ? axios.get<SelectedDataResponse[]>(`/api/RecepcaoEspecialidadeExame/byRecepcao/${recepcaoId}`) : Promise.resolve({ data: [] as SelectedDataResponse[] })
        ]);

        setEspecialidades(especialidadesResponse.data);
        setExames(examesResponse.data);
        initializeSelection(especialidadesResponse.data, examesResponse.data, selectedDataResponse.data);
      } catch (error) {
        console.error('Erro ao carregar especialidades e exames:', error);
        setSnackbar(new SnackbarState('Erro ao carregar especialidades e exames!', 'error', true));
      }
    };

    fetchData();
  }, [recepcaoId, setSnackbar, initializeSelection]);

  // Manipulação de seleção de especialidade
  const handleEspecialidadeChange = (especialidadeId: number) => {
    const isEspecialidadeSelected = !selectedEspecialidades[especialidadeId];
    setSelectedEspecialidades(prev => ({ ...prev, [especialidadeId]: isEspecialidadeSelected }));

    const examesDaEspecialidade = exames.filter(exame => exame.especialidadeId === especialidadeId);
    setSelectedExames(prev => {
      const newState = { ...prev };
      examesDaEspecialidade.forEach(exame => {
        newState[exame.id] = isEspecialidadeSelected;
      });
      return newState;
    });
  };

  // Manipulação de seleção de exame individual
  const handleExameChange = (exameId: number, especialidadeId: number) => {
    setSelectedExames(prev => ({ ...prev, [exameId]: !prev[exameId] }));

    const examesDaEspecialidade = exames.filter(exame => exame.especialidadeId === especialidadeId);
    const allExamesSelected = examesDaEspecialidade.every(exame => selectedExames[exame.id] || exame.id === exameId);

    setSelectedEspecialidades(prev => ({ ...prev, [especialidadeId]: allExamesSelected }));
  };

  // Função para salvar as seleções
  const handleSave = () => {
    const selectedData = especialidades.map(especialidade => {
      const examesDaEspecialidade = exames.filter(exame => exame.especialidadeId === especialidade.id);
      const examesSelecionados = examesDaEspecialidade
        .filter(exame => selectedExames[exame.id])
        .map(exame => exame.id);

      if (selectedEspecialidades[especialidade.id] && examesSelecionados.length === examesDaEspecialidade.length) {
        return { especialidadeId: especialidade.id, examesId: [] };
      } else if (examesSelecionados.length > 0) {
        return { especialidadeId: especialidade.id, examesId: examesSelecionados };
      }
      return null;
    }).filter(item => item !== null);

    onSave(selectedData as { especialidadeId: number; examesId: number[] }[]);
  };

  if (isLoading) {
    return <div>Carregando especialidades e exames...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Especialidades e Exames</h2>
      {especialidades.map(especialidade => (
        <div key={especialidade.id} className="mb-4 border-b pb-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`especialidade-${especialidade.id}`}
              checked={selectedEspecialidades[especialidade.id] || false}
              onChange={() => handleEspecialidadeChange(especialidade.id)}
              className="mr-2"
            />
            <label htmlFor={`especialidade-${especialidade.id}`} className="font-semibold">{especialidade.descricao}</label>
          </div>
          <div className="ml-6">
            {exames
              .filter(exame => exame.especialidadeId === especialidade.id)
              .map(exame => (
                <div key={exame.id} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    id={`exame-${exame.id}`}
                    checked={selectedExames[exame.id] || false}
                    onChange={() => handleExameChange(exame.id, especialidade.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`exame-${exame.id}`}>{exame.nomeExame}</label>
                </div>
              ))}
          </div>
        </div>
      ))}
      <button
        onClick={handleSave}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Salvar Especialidades e Exames
      </button>
    </div>
  );
};

export default EspecialidadeExameSelector;
