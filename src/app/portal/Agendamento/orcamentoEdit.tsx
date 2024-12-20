//src/app/orcamentos/orcamentoCreate.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { OrcamentoCabecalho } from '@/models/orcamentoCabecalho';
import { SnackbarState } from '@/models/snackbarState';
import OrcamentoClienteForm from './forms/OrcamentoClienteForm';
import OrcamentoConvenioForm from './forms/OrcamentoConvenioForm';
import { validateDateEmpty } from '@/utils/validateDate';
import OrcamentoExameForm from './forms/OrcamentoExameForm';
import OrcamentoResumoValoresForm from './forms/OrcamentoResumoValores';
import OrcamentoPagamentosForm from './forms/OrcamentoPagamentosForm';
import { useAuth } from '@/app/auth';
import { OrcamentoDetalhe } from '@/models/orcamentoDetalhe';
import { OrcamentoPagamento } from '@/models/orcamentoPagamento';
import 'jspdf-autotable'; // Para criar tabelas facilmente
import InformativeModal from '@/components/InformativeModal';

interface OrcamentoCreateFormProps {
  orcamentoCabecalhoData: OrcamentoCabecalho
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const OrcamentoEditForm = ({orcamentoCabecalhoData, onSave, onClose, setSnackbar }: OrcamentoCreateFormProps) => {
  const { register,handleSubmit, setValue, reset  } = useForm<OrcamentoCabecalho>({
    defaultValues: orcamentoCabecalhoData,
  });
  const auth = useAuth(); // Armazena o contexto inteiro e faz a verificação
  const user = auth?.user; // Verifica se auth é nulo antes de acessar user

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planoId, setPlanoId] = useState<number | null>(null);
  const [convenioId, setConvenioId] = useState<number | null>(null);

  const [subtotal, setSubtotal] = useState(0);
  const [desconto,setDesconto] = useState(0); // Adicione lógica para desconto se necessário
  //const [total, setTotal] = useState(0);
  const [isPercentage, setIsPercentage] = useState(false);
  const [totalComDesconto, setTotalComDesconto] = useState(0);
  const [isDescontoEditable, setIsDescontoEditable] = useState(false);

  const [orcamentoDetalhes, setOrcamentoDetalhes] = useState<OrcamentoDetalhe[]>([]);
  const [orcamentoPagamentos, setOrcamentoPagamentos] = useState<OrcamentoPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchComplete = useRef(false);

  const isPercentageRef = useRef<boolean>(false); 

  const previousPlanoIdRef = useRef<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // const [selectedExames, setSelectedExames] = useState<number[]>([]);

// Memoize the discount calculation function
  const calcularTotalComDesconto = useCallback((subtotal: number, desconto: number, isPercentage: boolean) => {
    return isPercentage ? subtotal - ((subtotal * desconto) / 100) : subtotal - desconto;
  }, []);

    // Função para buscar o orçamento completo
    useEffect(() => {
      const fetchOrcamentoCompleto = async () => {
        if (!orcamentoCabecalhoData || fetchComplete.current) return; // Fetch only once
        fetchComplete.current = true;

        try {
          const response = await axios.get(`/api/Orcamento/getOrcamentoCompleto/${orcamentoCabecalhoData.id}`);
          const { orcamentoCabecalho, orcamentoDetalhe, orcamentoPagamento } = response.data;

          // Iterar sobre orcamentoDetalhe para obter prazos
          const updatedOrcamentoDetalhe = await Promise.all(
            orcamentoDetalhe.map(async (item: OrcamentoDetalhe) => {
              try {
                // Buscar prazo para o exame atual
                const prazoResponse = await axios.get(`/api/Exame/${item.exameId}`);
                const prazoDias = prazoResponse.data.prazo || 0;

                // Calcular data final do prazo
                const dataColeta = typeof item.dataColeta === 'string' ? new Date(item.dataColeta) : new Date();
                const prazoFinal = new Date(dataColeta);
                prazoFinal.setDate(prazoFinal.getDate() + prazoDias);

                return { ...item, prazoFinal }; // Adiciona `prazoFinal` ao item
              } catch (error) {
                console.error(`Erro ao buscar prazo para o exame ${item.exameId}:`, error);
                return { ...item, prazoFinal: undefined }; // Retorna item sem alterar se der erro
              }
            })
          );
  
          reset(orcamentoCabecalho); // Preenche o formulário com os dados do cabeçalho

           // Initialize values directly from API response
          const initialIsPercentage = orcamentoCabecalho.tipoDesconto === '1';
          isPercentageRef.current = initialIsPercentage; // Set reference to stabilize `isPercentage`
          setIsPercentage(initialIsPercentage);


          setDesconto(orcamentoCabecalho.desconto);

          setOrcamentoDetalhes(updatedOrcamentoDetalhe);
          setOrcamentoPagamentos(orcamentoPagamento);
  
          // Calcula subtotal e total com base nos detalhes
          const novoSubtotal = updatedOrcamentoDetalhe.reduce((acc: number, item: OrcamentoDetalhe) => acc + (item.valor || 0), 0);
          setSubtotal(novoSubtotal);
          //setTotalComDesconto(novoSubtotal - desconto);
          const totalAtualizado = calcularTotalComDesconto(novoSubtotal, orcamentoCabecalho.desconto,initialIsPercentage );
          setTotalComDesconto(totalAtualizado);          
          setLoading(false);

          previousPlanoIdRef.current = orcamentoCabecalho.planoId || null;
        } catch (error) {
          console.error('Erro ao buscar o orçamento completo:', error);
          setSnackbar(new SnackbarState('Erro ao carregar o orçamento!', 'error', true));
        }
      };
  
      fetchOrcamentoCompleto();
    }, [orcamentoCabecalhoData.id, reset, setSnackbar]);      
  
