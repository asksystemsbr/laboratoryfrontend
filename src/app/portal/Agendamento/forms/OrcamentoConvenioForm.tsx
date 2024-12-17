//src/app/orcamentos/forms/OrcamentoConvenioForm.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Convenio } from '@/models/convenio';
import { Plano } from '@/models/plano';
import { useAuth } from '@/app/auth';
import { Recepcao } from '@/models/recepcao';
import InformativeModal from '@/components/InformativeModal';

interface OrcamentoConvenioFormProps {  
  onConvenioSelected: (id: number| null,codConvenio: string | null) => void;
  onPlanoSelected: (id: number| null) => void;  
  onUnidadeSelected: (id: number| null) => void; 
  convenioId?: number;
  planoId?: number;
}

const OrcamentoConvenioForm: React.FC<OrcamentoConvenioFormProps> = ({     
    onConvenioSelected,
    onPlanoSelected,    
    onUnidadeSelected,    
    convenioId,
    planoId
  }) => {  
  const [convenioData, setConvenioData] = useState<Convenio | null>(null);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [localConvenioId, setLocalConvenioId] = useState<number | null>(convenioId || null);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [planoData, setPlanoData] = useState<Plano | null>(null);  
  const [unidades, setUnidades] = useState<Recepcao[]>([]);
  const [unidadesData, setunidadesData] = useState<Recepcao | null>(null);
  // const [codigoConvenio, setcodigoConvenio] = useState('');
  const [recepcaoId,setrecepcaoId]= useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const auth = useAuth(); // Armazena o contexto inteiro e faz a verificação
  const user = auth?.user; // Verifica se auth é nulo antes de acessar user

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

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

  const handleSelectUnidadeChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    const selectedUnidade = unidades.find(p => p.id === selectedId) || null;
    if (selectedUnidade) {
      setunidadesData(selectedUnidade);
      setrecepcaoId(selectedUnidade.id ?? 0);
      onUnidadeSelected(selectedUnidade?.id ?? null);
      // Recarregar convênios
      try {
        const convenioResponse = await axios.get(`/api/Convenio/getConvenioByRecepcao/${selectedUnidade.id}`);
        setConvenios(convenioResponse.data);

        // Tentar restaurar o convênio antigo
        const restoredConvenio = convenioResponse.data.find((c: Convenio) => c.id === convenioData?.id);
        if (restoredConvenio) {
          setConvenioData(restoredConvenio);
          onConvenioSelected(restoredConvenio.id, restoredConvenio.codOperadora);
          await loadPlanosByConvenio(restoredConvenio.id);

          // Recarregar os planos com o convênio antigo
           const planoResponse = await axios.get(
             `/api/Plano/getListByConvenioAndRecepcao/${restoredConvenio.id}/${selectedUnidade.id}`
           );
           setPlanos(planoResponse.data);

          // Tentar restaurar o plano antigo
           const restoredPlano = planoResponse.data.find((p: Plano) => p.id === planoData?.id);
           if (restoredPlano) {
             setPlanoData(restoredPlano);
             onPlanoSelected(restoredPlano.id);
           } else {
             setPlanoData(null);
             onPlanoSelected(null);
             setModalMessage('O plano anterior não está disponível para a nova unidade.');
             setIsModalOpen(true);
           }
        } else {
          // Convênio antigo não encontrado
          setLocalConvenioId(null);
          setConvenioData(null);
          onConvenioSelected(null, null);
          onPlanoSelected(null);
          resetPlanos();
          if(convenioData != null){
            setModalMessage('O convênio anterior não está disponível para a nova unidade.');
            setIsModalOpen(true);
          }          
        }
      } catch (error) {
        console.error('Erro ao carregar convênios ou planos:', error);
      }      
    }
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

    const fetchUnidades = async () => {
      try {
        const response = await axios.get('/api/Recepcao');
        setUnidades(response.data);

        if (user?.unidadeId) {
          const selectedUnidade = response.data.find((u: Recepcao) => u.id === parseInt(user.unidadeId, 10));
          if (selectedUnidade) {
            setunidadesData(selectedUnidade);
            setrecepcaoId(selectedUnidade.id);
            onUnidadeSelected(selectedUnidade.id);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    Promise.all([loadConvenios(),fetchUnidades()]).then(() => setIsLoaded(true));    
  },[isLoaded]);

  useEffect(() => {
    // Carrega o convenio inicial quando `convenios` estiverem carregados e `convenioId` for passado
    //if (isLoaded && convenioId && convenios.length > 0 && !convenioData) {
    if (isLoaded && localConvenioId  && convenios.length > 0) {
      const selectedConvenio = convenios.find(c => c.id === localConvenioId ) || null;
      setConvenioData(selectedConvenio);
      // setcodigoConvenio(selectedConvenio?.codOperadora ?? '');
      onConvenioSelected(selectedConvenio?.id ?? null, selectedConvenio?.codOperadora ?? null);
  
      // Carregar os planos relacionados ao convênio
      if (selectedConvenio) loadPlanosByConvenio(selectedConvenio.id);
    }
  //}, [isLoaded, convenioId, convenios]);
  }, [isLoaded, localConvenioId , convenios.length]);


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
    <div className="form-section mt-1 border-t border-gray-300 py-2">
    <h3 className="text-lg font-semibold text-center mb-4">Convênios / Planos</h3>

    {/* Primeira linha */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
      <div className="col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
        <select
            value={unidadesData?.id || ''}        
            onChange={handleSelectUnidadeChange}  
            className="border rounded w-full py-2 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Selecione uma Unidade</option>
            {unidades.map((unidade) => (
              <option key={unidade.id} value={unidade.id}>
                {unidade.nomeRecepcao}
              </option>
            ))}
          </select>
      </div> 
      <div className="col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">Convênio</label>
      <select
          value={convenioData?.id || ''}        
          onChange={handleSelectConvenioChange}  
          className="border rounded w-full py-2 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Selecione um convênio</option>
          {convenios.map((convenio) => (
            <option key={convenio.id} value={convenio.id}>
              {convenio.descricao}
            </option>
          ))}
        </select>
      </div> 
      <div className="col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
      <select
          value={planoData?.id || ''}        
          onChange={handleSelectPlanoChange}  
          className="border rounded w-full py-2 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
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
    {/* Informative Modal */}
    <InformativeModal
    isOpen={isModalOpen}
    title="Atenção"
    message={modalMessage}
    onClose={() => setIsModalOpen(false)}
  />
  </div>
  );
};

export default OrcamentoConvenioForm;
