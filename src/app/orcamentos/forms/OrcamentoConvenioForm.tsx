//src/app/orcamentos/forms/OrcamentoConvenioForm.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Solicitante } from '@/models/solicitante';
import { Convenio } from '@/models/convenio';
import { Plano } from '@/models/plano';

interface OrcamentoConvenioFormProps {
  onSolicitanteSelected: (id: number| null) => void;
  onConvenioSelected: (id: number| null,codConvenio: string | null) => void;
  onPlanoSelected: (id: number| null) => void;
  solicitanteId?: number;
  convenioId?: number;
  planoId?: number;
}

const OrcamentoConvenioForm: React.FC<OrcamentoConvenioFormProps> = ({ 
    onSolicitanteSelected,
    onConvenioSelected,
    onPlanoSelected,
    solicitanteId,
    convenioId,
    planoId 
  }) => {
  const [solicitanteData, setSolicitanteData] = useState<Solicitante | null>(null);
  const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);  
  const [convenioData, setConvenioData] = useState<Convenio | null>(null);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [planoData, setPlanoData] = useState<Plano | null>(null);
  const [crm, setCRM] = useState('');
  const [codigoConvenio, setcodigoConvenio] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);


  const buscarSolicitantePorCRM = async () => {
    try {
      if (!crm || crm.length < 3) return;
      const response = await axios.get(`/api/Solicitante/solicitanteByCRM/${crm}`);
      const item = response.data;
      preencherDadosSolicitante(item);
    } catch (error) {
      console.error('Solicitante não encontrado', error);
      setSolicitanteData(null);
      onSolicitanteSelected(null);
    }
  };

  const preencherDadosSolicitante = async (solicitante: Solicitante) => {
    setSolicitanteData(solicitante);
    setCRM(solicitante.crm??"");
    onSolicitanteSelected(solicitante.id ?? null);
  };


  const buscarConvenioPorCodigo = async () => {
    try {
      if (!codigoConvenio ) return;
      const response = await axios.get(`/api/Convenio/getConvenioByCodigo/${codigoConvenio}`);
      const item = response.data;
      preencherDadosConvenio(item);
    } catch (error) {
      console.error('Solicitante não encontrado', error);
      setConvenioData(null);
      onConvenioSelected(null,null);
      resetPlanos();
    }
  };
  
  const preencherDadosConvenio = async (convenio: Convenio) => {
    setConvenioData(convenio);
    setcodigoConvenio(convenio.codOperadora??"");
    onConvenioSelected(convenio.id ?? null,convenio.codOperadora ?? null);
    await loadPlanosByConvenio(convenio.id);
  };

  const loadPlanosByConvenio = async (convenioId: number) => {
    try {
      const response = await axios.get(`/api/Plano/getListByConvenio/${convenioId}`);
      setPlanos(response.data);
      setPlanoData(null); // Reset plano selection
      onPlanoSelected(null);
    } catch (error) {
      console.error('Erro ao carregar planos', error);
      setPlanos([]);
    }
  };

  const resetPlanos = () => {
    setPlanos([]);
    setPlanoData(null);
    onPlanoSelected(null);
  };

  const handleSelectSolicitanteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    const selectedSolicitante = solicitantes.find(s => s.id === selectedId) || null;
    setSolicitanteData(selectedSolicitante);
    setCRM(selectedSolicitante?.crm ?? '');
    onSolicitanteSelected(selectedSolicitante?.id ?? null);
  };

  const handleSelectConvenioChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    const selectedConvenio = convenios.find(s => s.id === selectedId) || null;
    setConvenioData(selectedConvenio);
    setcodigoConvenio(selectedConvenio?.codOperadora ?? '');
    onConvenioSelected(selectedConvenio?.id ?? null,selectedConvenio?.codOperadora ?? null);

    if (selectedConvenio) {
      await loadPlanosByConvenio(selectedConvenio.id);
    } else {
      resetPlanos();
    }
  };

  const handleSelectPlanoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    const selectedPlano = planos.find(p => p.id === selectedId) || null;
    setPlanoData(selectedPlano);
    onPlanoSelected(selectedPlano?.id ?? null);
  };
  
  useEffect(() => {
    const loadSolicitantes = async () => {
      try {
        const response = await axios.get('/api/Solicitante');
        setSolicitantes(response.data);
      } catch (error) {
        console.log(error);
        //setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
      }
    };

    const loadConvenios = async () => {
      try {
        const response = await axios.get('/api/Convenio');
        setConvenios(response.data);
      } catch (error) {
        console.log(error);
        //setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
      }
    };

    Promise.all([loadSolicitantes(),loadConvenios()]).then(() => setIsLoaded(true));
  },[]);

  useEffect(() => {
    // Carrega o solicitante inicial quando `solicitantes` estiverem carregados e `solicitanteId` for passado
    if (isLoaded && solicitanteId && solicitantes.length > 0 && !solicitanteData) {
      const selectedSolicitante = solicitantes.find(s => s.id === solicitanteId) || null;
      setSolicitanteData(selectedSolicitante);
      setCRM(selectedSolicitante?.crm ?? '');
      onSolicitanteSelected(selectedSolicitante?.id ?? null);
    }
  }, [isLoaded, solicitanteId, solicitantes]);

  useEffect(() => {
    // Carrega o convenio inicial quando `convenios` estiverem carregados e `convenioId` for passado
    if (isLoaded && convenioId && convenios.length > 0 && !convenioData) {
      const selectedConvenio = convenios.find(c => c.id === convenioId) || null;
      setConvenioData(selectedConvenio);
      setcodigoConvenio(selectedConvenio?.codOperadora ?? '');
      onConvenioSelected(selectedConvenio?.id ?? null, selectedConvenio?.codOperadora ?? null);
  
      // Carregar os planos relacionados ao convênio
      if (selectedConvenio) loadPlanosByConvenio(selectedConvenio.id);
    }
  }, [isLoaded, convenioId, convenios]);


