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
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Para criar tabelas facilmente

interface OrcamentoCreateFormProps {
  orcamentoCabecalhoData: OrcamentoCabecalho
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const OrcamentoEditForm = ({orcamentoCabecalhoData, onSave, onClose, setSnackbar }: OrcamentoCreateFormProps) => {
  const { register,handleSubmit, setValue, reset,getValues  } = useForm<OrcamentoCabecalho>({
    defaultValues: orcamentoCabecalhoData,
  });
  const auth = useAuth(); // Armazena o contexto inteiro e faz a verificação
  const user = auth?.user; // Verifica se auth é nulo antes de acessar user

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planoId, setPlanoId] = useState<number | null>(null);

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

  const handleExameSelected = (detalhesOrcamento: OrcamentoDetalhe[],observacoes: string |null, medicamento: string | null) => {

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
      id: detalhe.id
    }));

    setOrcamentoDetalhes(detalhes);
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
        orcamentoDetalhe: orcamentoDetalheData,
        orcamentoPagamento: orcamentoPagamentos,
      };

      try {
        setIsSubmitting(true);
        await axios.put('/api/Orcamento', orcamentoCompleto);
        if(isPedido){
          await axios.post('/api/Pedido', orcamentoCompleto);
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

    const transformarEmPedido = async () => {
      const formData = getValues(); // Obtém os valores atuais do formulário
      if (!validateOrcamento(formData, true)) return; // Valida com a regra extra para pedidos
    
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
        const updatedData: OrcamentoCabecalho = {
          ...formData,
          status: '2', // Atualiza o status para "Pedido"
        };

        // Salva o orçamento atualizado
        await submitOrcamento(updatedData,true);
        setSnackbar(new SnackbarState('Orçamento transformado em pedido com sucesso!', 'success', true));
      } catch (error) {
        console.error(error);
        setSnackbar(new SnackbarState('Erro ao transformar o orçamento em pedido!', 'error', true));
      } finally {
        setIsSubmitting(false);
      }
    };

  
    const gerarPDF = async () => {
      const doc = new jsPDF();
    
      try {
        const pageWidth = doc.internal.pageSize.getWidth(); // Largura da página
        const pageHeight = doc.internal.pageSize.getHeight(); // Altura da página

        // Buscar dados do laboratório com base na recepção
        const recepcaoId = orcamentoCabecalhoData.recepcaoId;
        const laboratorioData = await axios.get(`/api/Recepcao/${recepcaoId}`).then(res => res.data);
        const logoPath = `/imgs/recepcao_${recepcaoId}.jpg`; // Caminho fixo da imagem
        //const endereco = laboratorioData.endereco || 'Endereço não disponível';
        const rodape = laboratorioData.rodapeOrcamento || '';
        const horarios = laboratorioData.cabecalhoOrcamento || ''; // Horários de atendimento das unidades
    
        // Carregar imagem diretamente do caminho fixo
        const logoImg = await fetch(logoPath).then(res => res.blob()).then(blob => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string); // Garantir que o resultado seja uma string
            reader.readAsDataURL(blob);
          });
        });
    
        // Função para adicionar cabeçalho
        const addCabecalho = () => {
          // Adicionar imagem no cabeçalho
          doc.addImage(logoImg, 'JPEG', 10, 10, 180, 20);

          // Adicionar informações do orçamento
          const dataHoraOrcamento = new Date(orcamentoCabecalhoData.dataHora || '').toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          const nomePaciente = orcamentoCabecalhoData.nomePaciente || 'N/A';
          const numeroOrcamento = orcamentoCabecalhoData.id || 'N/A';

          doc.setFontSize(12);
          doc.text(`NOME: ${nomePaciente}`, 10, 40);
          doc.text(`ORÇAMENTO Nº: ${numeroOrcamento} - ${dataHoraOrcamento}`, 10, 45);

          doc.setFontSize(10);
          doc.text('___________________________________________________________________________________________', 10, 50);
        };

        // Função para adicionar rodapé
        const addRodape = () => {
          doc.text('__________________________________________________________________________________________', 10, pageHeight - 20, { maxWidth: 190 });
          doc.text(rodape, 10, pageHeight - 15, { maxWidth: 190 });
        };

        // Adicionar cabeçalho na primeira página
        addCabecalho();
  
        doc.setFont('helvetica', 'bold'); // Fonte em negrito
        doc.text('GARANTIA DE QUALIDADE',  pageWidth / 2, 55,{ align: 'center' });

        // Resetar fonte para normal após o título
        doc.setFont('helvetica', 'normal');
        doc.text(
          'Garantimos a qualidade dos melhores laboratórios do país para seus exames de Análises Clínicas. Porém, ' +
          'a falta do preparo correto pode causar falsas dosagens, por interferências. Em caso de dúvidas quanto aos preparos, ' +
          'entre em contato conosco.',
          10,
          60,
          { maxWidth: 190 }
        );
    
        // Adicionar horários de atendimento
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold'); // Fonte em negrito
        doc.text('ANÁLISES CLÍNICAS - HORÁRIO DE ATENDIMENTO DAS UNIDADES', pageWidth / 2, 75,{ align: 'center' });
         // Resetar fonte para normal após o título
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(horarios, 10, 80, { maxWidth: 190 });
    
        // Adicionar tabela de exames
        const examesPromises = orcamentoDetalhes.map(detalhe =>
          axios.get(`/api/Exame/${detalhe.exameId}`).then(res => res.data.nomeExame || 'Exame desconhecido')
        );
        const nomesExames = await Promise.all(examesPromises);
            // Dividir exames em duas colunas
        const rows = [];
        for (let i = 0; i < nomesExames.length; i += 2) {
          rows.push([
            nomesExames[i] || '', // Primeira coluna
            nomesExames[i + 1] || '', // Segunda coluna (pode estar vazia)
          ]);
        }

        const head = [['Exame a Realizar']];
        // const body = orcamentoDetalhes.map((detalhe, index) => [
        //   nomesExames[index]
        // ]);
    
        doc.autoTable({
          startY: 100,
          head: head,
          body: rows,
          theme: 'grid',
          styles: { fontSize: 10 }, // Ajuste de tamanho de fonte
          //headStyles: { fillColor: [230, 230, 230] }, // Cabeçalho com fundo cinza claro
          didDrawPage: (data) => {
            if (data.pageNumber > 1) {
              addCabecalho(); // Adicionar cabeçalho em páginas subsequentes
            }
            addRodape(); // Adicionar rodapé em todas as páginas
          },
        });
    
        // Adicionar resumo
        const startY = doc.lastAutoTable.finalY + 10;

        doc.text('___________________________________________________________________________________________', 10, startY + 5);

        // const safeSubtotal = subtotal != null ? subtotal : 0; // Default 0 se subtotal for null/undefined
        // const safeDesconto = desconto != null ? desconto : 0; // Default 0 se desconto for null/undefined
        const safeTotalComDesconto = totalComDesconto != null ? totalComDesconto : 0; // Default 0 se totalComDesconto for null/undefined
        // doc.text(`Subtotal: R$ ${safeSubtotal.toFixed(2)}`, 10, startY);
        // doc.text(
        //   `Desconto: ${isPercentage ? `${safeDesconto}%` : `R$ ${safeDesconto.toFixed(2)}`}`,
        //   10,
        //   startY + 10
        // );
        doc.setFont('helvetica', 'bold'); // Fonte em negrito
        doc.text(`Total : R$ ${safeTotalComDesconto.toFixed(2)} (Cobrimos qualquer orçamento)`, 10, startY + 10);
        doc.setFont('helvetica', 'normal');

        doc.text('___________________________________________________________________________________________', 10, startY + 15);
            
        // Adicionar preparo e orientações
        const preparo = orcamentoCabecalhoData.medicamento || 'Não informado';
        const orientacoes = orcamentoCabecalhoData.observacoes || 'Não informado';
    
        const startYPreparo = startY + 30;
        doc.setFont('helvetica', 'bold'); // Fonte em negrito
        doc.text('PREPARO', 10, startYPreparo);
        doc.setFont('helvetica', 'normal');

        const preparoHeight = doc.splitTextToSize(preparo, 190); // Dividir texto para caber na página
        doc.text(preparoHeight, 10, startYPreparo + 5);
    

        const startYOrientacoes = startYPreparo + 10 + preparoHeight.length * 5; // Avançar com base na altura do texto de preparo
        doc.setFont('helvetica', 'bold'); // Fonte em negrito
        doc.text('ORIENTAÇÕES', 10,startYOrientacoes);
        doc.setFont('helvetica', 'normal');

        const orientacoesHeight = doc.splitTextToSize(orientacoes, 190); // Dividir texto para caber na página
        doc.text(orientacoesHeight, 10, startYOrientacoes + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        // Adicionar rodapé na última página
        addRodape();
    
        // Abrir ou salvar o PDF
        doc.save(`orcamento_${orcamentoCabecalhoData.id}.pdf`);
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        setSnackbar(new SnackbarState('Erro ao gerar o PDF!', 'error', true));
      }
    };
    
    
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 max-w-7xl w-full bg-white rounded-lg shadow-lg overflow-y-auto max-h-screen">
      {!loading && (
        <OrcamentoClienteForm 
          onClienteSelected={handleClienteSelected} 
          nomePaciente={orcamentoCabecalhoData.nomePaciente || ''}
          pacienteId={`${orcamentoCabecalhoData.pacienteId || ''}`}  /> 
      )}
      {!loading && (     
        <OrcamentoConvenioForm             
            onConvenioSelected={handleConvenioSelected} 
            onPlanoSelected={handlePlanoSelected}         
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
          <OrcamentoExameForm 
              onExameSelected={handleExameSelected} 
              onSolicitanteSelected={handleSolicitanteSelected} 
              planoId={planoId} 
              orcamentoDetalhes={orcamentoDetalhes}
              medicamentosParam={orcamentoCabecalhoData.medicamento || ''} 
              observacoesParam={orcamentoCabecalhoData.observacoes || ''} 
              orcamentoCabecalhoData={orcamentoCabecalhoData}
              solicitanteId={orcamentoCabecalhoData.solicitanteId || 0}
              />   
          )}
        <div className="grid grid-cols-2 gap-20 mt-1">
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
        <div className="buttons text-center mt-8">
          <button type="button" onClick={onClose} className="mr-2 py-2 px-4 rounded bg-gray-500 text-white">
            Cancelar
          </button>
          <button type="submit" className="mr-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-500 hover:to-blue-500 transition-all duration-200">
            Salvar
          </button>
          <button 
            type="button" 
            onClick={transformarEmPedido}
             className="mr-2 py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-200"
            >
            Transformar em Pedido
          </button>
          <button 
              type="button" 
              onClick={gerarPDF} 
                className="mr-2 py-2 px-4 bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold rounded-lg shadow-lg hover:from-red-500 hover:to-orange-400 transition-all duration-200"
                disabled
            >
              Imprimir PDF
            </button>
        </div>
      </form>
    </div>
  );
};
