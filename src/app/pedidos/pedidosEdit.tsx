//src/app/orcamentos/orcamentoCreate.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { OrcamentoCabecalho } from '@/models/orcamentoCabecalho';
import { SnackbarState } from '@/models/snackbarState';
import PedidoClienteForm from './forms/PedidoClienteForm';
import PedidoConvenioForm from './forms/PedidoConvenioForm';
import { validateDateEmpty } from '@/utils/validateDate';
import PedidoExameForm from './forms/PedidoExameForm';
import PedidoResumoValoresForm from './forms/PedidoResumoValores';
import PedidoPagamentosForm from './forms/PedidoPagamentosForm';
import { useAuth } from '@/app/auth';
import { OrcamentoDetalhe } from '@/models/orcamentoDetalhe';
import { OrcamentoPagamento } from '@/models/orcamentoPagamento';

interface PedidosEditFormProps {
  orcamentoCabecalhoData: OrcamentoCabecalho
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const PedidosEditForm = ({orcamentoCabecalhoData, onSave, onClose, setSnackbar }: PedidosEditFormProps) => {
  const { register,handleSubmit, setValue, reset,getValues  } = useForm<OrcamentoCabecalho>({
    defaultValues: orcamentoCabecalhoData,
  });
  const auth = useAuth(); // Armazena o contexto inteiro e faz a verificação
  const user = auth?.user; // Verifica se auth é nulo antes de acessar user

  const [isSubmitting, setIsSubmitting] = useState(false);


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
  
          reset(orcamentoCabecalho); // Preenche o formulário com os dados do cabeçalho

           // Initialize values directly from API response
          const initialIsPercentage = orcamentoCabecalho.tipoDesconto === '1';
          isPercentageRef.current = initialIsPercentage; // Set reference to stabilize `isPercentage`
          setIsPercentage(initialIsPercentage);


          setDesconto(orcamentoCabecalho.desconto);

          setOrcamentoDetalhes(orcamentoDetalhe);
          setOrcamentoPagamentos(orcamentoPagamento);
  
          // Calcula subtotal e total com base nos detalhes
          const novoSubtotal = orcamentoDetalhe.reduce((acc: number, item: OrcamentoDetalhe) => acc + (item.valor || 0), 0);
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
        const response = await axios.get(`/api/Orcamento/checkDescontoPermission/${user?.id}`);
        setIsDescontoEditable(response.data);
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
  };


  const handlePagamentosSelected = (pagamentos: OrcamentoPagamento[]) => {
    console.log(pagamentos);
    // Criar lista de `OrcamentoPagamento` a partir dos pagamentos selecionados
    const pagamentosData = pagamentos.map((pagamento) => ({
      pagamentoId: pagamento.pagamentoId,
      valor: pagamento.valor,
      orcamentoId: orcamentoCabecalhoData.id,
      id: 0
    }));

    setOrcamentoPagamentos(pagamentosData);
  };
  
  const validateOrcamento = (data: OrcamentoCabecalho, isPedido: boolean): boolean => {
    if (!data.pacienteId) {
      setSnackbar(new SnackbarState('Paciente é obrigatório!', 'error', true));
      return false;
    }
  
    if (!data.convenioId) {
      setSnackbar(new SnackbarState('Convênio é obrigatório!', 'error', true));
      return false;
    }
  
    if (!data.nomePaciente) {
      setSnackbar(new SnackbarState('Nome do paciente é obrigatório!', 'error', true));
      return false;
    }
  
    if (!data.solicitanteId) {
      setSnackbar(new SnackbarState('Solicitante é obrigatório!', 'error', true));
      return false;
    }
  
    if (!data.planoId) {
      setSnackbar(new SnackbarState('Plano é obrigatório!', 'error', true));
      return false;
    }
  
    if (orcamentoDetalhes.length === 0) {
      setSnackbar(new SnackbarState('O orçamento deve conter pelo menos um item!', 'error', true));
      return false;
    }
  
    if (isPedido) {
      const totalPago = orcamentoPagamentos.reduce((acc, pagamento) => acc + (pagamento.valor || 0), 0);
      if (totalPago !== totalComDesconto) {
        setSnackbar(new SnackbarState('O total pago deve ser igual ao total do orçamento!', 'error', true));
        return false;
      }
    }
  
    return true;
  };

  const onSubmit = async (data: OrcamentoCabecalho) => {
    if (isSubmitting) return;
    if (!validateOrcamento(data, false)) return; // Valida sem a regra específica para pedidos
  
    await submitOrcamento(data);
  };

  const submitOrcamento = async (data: OrcamentoCabecalho) => {
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
        orcamentoDetalhe: orcamentoDetalheData,
        orcamentoPagamento: orcamentoPagamentos,
      };

