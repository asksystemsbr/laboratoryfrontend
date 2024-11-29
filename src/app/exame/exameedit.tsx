//src/app/exame/exameApoioedit.tsx
"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Exame } from '../../models/exame';
import { Especialidade } from '../../models/especialidade';
import { Setor } from '../../models/setor';
import { MaterialApoio } from '../../models/materialApoio';
import { SnackbarState } from '@/models/snackbarState';
import { useEffect, useState } from 'react';
import { LaboratorioApoio } from '@/models/laboratorioApoio';
import ConfirmationModal from '@/components/confirmationModal';

interface ExameEditFormProps {
  exame: Exame;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const ExameEditForm = ({ exame, onSave, onClose, setSnackbar }: ExameEditFormProps) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Exame>({
    defaultValues: exame,
  });

  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [materialApoio, setMaterialApoio] = useState<MaterialApoio[]>([]);
  const [laboratorioApoio, setLaboratorioApoio] = useState<LaboratorioApoio[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'preparos' | 'coletas' | 'apoio'>('info');
  const [isLoaded, setIsLoaded] = useState(false);

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  useEffect(() => {
    const loadEspecialidades = async () => {
      try {
        const response = await axios.get('/api/Especialidade');
        setEspecialidades(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
      }
    };

    const loadSetores = async () => {
      try {
        const response = await axios.get('/api/Setor');
        setSetores(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar setores!', 'error', true));
      }
    };

    const loadMaterialApoio = async () => {
      try {
        const response = await axios.get('/api/MaterialApoio');
        setMaterialApoio(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar material de apoio!', 'error', true));
      }
    };

    const loadLaboratorioApoio = async () => {
      try {
        const response = await axios.get('/api/LaboratorioApoio');
        setLaboratorioApoio(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar laboratórios de apoio!', 'error', true));
      }
    };

    Promise.all([loadEspecialidades(), loadSetores(), loadMaterialApoio(),loadLaboratorioApoio()]).then(() => setIsLoaded(true));
  }, [setSnackbar]);

  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
    reset();
    onSave();
  };

  const confirmUpdateAgendas = async () => {
    closeConfirmationModal();
      await UpdateAgendamentos(exame);
  };

  const UpdateAgendamentos = async (exameData: Exame) => {
    try {
      // Chamada ao endpoint responsável pela replicação
      await axios.post('/api/Agendamento/ReplicarAgendamento', exameData);
      setSnackbar(new SnackbarState('Agendamentos replicados com sucesso!', 'success', true));
      reset();
      onSave();
    } catch (error) {
      console.error('Erro ao replicar agendamentos:', error);
      setSnackbar(new SnackbarState('Erro ao replicar agendamentos!', 'error', true));
    }
  };

  useEffect(() => {
    if (isLoaded) {
      setValue('codigoExame', exame.codigoExame);
      setValue('nomeExame', exame.nomeExame);
      setValue('sinonimos', exame.sinonimos);
      setValue('prazo', exame.prazo);
      setValue('especialidadeId', exame.especialidadeId);
      setValue('setorId', exame.setorId);
      setValue('materialApoioId', exame.materialApoioId);
      setValue('destinoId', exame.destinoId);
      setValue('agendamento', exame.agendamento==='1' ? '1' : '0');
    }
  }, [isLoaded, exame, setValue]);

  const clicarNoBotaoSalvar = () => {
    const botaoSalvar = document.getElementById('btnSalvar');
    if (botaoSalvar) {
      botaoSalvar.click();  // Simula o clique no botão
    }
  };

  const onSubmit = async (data: Exame) => {
    const camposObrigatoriosAbaInfo = [
      'codigoExame',
      'nomeExame',
      'sinonimos',
      'prazo',
      'especialidadeId',
      'setorId',
      'materialApoioId',
      'destinoId',
      'volumeMinimo'
    ];
    let isCamposVaziosAbaInfo = false;


    camposObrigatoriosAbaInfo.forEach(campo => {
      if (!data[campo]) {
        isCamposVaziosAbaInfo = true;  // Um ou mais campos estão vazios
        console.log(`Campo ${campo} não preenchido.`);
        errors[campo] = {type: 'required', message: `O campo ${campo} é obrigatório.` }; // Adiciona manualmente os erros
      }
    });

    if (isCamposVaziosAbaInfo) {
      // Define a aba 'info' como ativa para mostrar os erros
      setActiveTab('info');
      // Força o clique no botão de salvar programaticamente
      setTimeout(() => {
        clicarNoBotaoSalvar();  // Simula o clique no botão de salvar após a aba info renderizar
      }, 0);  
      return;
    }

    try {
      await axios.put(`/api/Exame/${exame.id}`, data);

      openConfirmationModal();
    } catch (error) {
      console.log(error);
      setSnackbar(new SnackbarState('Erro ao editar o registro!', 'error', true));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Exame</h2>

      {/* Abas de navegação com layout mais moderno */}
      <div className="flex border-b mb-4">
        <button
          type="button"
          className={`mr-4 pb-2 px-6 py-2 rounded-lg shadow-md transition-all duration-300 
            ${activeTab === 'info' ? 'bg-green-600 text-white' : 'bg-gray-300 hover:bg-blue-600 text-white'}`}
          onClick={() => setActiveTab('info')}
        >
          Informações Gerais
        </button>
        <button
          type="button"
          className={`mr-4 pb-2 px-6 py-2 rounded-lg shadow-md transition-all duration-300 
            ${activeTab === 'preparos' ? 'bg-green-600 text-white' : 'bg-gray-300 hover:bg-blue-600 text-white'}`}
          onClick={() => setActiveTab('preparos')}
        >
          Preparos
        </button>
        <button
          type="button"
            className={`mr-4 pb-2 px-6 py-2 rounded-lg shadow-md transition-all duration-300 
            ${activeTab === 'coletas' ? 'bg-green-600 text-white' : 'bg-gray-300 hover:bg-blue-600 text-white'}`}
          onClick={() => setActiveTab('coletas')}
        >
          Coletas
        </button>
        <button
          type="button"
          className={`pb-2 px-6 py-2 rounded-lg shadow-md transition-all duration-300 
            ${activeTab === 'apoio' ? 'bg-green-600 text-white' : 'bg-gray-300 hover:bg-blue-600 text-white'}`}
          onClick={() => setActiveTab('apoio')}
        >
          Apoio
        </button>        
      </div>

      {activeTab === 'info' && (
        <>
            {/* Código do Exame */}
            <div className="grid grid-cols-[1fr,2fr] gap-4 mb-4">
              <div>
                <label className="block text-gray-700">Código do Exame *</label> 
                <input
                  {...register('codigoExame', { required: 'O código do exame é obrigatório' })}
                  className="border rounded w-full py-2 px-3 mt-1"
                  placeholder="Código interno do exame"
                />
                {errors.codigoExame && <p className="text-red-500 text-sm">{errors.codigoExame?.message}</p>}
              </div>

              {/* Nome do Exame */}
              <div>
                <label className="block text-gray-700">Nome do Exame *</label> 
                <input
                  {...register('nomeExame', { required: 'O nome do exame é obrigatório' })}
                  className="border rounded w-full py-2 px-3 mt-1"
                />
                {errors.nomeExame && <p className="text-red-500 text-sm">{errors.nomeExame?.message}</p>}
              </div>
            </div>
            
          {/* sinonimos */}
          <div className="grid grid-cols-[2fr,1fr] gap-4 mb-4">
            <div>
              <label className="block text-gray-700">Sinônimos *</label>
              <input
                {...register('sinonimos', { required: 'O sinônimo é obrigatório' })}
                className="border rounded w-full py-2 px-3 mt-1"
              />
              {errors.sinonimos && <p className="text-red-500 text-sm">{errors.sinonimos?.message}</p>}
            </div>
            <div>
                <label className="block text-gray-700">Agendamento*</label> 
                  <select
                    {...register('agendamento', { required: 'O agendamento é obrigatório' })}
                    className="border rounded w-full py-2 px-3 mt-1"
                  >
                    <option value="">Selecione</option>
                    <option value="1">Sim</option>
                    <option value="0">Não</option>
                  </select>
                {errors.agendamento && <p className="text-red-500 text-sm">{errors.agendamento?.message}</p>}
              </div>
          </div>
            {/* Linha com TUSS, Prazo e Método */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              {/* TUSS */}
              <div>
                <label className="block text-gray-700">TUSS</label>
                <input
                  {...register('tuss')}
                  className="border rounded w-full py-2 px-3 mt-1"
                />
              </div>

              {/* Prazo */}
              <div>
                <label className="block text-gray-700">Prazo *</label>
                <input
                  type="number"
                  {...register('prazo', { required: 'O prazo é obrigatório' })}
                  className="border rounded w-full py-2 px-3 mt-1"
                />
                {errors.prazo && <p className="text-red-500 text-sm">{errors.prazo?.message}</p>}
              </div>

              <div>
                <label className="block text-gray-700">Vol. mínimo *</label>
                <input
                  {...register('volumeMinimo', { required: 'O volume mínimo é obrigatório' })}
                  className="border rounded w-full py-2 px-3 mt-1"
                />
                {errors.volumeMinimo && <p className="text-red-500 text-sm">{errors.volumeMinimo?.message}</p>}
              </div>

              {/* Método */}
              <div>
                <label className="block text-gray-700">Método</label>
                <input
                  {...register('metodo')}
                  className="border rounded w-full py-2 px-3 mt-1"
                  placeholder="Método do exame"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Lembretes */}
              <div>
                <label className="block text-gray-700">Lembretes</label>
                <textarea
                  {...register('lembretes')}
                  className="border rounded w-full py-2 px-3 mt-1 h-12" 
                />
              </div>   
              <div>
                <label className="block text-gray-700">Alertas</label>
                <textarea
                  {...register('alertas')}
                  className="border rounded w-full py-2 px-3 mt-1 h-12" 
                />
              </div>   
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Especialidade */}
                <div>
                  <label className="block text-gray-700">Especialidade *</label>
                  <select
                    {...register('especialidadeId', { required: 'A especialidade é obrigatória' })}
                    className="border rounded w-full py-2 px-3 mt-1"
                  >
                    <option value="">Selecione uma especialidade</option>
                    {especialidades.map((especialidade) => (
                      <option key={especialidade.id} value={especialidade.id}>
                        {especialidade.descricao}
                      </option>
                    ))}
                  </select>
                  {errors.especialidadeId && <p className="text-red-500 text-sm">{errors.especialidadeId?.message}</p>}
                </div>

                {/* Setor */}
                <div>
                  <label className="block text-gray-700">Setor *</label>
                  <select
                    {...register('setorId', { required: 'O setor é obrigatório' })}
                    className="border rounded w-full py-2 px-3 mt-1"
                  >
                    <option value="">Selecione um setor</option>
                    {setores.map((setor) => (
                      <option key={setor.id} value={setor.id}>
                        {setor.descricao}
                      </option>
                    ))}
                  </select>
                  {errors.setorId && <p className="text-red-500 text-sm">{errors.setorId?.message}</p>}
                </div>

              {/* Valor Atual */}
              <div>
                <label className="block text-gray-700">Valor Atual *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('slExamesRefTabelaValor', { required: 'O valor atual é obrigatório' })}
                  className="border rounded w-full py-2 px-3 mt-1"
                />
                {errors.slExamesRefTabelaValor && <p className="text-red-500 text-sm">{errors.slExamesRefTabelaValor?.message}</p>}
              </div>
            </div>           
          </>        
      )}

    {activeTab === 'preparos' && (
      <div className="mb-4">
            {/* Preparo */}
            <div className="mb-4">
            <label className="block text-gray-700">Preparo</label>
            <textarea
              {...register('preparo')}
              className="border rounded w-full py-2 px-3 mt-1 h-16" 
            />
            </div>

            {/* Preparo Feminino */}
            <div className="mb-4">
            <label className="block text-gray-700">Preparo Feminino</label>
            <textarea
              {...register('preparoF')}
              className="border rounded w-full py-2 px-3 mt-1 h-16" 
            />
            </div>

            {/* Preparo Crianças */}
            <div className="mb-4">
            <label className="block text-gray-700">Preparo Crianças</label>
            <textarea
              {...register('preparoC')}
              className="border rounded w-full py-2 px-3 mt-1 h-16" 
            />
            </div>

            {/* Instruções de Preparo */}
            <div className="mb-4">
            <label className="block text-gray-700">Instruções de Preparo</label>
            <textarea
              {...register('instrucoesPreparo')}
              className="border rounded w-full py-2 px-3 mt-1 h-16"
            />
            </div>     
        </div>   
     )}

      {activeTab === 'coletas' && (
        <div className="mb-4">
        {/* Coleta */}
        <div className="mb-4">
          <label className="block text-gray-700">Coleta</label>
          <textarea
            {...register('coleta')}
            className="border rounded w-full py-2 px-3 mt-1 h-12"
          />
        </div>

        {/* Técnica de Coleta */}
        <div className="mb-4">
          <label className="block text-gray-700">Técnica de Coleta</label>
          <textarea
            {...register('tecnicaDeColeta')}
            className="border rounded w-full py-2 px-3 mt-1 h-12"
          />
        </div>

        {/* Alertas Recepção */}
        <div className="mb-4">
          <label className="block text-gray-700">Alertas Recepção</label>
          <textarea
            {...register('alertasRecep')}
            className="border rounded w-full py-2 px-3 mt-1 h-12"
          />
        </div>

        {/* Meios de Coleta */}
        <div className="mb-4">
          <label className="block text-gray-700">Meios de Coleta</label>
          <input
            {...register('meiosDeColeta')}
            className="border rounded w-full py-2 px-3 mt-1"
          />
        </div>

        {/* Coleta Paciente */}
        <div className="mb-4">
          <label className="block text-gray-700">Coleta Paciente</label>
          <textarea
            {...register('coletaPac')}
            className="border rounded w-full py-2 px-3 mt-1 h-12"
          />
        </div>

        {/* Coleta Paciente Feminino */}
        <div className="mb-4">
          <label className="block text-gray-700">Coleta Paciente Feminino</label>
          <textarea
            {...register('coletaPacF')}
            className="border rounded w-full py-2 px-3 mt-1 h-12"
          />
        </div>

        {/* Coleta Paciente Criança */}
        <div className="mb-4">
          <label className="block text-gray-700">Coleta Paciente Criança</label>
          <textarea
            {...register('coletaPacC')}
            className="border rounded w-full py-2 px-3 mt-1 h-12"
          />
        </div>

       <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Meio de coleta similar */}
          <div>
            <label className="block text-gray-700">Meio de coleta similar</label>
            <input
            type='text'
              {...register('meioColetaSimilar')}
              className="border rounded w-full py-2 px-3 mt-1"
            />
          </div>

          {/* Material Coleta Similar */}
          <div>
            <label className="block text-gray-700">Material Coleta Similar</label>
            <input
            type='text'
              {...register('materialColetaSimilar')}
              className="border rounded w-full py-2 px-3 mt-1"
            />
          </div>
        </div>        
      </div>
      )}

      {activeTab === 'apoio' && (
        <div className="mb-4">
        {/* Coleta */}
        <div className="mb-4">
          <label className="block text-gray-700">Código do Exame do Apoio</label>
          <input
                  {...register('codigoExameApoio')}
                  className="border rounded w-full py-2 px-3 mt-1"
                  placeholder="Código do laboratório de apoio"
                />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-700">Prazo do Apoio</label>
            <input
                    {...register('prazoApoio')}
                    className="border rounded w-full py-2 px-3 mt-1"
                    placeholder="Prazo do laboratório de apoio"
                  />
          </div>

          <div>
            <label className="block text-gray-700">Valor do Apoio</label>
            <input
              type="number"
              step="0.01"
              {...register('valorApoio')}
              className="border rounded w-full py-2 px-3 mt-1"
            />
          </div>

          <div>
          <label className="block text-gray-700">Versão do Apoio</label>
          <input
                    {...register('versaoApoio')}
                    className="border rounded w-full py-2 px-3 mt-1"
                    placeholder="Versão do laboratório de apoio"
                  />          
          </div>  
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Dias de realização do Apoio</label>
          <input
                  {...register('diasRealizacaoApoio')}
                  className="border rounded w-full py-2 px-3 mt-1"
                  placeholder="Dias de realização do laboratório de apoio"
                />
        </div>   


        <div className="grid grid-cols-[2fr,1fr] gap-4 mb-4">
            {/* Destino */}
            <div>
            <label className="block text-gray-700">Laboratório Destino *</label>
            <select
              {...register('destinoId', { required: 'O destino é obrigatório' })}
              className="border rounded w-full py-2 px-3 mt-1"
            >
              <option value="">Selecione um laboratório destino</option>
              {laboratorioApoio.map((laboratorio) => (
                <option key={laboratorio.id} value={laboratorio.id}>
                  {laboratorio.nomeLaboratorio}
                </option>
              ))}
            </select>
            {errors.destinoId && <p className="text-red-500 text-sm">{errors.destinoId?.message}</p>}
          </div>
            {/* Material de Apoio */}
            <div>
              <label className="block text-gray-700">Material de Apoio *</label>
              <select
                {...register('materialApoioId', { required: 'O material de apoio é obrigatório' })}
                className="border rounded w-full py-2 px-3 mt-1"
              >
                <option value="">Selecione um material de apoio</option>
                {materialApoio.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.nomeMaterial}
                  </option>
                ))}
              </select>
              {errors.materialApoioId && <p className="text-red-500 text-sm">{errors.materialApoioId?.message}</p>}
            </div>
        </div>                  
      </div>
      )}
 
      {/* Botões de Ação */}
      <div className="flex justify-end">
        <button type="button" onClick={onClose} className="mr-2 py-2 px-4 rounded bg-gray-500 text-white">
          Cancelar
        </button>
        <button id="btnSalvar" type="submit" className="py-2 px-4 rounded bg-blue-500 text-white">
          Salvar
        </button>
      </div>

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        title="Replicar agendamento"
        message="Deseja replicar o agendamento para especialidade e setor?"
        onConfirm={confirmUpdateAgendas} // Open create modal on confirm
        onCancel={closeConfirmationModal}
      />
    </form>
  );
};

