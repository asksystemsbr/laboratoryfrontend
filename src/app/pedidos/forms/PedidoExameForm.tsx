//src/app/pedidos/forms/PedidoExameForm.tsx
import React, { useEffect,  useState } from 'react';
import axios from 'axios';
import { Exame } from '@/models/exame';
import { formatCurrencyBRL, formatDecimal } from '@/utils/numbers';
import { formatDateTimeForGrid } from '@/utils/formatDateForInput';
import { PedidoDetalhe } from '@/models/pedidoDetalhe';
import { PedidoCabecalho } from '@/models/pedidoCabecalho';
import { Solicitante } from '@/models/solicitante';
import InformativeModal from '@/components/InformativeModal';


interface ExameFormProps {
  onSolicitanteSelected: (id: number| null) => void;
  pedidoDetalhes?: PedidoDetalhe[]; 
  medicamentosParam?: string; 
  observacoesParam?: string;   
  pedidoCabecalhoData?: PedidoCabecalho;
  solicitanteId?: number;
}

const PedidoExameForm: React.FC<ExameFormProps> = ({ 
      onSolicitanteSelected,
      pedidoDetalhes = [],
      medicamentosParam='',
      observacoesParam='',  
      pedidoCabecalhoData,
      solicitanteId
    }) => {
  // const [codigoExame, setcodigoExame] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [addedExames, setAddedExames] = useState<Exame[]>([]);
  const [medicamentos, setMedicamentos] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);  
  const [solicitanteData, setSolicitanteData] = useState<Solicitante | null>(null);  
  const [crm, setCRM] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage] = useState("");
  
/*star search field exame*/
  

  useEffect(() => {      
      const updatedExames = pedidoDetalhes.map((detalhe) => {
        // Find the corresponding `exame` in `addedExames`
        const matchingExame = addedExames.find((exame) => exame.exameId === detalhe.exameId);
        
        // If a match is found, update its `preco`
        if (matchingExame) {
          return { ...matchingExame, preco: detalhe.valor ?? matchingExame.preco };
        } else {          
          return {
            ...detalhe,
            nomeExame: 'Desconhecido',  // Default or fetched value for missing properties
            prazo: 0,              // Default or fetched value
            preco: detalhe.valor ?? 0,
            dataColeta: detalhe.dataColeta || new Date().toISOString(),
            materialApoioId: 0,    // Default or fetched value
            especialidadeId: 0,    // Default or fetched value
            setorId: 0             // Default or fetched value
          } as Exame;
        }
        
        // If no match, keep the `detalhe` as is
        return detalhe;
      });

      setAddedExames(updatedExames as Exame[]);
  }, [pedidoDetalhes]);

  


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

  useEffect(() => {

    const loadSolicitantes = async () => {
      try {
        const response = await axios.get(`/api/Solicitante`);
        setSolicitantes(response.data);
      } catch (error) {
        console.log(error);
        //setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
      }
    };

    Promise.all([loadSolicitantes()]).then(() => setIsLoaded(true));
  },[]);

  useEffect(() => {
    if (isComponentMounted) return;
    // Carregar exames do orçamento (modo de edição) ao iniciar
    const loadPedidoExames = async () => {
      if ( !pedidoCabecalhoData?.id || pedidoDetalhes.length === 0) return;

      try {
        const idCabecalho = pedidoCabecalhoData?.id;
        const response = await axios.get(`/api/Pedido/GetExamesList/${idCabecalho}`);
        
      // Combinar detalhes do orçamento com os exames
      const examesComDetalhes = response.data.map((exame: Exame) => {
          // Encontrar o detalhe correspondente pelo ExameId
          const detalhe = pedidoDetalhes.find(d => d.exameId === exame.id);
          
          return {
            ...detalhe,
            exame,
            id: detalhe?.id || 0,
            pedidoId: idCabecalho,
            exameId: exame.id,
            valor: detalhe?.valor || exame.preco || 0,
            nomeExame: exame.nomeExame,  
            codigoExame: exame.codigoExame,
            preco: detalhe?.valor || exame.preco || 0, 
            dataColeta: detalhe?.dataColeta || new Date().toISOString().split('T')[0]
          } as PedidoDetalhe;
        });
        // Define a lista de exames já adicionados a partir dos exames do orçamento
        setAddedExames(examesComDetalhes);
        // setexames(examesComDetalhes);

        setObservacoes(observacoesParam);
        setMedicamentos(medicamentosParam);
        setIsComponentMounted(true);
      } catch (error) {
        console.error('Erro ao carregar exames do orçamento:', error);
      }
    };

    loadPedidoExames();
  }, []);

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
    if (isLoaded) {
      // setCRM()
      // setValue('codigoExame', exame.codigoExame);
    }
  }, [isLoaded]);

  


  const handleSelectSolicitanteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    const selectedSolicitante = solicitantes.find(s => s.id === selectedId) || null;
    setSolicitanteData(selectedSolicitante);
    setCRM(selectedSolicitante?.crm ?? '');
    onSolicitanteSelected(selectedSolicitante?.id ?? null);
  };

  
  return (
    <div className="form-section mt-4 border-t border-gray-300 py-1">
    <h3 className="text-lg font-semibold text-center mb-2">Lista de Exames</h3>

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
            disabled
          />         
      </div>
      <div className="basis-3/12">
      <select
          value={solicitanteData?.id || ''}        
          onChange={handleSelectSolicitanteChange}  
          className="border rounded w-full py-1 px-2 text-sm text-gray-800"
          disabled
        >
          <option value="">Selecione um solicitante</option>
          {solicitantes.map((solicitante) => (
            <option key={solicitante.id} value={solicitante.id}>
              {solicitante.descricao}
            </option>
          ))}
        </select>
      </div>                         
    </div>

    {addedExames.length > 0 && (
    // {exames.length > 0 && (
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-2 py-1 border-b text-left font-semibold">Código</th>
              <th className="px-2 py-1 border-b text-left font-semibold">Nome do Exame</th>
              <th className="px-2 py-1 border-b text-left font-semibold">Data Coleta</th>
              <th className="px-2 py-1 border-b text-right font-semibold">Valor</th>
            </tr>
          </thead>
          <tbody>
          {addedExames.map((exame, index) => (
          // {exames.map((exame, index) => (
            <tr key={exame.id} className={`hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}>
            <td className="px-2 py-1 border-b">{exame.codigoExame}</td>
            <td className="px-2 py-1 border-b">{exame.nomeExame}</td>
            <td className="px-2 py-1 border-b">{formatDateTimeForGrid(exame.dataColeta)}</td>
            <td className="px-2 py-1 border-b text-right">{formatCurrencyBRL(formatDecimal(exame.preco || 0, 2))}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>        
    )}

    <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col mt-4">
          <label className="font-semibold">Medicamentos:</label>
          <textarea
            value={medicamentos}
            readOnly
            className="border rounded w-full p-2 mt-1 text-sm"
            placeholder="Medicamentos acumulados"
            disabled
          />
        </div>

        <div className="flex flex-col mt-4">
          <label className="font-semibold">Observações:</label>
          <textarea
            value={observacoes}
            readOnly
            className="border rounded w-full p-2 mt-1 text-sm"
            placeholder="Observações acumuladas"
            disabled
          />
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

export default PedidoExameForm;