      try {
        setIsSubmitting(true);
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

    const transformarEmPedido = async () => {
      const formData = getValues(); // Obtém os valores atuais do formulário
      if (!validateOrcamento(formData, true)) return; // Valida com a regra extra para pedidos
    
      try {
        setIsSubmitting(true);
        //await submitOrcamento(formData);

        // Chamada à API para validação adicional
        const response = await axios.get<string>(`/api/Orcamento/validateCreatePedido/${formData.id}`);
        const validationMessage = response.data;

        // Verifica se a mensagem é diferente de vazio
        if (validationMessage) {
          setSnackbar(new SnackbarState(validationMessage, 'error', true));
          return; // Impede que o processo continue
        }

        // Atualiza o status para 2 antes de salvar
        const updatedData: OrcamentoCabecalho = {
          ...formData,
          status: '2', // Atualiza o status para "Pedido"
        };

        // Salva o orçamento atualizado
        await submitOrcamento(updatedData);
        setSnackbar(new SnackbarState('Orçamento transformado em pedido com sucesso!', 'success', true));
      } catch (error) {
        console.error(error);
        setSnackbar(new SnackbarState('Erro ao transformar o orçamento em pedido!', 'error', true));
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 max-w-7xl w-full bg-white rounded-lg shadow-lg overflow-y-auto max-h-screen">
      {!loading && (
        <PedidoClienteForm 
          onClienteSelected={handleClienteSelected} 
          nomePaciente={orcamentoCabecalhoData.nomePaciente || ''}
          pacienteId={`${orcamentoCabecalhoData.pacienteId || ''}`}  /> 
      )}
      {!loading && (     
        <PedidoConvenioForm             
            onConvenioSelected={handleConvenioSelected}    
            onUnidadeSelected={handleUnidadeSelected}   
            convenioId= {orcamentoCabecalhoData.convenioId || 0}
            planoId= {orcamentoCabecalhoData.planoId || 0}
            />
      )}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="basis-2/12">
            <input
              type="date"
              {...register('validadeCartao',{
                validate: validateDateEmpty
              }
              )}
              className="border rounded w-full py-1 px-2 text-sm"
              placeholder="Validade Cartão"
              disabled
            />
          </div>
          <div className="basis-2/12">
            <input
              type="text"
              {...register('guia')}
              className="border rounded w-full py-1 px-2 text-sm"
              placeholder="Guia"
              disabled
            />
          </div>          
          <div className="basis-5/12">
            <input
              type="text"
              {...register('titular')}
              className="border rounded w-full py-1 px-2 text-sm"
              placeholder="Titular"
              disabled
            />
          </div>      
          <div className="basis-2/12 flex-grow">
            <input
              type="text"
              {...register('senhaAutorizacao')}
              className="border rounded w-full py-1 px-2 text-sm"
              placeholder="Senha Autorização"
              disabled
            />
          </div>                
        </div>
        {!loading && (
          <PedidoExameForm 
              onSolicitanteSelected={handleSolicitanteSelected} 
              orcamentoDetalhes={orcamentoDetalhes}
              medicamentosParam={orcamentoCabecalhoData.medicamento || ''} 
              observacoesParam={orcamentoCabecalhoData.observacoes || ''} 
              orcamentoCabecalhoData={orcamentoCabecalhoData}
              solicitanteId={orcamentoCabecalhoData.solicitanteId || 0}
              />   
          )}
        <div className="grid grid-cols-2 gap-20 mt-1">
        {!loading && (
            <PedidoPagamentosForm  onPagamentosSelected={handlePagamentosSelected}  
                orcamentoPagamentos={orcamentoPagamentos} 
                orcamentoCabecalhoData={orcamentoCabecalhoData}
                />
        )}
        {!loading && (
            <PedidoResumoValoresForm 
                subtotal={subtotal} 
                desconto={desconto} 
                total={totalComDesconto}
                isEditable={isDescontoEditable}
                onDescontoChange={onDescontoChange}
                isPercentageRef ={isPercentage}
                />           
        )}
          </div>
        <div className="buttons text-center mt-8">
          <button type="button" onClick={onClose} className="mr-2 py-2 px-4 rounded bg-gray-500 text-white">
            Cancelar
          </button>
          {/* <button type="submit" className="mr-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-500 hover:to-blue-500 transition-all duration-200">
            Salvar
          </button> */}
          <button 
            type="button" 
            onClick={transformarEmPedido}
            className="mr-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-500 hover:to-blue-500 transition-all duration-200"
            >
            Gerar NFSe
          </button>
        </div>
      </form>
    </div>
  );
};
