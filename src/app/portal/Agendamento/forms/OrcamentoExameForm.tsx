//src/app/orcamentos/forms/OrcamentoExameForm.tsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Exame } from '@/models/exame';
import { TrashIcon } from '@heroicons/react/24/solid';
import { formatCurrencyBRL, formatDecimal } from '@/utils/numbers';
import { formatDateTimeForGrid } from '@/utils/formatDateForInput';
import { OrcamentoDetalhe } from '@/models/orcamentoDetalhe';
import { OrcamentoCabecalho } from '@/models/orcamentoCabecalho';
import { Solicitante } from '@/models/solicitante';
import InformativeModal from '@/components/InformativeModal';
import { useAuth } from '@/app/auth';
import { AgendamentoHorarioGerado } from '@/models/agendamentoHorarioGerado';


interface ExameFormProps {
  // onExameSelected: (
  //     detalhesOrcamento: OrcamentoDetalhe[],
  //     observacoes: string |null, 
  //     medicamento: string | null,
  //     selectedExames: number[] // IDs dos exames selecionados
  //   ) => void;
  onExameSelected: (
      detalhesOrcamento: OrcamentoDetalhe[],
      observacoes: string |null, 
      medicamento: string | null
    ) => void;  
  onSolicitanteSelected: (id: number| null) => void;
  planoId: number | null;
  orcamentoDetalhes?: OrcamentoDetalhe[]; 
  medicamentosParam?: string; 
  observacoesParam?: string;   
  orcamentoCabecalhoData?: OrcamentoCabecalho;
  solicitanteId?: number;
  convenioId?:number | null;
}

