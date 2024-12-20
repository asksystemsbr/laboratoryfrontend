//src/app/orcamentos/forms/OrcamentoPagamentosForm.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrashIcon } from '@heroicons/react/24/solid';
import { formatCurrencyBRL, formatDecimal } from '@/utils/numbers';
import { FormaPagamento } from '@/models/formaPagamento';
import { OrcamentoPagamento } from '@/models/orcamentoPagamento';
import { OrcamentoCabecalho } from '@/models/orcamentoCabecalho';
import InformativeModal from '@/components/InformativeModal';
import { formatDateTimeForGrid } from '@/utils/formatDateForInput';


interface PagamentosFormProps {
  onPagamentosSelected: (exames: FormaPagamento[]) => void;
  orcamentoPagamentos?: OrcamentoPagamento[];
  orcamentoCabecalhoData?: OrcamentoCabecalho; // Lista de pagamentos no modo de edição
  total: number;
}

const OrcamentoPagamentosForm: React.FC<PagamentosFormProps> = ({ onPagamentosSelected,orcamentoPagamentos =[],orcamentoCabecalhoData, total  }) => {  
  const [formasPagamentos, setformasPagamentos] = useState<FormaPagamento[]>([]);
  const [formaPagamentoData, setformaPagamentoData] = useState<FormaPagamento | null>(null);
  const [valorPagamento, setvalorPagamento] = useState(0);  
  const [isLoaded, setIsLoaded] = useState(false);
  const [addedFormaPagamento, setaddedFormaPagamento] = useState<FormaPagamento[]>([]);
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [dataPagamento, setDataPagamento] = useState<string | null>(null);

  useEffect(() => {
    const loadFormasPagamentos = async () => {
      try {
        const response = await axios.get('/api/FormaPagamento');
        setformasPagamentos(response.data);
      } catch (error) {
        console.log(error);
        //setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
      }
    };

    Promise.all([loadFormasPagamentos()]).then(() => setIsLoaded(true));
  },[]);

  useEffect(() => {
    if (isComponentMounted) return;
    // Carregar exames do orçamento (modo de edição) ao iniciar
    const loadOrcamentoPagamentos = async () => {          
      if ( !orcamentoCabecalhoData?.id || orcamentoPagamentos.length === 0) return;

      try {
        // Obtém o `OrcamentoId` e chama a API para obter os exames associados
        const idCabecalho = orcamentoPagamentos[0].orcamentoId;
        const response = await axios.get(`/api/Orcamento/getPagamentosList/${idCabecalho}`);
        
      // Combinar detalhes do orçamento com os exames
      const pagamentosComDetalhes = response.data.map((formaPagamento: FormaPagamento) => {
          // Encontrar o detalhe correspondente pelo ExameId
          const pagamentoDetalhe  = orcamentoPagamentos.find(d => d.pagamentoId === formaPagamento.id);
          
          // Retornar o exame com os detalhes de preço e data de coleta
          return {
            ...formaPagamento,
            valor: pagamentoDetalhe ? pagamentoDetalhe.valor : 0,
            id: pagamentoDetalhe ? pagamentoDetalhe.id : formaPagamento.id,
            pagamentoId: formaPagamento.id,
            dataPagamento: pagamentoDetalhe?pagamentoDetalhe.dataPagamento: '01-01-1900'
          };
        });
        // Define a lista de exames já adicionados a partir dos exames do orçamento
        setaddedFormaPagamento(pagamentosComDetalhes);
        onPagamentosSelected(pagamentosComDetalhes);
        setIsComponentMounted(true);

      } catch (error) {
        console.error('Erro ao carregar pagamentos do orçamento:', error);
      }
    };

    loadOrcamentoPagamentos();
  }, [orcamentoPagamentos, onPagamentosSelected]);

  const preencherDadosExame = async (formaPagamento: FormaPagamento) => {
    setformaPagamentoData(formaPagamento);
    setvalorPagamento(formaPagamento.valor??0);
  };

  useEffect(() => {
    if (isLoaded) {
      // setCRM()
      // setValue('codigoExame', exame.codigoExame);
    }
  }, [isLoaded]); 


  const adicionarFormaPagamento = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formaPagamentoData )
      { 
        setModalMessage("Selecione uma forma de pagamento.");
        setIsModalOpen(true);
        return;
      }

      if (!dataPagamento) {
        setModalMessage("Selecione uma data de pagamento.");
        setIsModalOpen(true);
        return;
      }

    try {

      if (valorPagamento <= 0) {
        setModalMessage('O valor do pagamento deve ser maior que zero.');
        setIsModalOpen(true);
        return;
      }

      // Check if the payment type already exists in the list
      const alreadyExists = (addedFormaPagamento as OrcamentoPagamento[]).some(
        (pagamento) => pagamento.pagamentoId === formaPagamentoData.id
      );

      if (alreadyExists) {
        setModalMessage('Essa forma de pagamento já foi adicionada.');
        setIsModalOpen(true);
        return;
      }


      const novoTotal = arredondar(
        addedFormaPagamento.reduce((acc, pagamento) => acc + (pagamento.valor || 0), 0) + valorPagamento
      );

      console.log(total);
      console.log(novoTotal);

      const totalArredondado = arredondar(total);
      if (novoTotal > totalArredondado) {
        setModalMessage("A soma dos valores dos pagamentos excede o total permitido.");
        setIsModalOpen(true);
        return;
      }

      const pagamentoComDetalhes = { ...formaPagamentoData, valor:valorPagamento,pagamentoId:formaPagamentoData.id, dataPagamento, };
      setaddedFormaPagamento([...addedFormaPagamento, pagamentoComDetalhes]);

      onPagamentosSelected([...addedFormaPagamento, pagamentoComDetalhes]);
      setvalorPagamento(0); // Resetar campo após adicionar
      setIsComponentMounted(true);
    } catch (error) {
      console.error('Erro ao adicionar exame', error);
    }
  };

  const arredondar = (valor: number) => parseFloat(valor.toFixed(2));
  
  const removerPagamento = (index: number) => {
    const updatedExames = addedFormaPagamento.filter((_, idx) => idx !== index);
    setaddedFormaPagamento(updatedExames);
    onPagamentosSelected(updatedExames);
  };

  return (
    <div className="form-section mt-4 border-t border-gray-300 py-2">
    <h3 className="text-lg font-semibold text-center mb-4">Pagamentos</h3>

    {/* Primeira linha */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div className="col-span-1">
        <select
            value={formaPagamentoData?.id || ''}        
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              const selectedExame = formasPagamentos.find((p) => p.id === selectedId) || null;
              if(selectedExame){
                preencherDadosExame(selectedExame);
              }
            }}
            className="border rounded w-full py-2 px-3 text-sm text-gray-800"
          >
            <option value="">Selecione um pagamento</option>
            {formasPagamentos.map((pagamento) => (
              <option key={pagamento.id} value={pagamento.id}>
                {pagamento.descricao}
              </option>
            ))}
        </select>
      </div> 
      <div className="col-span-1">
          <input
            type="number"
            value={formatDecimal(valorPagamento,2)}
            onChange={(e) => setvalorPagamento(formatDecimal(parseFloat(e.target.value), 2))}
            className="border rounded w-full py-2 px-3 text-sm"
            placeholder="R$"
          />         
      </div>      
      <div className="col-span-1">
        <input
          type="date"
          value={dataPagamento || ''}
          onChange={(e) => setDataPagamento(e.target.value)}
          className="border rounded w-full py-2 px-3 text-sm"
          placeholder="Data de pagamento"
        />
      </div>      
      <div className="col-span-1 flex items-center justify-center">
        <button
          onClick={adicionarFormaPagamento}
          className="w-full sm:w-auto py-2 px-6 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold rounded-lg shadow-md text-center hover:from-green-500 hover:to-blue-500 transition-all duration-300"
        >
          Adicionar
        </button>
      </div>     
    </div>

    {addedFormaPagamento.length > 0 && (
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-2 py-1 border-b text-left font-semibold">Pagamento</th>
              <th className="px-2 py-1 border-b text-right font-semibold">Valor</th>
              <th className="px-2 py-1 border-b text-left font-semibold">Data de Pagamento</th>
              <th className="px-2 py-1 border-b text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
          {addedFormaPagamento.map((pagamento, index) => (
            <tr key={pagamento.id} className={`hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}>
            <td className="px-2 py-1 border-b">{pagamento.descricao}</td>
            <td className="px-2 py-1 border-b text-right">{formatCurrencyBRL(formatDecimal(pagamento.valor || 0, 2))}</td>
            <td className="px-2 py-1 border-b">
              {formatDateTimeForGrid(
                typeof pagamento.dataPagamento === 'string' && pagamento.dataPagamento.includes('T')
                ? pagamento.dataPagamento // Se já contém data e hora, usa diretamente
                : `${pagamento.dataPagamento}T${new Date().toLocaleTimeString('pt-BR', { hour12: false })}` // Adiciona hora atual se só houver data
              )}
            </td>
            <td className="px-2 py-1 border-b text-center">
              <button
                onClick={() => removerPagamento(index)}
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

export default OrcamentoPagamentosForm;
