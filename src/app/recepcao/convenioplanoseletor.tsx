import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Convenio } from '../../models/convenio';
import { Plano } from '../../models/plano';
import { SnackbarState } from '../../models/snackbarState';

interface ConvenioPlanoSelectorProps {
  onSave: (selectedData: { convenioId: number; planos: number[] }[]) => void;
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
    } catch (error) {
      console.error('Erro ao carregar convênios:', error);
      setSnackbar(new SnackbarState('Erro ao carregar convênios!', 'error', true));
    }
  }, [setSnackbar]);

  const loadPlanos = useCallback(async () => {
    try {
      const response = await axios.get('/api/Plano');
      setPlanos(response.data);
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
        
        const newSelectedConvenios: { [key: number]: boolean } = {};
        const newSelectedPlanos: { [key: number]: boolean } = {};

        selectedData.forEach((item: { convenioId: number; planos: number[] }) => {
          newSelectedConvenios[item.convenioId] = true;
          if (Array.isArray(item.planos) && item.planos.length > 0) {
            item.planos.forEach(planoId => {
              newSelectedPlanos[planoId] = true;
            });
          } else {
            console.warn(`Invalid or empty planos for convenioId: ${item.convenioId}`);
          }
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
    setSelectedConvenios(prev => ({ ...prev, [convenioId]: !prev[convenioId] }));
    
    // Selecionar/deselecionar todos os planos deste convênio
    const convenioPlanos = planos.filter(plano => plano.convenioId === convenioId);
    setSelectedPlanos(prev => {
      const newState = { ...prev };
      convenioPlanos.forEach(plano => {
        newState[plano.id!] = !selectedConvenios[convenioId];
      });
      return newState;
    });
  };

  const handlePlanoChange = (planoId: number) => {
    setSelectedPlanos(prev => ({ ...prev, [planoId]: !prev[planoId] }));
  };

  const handleSave = () => {
    const selectedData = convenios
      .filter(convenio => selectedConvenios[convenio.id!])
      .map(convenio => ({
        convenioId: convenio.id!,
        planos: planos
          .filter(plano => plano.convenioId === convenio.id && selectedPlanos[plano.id!])
          .map(plano => plano.id!)
      }));

    onSave(selectedData);
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
                    onChange={() => handlePlanoChange(plano.id!)}
                    className="mr-2"
                  />
                  <label htmlFor={`plano-${plano.id}`}>{plano.descricao}</label>
                </div>
              ))
            }
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