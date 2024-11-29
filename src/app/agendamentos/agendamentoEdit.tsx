//src/app/agendamentos/agendamentoEdit.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { AgendamentoCabecalho } from '@/models/agendamentoCabecalho';
import { SnackbarState } from '@/models/snackbarState';
import AgendamentoClienteForm from './forms/AgendamentoClienteForm';
import AgendamentoConvenioForm from './forms/AgendamentoConvenioForm';
import { validateDateEmpty } from '@/utils/validateDate';
import AgendamentoExameForm from './forms/AgendamentoExameForm';
import AgendamentoResumoValoresForm from './forms/AgendamentoResumoValores';
import AgendamentoPagamentosForm from './forms/AgendamentoPagamentosForm';
import { useAuth } from '@/app/auth';
import { AgendamentoDetalhe } from '@/models/agendamentoDetalhe';
import { AgendamentoPagamento } from '@/models/agendamentoPagamento';

interface AgendamentoCreateFormProps {
  agendamentoCabecalhoData: AgendamentoCabecalho
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const AgendamentoEditForm = ({agendamentoCabecalhoData, onSave, onClose, setSnackbar }: AgendamentoCreateFormProps) => {
  const { register,handleSubmit, setValue, reset,getValues  } = useForm<AgendamentoCabecalho>({
    defaultValues: agendamentoCabecalhoData,
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

  const [agendamentoDetalhes, setAgendamentoDetalhes] = useState<AgendamentoDetalhe[]>([]);
  const [agendamentoPagamentos, setAgendamentoPagamentos] = useState<AgendamentoPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchComplete = useRef(false);

  const isPercentageRef = useRef<boolean>(false); 

  const previousPlanoIdRef = useRef<number | null>(null);

// Memoize the discount calculation function
  const calcularTotalComDesconto = useCallback((subtotal: number, desconto: number, isPercentage: boolean) => {
    return isPercentage ? subtotal - ((subtotal * desconto) / 100) : subtotal - desconto;
  }, []);

    
    useEffect(() => {
      const fetchAgendamentoCompleto = async () => {
        if (!agendamentoCabecalhoData || fetchComplete.current) return; // Fetch only once
        fetchComplete.current = true;

        try {
          const response = await axios.get(`/api/Agendamento/getAgendamentoCompleto/${agendamentoCabecalhoData.id}`);
          const { agendamentoCabecalho, agendamentoDetalhe, agendamentoPagamento } = response.data;
  
          reset(agendamentoCabecalho); // Preenche o formulário com os dados do cabeçalho

           // Initialize values directly from API response
          const initialIsPercentage = agendamentoCabecalho.tipoDesconto === '1';
          isPercentageRef.current = initialIsPercentage; // Set reference to stabilize `isPercentage`
          setIsPercentage(initialIsPercentage);


          setDesconto(agendamentoCabecalho.desconto);

          setAgendamentoDetalhes(agendamentoDetalhe);
          setAgendamentoPagamentos(agendamentoPagamento);
  
          // Calcula subtotal e total com base nos detalhes
          const novoSubtotal = agendamentoDetalhe.reduce((acc: number, item: AgendamentoDetalhe) => acc + (item.valor || 0), 0);
          setSubtotal(novoSubtotal);
          //setTotalComDesconto(novoSubtotal - desconto);
          const totalAtualizado = calcularTotalComDesconto(novoSubtotal, agendamentoCabecalho.desconto,initialIsPercentage );
          setTotalComDesconto(totalAtualizado);          
          setLoading(false);

          previousPlanoIdRef.current = agendamentoCabecalho.planoId || null;
        } catch (error) {
          console.error('Erro ao buscar o agendamento completo:', error);
          setSnackbar(new SnackbarState('Erro ao carregar o agendamento!', 'error', true));
        }
      };
  
      fetchAgendamentoCompleto();
    }, [agendamentoCabecalhoData.id, reset, setSnackbar]);      
  
  useEffect(() => {
    const checkDescontoPermission = async () => {
      try {
        const response = await axios.get(`/api/Agendamento/checkDescontoPermission/${user?.id}`);
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
    setConvenioId(id);
  };

  const handlePlanoSelected = async  (id: number | null) => {
    setValue('planoId', id || 0);
    setPlanoId(id);

  // Se `id` for nulo ou indefinido, resetar os preços para 0
  if (!id) {
    const updatedDetalhes = agendamentoDetalhes.map((detalhe) => ({
      ...detalhe,
      valor: 0,
    }));

    setAgendamentoDetalhes(updatedDetalhes);

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
        agendamentoDetalhes.map(async (detalhe) => {
          const precoResponse = await axios.get(`/api/Exame/getPrecoByPlanoExameId/${id}/${detalhe.exameId}`);
          const preco = precoResponse.data?.preco || 0;
          return { ...detalhe, valor: preco };
        })
      );

      setAgendamentoDetalhes(updatedDetalhes);

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

  const handleExameSelected = (detalhesAgendamento: AgendamentoDetalhe[],observacoes: string |null, medicamento: string | null) => {

    // Calcular subtotal com base nos preços dos exames
    const novoSubtotal = detalhesAgendamento.reduce((acc, detalhe) => acc + (detalhe.valor || 0), 0);
    setSubtotal(novoSubtotal);

    // Calcular total com base no subtotal e desconto
    const totalAtualizado = calcularTotalComDesconto(subtotal, desconto, isPercentage);
    setTotalComDesconto(totalAtualizado);
    //setTotalComDesconto(novoSubtotal - desconto);

    setValue('observacoes', observacoes || '');
    setValue('medicamento', medicamento || '');

    const detalhes = detalhesAgendamento.map((detalhe) => ({
      exameId: detalhe.exameId,
      valor: detalhe.valor,
      dataColeta: detalhe.dataColeta,
      agendamentoId:agendamentoCabecalhoData.id,
      id: detalhe.id,
      horarioId: detalhe.horarioId
    }));

    setAgendamentoDetalhes(detalhes);
  };

  const handlePagamentosSelected = (pagamentos: AgendamentoPagamento[]) => {
    console.log(pagamentos);

    const pagamentosData = pagamentos.map((pagamento) => ({
      pagamentoId: pagamento.pagamentoId,
      valor: pagamento.valor,
      agendamentoId: agendamentoCabecalhoData.id,
      id: 0
    }));

    setAgendamentoPagamentos(pagamentosData);
  };
  
  const validateAgendamento = (data: AgendamentoCabecalho, isPedido: boolean): boolean => {
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
  
    if (agendamentoDetalhes.length === 0) {
      setSnackbar(new SnackbarState('O agendamento deve conter pelo menos um item!', 'error', true));
      return false;
    }
  
    if (isPedido) {
      const totalPago = agendamentoPagamentos.reduce((acc, pagamento) => acc + (pagamento.valor || 0), 0);
      if (totalPago !== totalComDesconto) {
        setSnackbar(new SnackbarState('O total pago deve ser igual ao total do agendamento!', 'error', true));
        return false;
      }
    }
  
    return true;
  };

  const onSubmit = async (data: AgendamentoCabecalho) => {
    if (isSubmitting) return;
    if (!validateAgendamento(data, false)) return; // Valida sem a regra específica para pedidos
  
    // Chamada à API para validação adicional
    const response = await axios.get<string>(`/api/Agendamento/validateCreateBudget/${data.id}`);
    const validationMessage = response.data;

    // Verifica se a mensagem é diferente de vazio
    if (validationMessage) {
      setSnackbar(new SnackbarState(validationMessage, 'error', true));
      return; // Impede que o processo continue
    }
    await submitAgendamento(data,false);
  };

  const submitAgendamento = async (data: AgendamentoCabecalho,isPedido: boolean) => {
      const now = new Date();
      now.setHours(now.getHours() - 3); // Ajuste para GMT-3
      const dataHora = now.toISOString().slice(0, 19); // Remove o "Z" para evitar indicação de UTC

      const agendamentoData: AgendamentoCabecalho = {
        ...data,
        usuarioId: user?.id || 0,
        dataHora: dataHora,
        total: totalComDesconto,
        desconto: desconto,
        tipoDesconto: isPercentage ? '1' : '0',
      };

      const agendamentoDetalheData = agendamentoDetalhes.map((detalhe) => ({
        ...detalhe,
        agendamentoId: agendamentoCabecalhoData.id,
        id: detalhe.id,
      }));

      const agendamentoCompleto = {
        agendamentoCabecalho: agendamentoData,
        agendamentoDetalhe: agendamentoDetalheData,
        agendamentoPagamento: agendamentoPagamentos,
      };

      try {
        setIsSubmitting(true);
        await axios.put('/api/Agendamento', agendamentoCompleto);
        if(isPedido){
          await axios.post('/api/Agendamento/exportToBudget', agendamentoCompleto);
        }
        reset();
        onSave();
      } catch (error) {
        console.error(error);
        setSnackbar(new SnackbarState('Erro ao criar o registro!', 'error', true));
      } finally {
        setIsSubmitting(false);
      }
    };

    const transformarEmOrcamento = async () => {
      const formData = getValues(); // Obtém os valores atuais do formulário
      if (!validateAgendamento(formData, true)) return; // Valida com a regra extra para pedidos
    
      try {
        setIsSubmitting(true);
        

        // Chamada à API para validação adicional
        const response = await axios.get<string>(`/api/Agendamento/validateCreateBudget/${formData.id}`);
        const validationMessage = response.data;

        // Verifica se a mensagem é diferente de vazio
        if (validationMessage) {
          setSnackbar(new SnackbarState(validationMessage, 'error', true));
          return; // Impede que o processo continue
        }

        // Atualiza o status para 2 antes de salvar
        const updatedData: AgendamentoCabecalho = {
          ...formData,
          status: '2', // Atualiza o status para "Pedido"
        };

        // Salva o orçamento atualizado
        await submitAgendamento(updatedData,true);
        setSnackbar(new SnackbarState('Agendamento transformado em orçamento com sucesso!', 'success', true));
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
        <AgendamentoClienteForm 
          onClienteSelected={handleClienteSelected} 
          nomePaciente={agendamentoCabecalhoData.nomePaciente || ''}
          pacienteId={`${agendamentoCabecalhoData.pacienteId || ''}`}  /> 
      )}
      {!loading && (     
        <AgendamentoConvenioForm             
            onConvenioSelected={handleConvenioSelected} 
            onPlanoSelected={handlePlanoSelected}         
            onUnidadeSelected={handleUnidadeSelected}   
            convenioId= {agendamentoCabecalhoData.convenioId || 0}
            planoId= {agendamentoCabecalhoData.planoId || 0}
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
            />
          </div>
          <div className="basis-2/12">
            <input
              type="text"
              {...register('guia')}
              className="border rounded w-full py-1 px-2 text-sm"
              placeholder="Guia"
            />
          </div>          
          <div className="basis-5/12">
            <input
              type="text"
              {...register('titular')}
              className="border rounded w-full py-1 px-2 text-sm"
              placeholder="Titular"
            />
          </div>      
          <div className="basis-2/12 flex-grow">
            <input
              type="text"
              {...register('senhaAutorizacao')}
              className="border rounded w-full py-1 px-2 text-sm"
              placeholder="Senha Autorização"
            />
          </div>                
        </div>
        {!loading && (
          <AgendamentoExameForm 
              onExameSelected={handleExameSelected} 
              onSolicitanteSelected={handleSolicitanteSelected} 
              planoId={planoId} 
              agendamentoDetalhes={agendamentoDetalhes}
              medicamentosParam={agendamentoCabecalhoData.medicamento || ''} 
              observacoesParam={agendamentoCabecalhoData.observacoes || ''} 
              agendamentoCabecalhoData={agendamentoCabecalhoData}
              solicitanteId={agendamentoCabecalhoData.solicitanteId || 0}
              convenioId={convenioId} 
              />   
          )}
        <div className="grid grid-cols-2 gap-20 mt-1">
        {!loading && (
            <AgendamentoPagamentosForm  onPagamentosSelected={handlePagamentosSelected}  
                agendamentoPagamentos={agendamentoPagamentos} 
                agendamentoCabecalhoData={agendamentoCabecalhoData}
                total={totalComDesconto}
                />
        )}
        {!loading && (
            <AgendamentoResumoValoresForm 
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
          <button 
            type="submit" 
            className="mr-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-500 hover:to-blue-500 transition-all duration-200"
            >
            Salvar
          </button>
          <button 
            type="button" 
            onClick={transformarEmOrcamento}
             className="mr-2 py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-200"
            >
            Transformar em Orçamento
          </button>
        </div>
      </form>
    </div>
  );
};
