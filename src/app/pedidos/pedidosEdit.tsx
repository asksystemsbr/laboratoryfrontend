//src/app/pedidos/pedidosEdit.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { PedidoCabecalho } from '@/models/pedidoCabecalho';
import { SnackbarState } from '@/models/snackbarState';
import PedidoClienteForm from './forms/PedidoClienteForm';
import PedidoConvenioForm from './forms/PedidoConvenioForm';
import { validateDateEmpty } from '@/utils/validateDate';
import PedidoExameForm from './forms/PedidoExameForm';
import PedidoResumoValoresForm from './forms/PedidoResumoValores';
import PedidoPagamentosForm from './forms/PedidoPagamentosForm';
import { useAuth } from '@/app/auth';
import { PedidoDetalhe } from '@/models/pedidoDetalhe';
import { PedidoPagamento } from '@/models/pedidoPagamento';

interface PedidosEditFormProps {
  pedidoCabecalhoData: PedidoCabecalho
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const PedidosEditForm = ({pedidoCabecalhoData, onSave, onClose, setSnackbar }: PedidosEditFormProps) => {
  const { register,handleSubmit, setValue, reset,getValues  } = useForm<PedidoCabecalho>({
    defaultValues: pedidoCabecalhoData,
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

  const [pedidoDetalhes, setPedidoDetalhes] = useState<PedidoDetalhe[]>([]);
  const [pedidoPagamentos, setPedidoPagamentos] = useState<PedidoPagamento[]>([]);
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
      const fetchPedidoCompleto = async () => {
        if (!pedidoCabecalhoData || fetchComplete.current) return; // Fetch only once
        fetchComplete.current = true;

        try {
          const response = await axios.get(`/api/Pedido/getPedidoCompleto/${pedidoCabecalhoData.id}`);
          const { pedidoCabecalho, pedidoDetalhe, pedidoPagamento } = response.data;
  
          reset(pedidoCabecalho); // Preenche o formulário com os dados do cabeçalho

           // Initialize values directly from API response
          const initialIsPercentage = pedidoCabecalho.tipoDesconto === '1';
          isPercentageRef.current = initialIsPercentage; // Set reference to stabilize `isPercentage`
          setIsPercentage(initialIsPercentage);


          setDesconto(pedidoCabecalho.desconto);

          setPedidoDetalhes(pedidoDetalhe);
          setPedidoPagamentos(pedidoPagamento);
  
          // Calcula subtotal e total com base nos detalhes
          const novoSubtotal = pedidoDetalhe.reduce((acc: number, item: PedidoDetalhe) => acc + (item.valor || 0), 0);
          setSubtotal(novoSubtotal);
          //setTotalComDesconto(novoSubtotal - desconto);
          const totalAtualizado = calcularTotalComDesconto(novoSubtotal, pedidoCabecalho.desconto,initialIsPercentage );
          setTotalComDesconto(totalAtualizado);          
          setLoading(false);

          previousPlanoIdRef.current = pedidoCabecalho.planoId || null;
        } catch (error) {
          console.error('Erro ao buscar o pedido completo:', error);
          setSnackbar(new SnackbarState('Erro ao carregar o pedido!', 'error', true));
        }
      };
  
      fetchPedidoCompleto();
    }, [pedidoCabecalhoData.id, reset, setSnackbar]);      
  
  useEffect(() => {
    const checkDescontoPermission = async () => {
      try {
        const response = await axios.get(`/api/Pedido/checkDescontoPermission/${user?.id}`);
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


  const handlePagamentosSelected = (pagamentos: PedidoPagamento[]) => {
    console.log(pagamentos);    
    const pagamentosData = pagamentos.map((pagamento) => ({
      pagamentoId: pagamento.pagamentoId,
      valor: pagamento.valor,
      pedidoId: pedidoCabecalhoData.id,
      id: 0
    }));

    setPedidoPagamentos(pagamentosData);
  };
  
  const validatePedido = (data: PedidoCabecalho, isPedido: boolean): boolean => {
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
  
    if (setPedidoDetalhes.length === 0) {
      setSnackbar(new SnackbarState('O orçamento deve conter pelo menos um item!', 'error', true));
      return false;
    }
  
    if (isPedido) {
      const totalPago = pedidoPagamentos.reduce((acc, pagamento) => acc + (pagamento.valor || 0), 0);
      if (totalPago !== totalComDesconto) {
        setSnackbar(new SnackbarState('O total pago deve ser igual ao total do orçamento!', 'error', true));
        return false;
      }
    }
  
    return true;
  };

  const onSubmit = async (data: PedidoCabecalho) => {
    if (isSubmitting) return;
    if (!validatePedido(data, false)) return; // Valida sem a regra específica para pedidos
  
    await submitPedido(data);
  };

  const submitPedido = async (data: PedidoCabecalho) => {
      const now = new Date();
      now.setHours(now.getHours() - 3); // Ajuste para GMT-3
      const dataHora = now.toISOString().slice(0, 19); // Remove o "Z" para evitar indicação de UTC

      const pedidoData: PedidoCabecalho = {
        ...data,
        usuarioId: user?.id || 0,
        dataHora: dataHora,
        total: totalComDesconto,
        desconto: desconto,
        tipoDesconto: isPercentage ? '1' : '0',
      };

      const pedidoDetalheData = pedidoDetalhes.map((detalhe) => ({
        ...detalhe,
        pedidoId: pedidoCabecalhoData.id,
        id: detalhe.id,
      }));

      const pedidoCompleto = {
        pedidoCabecalho: pedidoData,
        pedidoDetalhe: pedidoDetalheData,
        pedidoPagamento: pedidoPagamentos,
      };

      try {
        setIsSubmitting(true);
        await axios.put('/api/Pedido', pedidoCompleto);
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
      if (!validatePedido(formData, true)) return; // Valida com a regra extra para pedidos
    
      try {
        setIsSubmitting(true);
        //await submitOrcamento(formData);

        // Chamada à API para validação adicional
        const response = await axios.get<string>(`/api/Pedido/validateCreatePedido/${formData.id}`);
        const validationMessage = response.data;

        // Verifica se a mensagem é diferente de vazio
        if (validationMessage) {
          setSnackbar(new SnackbarState(validationMessage, 'error', true));
          return; // Impede que o processo continue
        }

        // Atualiza o status para 2 antes de salvar
        const updatedData: PedidoCabecalho = {
          ...formData,
          status: '2', // Atualiza o status para "Pedido"
        };

        // Salva o orçamento atualizado
        await submitPedido(updatedData);
        setSnackbar(new SnackbarState('Pedido transformado em pedido com sucesso!', 'success', true));
      } catch (error) {
        console.error(error);
        setSnackbar(new SnackbarState('Erro ao transformar o pedido em pedido!', 'error', true));
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
          nomePaciente={pedidoCabecalhoData.nomePaciente || ''}
          pacienteId={`${pedidoCabecalhoData.pacienteId || ''}`}  /> 
      )}
      {!loading && (     
        <PedidoConvenioForm             
            onConvenioSelected={handleConvenioSelected}    
            onUnidadeSelected={handleUnidadeSelected}   
            convenioId= {pedidoCabecalhoData.convenioId || 0}
            planoId= {pedidoCabecalhoData.planoId || 0}
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
              pedidoDetalhes={pedidoDetalhes}
              medicamentosParam={pedidoCabecalhoData.medicamento || ''} 
              observacoesParam={pedidoCabecalhoData.observacoes || ''} 
              pedidoCabecalhoData={pedidoCabecalhoData}
              solicitanteId={pedidoCabecalhoData.solicitanteId || 0}
              />   
          )}
        <div className="grid grid-cols-2 gap-20 mt-1">
        {!loading && (
            <PedidoPagamentosForm  onPagamentosSelected={handlePagamentosSelected}  
                pedidosPagamentos={pedidoPagamentos} 
                pedidoCabecalhoData={pedidoCabecalhoData}
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
