import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Convenio } from '../../models/convenio';
import { Plano } from '../../models/plano';
import { SnackbarState } from '../../models/snackbarState';

interface ConvenioPlanoSelectorProps {
  onSave: (selectedData: { convenioId: number; planosId: number[] }[]) => void;
  recepcaoId?: number;
  setSnackbar: (snackbar: SnackbarState) => void;
}

const ConvenioPlanoSelector: React.FC<ConvenioPlanoSelectorProps> = ({ onSave, recepcaoId, setSnackbar }) => {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [selectedConvenios, setSelectedConvenios] = useState<{ [key: number]: boolean }>({});
  const [selectedPlanos, setSelectedPlanos] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadConvenios = useCallback(async () => {
    try {
      const response = await axios.get('/api/Convenio');
      setConvenios(response.data);
      console.log("Convenios carregados:", response.data); // Log convenios carregados
    } catch (error) {
      console.error('Erro ao carregar convênios:', error);
      setSnackbar(new SnackbarState('Erro ao carregar convênios!', 'error', true));
    }
  }, [setSnackbar]);

  const loadPlanos = useCallback(async () => {
    try {
      const response = await axios.get('/api/Plano');
      setPlanos(response.data);
      console.log("Planos carregados:", response.data); // Log planos carregados
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      setSnackbar(new SnackbarState('Erro ao carregar planos!', 'error', true));
    }
  }, [setSnackbar]);

  const loadSelectedData = useCallback(async () => {
    if (recepcaoId) {
      try {
        const response = await axios.get(`/api/RecepcaoConvenioPlano/byRecepcao/${recepcaoId}`);
        const selectedData = response.data;
        console.log("Dados selecionados carregados:", selectedData); // Log dados selecionados

        const newSelectedConvenios: { [key: number]: boolean } = {};
        const newSelectedPlanos: { [key: number]: boolean } = {};

        selectedData.forEach((item: { convenioId: number; planos: number[] }) => {
          newSelectedConvenios[item.convenioId] = true;
          item.planos.forEach(planoId => {
            newSelectedPlanos[planoId] = true;
          });
        });

        setSelectedConvenios(newSelectedConvenios);
        setSelectedPlanos(newSelectedPlanos);
      } catch (error) {
        console.error('Erro ao carregar dados selecionados:', error);
        setSnackbar(new SnackbarState('Erro ao carregar dados selecionados!', 'error', true));
      }
    }
  }, [recepcaoId, setSnackbar]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([loadConvenios(), loadPlanos(), loadSelectedData()]);
      setIsLoading(false);
    };

    fetchData();
  }, [loadConvenios, loadPlanos, loadSelectedData]);

  const handleConvenioChange = (convenioId: number) => {
    const isConvenioSelected = !selectedConvenios[convenioId];
    console.log(`Convenio ${convenioId} selecionado:`, isConvenioSelected); // Log mudança de seleção de convênio

    setSelectedConvenios(prev => ({ ...prev, [convenioId]: isConvenioSelected }));

    const convenioPlanos = planos.filter(plano => plano.convenioId === convenioId);
    setSelectedPlanos(prev => {
      const newState = { ...prev };
      convenioPlanos.forEach(plano => {
        newState[plano.id!] = isConvenioSelected;
        console.log(`Plano ${plano.id} de Convenio ${convenioId} definido para:`, isConvenioSelected); // Log mudança de seleção de planos
      });
      return newState;
    });
  };

  const handlePlanoChange = (planoId: number, convenioId: number) => {
    setSelectedPlanos(prev => ({ ...prev, [planoId]: !prev[planoId] }));
    console.log(`Plano ${planoId} do Convenio ${convenioId} selecionado:`, !selectedPlanos[planoId]); // Log mudança de seleção de plano individual

    const convenioPlanos = planos.filter(plano => plano.convenioId === convenioId);
    const allPlanosSelected = convenioPlanos.every(plano => selectedPlanos[plano.id!] || plano.id === planoId);

    setSelectedConvenios(prev => ({ ...prev, [convenioId]: allPlanosSelected }));
    console.log(`Convenio ${convenioId} selecionado automaticamente:`, allPlanosSelected); // Log atualização automática do convênio
  };
  
  const handleSave = () => {
    const selectedData = convenios.map(convenio => {
      // Obtém todos os planos do convênio atual
      const convenioPlanos = planos.filter(plano => plano.convenioId === convenio.id);
      // Filtra apenas os planos selecionados para o convênio atual
      const planosSelecionados = convenioPlanos
        .filter(plano => selectedPlanos[plano.id!])
        .map(plano => plano.id!);
  
      console.log(`Convênio ${convenio.id}:`, {
        convenioSelecionado: selectedConvenios[convenio.id!],
        totalPlanos: convenioPlanos.length,
        planosSelecionados: planosSelecionados.length,
        planosSelecionadosIds: planosSelecionados
      });
  
      // Condição 1: Todos os planos do convênio estão selecionados
      if (selectedConvenios[convenio.id!] && planosSelecionados.length === convenioPlanos.length) {
        console.log(`Todos os planos do Convênio ${convenio.id} selecionados.`);
        return { convenioId: convenio.id!, planosId: [] }; // Envia lista vazia para indicar todos os planos
      }
  
      // Condição 2: Apenas alguns planos do convênio estão selecionados
      else if (planosSelecionados.length > 0) {
        console.log(`Alguns planos do Convênio ${convenio.id} selecionados:`, planosSelecionados);
        return { convenioId: convenio.id!, planosId: planosSelecionados }; // Envia apenas os IDs selecionados
      }
  
      // Caso contrário, retorna null para convênios não selecionados
      return null;
    }).filter(item => item !== null); // Remove itens null
  
    console.log("Dados formatados para enviar à API:", selectedData); // Log dos dados finais antes do envio
    onSave(selectedData as { convenioId: number; planosId: number[] }[]);
  };
  

  if (isLoading) {
    return <div>Carregando convênios e planos...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Convênios e Planos</h2>
      {convenios.map(convenio => (
        <div key={convenio.id} className="mb-4 border-b pb-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id={`convenio-${convenio.id}`}
              checked={selectedConvenios[convenio.id!] || false}
              onChange={() => handleConvenioChange(convenio.id!)}
              className="mr-2"
            />
            <label htmlFor={`convenio-${convenio.id}`} className="font-semibold">{convenio.descricao}</label>
          </div>
          <div className="ml-6">
            {planos
              .filter(plano => plano.convenioId === convenio.id)
              .map(plano => (
                <div key={plano.id} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    id={`plano-${plano.id}`}
                    checked={selectedPlanos[plano.id!] || false}
                    onChange={() => handlePlanoChange(plano.id!, convenio.id!)}
                    className="mr-2"
                  />
                  <label htmlFor={`plano-${plano.id}`}>{plano.descricao}</label>
                </div>
              ))}
          </div>
        </div>
      ))}
      <button
        onClick={handleSave}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Salvar Convênios e Planos
      </button>
    </div>
  );
};

export default ConvenioPlanoSelector;
