//src/app/orcamentos/forms/OrcamentoExameForm.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Exame } from '@/models/exame';
import { PlusIcon,TrashIcon } from '@heroicons/react/24/solid';
import { formatDecimal } from '@/utils/numbers';
import { formatDateForInput } from '@/utils/formatDateForInput';
import { OrcamentoDetalhe } from '@/models/orcamentoDetalhe';
import { OrcamentoCabecalho } from '@/models/orcamentoCabecalho';


interface ExameFormProps {
  onExameSelected: (detalhesOrcamento: OrcamentoDetalhe[],observacoes: string |null, medicamento: string | null) => void;
  planoId: number | null;
  orcamentoDetalhes?: OrcamentoDetalhe[]; 
  medicamentosParam?: string; 
  observacoesParam?: string;   
  orcamentoCabecalhoData?: OrcamentoCabecalho;
}

const OrcamentoExameForm: React.FC<ExameFormProps> = ({ 
      onExameSelected, 
      planoId,
      orcamentoDetalhes = [],
      medicamentosParam='',
      observacoesParam='',  
      orcamentoCabecalhoData}) => {
  const [exameData, setexameData] = useState<Exame | null>(null);
  const [codigoExame, setcodigoExame] = useState('');
  const [exames, setexames] = useState<Exame[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [addedExames, setAddedExames] = useState<Exame[]>([]);
  const [medicamentos, setMedicamentos] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  
  useEffect(() => {
    const loadExames = async () => {
      try {
        const response = await axios.get('/api/Exame');
        setexames(response.data);
      } catch (error) {
        console.log(error);
        //setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
      }
    };

    Promise.all([loadExames()]).then(() => setIsLoaded(true));
  },[]);

  useEffect(() => {
    if (isComponentMounted) return;
    // Carregar exames do orçamento (modo de edição) ao iniciar
    const loadOrcamentoExames = async () => {
      if ( !orcamentoCabecalhoData?.id || orcamentoDetalhes.length === 0) return;

      try {
        // Obtém o `OrcamentoId` e chama a API para obter os exames associados
        const idCabecalho = orcamentoCabecalhoData?.id;
        const response = await axios.get(`/api/Orcamento/GetExamesList/${idCabecalho}`);
        
      // Combinar detalhes do orçamento com os exames
      const examesComDetalhes = response.data.map((exame: Exame) => {
          // Encontrar o detalhe correspondente pelo ExameId
          const detalhe = orcamentoDetalhes.find(d => d.exameId === exame.id);
          
          return {
            ...detalhe,
            exame,
            id: detalhe?.id || 0,
            orcamentoId: idCabecalho,
            exameId: exame.id,
            valor: detalhe?.valor || exame.preco || 0,
            nomeExame: exame.nomeExame,  
            codigoExame: exame.codigoExame,
            preco: detalhe?.valor || exame.preco || 0, 
            dataColeta: detalhe?.dataColeta || new Date().toISOString().split('T')[0]
          } as OrcamentoDetalhe;
        });
        // Define a lista de exames já adicionados a partir dos exames do orçamento
        setAddedExames(examesComDetalhes);

        setObservacoes(observacoesParam);
        setMedicamentos(medicamentosParam);
        setIsComponentMounted(true);
      } catch (error) {
        console.error('Erro ao carregar exames do orçamento:', error);
      }
    };

    loadOrcamentoExames();
  }, []);

  const buscarExamePorCodigo = async () => {
    try {
      if (!codigoExame) return;
      const response = await axios.get(`/api/Exame/getitemsByCodigo/${codigoExame}`);
      const items = response.data;
      preencherDadosExame(items);
    } catch (error) {
      console.error('Exame não encontrado', error);
      setexameData(null);
    }
  };  

  const preencherDadosExame = async (exame: Exame) => {
    setexameData(exame);
    setcodigoExame(exame.codigoExame??"");
  };

  useEffect(() => {
    if (isLoaded) {
      // setCRM()
      // setValue('codigoExame', exame.codigoExame);
    }
  }, [isLoaded]);

  const adicionarExame = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!exameData || !planoId) return;

    try {
      // Buscar preço pelo código do plano e exame
      const precoResponse = await axios.get(`/api/Exame/getPrecoByPlanoExame/${planoId}/${exameData.codigoExame}`);
      const preco = precoResponse.data?.preco || 0;

      // Adicionar medicamento e observação ao estado acumulado
      const medsResponse = await axios.get(`/api/Exame/getitemsByCodigo/${exameData.codigoExame}`);      
      //const obsResponse = await axios.get(`/api/Exame/getitemsByCodigo/${exameData.codigoExame}`);
      const obsResponse = medsResponse;

      // Atualizar campos de medicamentos e observações, evitando duplicação
      const newMedicamentos = `${medicamentos}${medicamentos ? ', ' : ''}${medsResponse.data.alertasRecep}`
        .split(', ')
        .filter((item, index, self) => self.indexOf(item) === index)
        .join(', ');
      setMedicamentos(newMedicamentos);

      const newObservacoes = `${observacoes}${observacoes ? ', ' : ''}${obsResponse.data.instrucoesPreparo}`
        .split(', ')
        .filter((item, index, self) => self.indexOf(item) === index)
        .join(', ');
      setObservacoes(newObservacoes);

      const exameComDetalhes = { ...exameData, id:0, valor:preco,exameId:exameData.id,preco:preco, dataColeta: new Date().toISOString().split('T')[0] };

      setAddedExames([...addedExames, exameComDetalhes]);

      onExameSelected([...addedExames, exameComDetalhes],observacoes,medicamentos);
      setcodigoExame(''); // Resetar campo após adicionar
    } catch (error) {
      console.error('Erro ao adicionar exame', error);
    }
  };

  const removerExame = (index: number) => {
    const updatedExames = addedExames.filter((_, idx) => idx !== index);
    setAddedExames(updatedExames);
    onExameSelected(updatedExames,observacoes,medicamentos);
  };

  return (
    <div className="form-section mt-4 border-t border-gray-300 py-1">
    <h3 className="text-lg font-semibold text-center mb-2">Lista de Exames</h3>

    {/* Primeira linha */}
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="basis-2/12">
          <input
            type="text"
            value={codigoExame}
            onChange={(e) => setcodigoExame(e.target.value)}
            onBlur={buscarExamePorCodigo}
            className="border rounded w-full py-1 px-2 text-sm"
            placeholder="CÓDIGO"
          />         
      </div>
      <div className="basis-7/12">
      <select
          value={exameData?.id || ''}        
          onChange={(e) => {
            const selectedId = Number(e.target.value);
            const selectedExame = exames.find((p) => p.id === selectedId) || null;
            if(selectedExame){
              preencherDadosExame(selectedExame);
            }
          }}
          className="border rounded w-full py-1 px-2 text-sm text-gray-800"
        >
          <option value="">Selecione um exame</option>
          {exames.map((exame) => (
            <option key={exame.id} value={exame.id}>
              {exame.nomeExame}
            </option>
          ))}
        </select>
      </div> 
      <div className="basis-1/12">
        <button onClick={adicionarExame}
          className="p-2 bg-blue-400 text-white font-semibold rounded-full shadow hover:bg-blue-500 transition duration-150"
          >
            <PlusIcon className="h-5 w-5" /> {/* Ícone de adicionar */}
        </button>          
      </div>        
    </div>

    {addedExames.length > 0 && (
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-2 py-1 border-b text-left font-semibold">Código</th>
              <th className="px-2 py-1 border-b text-left font-semibold">Nome do Exame</th>
              <th className="px-2 py-1 border-b text-left font-semibold">Data Coleta</th>
              <th className="px-2 py-1 border-b text-right font-semibold">Valor</th>
              <th className="px-2 py-1 border-b text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
          {addedExames.map((exame, index) => (
            <tr key={exame.id} className="hover:bg-gray-100">
            <td className="px-2 py-1 border-b">{exame.codigoExame}</td>
            <td className="px-2 py-1 border-b">{exame.nomeExame}</td>
            <td className="px-2 py-1 border-b">{formatDateForInput(exame.dataColeta)}</td>
            <td className="px-2 py-1 border-b text-right">{formatDecimal(exame.preco || 0, 2)}</td>
            <td className="px-2 py-1 border-b text-center">
              <button
                onClick={() => removerExame(index)}
                className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-200"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </td>
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
          />
        </div>

        <div className="flex flex-col mt-4">
          <label className="font-semibold">Observações:</label>
          <textarea
            value={observacoes}
            readOnly
            className="border rounded w-full p-2 mt-1 text-sm"
            placeholder="Observações acumuladas"
          />
        </div>
    </div>
  </div>
  );
};

export default OrcamentoExameForm;
