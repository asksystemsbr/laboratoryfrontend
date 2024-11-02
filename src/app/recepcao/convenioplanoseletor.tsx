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

interface SelectedDataResponse {
  convenioId: number;
  planos: number[];
}

const ConvenioPlanoSelector: React.FC<ConvenioPlanoSelectorProps> = ({ onSave, recepcaoId, setSnackbar }) => {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [selectedConvenios, setSelectedConvenios] = useState<{ [key: number]: boolean }>({});
  const [selectedPlanos, setSelectedPlanos] = useState<{ [key: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);

  const initializeSelection = useCallback((conveniosData: Convenio[], planosData: Plano[], selectedData: SelectedDataResponse[]) => {
    const newSelectedConvenios: { [key: number]: boolean } = {};
    const newSelectedPlanos: { [key: number]: boolean } = {};

    selectedData.forEach((item) => {
      item.planos.forEach(planoId => {
        newSelectedPlanos[planoId] = true;
      });
      const convenioPlanos = planosData.filter(plano => plano.convenioId === item.convenioId);
      const allPlanosSelected = convenioPlanos.every(plano => newSelectedPlanos[plano.id!]);
      newSelectedConvenios[item.convenioId] = allPlanosSelected;
    });

    setSelectedConvenios(newSelectedConvenios);
    setSelectedPlanos(newSelectedPlanos);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [conveniosResponse, planosResponse, selectedDataResponse] = await Promise.all([
          axios.get<Convenio[]>('/api/Convenio'),
          axios.get<Plano[]>('/api/Plano'),
          recepcaoId ? axios.get<SelectedDataResponse[]>(`/api/RecepcaoConvenioPlano/byRecepcao/${recepcaoId}`) : Promise.resolve({ data: [] as SelectedDataResponse[] })
        ]);

        setConvenios(conveniosResponse.data);
        setPlanos(planosResponse.data);
        initializeSelection(conveniosResponse.data, planosResponse.data, selectedDataResponse.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setSnackbar(new SnackbarState('Erro ao carregar dados!', 'error', true));
      }
    };

    fetchData();
  }, [recepcaoId, setSnackbar, initializeSelection]);

  const handleConvenioChange = (convenioId: number) => {
    const isConvenioSelected = !selectedConvenios[convenioId];

    setSelectedConvenios(prev => ({ ...prev, [convenioId]: isConvenioSelected }));

    const convenioPlanos = planos.filter(plano => plano.convenioId === convenioId);
    setSelectedPlanos(prev => {
      const newState = { ...prev };
      convenioPlanos.forEach(plano => {
        newState[plano.id!] = isConvenioSelected;
      });
      return newState;
    });
  };

  const handlePlanoChange = (planoId: number, convenioId: number) => {
    setSelectedPlanos(prev => ({ ...prev, [planoId]: !prev[planoId] }));

    const convenioPlanos = planos.filter(plano => plano.convenioId === convenioId);
    const allPlanosSelected = convenioPlanos.every(plano => selectedPlanos[plano.id!] || plano.id === planoId);

    setSelectedConvenios(prev => ({ ...prev, [convenioId]: allPlanosSelected }));
  };

  const handleSave = () => {
    const selectedData = convenios.map(convenio => {
      const convenioPlanos = planos.filter(plano => plano.convenioId === convenio.id);
      const planosSelecionados = convenioPlanos
        .filter(plano => selectedPlanos[plano.id!])
        .map(plano => plano.id!);

      if (selectedConvenios[convenio.id!] && planosSelecionados.length === convenioPlanos.length) {
        return { convenioId: convenio.id!, planosId: [] };
      } else if (planosSelecionados.length > 0) {
        return { convenioId: convenio.id!, planosId: planosSelecionados };
      }
      return null;
    }).filter(item => item !== null);

    console.log("Dados formatados para enviar à API:", selectedData);
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
