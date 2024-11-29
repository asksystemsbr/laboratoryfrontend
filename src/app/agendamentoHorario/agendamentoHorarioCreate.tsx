//src/app/formaPagamento/formaPagamentocreate.tsx
"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { AgendamentoHorario } from '../../models/agendamentoHorario';
import { SnackbarState } from '@/models/snackbarState';
import { Recepcao } from '@/models/recepcao';
import { useAuth } from '../auth';
import { Convenio } from '@/models/convenio';
import { Plano } from '@/models/plano';
import InformativeModal from '@/components/InformativeModal';
import { Solicitante } from '@/models/solicitante';
import { Exame } from '@/models/exame';
import { Especialidade } from '@/models/especialidade';

interface AgendamentoHorarioCreateFormProps {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const FormaPagamentoCreateForm = ({ onSave, onClose,setSnackbar  }: AgendamentoHorarioCreateFormProps) => {
  const { register, handleSubmit, reset,setValue,formState: { errors } } = useForm<AgendamentoHorario>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const auth = useAuth(); // Armazena o contexto inteiro e faz a verificação
  const user = auth?.user; // Verifica se auth é nulo antes de acessar user

  const [recepcaoId,setrecepcaoId]= useState(0);
  const [unidades, setUnidades] = useState<Recepcao[]>([]);
  const [unidadesData, setunidadesData] = useState<Recepcao | null>(null);
  
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [convenioData, setConvenioData] = useState<Convenio | null>(null);  

  const [planos, setPlanos] = useState<Plano[]>([]);
  const [planoData, setPlanoData] = useState<Plano | null>(null);  