const OrcamentoExameForm: React.FC<ExameFormProps> = ({ 
      onExameSelected, 
      onSolicitanteSelected,
      planoId,
      orcamentoDetalhes = [],
      medicamentosParam='',
      observacoesParam='',  
      orcamentoCabecalhoData,
      solicitanteId,
      convenioId
    }) => {
  const [exameData, setexameData] = useState<Exame | null>(null);
  // const [codigoExame, setcodigoExame] = useState('');
  const [exames, setexames] = useState<Exame[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [addedExames, setAddedExames] = useState<(Exame [])>([]);
  const [medicamentos, setMedicamentos] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);  
  const [solicitanteData, setSolicitanteData] = useState<Solicitante | null>(null);  
  const [crm, setCRM] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const auth = useAuth(); // Armazena o contexto inteiro e faz a verificação
  const user = auth?.user; // Verifica se auth é nulo antes de acessar user
  
/*star search field exame*/
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExames, setFilteredExames] = useState(exames);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [dataColeta, setDataColeta] = useState(new Date().toISOString().split('T')[0]); // Estado para a data de coleta
  const [horarioSelecionado, setHorarioSelecionado] = useState<number | null>(null); // Seleção de horário
  const [isFetchingHorarios, setIsFetchingHorarios] = useState(false); // Estado de carregamento
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<AgendamentoHorarioGerado[]>([]); // Novo estado

  const [datasDisponiveis, setDatasDisponiveis] = useState<Date[]>([]);

  // const [selectedExames, setSelectedExames] = useState<number[]>([]);
  
  // const previousDataRef = useRef<string>(JSON.stringify({ addedExames, observacoes, medicamentos, selectedExames }));
  const previousDataRef = useRef<string>(JSON.stringify({ addedExames, observacoes, medicamentos }));

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredExames(
      exames.filter(
        (exame) =>
          exame.codigoExame?.toLowerCase().includes(term) ||
          exame.nomeExame.toLowerCase().includes(term) ||
          exame.sinonimos?.toLowerCase().includes(term)
      )
    );
    setHighlightedIndex(-1); // redefine o destaque ao atualizar a lista
  }, [searchTerm, exames]);

  useEffect(() => {
      // Update `addedExames` by modifying the `preco` of each item based on `orcamentoDetalhes`
      const updatedExames = orcamentoDetalhes.map((detalhe) => {
        // Find the corresponding `exame` in `addedExames`
        const matchingExame = addedExames.find((exame) => exame.exameId === detalhe.exameId);
        
        // If a match is found, update its `preco`
        if (matchingExame) {
          return { ...matchingExame, preco: detalhe.valor ?? matchingExame.preco };
        } else {
          // Convert `OrcamentoDetalhe` to `Exame`, filling in required `Exame` fields
          return {
            ...detalhe,
            nomeExame: 'Desconhecido',  // Default or fetched value for missing properties
            prazo: 0,              // Default or fetched value
            preco: detalhe.valor ?? 0,
            dataColeta: detalhe.dataColeta || new Date().toISOString(),
            materialApoioId: 0,    // Default or fetched value
            especialidadeId: 0,    // Default or fetched value
            setorId: 0             // Default or fetched value
          } as Exame;
        }
        
        // If no match, keep the `detalhe` as is
        return detalhe;
      });

      setAddedExames(updatedExames as Exame[]);
  }, [orcamentoDetalhes]);

  useEffect(() => {
    fetchHorariosDisponiveis(false);
  }, [ exameData]);

  useEffect(() => {
    fetchHorariosDisponiveis(true);
  }, [dataColeta]);

  useEffect(() => {
    if (exameData) {
      fetchDatasDisponiveis();
    }
  }, [exameData, planoId, convenioId, user?.unidadeId]);
  
  const handleHorarioChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setHorarioSelecionado(Number(event.target.value));
  };

  const fetchDatasDisponiveis = async () => {
    if (!planoId || !convenioId || !exameData || !user?.unidadeId) {
      console.warn('Campos obrigatórios faltando para buscar datas disponíveis.');
      setModalMessage('Selecione o convênio, plano, unidade, e exame para buscar as datas disponíveis.');
      setIsModalOpen(true);
      return;
    }
  
    const dto = {
      ConvenioId: convenioId,
      PlanoId: planoId,
      UnidadeId: parseInt(user.unidadeId, 10),
      ExameId: exameData.id,
    };
  
    try {
      const response = await axios.post('/api/Agendamento/getNextAgendamentoDisponiveis', dto);
      if (response.status === 200) {
        const datas = response.data.map((item: { dataInicio: string }) => new Date(item.dataInicio));
        setDatasDisponiveis(datas);
      } else {
        setDatasDisponiveis([]);
        setModalMessage('Nenhuma data disponível para os critérios selecionados.');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Erro ao buscar datas disponíveis:', error);
      setDatasDisponiveis([]);
    }
  };

   // Função para buscar os horários
   const fetchHorariosDisponiveis = async (isData:boolean) => {
    if (!planoId || !exameData || !dataColeta || !user?.unidadeId) {
      console.warn('Campos obrigatórios faltando para buscar horários.');
      setModalMessage('Selecione o convenio, plano, unidade, e exame para buscar os horários.');
      setIsModalOpen(true);
      return;
    }

    const dtoNextDate = {
      ConvenioId: convenioId,
      PlanoId: planoId,
      UnidadeId: parseInt(user.unidadeId, 10),
      ExameId: exameData?.id,
    };
    //buscar a data mais próxima
    try {

      let  dataConsulta = dataColeta;
      if(!isData){
      const responseDataProxima = await axios.post('/api/Agendamento/getNextAgendamentosHorariosDisponiveis', dtoNextDate);
      if (responseDataProxima.status === 204) {
          // Limpar os horários disponíveis
          setHorariosDisponiveis([]);
          setModalMessage('Nenhum horário disponível para os critérios selecionados.');
          setIsModalOpen(true);
          return;
        }
        const proximaData =responseDataProxima.data[0].horario; // Obtém o horário da resposta
        const formattedDataInicio = new Date(proximaData).toISOString().split('T')[0]; // Garante que seja uma string no formato YYYY-MM-DD
        setDataColeta(formattedDataInicio);
        dataConsulta = formattedDataInicio;
      }


        
        const dto = {
          ConvenioId: convenioId,
          PlanoId: planoId,
          UnidadeId: parseInt(user.unidadeId, 10),
          ExameId: exameData?.id,
          DataInicio: dataConsulta, // Usa a data formatada
        };
    
      setIsFetchingHorarios(true);
      const response = await axios.post('/api/Agendamento/getAgendamentosHorariosDisponiveis', dto);
      if (response.status === 204) {
        // Limpar os horários disponíveis
        setHorariosDisponiveis([]);
        setModalMessage('Nenhum horário disponível para os critérios selecionados.');
        setIsModalOpen(true);
      } else {
        // Atualizar os horários com os dados recebidos
        setHorariosDisponiveis(response.data);          
      }
      setHorarioSelecionado(null); // Reseta a seleção ao recarregar os horários
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      setHorariosDisponiveis([]);
    } finally {
      setIsFetchingHorarios(false);
    }
  };

  const handleSelect = (exame: Exame) => {
    console.log('Item selecionado:', exame); 
    setSearchTerm(exame.nomeExame); // Preenche o nome do exame no campo de entrada
    preencherDadosExame(exame); // Chama a função de preenchimento com o exame selecionado
    setIsDropdownOpen(false); // Fecha o dropdown
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleKeyDown = async (event: React.KeyboardEvent) => {
    if(!isDropdownOpen)
      setIsDropdownOpen(true);
    if (event.key === 'ArrowDown') {
      // Move o destaque para o próximo item
      setHighlightedIndex((prevIndex) =>
        prevIndex < filteredExames.length - 1 ? prevIndex + 1 : 0
      );
    } else if (event.key === 'ArrowUp') {
      // Move o destaque para o item anterior
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : filteredExames.length - 1
      );
    } else if (event.key === 'Tab') {
      event.preventDefault(); 
      // Seleciona o item destacado ao pressionar Tab
      if (highlightedIndex >= 0 && filteredExames[highlightedIndex]) {
        handleSelect(filteredExames[highlightedIndex]);
        await adicionarExameTeclado(filteredExames[highlightedIndex]); // Chama `adicionarExame` com o exame atualmente destacado
      }
    }
  };
  const resetInput = () => {
    setSearchTerm(''); // Limpa o campo de entrada
    setIsDropdownOpen(false); // Fecha o dropdown
    setHighlightedIndex(-1); // Redefine o índice destacado
    setexameData(null); // Reseta o exame selecionado
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (inputRef.current && event.target instanceof Node && !inputRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
/*end search field exame*/


  const buscarSolicitantePorCRM = async () => {
    try {
      if (!crm || crm.length < 3) return;
      const response = await axios.get(`/api/Solicitante/solicitanteByCRM/${crm}`);
      const item = response.data;
      preencherDadosSolicitante(item);
    } catch (error) {
      console.error('Solicitante não encontrado', error);
      setSolicitanteData(null);
      onSolicitanteSelected(null);
    }
  };

  const preencherDadosSolicitante = async (solicitante: Solicitante) => {
    setSolicitanteData(solicitante);
    setCRM(solicitante.crm??"");
    onSolicitanteSelected(solicitante.id ?? null);
  };

  useEffect(() => {
    const recepcaoCod= parseInt(user?.unidadeId || '0', 10);
    //setrecepcaoId(recepcaoCod)

    const loadExames = async () => {
      try {
        const response = await axios.get(`/api/Exame/getExameByRecepcao/${recepcaoCod}`);
        setexames(response.data);
      } catch (error) {
        console.log(error);
        //setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
      }
    };

    const loadSolicitantes = async () => {
      try {
        const response = await axios.get(`/api/Solicitante`);
        setSolicitantes(response.data);
      } catch (error) {
        console.log(error);
        //setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
      }
    };

    Promise.all([loadSolicitantes(),loadExames()]).then(() => setIsLoaded(true));
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
            dataColeta: detalhe?.dataColeta || new Date().toISOString().split('T')[0],
            prazo: exame.prazo,
          } as OrcamentoDetalhe;
        });
        // Define a lista de exames já adicionados a partir dos exames do orçamento
        setAddedExames(examesComDetalhes);
        // setexames(examesComDetalhes);

        setObservacoes(observacoesParam);
        setMedicamentos(medicamentosParam);
        setIsComponentMounted(true);
      } catch (error) {
        console.error('Erro ao carregar exames do orçamento:', error);
      }
    };

    loadOrcamentoExames();
  }, []);

  useEffect(() => {
    // Carrega o solicitante inicial quando `solicitantes` estiverem carregados e `solicitanteId` for passado
    if (isLoaded && solicitanteId && solicitantes.length > 0 && !solicitanteData) {
      const selectedSolicitante = solicitantes.find(s => s.id === solicitanteId) || null;
      setSolicitanteData(selectedSolicitante);
      setCRM(selectedSolicitante?.crm ?? '');
      onSolicitanteSelected(selectedSolicitante?.id ?? null);
    }
  }, [isLoaded, solicitanteId, solicitantes]);


