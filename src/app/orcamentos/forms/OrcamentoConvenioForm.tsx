//src/app/orcamentos/forms/OrcamentoConvenioForm.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Convenio } from '@/models/convenio';
import { Plano } from '@/models/plano';
import { useAuth } from '@/app/auth';

interface OrcamentoConvenioFormProps {  
  onConvenioSelected: (id: number| null,codConvenio: string | null) => void;
  onPlanoSelected: (id: number| null) => void;  
  convenioId?: number;
  planoId?: number;
}

const OrcamentoConvenioForm: React.FC<OrcamentoConvenioFormProps> = ({     
    onConvenioSelected,
    onPlanoSelected,    
    convenioId,
    planoId
  }) => {  
  const [convenioData, setConvenioData] = useState<Convenio | null>(null);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [planoData, setPlanoData] = useState<Plano | null>(null);  
  // const [codigoConvenio, setcodigoConvenio] = useState('');
  const [recepcaoId,setrecepcaoId]= useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const auth = useAuth(); // Armazena o contexto inteiro e faz a verificação
  const user = auth?.user; // Verifica se auth é nulo antes de acessar user

  // const buscarConvenioPorCodigo = async () => {
  //   try {
  //     if (!codigoConvenio ) return;
  //     const response = await axios.get(`/api/Convenio/getConvenioByCodigoAndRecepcao/${codigoConvenio}/${recepcaoId}`);
  //     const item = response.data;
  //     preencherDadosConvenio(item);
  //   } catch (error) {
  //     console.error('Solicitante não encontrado', error);
  //     setConvenioData(null);
  //     onConvenioSelected(null,null);
  //     resetPlanos();
  //   }
  // };
  
  // const preencherDadosConvenio = async (convenio: Convenio) => {
  //   setConvenioData(convenio);
  //   setcodigoConvenio(convenio.codOperadora??"");
  //   onConvenioSelected(convenio.id ?? null,convenio.codOperadora ?? null);
  //   await loadPlanosByConvenio(convenio.id);
  // };

  const loadPlanosByConvenio = async (convenioId: number) => {
    try {
      const response = await axios.get(`/api/Plano/getListByConvenioAndRecepcao/${convenioId}/${recepcaoId}`);
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

  const handleSelectConvenioChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    const selectedConvenio = convenios.find(s => s.id === selectedId) || null;
    setConvenioData(selectedConvenio);
    // setcodigoConvenio(selectedConvenio?.codOperadora ?? '');
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
  // Usa uma variável para controlar a execução e evitar chamadas duplicadas

    const loadConvenios = async () => {
      const recepcaoCod= parseInt(user?.unidadeId || '0', 10);
      setrecepcaoId(recepcaoCod)
      try {        
          setIsLoaded(true);
          const response = await axios.get(`/api/Convenio/getConvenioByRecepcao/${recepcaoCod}`);
          setConvenios(response.data);                 
      } catch (error) {
        console.log(error);
        //setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
      } 
      
    };

    Promise.all([loadConvenios()]).then(() => setIsLoaded(true));    
  },[isLoaded]);

  useEffect(() => {
    // Carrega o convenio inicial quando `convenios` estiverem carregados e `convenioId` for passado
    //if (isLoaded && convenioId && convenios.length > 0 && !convenioData) {
    if (isLoaded && convenioId && convenios.length > 0) {
      const selectedConvenio = convenios.find(c => c.id === convenioId) || null;
      setConvenioData(selectedConvenio);
      // setcodigoConvenio(selectedConvenio?.codOperadora ?? '');
      onConvenioSelected(selectedConvenio?.id ?? null, selectedConvenio?.codOperadora ?? null);
  
      // Carregar os planos relacionados ao convênio
      if (selectedConvenio) loadPlanosByConvenio(selectedConvenio.id);
    }
  //}, [isLoaded, convenioId, convenios]);
  }, [isLoaded, convenioId, convenios.length]);


useEffect(() => {
  // Carrega o plano inicial quando `planos` estiverem carregados e `planoId` for passado
  if (planoId && planos.length > 0 && !planoData) {
    const selectedPlano = planos.find(p => p.id === planoId) || null;
    setPlanoData(selectedPlano);
    onPlanoSelected(selectedPlano?.id ?? null);
  }
//}, [planoId, planos]);
}, [planoId, planos.length]);


  return (
    <div className="form-section mt-1 border-t border-gray-300 py-1">
    <h3 className="text-lg font-semibold text-center mb-2">Convênios / Planos</h3>

    {/* Primeira linha */}
    <div className="flex flex-wrap gap-4 mb-4">
      {/* <div className="basis-1/12">
          <input
            type="text"
            value={codigoConvenio}
            onChange={(e) => setcodigoConvenio(e.target.value)}
            onBlur={buscarConvenioPorCodigo}
            className="border rounded w-full py-1 px-2 text-sm"
            placeholder="Cód Convênio"
          />         
      </div>     */}
      <div className="basis-5/12">
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