  const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);  
  const [solicitanteData, setSolicitanteData] = useState<Solicitante | null>(null);    
      
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);  

  const [especialidadeData, setEspecialidadesData] = useState<Especialidade | null>(null);    

  const [exames, setexames] = useState<Exame[]>([]);  
  const [exameData, setexameData] = useState<Exame | null>(null);

  /*star search field exame*/
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExames, setFilteredExames] = useState(exames);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

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
    // Usa uma variável para controlar a execução e evitar chamadas duplicadas
    const recepcaoCod= parseInt(user?.unidadeId || '0', 10);
  
      const loadConvenios = async () => {
        const recepcaoCod= parseInt(user?.unidadeId || '0', 10);
        setrecepcaoId(recepcaoCod)
        try {        
            setIsLoaded(true);
            const response = await axios.get(`/api/Convenio/getConvenioByRecepcao/${recepcaoCod}`);
            setConvenios(response.data);                 
        } catch (error) {
          console.log(error);
          //setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
        } 
        
      };
  
      const fetchUnidades = async () => {
        try {
          const response = await axios.get('/api/Recepcao');
          setUnidades(response.data);
  
          if (user?.unidadeId) {
            const selectedUnidade = response.data.find((u: Recepcao) => u.id === parseInt(user.unidadeId, 10));
            if (selectedUnidade) {
              setunidadesData(selectedUnidade);
              setrecepcaoId(selectedUnidade.id);
              setValue('recepcaoId', selectedUnidade.id || 0);
            }
          }
        } catch (error) {
          console.log(error);
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

      const loadExames = async () => {
        try {
          const response = await axios.get(`/api/Exame/getExameByRecepcao/${recepcaoCod}`);
          setexames(response.data);
        } catch (error) {
          console.log(error);
          //setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
        }
      };

      const loadEspecialidades = async () => {
        try {
          const response = await axios.get(`/api/Especialidade`);
          setEspecialidades(response.data);
        } catch (error) {
          console.log(error);
          //setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
        }
      };
  
      Promise.all([loadConvenios(),fetchUnidades(),loadSolicitantes(),loadExames(),loadEspecialidades()]).then(() => setIsLoaded(true));    
    },[isLoaded]);

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && event.target instanceof Node && !inputRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const preencherDadosExame = async (exame: Exame) => {
      setexameData(exame);
      console.log(exameData);
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
          //await adicionarExameTeclado(filteredExames[highlightedIndex]); // Chama `adicionarExame` com o exame atualmente destacado
        }
      }
    };

    const handleSelectEspecialidadeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = Number(event.target.value);
      const selectedEspecialidade = especialidades.find(s => s.id === selectedId) || null;
      setEspecialidadesData(selectedEspecialidade);
      setValue('especialidadeId', selectedEspecialidade?.id ?? 0); 
    };

    const handleSelectSolicitanteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = Number(event.target.value);
      const selectedSolicitante = solicitantes.find(s => s.id === selectedId) || null;
      setSolicitanteData(selectedSolicitante);
      setValue('solicitanteId', selectedSolicitante?.id ?? 0); 
    };

    const handleSelectConvenioChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = Number(event.target.value);
      const selectedConvenio = convenios.find(s => s.id === selectedId) || null;
      setConvenioData(selectedConvenio);
      setValue('convenioId', selectedConvenio?.id ??  0);
  
      if (selectedConvenio) {
        await loadPlanosByConvenio(selectedConvenio.id);
      } else {
        resetPlanos();
      }
    };

    const handleSelectPlanoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = Number(event.target.value);
      const selectedPlano = planos.find(p => p.id === selectedId) || null;
      setPlanoData(selectedPlano);
      setValue('planoId', selectedPlano?.id ?? 0);
    };

    const loadPlanosByConvenio = async (convenioId: number) => {
      try {
        const response = await axios.get(`/api/Plano/getListByConvenioAndRecepcao/${convenioId}/${recepcaoId}`);
        setPlanos(response.data);
        setPlanoData(null); // Reset plano selection
        setValue('planoId', 0);
      } catch (error) {
        console.error('Erro ao carregar planos', error);
        setPlanos([]);
      }
    };

    const resetPlanos = () => {
      setPlanos([]);
      setPlanoData(null);
      setValue('planoId', 0);
    };

    const handleSelectUnidadeChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = Number(event.target.value);
      const selectedUnidade = unidades.find(p => p.id === selectedId) || null;
      if (selectedUnidade) {
        setunidadesData(selectedUnidade);
        setrecepcaoId(selectedUnidade.id ?? 0);
        setValue('recepcaoId', selectedUnidade?.id || 0);
        // Recarregar convênios
        try {
          const convenioResponse = await axios.get(`/api/Convenio/getConvenioByRecepcao/${selectedUnidade.id}`);
          setConvenios(convenioResponse.data);
  
          // Tentar restaurar o convênio antigo
          const restoredConvenio = convenioResponse.data.find((c: Convenio) => c.id === convenioData?.id);
          if (restoredConvenio) {
            setConvenioData(restoredConvenio);
            setValue('convenioId', restoredConvenio.id || 0);
            await loadPlanosByConvenio(restoredConvenio.id);
  
            // Recarregar os planos com o convênio antigo
             const planoResponse = await axios.get(
               `/api/Plano/getListByConvenioAndRecepcao/${restoredConvenio.id}/${selectedUnidade.id}`
             );
             setPlanos(planoResponse.data);
  
            // Tentar restaurar o plano antigo
             const restoredPlano = planoResponse.data.find((p: Plano) => p.id === planoData?.id);
             if (restoredPlano) {
               setPlanoData(restoredPlano);
               setValue('planoId', restoredPlano.id || 0);
             } else {
               setPlanoData(null);
               setValue('planoId',  0);
               setModalMessage('O plano anterior não está disponível para a nova unidade.');
               setIsModalOpen(true);
             }
          } else {
            // Convênio antigo não encontrado
            setConvenioData(null);
            setValue('convenioId', 0);
            setValue('planoId',  0);
            resetPlanos();
            if(convenioData != null){
              setModalMessage('O convênio anterior não está disponível para a nova unidade.');
              setIsModalOpen(true);
            }          
          }
        } catch (error) {
          console.error('Erro ao carregar convênios ou planos:', error);
        }      
      }
    };

  const onSubmit = async (data: AgendamentoHorario) => {
    if (isSubmitting) return;

    try {
        setIsSubmitting(true); 

          // Validação manual dos campos obrigatórios
        const missingFields: string[] = [];
        
        if (!unidadesData?.id) missingFields.push("Recepção");
        if (!convenioData?.id) missingFields.push("Convênio");
        if (!planoData?.id) missingFields.push("Plano");
        //if (!solicitanteData?.id) missingFields.push("Solicitante");
        if (!especialidadeData?.id) missingFields.push("especialidade");
        if (!exameData?.id) missingFields.push("Exame");
        if (!data.dataInicio) missingFields.push("Data Início");
        if (!data.dataFim) missingFields.push("Data Fim");
        if (!data.horaInicio) missingFields.push("Hora Início");
        if (!data.horaFim) missingFields.push("Hora Fim");
        if (!data.duracaoMinutos) missingFields.push("Duração");
        // if (!data.intervaloMinutos) missingFields.push("Intervalo");

        if (missingFields.length > 0) {
          const errorMessage = `Os seguintes campos são obrigatórios e estão faltando: ${missingFields.join(", ")}`;
          setModalMessage(errorMessage); // Mostra a mensagem no modal informativo
          setIsModalOpen(true);
          return; // Não prossegue com o envio dos dados
        }

        // Completa os dados do formulário
        const requestData: AgendamentoHorario = {
          ...data,
          //recepcaoId: unidadesData?.id || 0, // Mapeia recepcaoId baseado na unidade selecionada
          convenioId: convenioData?.id || 0,
          planoId: planoData?.id || 0,
          solicitanteId: solicitanteData?.id || 0,
          especialidadeId: especialidadeData?.id || 0,
          unidadeId: unidadesData?.id || 0,
          exameId: exameData?.id || 0,
          dataInicio: data.dataInicio || null,
          dataFim: data.dataFim || null,
          duracaoMinutos: data.duracaoMinutos || 0,
          intervaloMinutos:  0,
          horaInicio: data.horaInicio || null, // Use "HH:mm"
          horaFim: data.horaFim || null,       // Use "HH:mm"
        };

        await axios.post('/api/Agendamento/criarAgendamento', requestData);
        reset();
        onSave();
      } catch (error) { 
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao criar o registro!', 'error', true)); // Exibe erro via snackbar
      }finally {
        setIsSubmitting(false); 
      }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
        <h2 className="text-xl font-bold mb-4">Novo Agendamento</h2>

        <div className="mb-4">
          <label className="block text-gray-700">Recepção</label>
            <select
              value={unidadesData?.id || ''}        
              onChange={handleSelectUnidadeChange}  
              className="border rounded w-full py-1 px-2 text-sm text-gray-800"
            >
              <option value="">Selecione uma Unidade</option>
              {unidades.map((unidade) => (
                <option key={unidade.id} value={unidade.id}>
                  {unidade.nomeRecepcao}
                </option>
              ))}
            </select>
          {errors.recepcaoId && <p className="text-red-500 text-sm">{errors.recepcaoId.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Convênio</label>
              <select
              value={convenioData?.id || ''}        
              onChange={handleSelectConvenioChange}  
              className="border rounded w-full py-1 px-2 text-sm text-gray-800"
            >
              <option value="">Selecione um convênio</option>
              {convenios.map((convenio) => (
                <option key={convenio.id} value={convenio.id}>
                  {convenio.descricao}
                </option>
              ))}
            </select>
          {errors.convenioId && <p className="text-red-500 text-sm">{errors.convenioId.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Plano</label>
            <select
            value={planoData?.id || ''}        
            onChange={handleSelectPlanoChange}  
            className="border rounded w-full py-1 px-2 text-sm text-gray-800"
          >
            <option value="">Selecione um Plano</option>
            {planos.map((plano) => (
              <option key={plano.id} value={plano.id}>
                {plano.descricao}
              </option>
            ))}
          </select>
          {errors.planoId && <p className="text-red-500 text-sm">{errors.planoId.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Especialidade</label>
            <select
            value={especialidadeData?.id || ''}        
            onChange={handleSelectEspecialidadeChange}  
            className="border rounded w-full py-1 px-2 text-sm text-gray-800"
          >
            <option value="">Selecione uma Especialidade</option>
            {especialidades.map((especialidade) => (
              <option key={especialidade.id} value={especialidade.id}>
                {especialidade.descricao}
              </option>
            ))}
          </select>
          {errors.especialidadeId && <p className="text-red-500 text-sm">{errors.especialidadeId.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Especialista</label>
            <select
            value={solicitanteData?.id || ''}        
            onChange={handleSelectSolicitanteChange}  
            className="border rounded w-full py-1 px-2 text-sm text-gray-800"
          >
            <option value="">Selecione um especialista</option>
            {solicitantes.map((solicitante) => (
              <option key={solicitante.id} value={solicitante.id}>
                {solicitante.descricao}
              </option>
            ))}
          </select>
          {errors.solicitanteId && <p className="text-red-500 text-sm">{errors.solicitanteId.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Exame</label>
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
          {errors.exameId && <p className="text-red-500 text-sm">{errors.exameId.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Data Início</label>
          <input
            type="date"
            {...register('dataInicio', { required: 'A data de início é obrigatória' })}
            className="border rounded w-full py-2 px-3 mt-1"
          />
          {errors.dataInicio && <p className="text-red-500 text-sm">{errors.dataInicio.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Data Fim</label>
          <input
            type="date"
            {...register('dataFim', { required: 'A data de fim é obrigatória' })}
            className="border rounded w-full py-2 px-3 mt-1"
          />
          {errors.dataFim && <p className="text-red-500 text-sm">{errors.dataFim.message}</p>}
        </div>

        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="block text-gray-700">Hora Início</label>
            <input
              type="time"
              {...register('horaInicio', { required: 'A hora de início é obrigatória' })}
              className="border rounded w-full py-2 px-3 mt-1"
            />
            {errors.horaInicio && <p className="text-red-500 text-sm">{errors.horaInicio.message}</p>}
          </div>

          <div className="flex-1">
            <label className="block text-gray-700">Hora Fim</label>
            <input
              type="time"
              {...register('horaFim', { required: 'A hora de fim é obrigatória' })}
              className="border rounded w-full py-2 px-3 mt-1"
            />
            {errors.horaFim && <p className="text-red-500 text-sm">{errors.horaFim.message}</p>}
          </div>
        </div>

        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="block text-gray-700">Duração (minutos)</label>
            <input
              type="number"
              {...register('duracaoMinutos', { required: 'A duração é obrigatória' })}
              className="border rounded w-full py-2 px-3 mt-1"
            />
            {errors.duracaoMinutos && <p className="text-red-500 text-sm">{errors.duracaoMinutos.message}</p>}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="mr-2 py-2 px-4 rounded bg-gray-500 text-white">
            Cancelar
          </button>
          <button
            type="submit"
            className="py-2 px-4 rounded bg-blue-500 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
        <div>
              {/* Informative Modal */}
              <InformativeModal
              isOpen={isModalOpen}
              title="Atenção"
              message={modalMessage}
              onClose={() => setIsModalOpen(false)}
            />
        </div>
      </form>
  );
};
