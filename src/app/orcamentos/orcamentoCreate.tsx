//src/app/orcamentos/orcamentoCreate.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { OrcamentoCabecalho } from '@/models/orcamentoCabecalho';
import { SnackbarState } from '@/models/snackbarState';
import OrcamentoClienteForm from './forms/OrcamentoClienteForm';
import OrcamentoConvenioForm from './forms/OrcamentoConvenioForm';
import { validateDate } from '@/utils/validateDate';
import OrcamentoExameForm from './forms/OrcamentoExameForm';
import { Exame } from '@/models/exame';
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
  const { register,handleSubmit, setValue, reset } = useForm<OrcamentoCabecalho>();
  const auth = useAuth(); // Armazena o contexto inteiro e faz a verificação
  const user = auth?.user; // Verifica se auth é nulo antes de acessar user

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planoId, setPlanoId] = useState<number | null>(null);

  const [subtotal, setSubtotal] = useState(0);
  const [desconto] = useState(0); // Adicione lógica para desconto se necessário
  const [total, setTotal] = useState(0);

  const [orcamentoDetalhes, setOrcamentoDetalhes] = useState<OrcamentoDetalhe[]>([]);
  const [orcamentoPagamentos, setOrcamentoPagamentos] = useState<OrcamentoPagamento[]>([]);

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

  const handlePlanoSelected = (id: number | null) => {
    setValue('planoId', id || 0);
    setPlanoId(id);
  };

  const handleExameSelected = (exames: Exame[],observacoes: string |null, medicamento: string | null) => {

    // Calcular subtotal com base nos preços dos exames
    const novoSubtotal = exames.reduce((acc, exame) => acc + (exame.preco || 0), 0);
    setSubtotal(novoSubtotal);

    // Calcular total com base no subtotal e desconto
    setTotal(novoSubtotal - desconto);

    setValue('observacoes', observacoes || '');
    setValue('medicamento', medicamento || '');

    const detalhes = exames.map((exame) => ({
      exameId: exame.id,
      valor: exame.preco,
      dataColeta: new Date() // ou alguma outra data relacionada
    }));

    setOrcamentoDetalhes(detalhes);
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
  
  const onSubmit = async (data: OrcamentoCabecalho) => {
    if (isSubmitting) return;
    const orcamentoData: OrcamentoCabecalho = {
      ...data,
      usuarioId: user?.id || 0,
      recepcaoId: parseInt(user?.unidadeId || '0', 10),
      status: '1',
      dataHora: new Date().toISOString().split('T')[0],
      total
    };

    const orcamentoDetalheData = orcamentoDetalhes.map((detalhe) => ({
      ...detalhe,
      id: 0,
      orcamentoId:  0 
    }));

    // Preparar o objeto final que contém cabeçalho, detalhes e pagamentos
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
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 max-w-7xl w-full bg-white rounded-lg shadow-lg overflow-y-auto max-h-screen">
        <OrcamentoClienteForm 
          onClienteSelected={handleClienteSelected}
          nomePaciente={''}
          pacienteId={ ''}  />
        <OrcamentoConvenioForm 
            onSolicitanteSelected={handleSolicitanteSelected} 
            onConvenioSelected={handleConvenioSelected} 
            onPlanoSelected={handlePlanoSelected}
            solicitanteId= {undefined}
            convenioId= {undefined}
            planoId= {undefined}
            />
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="basis-2/12">
            <input
              type="date"
              {...register('validadeCartao',{
                validate: validateDate
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
        <OrcamentoExameForm onExameSelected={handleExameSelected} planoId={planoId}  />       
        <div className="grid grid-cols-2 gap-20 mt-1">
            <OrcamentoPagamentosForm  onPagamentosSelected={handlePagamentosSelected}/>
            <OrcamentoResumoValoresForm subtotal={subtotal} desconto={desconto} total={total}/>           
          </div>
        <div className="buttons text-center mt-8">
          <button type="button" onClick={onClose} className="mr-2 py-2 px-4 rounded bg-gray-500 text-white">
            Cancelar
          </button>
          <button type="submit" className="mr-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-500 hover:to-blue-500 transition-all duration-200">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};
