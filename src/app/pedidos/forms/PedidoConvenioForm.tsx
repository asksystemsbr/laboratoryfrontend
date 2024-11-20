//src/app/pedidos/forms/PedidoConvenioForm.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Convenio } from '@/models/convenio';
import { Plano } from '@/models/plano';
import { useAuth } from '@/app/auth';
import { Recepcao } from '@/models/recepcao';

interface PedidoConvenioFormProps {  
  onConvenioSelected: (id: number| null,codConvenio: string | null) => void;
  onUnidadeSelected: (id: number| null) => void; 
  convenioId?: number;
  planoId?: number;
}

const PedidoConvenioForm: React.FC<PedidoConvenioFormProps> = ({     
    onConvenioSelected,
    onUnidadeSelected,    
    convenioId,
    planoId
  }) => {  
  const [convenioData, setConvenioData] = useState<Convenio | null>(null);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [localConvenioId] = useState<number | null>(convenioId || null);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [planoData, setPlanoData] = useState<Plano | null>(null);  
  const [unidades, setUnidades] = useState<Recepcao[]>([]);
  const [unidadesData, setunidadesData] = useState<Recepcao | null>(null);
  // const [codigoConvenio, setcodigoConvenio] = useState('');
  const [recepcaoId,setrecepcaoId]= useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const auth = useAuth(); // Armazena o contexto inteiro e faz a verificação
  const user = auth?.user; // Verifica se auth é nulo antes de acessar user


  const loadPlanosByConvenio = async (convenioId: number) => {
    try {
      const response = await axios.get(`/api/Plano/getListByConvenioAndRecepcao/${convenioId}/${recepcaoId}`);
      setPlanos(response.data);
      setPlanoData(null); // Reset plano selection
    } catch (error) {
      console.error('Erro ao carregar planos', error);
      setPlanos([]);
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
      <div className="basis-3/12">
        <select
            value={unidadesData?.id || ''}        
            className="border rounded w-full py-1 px-2 text-sm text-gray-800"
            disabled
          >
            <option value="">Selecione uma Unidade</option>
            {unidades.map((unidade) => (
              <option key={unidade.id} value={unidade.id}>
                {unidade.nomeRecepcao}
              </option>
            ))}
          </select>
      </div> 
      <div className="basis-4/12">
      <select
          value={convenioData?.id || ''}        
          className="border rounded w-full py-1 px-2 text-sm text-gray-800"
          disabled
        >
          <option value="">Selecione um convênio</option>
          {convenios.map((convenio) => (
            <option key={convenio.id} value={convenio.id}>
              {convenio.descricao}
            </option>
          ))}
        </select>
      </div> 
      <div className="basis-4/12 flex-grow">
      <select
          value={planoData?.id || ''}        
          className="border rounded w-full py-1 px-2 text-sm text-gray-800"
          disabled
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

export default PedidoConvenioForm;