useEffect(() => {
  // Carrega o plano inicial quando `planos` estiverem carregados e `planoId` for passado
  if (planoId && planos.length > 0 && !planoData) {
    const selectedPlano = planos.find(p => p.id === planoId) || null;
    setPlanoData(selectedPlano);
    onPlanoSelected(selectedPlano?.id ?? null);
  }
}, [planoId, planos]);


  return (
    <div className="form-section mt-1 border-t border-gray-300 py-1">
    <h3 className="text-lg font-semibold text-center mb-2">Solicitante e Plano</h3>

    {/* Primeira linha */}
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="basis-1/12">
          <input
            type="text"
            value={crm}
            onChange={(e) => setCRM(e.target.value)}
            onBlur={buscarSolicitantePorCRM}
            className="border rounded w-full py-1 px-2 text-sm"
            placeholder="CRM"
          />         
      </div>
      <div className="basis-3/12">
      <select
          value={solicitanteData?.id || ''}        
          onChange={handleSelectSolicitanteChange}  
          className="border rounded w-full py-1 px-2 text-sm text-gray-800"
        >
          <option value="">Selecione um solicitante</option>
          {solicitantes.map((solicitante) => (
            <option key={solicitante.id} value={solicitante.id}>
              {solicitante.descricao}
            </option>
          ))}
        </select>
      </div>   
      <div className="basis-1/12">
          <input
            type="text"
            value={codigoConvenio}
            onChange={(e) => setcodigoConvenio(e.target.value)}
            onBlur={buscarConvenioPorCodigo}
            className="border rounded w-full py-1 px-2 text-sm"
            placeholder="Cód Convênio"
          />         
      </div>    
      <div className="basis-3/12">
      <select
          value={convenioData?.id || ''}        
          onChange={handleSelectConvenioChange}  
          className="border rounded w-full py-1 px-2 text-sm text-gray-800"
        >
          <option value="">Selecione um convênio</option>
          {convenios.map((convenio) => (
            <option key={convenio.id} value={convenio.id}>
              {convenio.descricao}
            </option>
          ))}
        </select>
      </div> 
      <div className="basis-3/12 flex-grow">
      <select
          value={planoData?.id || ''}        
          onChange={handleSelectPlanoChange}  
          className="border rounded w-full py-1 px-2 text-sm text-gray-800"
        >
          <option value="">Selecione um Plano</option>
          {planos.map((plano) => (
            <option key={plano.id} value={plano.id}>
              {plano.descricao}
            </option>
          ))}
        </select>
      </div>                      
    </div>

  </div>
  );
};

export default OrcamentoConvenioForm;
