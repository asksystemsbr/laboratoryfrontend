//src/app/agendamentos/forms/AgendamentoExameForm.tsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Exame } from '@/models/exame';
import { PlusIcon,TrashIcon } from '@heroicons/react/24/solid';
import { formatCurrencyBRL, formatDecimal } from '@/utils/numbers';
import { formatDateTimeForGrid } from '@/utils/formatDateForInput';
import { AgendamentoDetalhe } from '@/models/agendamentoDetalhe';
import { AgendamentoCabecalho } from '@/models/agendamentoCabecalho';
import { Solicitante } from '@/models/solicitante';
import InformativeModal from '@/components/InformativeModal';
import { useAuth } from '@/app/auth';


interface ExameFormProps {
  onExameSelected: (detalhesAgendamento: AgendamentoDetalhe[],observacoes: string |null, medicamento: string | null) => void;
  onSolicitanteSelected: (id: number| null) => void;
  planoId: number | null;
  agendamentoDetalhes?: AgendamentoDetalhe[]; 
  medicamentosParam?: string; 
  observacoesParam?: string;   
  agendamentoCabecalhoData?: AgendamentoCabecalho;
  solicitanteId?: number;
}

const AgendamentoExameForm: React.FC<ExameFormProps> = ({ 
      onExameSelected, 
      onSolicitanteSelected,
      planoId,
      agendamentoDetalhes = [],
      medicamentosParam='',
      observacoesParam='',  
      agendamentoCabecalhoData,
      solicitanteId
    }) => {
  const [exameData, setexameData] = useState<Exame | null>(null);
  // const [codigoExame, setcodigoExame] = useState('');
  const [exames, setexames] = useState<Exame[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [addedExames, setAddedExames] = useState<Exame[]>([]);
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
      const updatedExames = agendamentoDetalhes.map((detalhe) => {
        // Find the corresponding `exame` in `addedExames`
        const matchingExame = addedExames.find((exame) => exame.exameId === detalhe.exameId);
        
        // If a match is found, update its `preco`
        if (matchingExame) {
          return { ...matchingExame, preco: detalhe.valor ?? matchingExame.preco };
        } else {
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
  }, [agendamentoDetalhes]);

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
    const loadItemsExames = async () => {
      if ( !agendamentoCabecalhoData?.id || agendamentoDetalhes.length === 0) return;

      try {
        const idCabecalho = agendamentoCabecalhoData?.id;
        const response = await axios.get(`/api/Agendamento/GetExamesList/${idCabecalho}`);
        
      // Combinar detalhes do orçamento com os exames
      const examesComDetalhes = response.data.map((exame: Exame) => {
          // Encontrar o detalhe correspondente pelo ExameId
          const detalhe = agendamentoDetalhes.find(d => d.exameId === exame.id);
          
          return {
            ...detalhe,
            exame,
            id: detalhe?.id || 0,
            agendamentoId: idCabecalho,
            exameId: exame.id,
            valor: detalhe?.valor || exame.preco || 0,
            nomeExame: exame.nomeExame,  
            codigoExame: exame.codigoExame,
            preco: detalhe?.valor || exame.preco || 0, 
            dataColeta: detalhe?.dataColeta || new Date().toISOString().split('T')[0]
          } as AgendamentoDetalhe;
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

    loadItemsExames();
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
       const alreadyExists = (addedExames as AgendamentoDetalhe[]).some(
        (exameItem) => exameItem.exameId === exame.id
      );

      if (alreadyExists) {
        setModalMessage('Esse exame já foi adicionado.');
        setIsModalOpen(true);
        resetInput();
        return;
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
        id: 0, 
        valor: preco, 
        exameId: exame.id, 
        preco: preco, 
        dataColeta: dataColeta // Inclui a data de coleta selecionada pelo usuário
      };

      setAddedExames([...addedExames, exameComDetalhes]);

      onExameSelected([...addedExames, exameComDetalhes],newObservacoes,newMedicamentos);

      // setexames([...exames, exameComDetalhes]);

      // onExameSelected([...exames, exameComDetalhes],observacoes,medicamentos);
      //setcodigoExame(''); // Resetar campo após adicionar
      resetInput();
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

    onExameSelected(updatedExames,observacoes,medicamentos);
  };

  const handleSelectSolicitanteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    const selectedSolicitante = solicitantes.find(s => s.id === selectedId) || null;
    setSolicitanteData(selectedSolicitante);
    setCRM(selectedSolicitante?.crm ?? '');
    onSolicitanteSelected(selectedSolicitante?.id ?? null);
  };

  
  return (
    <div className="form-section mt-4 border-t border-gray-300 py-1">
    <h3 className="text-lg font-semibold text-center mb-2">Lista de Exames</h3>

    {/* Primeira linha */}
    <div className="flex flex-wrap gap-4 mb-4">
    <div className="basis-1/12">
          <input
            type="text"
            value={crm}
            onChange={(e) => setCRM(e.target.value)}
            onBlur={buscarSolicitantePorCRM}
            className="border rounded w-full py-1 px-2 text-sm"
            placeholder="CRM"
          />         
      </div>
      <div className="basis-3/12">
      <select
          value={solicitanteData?.id || ''}        
          onChange={handleSelectSolicitanteChange}  
          className="border rounded w-full py-1 px-2 text-sm text-gray-800"
        >
          <option value="">Selecione um solicitante</option>
          {solicitantes.map((solicitante) => (
            <option key={solicitante.id} value={solicitante.id}>
              {solicitante.descricao}
            </option>
          ))}
        </select>
      </div>        
      <div className="basis-5/12">
        <div className="relative w-full">
          <input
            type="text"
            ref={inputRef}
            value={searchTerm}
            onFocus={handleInputFocus}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown} 
            placeholder="Buscar exame..."
            className="border rounded w-full py-1 px-2 text-sm text-gray-800"
          />
          {isDropdownOpen && filteredExames.length > 0 && (
            <ul className="absolute z-10 w-full border bg-white shadow-md max-h-60 overflow-y-auto">
              {filteredExames.map((exame,index) => (
                <li
                  key={exame.id}
                  onMouseDown={() => handleSelect(exame)}
                  className={`px-2 py-1 cursor-pointer ${
                    index === highlightedIndex ? 'bg-blue-200' : 'hover:bg-blue-100'
                  }`}
                >
                  {exame.nomeExame} - {exame.codigoExame}
                </li>
              ))}
            </ul>
          )}
          {isDropdownOpen && filteredExames.length === 0 && (
            <div className="absolute z-10 w-full border bg-white text-gray-500 px-2 py-1">
              Nenhum exame encontrado
            </div>
          )}
        </div>        
      </div> 
      {/* Campo para data de coleta */}
      <div className="basis-1/12">
        <input
          type="date"
          value={dataColeta}
          onChange={(e) => setDataColeta(e.target.value)}
          className="border rounded w-full py-1 px-2 text-sm"
        />
      </div>      
      <div className="basis-1/12">
        <button onClick={adicionarExameBtn}
          className="p-2 bg-blue-400 text-white font-semibold rounded-full shadow hover:bg-blue-500 transition duration-150"
          >
            <PlusIcon className="h-5 w-5" /> {/* Ícone de adicionar */}
        </button>          
      </div>        
    </div>

    {addedExames.length > 0 && (
    // {exames.length > 0 && (
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-2 py-1 border-b text-left font-semibold">Código</th>
              <th className="px-2 py-1 border-b text-left font-semibold">Nome do Exame</th>
              <th className="px-2 py-1 border-b text-left font-semibold">Data Agendamento</th>
              <th className="px-2 py-1 border-b text-right font-semibold">Valor</th>
              <th className="px-2 py-1 border-b text-center font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
          {addedExames.map((exame, index) => (
          // {exames.map((exame, index) => (
            <tr key={exame.id} className={`hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}>
            <td className="px-2 py-1 border-b">{exame.codigoExame}</td>
            <td className="px-2 py-1 border-b">{exame.nomeExame}</td>
            <td className="px-2 py-1 border-b">
            {formatDateTimeForGrid(
               typeof exame.dataColeta === 'string' && exame.dataColeta.includes('T')
              ? exame.dataColeta // Se já contém data e hora, usa diretamente
              : `${exame.dataColeta}T${new Date().toLocaleTimeString('pt-BR', { hour12: false })}` // Adiciona hora atual se só houver data
            )}
            </td>
            <td className="px-2 py-1 border-b text-right">{formatCurrencyBRL(formatDecimal(exame.preco || 0, 2))}</td>
            <td className="px-2 py-1 border-b text-center">
              <button
                onClick={() => removerExame(index)}
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

    <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col mt-4">
          <label className="font-semibold">Medicamentos:</label>
          <textarea
            value={medicamentos}
            readOnly
            className="border rounded w-full p-2 mt-1 text-sm"
            placeholder="Medicamentos acumulados"
          />
        </div>

        <div className="flex flex-col mt-4">
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

export default AgendamentoExameForm;