  useEffect(() => {
    const checkDescontoPermission = async () => {
      try {
      //   const response = await axios.get(`/api/Orcamento/checkDescontoPermission/${user?.id}`);
      //   setIsDescontoEditable(response.data);
        setIsDescontoEditable(false);
       } catch (error) {
         console.error('Erro ao verificar permissão para editar desconto:', error);
       }      
    };
    checkDescontoPermission();
  }, []);

  useEffect(() => {
    if (!loading && (subtotal > 0 || desconto > 0)) { 
      const totalAtualizado = calcularTotalComDesconto(subtotal, desconto, isPercentage);
      if (totalAtualizado !== totalComDesconto) {
        setTotalComDesconto(totalAtualizado);
      }
    }
  }, [subtotal, desconto, isPercentage, loading, calcularTotalComDesconto]);

  
  const onDescontoChange = (novoDesconto: number, percentual: boolean) => {
    setDesconto(novoDesconto);
    setIsPercentage(percentual);
  };

  const handleClienteSelected = (id: number | null, nomePaciente: string | null) => {
    setValue('pacienteId', id || 0);
    setValue('nomePaciente', nomePaciente || '');
  };

  const handleSolicitanteSelected = (id: number | null) => {
    setValue('solicitanteId', id || 0);  
  };

  const handleUnidadeSelected = (id: number | null) => {
    setValue('recepcaoId', id || 0);
  };

  const handleConvenioSelected = (id: number | null, codConvenio: string | null) => {
    setValue('convenioId', id || 0);
    setValue('codConvenio', codConvenio || '');
    setConvenioId(id);
  };

  const handlePlanoSelected = async  (id: number | null) => {
    setValue('planoId', id || 0);
    setPlanoId(id);

  // Se `id` for nulo ou indefinido, resetar os preços para 0
  if (!id) {
    const updatedDetalhes = orcamentoDetalhes.map((detalhe) => ({
      ...detalhe,
      valor: 0,
    }));

    setOrcamentoDetalhes(updatedDetalhes);

    // Recalcular subtotal e total com desconto
    const novoSubtotal = 0; // Todos os valores são 0
    setSubtotal(novoSubtotal);
    const totalAtualizado = calcularTotalComDesconto(novoSubtotal, desconto, isPercentage);
    setTotalComDesconto(totalAtualizado);

    previousPlanoIdRef.current = id;
    return; // Encerrar execução
  }

  // Caso o ID seja válido e diferente do plano anterior
  if (id === previousPlanoIdRef.current) return;

    try {
      const updatedDetalhes = await Promise.all(
        orcamentoDetalhes.map(async (detalhe) => {
          const precoResponse = await axios.get(`/api/Exame/getPrecoByPlanoExameId/${id}/${detalhe.exameId}`);
          const preco = precoResponse.data?.preco || 0;
          return { ...detalhe, valor: preco };
        })
      );

      setOrcamentoDetalhes(updatedDetalhes);

      // Recalculate subtotal and total with discount
      const novoSubtotal = updatedDetalhes.reduce((acc, detalhe) => acc + (detalhe.valor || 0), 0);
      setSubtotal(novoSubtotal);
      const totalAtualizado = calcularTotalComDesconto(novoSubtotal, desconto, isPercentage);
      setTotalComDesconto(totalAtualizado);
      previousPlanoIdRef.current = id;
    } catch (error) {
      console.error('Erro ao atualizar preços dos exames:', error);
      setSnackbar(new SnackbarState('Erro ao atualizar preços dos exames!', 'error', true));
    }
  };

