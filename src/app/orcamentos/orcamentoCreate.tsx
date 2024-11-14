//src/app/orcamentos/orcamentoCreate.tsx
import React, { useEffect, useRef, useState } from 'react';
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
import { FormaPagamento } from '@/models/formaPagamento';
import { useAuth } from '@/app/auth';
import { OrcamentoDetalhe } from '@/models/orcamentoDetalhe';
import { OrcamentoPagamento } from '@/models/orcamentoPagamento';

interface OrcamentoCreateFormProps {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const OrcamentoCreateForm = ({ onSave, onClose, setSnackbar }: OrcamentoCreateFormProps) => {
  const { register, setValue, reset,getValues  } = useForm<OrcamentoCabecalho>();
  const auth = useAuth(); // Armazena o contexto inteiro e faz a verificação
  const user = auth?.user; // Verifica se auth é nulo antes de acessar user

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planoId, setPlanoId] = useState<number | null>(null);

  const [subtotal, setSubtotal] = useState(0);
  const [desconto,setDesconto] = useState(0); // Adicione lógica para desconto se necessário
  const [isPercentage, setIsPercentage] = useState(false);
  const [totalComDesconto, setTotalComDesconto] = useState(0);
  const [isDescontoEditable, setIsDescontoEditable] = useState(false);

  const [orcamentoDetalhes, setOrcamentoDetalhes] = useState<OrcamentoDetalhe[]>([]);
  const [orcamentoPagamentos, setOrcamentoPagamentos] = useState<OrcamentoPagamento[]>([]);
  const previousPlanoIdRef = useRef<number | null>(null);

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

  const calcularTotalComDesconto = (subtotal: number, desconto: number, isPercentage: boolean) => {
    return isPercentage ? subtotal - ((subtotal * desconto) / 100) : subtotal - desconto;
  };



  useEffect(() => {
    const totalAtualizado = calcularTotalComDesconto(subtotal, desconto, isPercentage);
    //setTotalComDesconto(Math.max(totalAtualizado, 0));
    setTotalComDesconto(totalAtualizado);
  }, [subtotal, desconto, isPercentage]);

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

  const handleConvenioSelected = (id: number | null, codConvenio: string | null) => {
    setValue('convenioId', id || 0);
    setValue('codConvenio', codConvenio || '');
  };

  const handlePlanoSelected = async (id: number | null) => {
    setValue('planoId', id || 0);
    setPlanoId(id);

    if (!id || id === previousPlanoIdRef.current) return;

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

  const handleExameSelected = (detalhesOrcamento: OrcamentoDetalhe[],observacoes: string |null, medicamento: string | null) => {

    // Calcular subtotal com base  nos preços dos exames
    const novoSubtotal = detalhesOrcamento.reduce((acc, detalhe) => acc + (detalhe.valor || 0), 0);

    if (subtotal !== novoSubtotal) {
      setSubtotal(novoSubtotal);
    
      // Calcular total com base no subtotal e desconto
      //setTotal(novoSubtotal - desconto);

      const totalAtualizado = calcularTotalComDesconto(subtotal, desconto, isPercentage);
      setTotalComDesconto(totalAtualizado);
    }

    // Atualizar observações e medicamento se eles realmente mudaram
    if (getValues('observacoes') !== observacoes) {
      setValue('observacoes', observacoes || '');
    }
    if (getValues('medicamento') !== medicamento) {
      setValue('medicamento', medicamento || '');
    }

    const detalhes = detalhesOrcamento.map((detalhe) => ({
      exameId: detalhe.exameId,
      valor: detalhe.valor,
      dataColeta: new Date() // ou alguma outra data relacionada
    }));

    // Apenas atualize orcamentoDetalhes se os valores mudarem
    if (JSON.stringify(orcamentoDetalhes) !== JSON.stringify(detalhes)) {
      setOrcamentoDetalhes(detalhes);
    }
  };

  const handlePagamentosSelected = (pagamentos: FormaPagamento[]) => {
    console.log(pagamentos);
    // Criar lista de `OrcamentoPagamento` a partir dos pagamentos selecionados
    const pagamentosData = pagamentos.map((pagamento) => ({
      pagamentoId: pagamento.id,
      valor: pagamento.valor
    }));

    setOrcamentoPagamentos(pagamentosData);
  };
  
  const submitOrcamento = async () => {
    if (isSubmitting) return;

    const data = getValues();  // Pega valores atuais do formulário
    const now = new Date();
    now.setHours(now.getHours() - 3); // Adjust to GMT-3

    const dataHora = now.toISOString().slice(0, 19); // Remove the "Z" to avoid UTC indication.

    const orcamentoData: OrcamentoCabecalho = {
      ...data,
      usuarioId: user?.id || 0,
      recepcaoId: parseInt(user?.unidadeId || '0', 10),
      status: '1',
      dataHora: dataHora,
      total:totalComDesconto,
      validadeCartao: data.validadeCartao || undefined,
      desconto:desconto,
      tipoDesconto: isPercentage ? '1': '0',
      observacoes: getValues('observacoes'),
      medicamento: getValues('medicamento')
    };

    const orcamentoDetalheData = orcamentoDetalhes.map((detalhe) => ({
      ...detalhe,
      id: 0,
      orcamentoId: 0 
    }));

    const orcamentoCompleto = {
      orcamentoCabecalho: orcamentoData,
      orcamentoDetalhe: orcamentoDetalheData,
      orcamentoPagamento: orcamentoPagamentos
    };

    try {
      setIsSubmitting(true);
      await axios.post('/api/Orcamento', orcamentoCompleto);
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
      <form className="p-4 max-w-6xl w-full bg-white rounded-lg shadow-lg overflow-y-auto max-h-screen">
        <OrcamentoClienteForm 
          onClienteSelected={handleClienteSelected}
          nomePaciente={''}
          pacienteId={ ''}  />
        <OrcamentoConvenioForm             
            onConvenioSelected={handleConvenioSelected} 
            onPlanoSelected={handlePlanoSelected}            
            convenioId= {undefined}
            planoId= {undefined}
            />
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
        <OrcamentoExameForm 
              onExameSelected={handleExameSelected} 
              onSolicitanteSelected={handleSolicitanteSelected} 
              planoId={planoId} 
              orcamentoDetalhes={orcamentoDetalhes}
              medicamentosParam= ''
              observacoesParam= ''
              orcamentoCabecalhoData= {undefined}
              solicitanteId= {undefined}
              />     
        <div className="grid grid-cols-2 gap-20 mt-1">
            <OrcamentoPagamentosForm  
                onPagamentosSelected={handlePagamentosSelected} 
                total={totalComDesconto}
                />
            <OrcamentoResumoValoresForm 
                subtotal={subtotal} 
                desconto={desconto} 
                total={totalComDesconto}
                isEditable={isDescontoEditable}
                onDescontoChange={onDescontoChange}
                isPercentageRef={isPercentage}
                />           
          </div>
        <div className="buttons text-center mt-8">
          <button type="button" onClick={onClose} className="mr-2 py-2 px-4 rounded bg-gray-500 text-white">
            Cancelar
          </button>
          <button type="button" onClick={submitOrcamento} className="mr-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-500 hover:to-blue-500 transition-all duration-200">
            Salvar
          </button>
          <button type="button"  className="mr-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-500 hover:to-blue-500 transition-all duration-200">
            OCR
          </button>
        </div>
      </form>
    </div>
  );
};