// useEffect(() => {
//   const currentData = JSON.stringify({ addedExames, observacoes, medicamentos, selectedExames });

//   if (currentData !== previousDataRef.current) {
//     previousDataRef.current = currentData;
//     onExameSelected(addedExames, observacoes, medicamentos, selectedExames);
//   }
// }, [addedExames, observacoes, medicamentos, selectedExames]);

useEffect(() => {
  const currentData = JSON.stringify({ addedExames, observacoes, medicamentos });

  if (currentData !== previousDataRef.current) {
    previousDataRef.current = currentData;
    onExameSelected(addedExames, observacoes, medicamentos);
  }
}, [addedExames, observacoes, medicamentos]);

  const preencherDadosExame = async (exame: Exame) => {
    setexameData(exame);
    //setcodigoExame(exame.codigoExame??"");
  };

  useEffect(() => {
    if (isLoaded) {
      // setCRM()
      // setValue('codigoExame', exame.codigoExame);
    }
  }, [isLoaded]);


  const adicionarExame = async (exame: Exame) => {    

    try {
      // Buscar preço pelo código do plano e exame
      const precoResponse = await axios.get(`/api/Exame/getPrecoByPlanoExame/${planoId}/${exame.codigoExame}`);
      const preco = precoResponse.data?.preco || 0;      

      if (preco <= 0) {
        setModalMessage('Não foi possível encontrar preço para o exame na tabela de preço.');
        setIsModalOpen(true);
        return;
      }

       // Check if the payment type already exists in the list
       const alreadyExists = (addedExames as OrcamentoDetalhe[]).some(
      // const alreadyExists = (exames as OrcamentoDetalhe[]).some(
        (exameItem) => exameItem.exameId === exame.id
      );

      if (alreadyExists) {
        setModalMessage('Esse exame já foi adicionado.');
        setIsModalOpen(true);
        resetInput();
        return;
      }

      //verifica se é um exame que precisa ser agendado
      // Validar se um horário foi selecionado  
      const agendamentoResponse = await axios.get(`/api/Orcamento/checkExamAgendamento/${exame.id}`);
      const isAgendamento = agendamentoResponse.data;  

      let dataHoraColeta;
      let horarioData;
      if(isAgendamento)  {
        if (!horarioSelecionado) {
          setModalMessage('Selecione um horário antes de adicionar o exame.');
          setIsModalOpen(true);
          return;
        }
      // Combinar dataColeta com horárioSelecionado
      horarioData = horariosDisponiveis.find((h) => h.id === horarioSelecionado); // Obter horário do dropdown
      dataHoraColeta = `${dataColeta}T${new Date(horarioData?.horario || '').toLocaleTimeString('pt-BR', {
        hour12: false,
      })}`; // Combina data e horário no formato ISO
      }
      else {
        // Usar a data e hora atual
        const now = new Date();
        dataHoraColeta = now.toISOString(); // Data e hora no formato ISO
      }




      // Adicionar medicamento e observação ao estado acumulado
      const medsResponse = await axios.get(`/api/Exame/getitemsByCodigo/${exame.codigoExame}`);      
      //const obsResponse = await axios.get(`/api/Exame/getitemsByCodigo/${exameData.codigoExame}`);
      const obsResponse = medsResponse;

      // Atualizar campos de medicamentos e observações, evitando duplicação
      const newMedicamentos = `${medicamentos}${medicamentos ? ', ' : ''}${medsResponse.data.alertasRecep}`
        .split(', ')
        .filter((item, index, self) => self.indexOf(item) === index)
        .join(', ');
      setMedicamentos(newMedicamentos);

      const newObservacoes = `${observacoes}${observacoes ? ', ' : ''}${obsResponse.data.instrucoesPreparo}${obsResponse.data.tecnicaDeColeta ? ', ' + obsResponse.data.tecnicaDeColeta : ''}`
      .split(', ')
      .filter((item, index, self) => self.indexOf(item) === index)
      .join(', ');
    setObservacoes(newObservacoes);

      const exameComDetalhes = { 
        ...exame, 
        id:0, 
        valor:preco,
        exameId:exame.id,
        preco:preco, 
        dataColeta: dataHoraColeta,
        horarioId:horarioData?.id || 0,
        prazoFinal: undefined as Date | undefined  
      };


          try {
            // Buscar prazo para o exame atual
            const prazoResponse = await axios.get(`/api/Exame/${exameComDetalhes.exameId}`);
            const prazoDias = prazoResponse.data.prazo || 0;
  
            // Calcular data final do prazo
            const dataColeta = typeof exameComDetalhes.dataColeta === 'string' ? new Date(exameComDetalhes.dataColeta) : new Date();
            const prazoFinal = new Date(dataColeta);
            prazoFinal.setDate(prazoFinal.getDate() + prazoDias);
  
            exameComDetalhes.prazoFinal = prazoFinal;
          } catch (error) {
            console.error(`Erro ao buscar prazo para o exame ${exameComDetalhes.exameId}:`, error);
            exameComDetalhes.prazoFinal = undefined;
          }

      setAddedExames([...addedExames, exameComDetalhes]);

      // onExameSelected([...addedExames, exameComDetalhes],newObservacoes,newMedicamentos,selectedExames);
      onExameSelected([...addedExames, exameComDetalhes],newObservacoes,newMedicamentos);

      // setexames([...exames, exameComDetalhes]);

      // onExameSelected([...exames, exameComDetalhes],observacoes,medicamentos);
      //setcodigoExame(''); // Resetar campo após adicionar
      resetInput();
      setHorariosDisponiveis([]);
    } catch (error) {
      console.error('Erro ao adicionar exame', error);
    }
  };

  const adicionarExameTeclado = async (exame: Exame) => {
    if (!exame || !planoId) {
      setModalMessage('Verifique o exame com convênio e plano.');
      setIsModalOpen(true);
      //resetInput();
      return;
    };
    await adicionarExame(exame);

  };

  const adicionarExameBtn = async (e: React.MouseEvent) => {
    e.preventDefault();    
    if (!exameData || !planoId) {
      setModalMessage('Verifique o exame com convênio e plano.');
      setIsModalOpen(true);
      //resetInput();
      return;
    };

    await adicionarExame(exameData);
    
  };

  const removerExame = (index: number) => {
    const updatedExames = addedExames.filter((_, idx) => idx !== index);
    setAddedExames(updatedExames);
    // const updatedExames = exames.filter((_, idx) => idx !== index);
    // setexames(updatedExames);

    // Recompute medicamentos and observacoes based on remaining exams
    const newMedicamentos = updatedExames
    .map((exame) => exame.alertasRecep || '') // Assuming 'alertasRecep' holds medication alerts
    .filter((med) => med) // Remove empty strings
    .join(', ');

    const newObservacoes = updatedExames
      .map((exame) => {
        const instrucoes = exame.instrucoesPreparo || '';
        const tecnica = exame.tecnicaDeColeta || '';
        return `${instrucoes}${tecnica ? ', ' + tecnica : ''}`;
      })
      .filter((obs) => obs) // Remove empty strings
      .join(', ');

    // Set the recomputed values to avoid duplicates
    setMedicamentos(newMedicamentos);
    setObservacoes(newObservacoes);

    // onExameSelected(updatedExames,observacoes,medicamentos,selectedExames);
    onExameSelected(updatedExames,observacoes,medicamentos);
  };

  const handleSelectSolicitanteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    const selectedSolicitante = solicitantes.find(s => s.id === selectedId) || null;
    setSolicitanteData(selectedSolicitante);
    setCRM(selectedSolicitante?.crm ?? '');
    onSolicitanteSelected(selectedSolicitante?.id ?? null);
  };

  // const handleCheckboxChange = (exameId: number) => {
  //   setSelectedExames((prevSelected) =>
  //     prevSelected.includes(exameId)
  //       ? prevSelected.filter((id) => id !== exameId) // Remove da seleção
  //       : [...prevSelected, exameId] // Adiciona à seleção
  //   );
  // };

  return (
    <div className="form-section mt-4 border-t border-gray-300 py-2">
    <h3 className="text-lg font-semibold text-center mb-4">Lista de Exames</h3>

    {/* Primeira linha */}
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mb-4">
    <div className="col-span-1">
          <input
            type="text"
            value={crm}
            onChange={(e) => setCRM(e.target.value)}
            onBlur={buscarSolicitantePorCRM}
            className="border rounded w-full py-2 px-3 text-sm"
            placeholder="CRM"
          />         
      </div>
      <div className="col-span-2">
      <select
          value={solicitanteData?.id || ''}        
          onChange={handleSelectSolicitanteChange}  
          className="border rounded w-full py-2 px-3 text-sm text-gray-800"
        >
          <option value="">Selecione um solicitante</option>
          {solicitantes.map((solicitante) => (
            <option key={solicitante.id} value={solicitante.id}>
              {solicitante.descricao}
            </option>
          ))}
        </select>
      </div>        
        <div className="col-span-2 relative">
          <input
            type="text"
            ref={inputRef}
            value={searchTerm}
            onFocus={handleInputFocus}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown} 
            placeholder="Buscar exame..."
            className="border rounded w-full py-2 px-3 text-sm text-gray-800"
          />
        {isDropdownOpen && (
          <ul className="absolute z-10 w-full border bg-white shadow-md max-h-60 overflow-y-auto">
            {filteredExames.length > 0 ? (
              filteredExames.map((exame, index) => (
                <li
                  key={exame.id}
                  onMouseDown={() => handleSelect(exame)}
                  className={`px-2 py-1 cursor-pointer ${
                    index === highlightedIndex ? 'bg-blue-200' : 'hover:bg-blue-100'
                  }`}
                >
                  {exame.nomeExame} - {exame.codigoExame}
                </li>
              ))
            ) : (
              <li className="px-2 py-1 text-gray-500">Nenhum exame encontrado</li>
            )}
          </ul>
        )}      
      </div> 
      {/* Campo para data de coleta */}
      <div className="col-span-1">
        <select
          value={dataColeta}
          onChange={(e) => setDataColeta(e.target.value)}
          className="border rounded w-full py-2 px-3 text-sm text-gray-800"
        >
          <option value="" disabled>
            {datasDisponiveis.length === 0 ? 'Carregando...' : 'Selecione uma data'}
          </option>
          {datasDisponiveis.map((data, index) => (
            <option key={index} value={data.toISOString().split('T')[0]}>
              {data.toLocaleDateString('pt-BR')}
            </option>
          ))}
        </select>
      </div>    
      <div  className="col-span-2">
        <select
          value={horarioSelecionado || ''}
          onChange={handleHorarioChange}
          className="border rounded w-full py-2 px-3 text-sm text-gray-800"
          disabled={isFetchingHorarios || horariosDisponiveis.length === 0}
        >
          <option value="" disabled>
            {isFetchingHorarios ? 'Carregando...' : 'Hora'}
          </option>
          {horariosDisponiveis.map((horario) => (
            <option key={horario.id} value={horario.id}>
              {horario.horario
                  ? new Date(horario.horario).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Horário inválido'}
            </option>
          ))}
        </select>
      </div>      

      <div className="flex justify-center">
        <button
          onClick={adicionarExameBtn}
          className="w-full max-w-xs sm:max-w-sm lg:max-w-md py-2 px-6 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold rounded-lg shadow-lg text-center hover:from-green-500 hover:to-blue-500 transition-all duration-300 text-base"
        >
          Adicionar
        </button>
      </div>

    </div>

    {addedExames.length > 0 && (
    // {exames.length > 0 && (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-2 py-1 border-b">Código</th>
              <th className="px-2 py-1 border-b">Exame</th>
              <th className="px-2 py-1 border-b">Data</th>
              <th className="px-2 py-1 border-b">Prazo</th>
              <th className="px-2 py-1 border-b">Valor</th>
              <th className="px-2 py-1 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
          {addedExames.map((exame, index) => (
          // {exames.map((exame, index) => (
            <tr key={
              typeof exame.exameId === 'number' || typeof exame.exameId === 'string' 
              ? exame.exameId : String(exame.exameId) 
              } className={`hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}>            
            <td className="px-2 py-1 border-b">{exame.codigoExame}</td>
            <td className="px-2 py-1 border-b">{exame.nomeExame}</td>
            <td className="px-2 py-1 border-b">
              {formatDateTimeForGrid(
                typeof exame.dataColeta === 'string' && exame.dataColeta.includes('T')
                ? exame.dataColeta // Se já contém data e hora, usa diretamente
                : `${exame.dataColeta}T${new Date().toLocaleTimeString('pt-BR', { hour12: false })}` // Adiciona hora atual se só houver data
              )}
            </td>
            <td className="px-2 py-1 border-b">
            {exame.prazoFinal && (typeof exame.prazoFinal === 'string' || exame.prazoFinal instanceof Date)
              ? formatDateTimeForGrid(new Date(exame.prazoFinal))
              : 'Data inválida'}
              </td>     
            <td className="px-2 py-1 border-b text-right">{formatCurrencyBRL(formatDecimal(exame.preco || 0, 2))}</td>
            <td className="px-2 py-1 border-b text-center">
              <button
                onClick={() => removerExame(index)}
                // hidden={!['agendado', 'Agendado'].includes(typeof exame.status === 'string' ? exame.status : '')}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
        <label className="font-semibold">Medicamentos:</label>
          <textarea
            value={medicamentos}
            readOnly
            className="border rounded w-full p-2 mt-1 text-sm"
            placeholder="Medicamentos acumulados"
          />
        </div>

        <div >
          <label className="font-semibold">Observações:</label>
          <textarea
            value={observacoes}
            readOnly
            className="border rounded w-full p-2 mt-1 text-sm"
            placeholder="Observações acumuladas"
          />
        </div>
    </div>
    
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

export default OrcamentoExameForm;