  const handleExameSelected = (
    detalhesOrcamento: OrcamentoDetalhe[]
    ,observacoes: string |null
    , medicamento: string | null
    // ,selectedExamesIds: number[]
  ) => {


    // Calcular subtotal com base nos preços dos exames
    const novoSubtotal = detalhesOrcamento.reduce((acc, detalhe) => acc + (detalhe.valor || 0), 0);
    setSubtotal(novoSubtotal);

    // Calcular total com base no subtotal e desconto
    const totalAtualizado = calcularTotalComDesconto(subtotal, desconto, isPercentage);
    setTotalComDesconto(totalAtualizado);
    //setTotalComDesconto(novoSubtotal - desconto);
    
    setValue('observacoes', observacoes || '');
    setValue('medicamento', medicamento || '');

    const detalhes = detalhesOrcamento.map((detalhe) => ({
      exameId: detalhe.exameId,
      valor: detalhe.valor,
      dataColeta: new Date(),
      orcamentoId:orcamentoCabecalhoData.id,
      id: detalhe.id,
      horarioId: detalhe.horarioId,
    }));

    setOrcamentoDetalhes(detalhes);
    // setSelectedExames(selectedExamesIds);
  };

  const handlePagamentosSelected = (pagamentos: OrcamentoPagamento[]) => {
    console.log(pagamentos);
    // Criar lista de `OrcamentoPagamento` a partir dos pagamentos selecionados
    const pagamentosData = pagamentos.map((pagamento) => ({
      pagamentoId: pagamento.pagamentoId,
      valor: pagamento.valor,
      orcamentoId: orcamentoCabecalhoData.id,
      id: 0,
      dataPagamento: pagamento.dataPagamento
    }));

    setOrcamentoPagamentos(pagamentosData);
  };
  
  const validateOrcamento = (data: OrcamentoCabecalho, isPedido: boolean): boolean => {
    if (!data.pacienteId) {
      setModalMessage('Paciente é obrigatório!');
      setIsModalOpen(true);
      return false;
    }
  
    if (!data.convenioId) {
      setModalMessage('Convênio é obrigatório!');
      setIsModalOpen(true);
      return false;
    }
  
    if (!data.nomePaciente) {
      setModalMessage('Nome do paciente é obrigatório!');
      setIsModalOpen(true);
      return false;
    }
  
    if (!data.solicitanteId) {
      setModalMessage('Solicitante é obrigatório!');
      setIsModalOpen(true);
      return false;
    }
  
    if (!data.planoId) {
      setModalMessage('Plano é obrigatório!');
      setIsModalOpen(true);
      return false;
    }
  
    if (orcamentoDetalhes.length === 0) {
      setModalMessage('O orçamento deve conter pelo menos um item!');
      setIsModalOpen(true);
      return false;
    }
  
    if (isPedido) {
      const totalPago =arredondar(orcamentoPagamentos.reduce((acc, pagamento) => acc + (pagamento.valor || 0), 0));
      if (totalPago !== arredondar(totalComDesconto)) {
        setModalMessage('O total pago deve ser igual ao total do orçamento!');
        setIsModalOpen(true);
        return false;
      }
    }
  
    return true;
  };

  const arredondar = (valor: number) => parseFloat(valor.toFixed(2));

  const onSubmit = async (data: OrcamentoCabecalho) => {
    if (isSubmitting) return;
    if (!validateOrcamento(data, false)) return; // Valida sem a regra específica para pedidos
  
    // Chamada à API para validação adicional
    const response = await axios.get<string>(`/api/Orcamento/validateCreatePedido/${data.id}`);
    const validationMessage = response.data;

    // Verifica se a mensagem é diferente de vazio
    if (validationMessage) {
      setSnackbar(new SnackbarState(validationMessage, 'error', true));
      return; // Impede que o processo continue
    }

    await submitOrcamento(data,false);
  };

