//src/app/orcamentos/forms/OrcamentoPagamentosForm.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatCurrencyBRL, formatDecimal } from '@/utils/numbers';
import { FormaPagamento } from '@/models/formaPagamento';
import { OrcamentoPagamento } from '@/models/orcamentoPagamento';
import { OrcamentoCabecalho } from '@/models/orcamentoCabecalho';
import InformativeModal from '@/components/InformativeModal';


interface PagamentosFormProps {
  onPagamentosSelected: (exames: FormaPagamento[]) => void;
  orcamentoPagamentos?: OrcamentoPagamento[];
  orcamentoCabecalhoData?: OrcamentoCabecalho; // Lista de pagamentos no modo de edição
}

const PedidoPagamentosForm: React.FC<PagamentosFormProps> = ({ onPagamentosSelected,orcamentoPagamentos =[],orcamentoCabecalhoData  }) => {  
  const [isLoaded] = useState(false);
  const [addedFormaPagamento, setaddedFormaPagamento] = useState<FormaPagamento[]>([]);
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage] = useState("");

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
            pagamentoId: formaPagamento.id
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


  useEffect(() => {
    if (isLoaded) {
      // setCRM()
      // setValue('codigoExame', exame.codigoExame);
    }
  }, [isLoaded]);   


  return (
    <div className="form-section mt-4 border-t border-gray-300 py-1">
    <h3 className="text-lg font-semibold text-center mb-2">Pagamentos</h3>

    {/* Primeira linha */}   

    {addedFormaPagamento.length > 0 && (
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-2 py-1 border-b text-left font-semibold">Pagamento</th>
              <th className="px-2 py-1 border-b text-right font-semibold">Valor</th>
            </tr>
          </thead>
          <tbody>
          {addedFormaPagamento.map((pagamento, index) => (
            <tr key={pagamento.id} className={`hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}>
            <td className="px-2 py-1 border-b">{pagamento.descricao}</td>
            <td className="px-2 py-1 border-b text-right">{formatCurrencyBRL(formatDecimal(pagamento.valor || 0, 2))}</td>            
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

export default PedidoPagamentosForm;