  const submitOrcamento = async (data: OrcamentoCabecalho, isPedido: boolean) => {
      const now = new Date();
      now.setHours(now.getHours() - 3); // Ajuste para GMT-3
      const dataHora = now.toISOString().slice(0, 19); // Remove o "Z" para evitar indicação de UTC

      const orcamentoData: OrcamentoCabecalho = {
        ...data,
        usuarioId: user?.id || 0,
        dataHora: dataHora,
        total: totalComDesconto,
        desconto: desconto,
        tipoDesconto: isPercentage ? '1' : '0',
      };

      const orcamentoDetalheData = orcamentoDetalhes.map((detalhe) => ({
        ...detalhe,
        orcamentoId: orcamentoCabecalhoData.id,
        id: detalhe.id,
      }));

      const orcamentoCompleto = {
        orcamentoCabecalho: orcamentoData,
        // orcamentoDetalhe:  isPedido
        // ? orcamentoDetalheData.filter((detalhe) => selectedExames.includes(detalhe.exameId ?? 0)) // Apenas selecionados
        // : orcamentoDetalheData, // Todos os exames,
        orcamentoDetalhe: orcamentoDetalheData,
        orcamentoPagamento: orcamentoPagamentos,
      };

      // const orcamentoCompletoPedido = {
      //   orcamentoCabecalho: orcamentoData,
      //   orcamentoDetalhe:  orcamentoDetalheData.filter((detalhe) => selectedExames.includes(detalhe.exameId ?? 0)),
      //   orcamentoPagamento: orcamentoPagamentos,
      // };

      try {
        setIsSubmitting(true);        
         if(isPedido){
        //   await axios.post('/api/Pedido', orcamentoCompletoPedido);
         }

        await axios.put('/api/Orcamento', orcamentoCompleto);
        reset();
        onSave();
      } catch (error) {
        console.error(error);
        setSnackbar(new SnackbarState('Erro ao criar o registro!', 'error', true));
      } finally {
        setIsSubmitting(false);
      }
    };    
    
    
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-750 bg-opacity-50 z-50">
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 max-w-6xl w-full bg-white rounded-lg shadow-lg overflow-y-auto max-h-screen">
      <div className="space-y-6">      
      {!loading && (
        <div className="border-b pb-4">
          <OrcamentoClienteForm 
            onClienteSelected={handleClienteSelected} 
            nomePaciente={orcamentoCabecalhoData.nomePaciente || ''}
            pacienteId={`${orcamentoCabecalhoData.pacienteId || ''}`}  /> 
        </div>
      )}
      {!loading && (     
        <div className="border-b pb-4">        
          <OrcamentoConvenioForm             
              onConvenioSelected={handleConvenioSelected} 
              onPlanoSelected={handlePlanoSelected}         
              onUnidadeSelected={handleUnidadeSelected}   
              convenioId= {orcamentoCabecalhoData.convenioId || 0}
              planoId= {orcamentoCabecalhoData.planoId || 0}
              />
        </div>
      )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <input
              type="date"
              {...register('validadeCartao',{
                validate: validateDateEmpty
              }
              )}
              className="border rounded w-full py-1 px-2 text-sm"
              placeholder="Validade Cartão"
            />
          </div>
          <div>
            <input
              type="text"
              {...register('guia')}
              className="border rounded w-full py-1 px-2 text-sm"
              placeholder="Guia"
            />
          </div>          
          <div >
            <input
              type="text"
              {...register('titular')}
              className="border rounded w-full py-1 px-2 text-sm"
              placeholder="Titular"
            />
          </div>      
          <div >
            <input
              type="text"
              {...register('senhaAutorizacao')}
              className="border rounded w-full py-1 px-2 text-sm"
              placeholder="Senha Autorização"
            />
          </div>                
        </div>
        {!loading && (
          <div className="border-b pb-4">
          <OrcamentoExameForm 
              onExameSelected={handleExameSelected} 
              onSolicitanteSelected={handleSolicitanteSelected} 
              planoId={planoId} 
              orcamentoDetalhes={orcamentoDetalhes}
              medicamentosParam={orcamentoCabecalhoData.medicamento || ''} 
              observacoesParam={orcamentoCabecalhoData.observacoes || ''} 
              orcamentoCabecalhoData={orcamentoCabecalhoData}
              solicitanteId={orcamentoCabecalhoData.solicitanteId || 0}
              convenioId={convenioId} 
              />   
          </div>
          )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {!loading && (
            <OrcamentoPagamentosForm  onPagamentosSelected={handlePagamentosSelected}  
                orcamentoPagamentos={orcamentoPagamentos} 
                orcamentoCabecalhoData={orcamentoCabecalhoData}
                total={totalComDesconto}
                />
        )}
        {!loading && (
            <OrcamentoResumoValoresForm 
                subtotal={subtotal} 
                desconto={desconto} 
                total={totalComDesconto}
                isEditable={isDescontoEditable}
                onDescontoChange={onDescontoChange}
                isPercentageRef ={isPercentage}
                />           
        )}
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <button type="button" onClick={onClose} className="w-full sm:w-auto py-2 px-4 rounded bg-gray-500 text-white">
            Cancelar
          </button>
          <button type="submit" className="w-full sm:w-auto py-2 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-500 hover:to-blue-500 transition-all duration-200">
            Salvar
          </button>
        </div>
        </div>
      </form>

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
