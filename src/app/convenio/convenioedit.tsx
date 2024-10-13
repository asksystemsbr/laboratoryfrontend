//src/app/convenio/convenioedit.tsx
"use client";
import React,{useState,useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Convenio } from '../../models/convenio';
import { SnackbarState } from '@/models/snackbarState';
import { Plano } from '../../models/plano'; // Importa o tipo Plano
import { Endereco } from '@/models/endereco';
import { UF } from '@/models/uf';
import { buscarEnderecoViaCep } from '@/utils/endereco';
import InputMask from 'react-input-mask-next';
import PlanoList from '../plano/planoList';
import { Empresa } from '@/models/empresa';
import { formatDateForInput } from '@/utils/formatDateForInput';

interface ConvenioEditFormProps {
  convenio: Convenio;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const ConvenioEditForm = ({ convenio, onSave, onClose,setSnackbar  }: ConvenioEditFormProps) => {
  const { register, handleSubmit, reset,formState: { errors },setValue } = useForm<Convenio>({
    defaultValues: convenio,
  });

  const [activeTab, setActiveTab] = useState<string>('info');
  const [plano, setPlano] = useState<Plano | null>(null);
  const [isPlanoFetched, setIsPlanoFetched] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [empresas, setEmpresa] = useState<Empresa[]>([]);

  const [ufOptions, setUFOptions] = useState<UF[]>([]);
  const [endereco, setEndereco] = useState<Endereco>({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });
  
  const fetchPlanoByConvenioId = async (convenioId: number) => {
    try {
      const response = await axios.get(`/api/Plano/getByConvenio/${convenioId}`);
      setPlano(response.data); // Armazena os dados do plano no estado
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Se a resposta for 404, cria um objeto plano zerado
        setPlano({
          id: 0,
          descricao: '',
          tabelaPrecoId: 0,
          convenioId: convenioId,
          custoHorario: 0,
          filme: 0,
          codigoArnb: '',
        });
        //setSnackbar(new SnackbarState('Plano não encontrado, criando um novo registro.', 'warning', true));
      } else {
        // Caso contrário, trata o erro como antes
        console.error('Erro ao buscar o plano:', error);
        setSnackbar(new SnackbarState('Erro ao buscar o plano!', 'error', true));
      }
    }
  };

  useEffect(() => {
    const fetchUF = async () => {
      try {
        const response = await axios.get('/api/UF'); // Supondo que essa seja a rota da API
        setUFOptions(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar os tipos de solicitante', 'error', true));
      }
    };

        
    const fetchEmpresa = async () => {
      try {
        const response = await axios.get('/api/Empresa'); // Supondo que essa seja a rota da API
        setEmpresa(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar Empresas', 'error', true));
      }
    };


    Promise.all([fetchUF(),fetchEmpresa()]).then(() => setIsLoaded(true));
  }, [setSnackbar]);

  useEffect(() => {
    if (activeTab === 'planos'  && convenio.id !== undefined && !isPlanoFetched) {
      fetchPlanoByConvenioId(convenio.id); // Passa o ID do convênio para buscar o plano
      setIsPlanoFetched(true); 
    }
  }, [activeTab, convenio.id,isPlanoFetched,fetchPlanoByConvenioId]);

  useEffect(() => {
    const fetchEndereco = async () => {
      try {
        const response = await axios.get(`/api/Endereco/${convenio.enderecoId}`);
        setEndereco(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar endereço', 'error', true));
      }
    };

    if (isLoaded) {
      fetchEndereco();
      setValue('empresaId', convenio.empresaId);
      setValue('ateCronograma', formatDateForInput(convenio.ateCronograma));
      setValue('vencimentoCronograma', formatDateForInput(convenio.vencimentoCronograma));
    }
  }, [isLoaded,convenio.enderecoId, setSnackbar]);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cepDigitado = e.target.value.replace(/\D/g, '');
    setEndereco({ ...endereco, cep: e.target.value })

    if (cepDigitado.length === 8) {
        const enderecoAtualizado = await buscarEnderecoViaCep(cepDigitado);
      
      if (enderecoAtualizado) {
        setEndereco({
          ...enderecoAtualizado, // Preenche o endereço retornado pela API
          numero: endereco.numero // Mantém o número se já estiver preenchido
        });
      } else {
        setSnackbar(new SnackbarState('CEP não encontrado!', 'error', true));
      }
    }
  };
  
  const onSubmit = async (data: Convenio) => {
        if(!endereco.cep  
          || !endereco.rua 
          || !endereco.numero  
          || !endereco.bairro
          || !endereco.cidade
          || !endereco.uf  
      ){
        return;
      }

      const convenioComEndereco = {
        ...data,
        endereco,  // Inclui o endereço completo ao enviar o cliente
      };
    try {
        await axios.put(`/api/Convenio/${convenioComEndereco.id}`, convenioComEndereco);
        reset();
        onSave();
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao editar o registro!', 'error', true)); // Exibe erro via snackbar
      }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
    {/* Abas */}
    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-full max-h-[90vh] p-6 overflow-y-auto overflow-x-auto"> {/* Ajusta a largura e altura com scroll */}
      <div className="mb-4">
        <button 
          onClick={() => setActiveTab('info')} 
          className={`py-2 px-4 ${activeTab === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Informações
        </button>
        <button 
          onClick={() => setActiveTab('planos')} 
          className={`py-2 px-4 ${activeTab === 'planos' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Planos
        </button>
      </div>

      
        {/* Conteúdo da aba */}
        {activeTab === 'info' && (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4">
              <h2 className="text-xl font-bold mb-4">Editar Convênio</h2>
              <div className="flex justify-end">
                <button type="submit" className="py-2 px-4 rounded bg-blue-500 text-white">
                  Salvar
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Descrição</label>
                <textarea
                  {...register('descricao', { required: 'A descrição é obrigatória' })}
                  className="border rounded w-full py-2 px-3 mt-1"
                />
                {errors.descricao && <p className="text-red-500 text-sm">{errors.descricao?.message}</p>}
              </div>

              {/* Campos adicionais */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700">Dígitos para Validar Matrícula</label>
                  <input
                    type="number"
                    {...register('digitosValidarMatricula')}
                    className="border rounded w-full py-2 px-3 mt-1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Liquidação (Via Fatura ou Caixa)</label>
                  <input
                    type="text"
                    {...register('liquidacao')}
                    className="border rounded w-full py-2 px-3 mt-1"
                  />
                </div>
              </div>

              {/* Código do Prestador e Versão da TISS */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700">Código do Prestador</label>
                  <input
                    type="text"
                    {...register('codigoPrestador')}
                    className="border rounded w-full py-2 px-3 mt-1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Versão da TISS</label>
                  <input
                    type="text"
                    {...register('versaoTiss')}
                    className="border rounded w-full py-2 px-3 mt-1"
                  />
                </div>
              </div>

              {/* CNES do Convênio, Código Operadora TISS e Código Operadora Autorize */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700">CNES do Convênio</label>
                  <input
                    type="text"
                    {...register('cnesConvenio')}
                    className="border rounded w-full py-2 px-3 mt-1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Código Operadora TISS</label>
                  <input
                    type="text"
                    {...register('codOperadoraTiss')}
                    className="border rounded w-full py-2 px-3 mt-1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Código Operadora (Autorize)</label>
                  <input
                    type="text"
                    {...register('codOperadora')}
                    className="border rounded w-full py-2 px-3 mt-1"
                  />
                </div>
              </div>

              {/* API de Integração e Início da Numeração */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700">API de Integração (Autorizar/Faturar)</label>
                  <input
                    type="text"
                    {...register('urlIntegracao')}
                    className="border rounded w-full py-2 px-3 mt-1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Início da Numeração</label>
                  <input
                    type="text"
                    {...register('inicioNumeracao')}
                    className="border rounded w-full py-2 px-3 mt-1"
                  />
                </div>
              </div>

              {/* Usuário e Senha Acesso Web */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700">Usuário Acesso Web</label>
                  <input
                    type="text"
                    {...register('usuarioAcessoWeb')}
                    className="border rounded w-full py-2 px-3 mt-1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Senha Acesso Web</label>
                  <input
                    type="password"
                    {...register('senhaAcessoWeb')}
                    className="border rounded w-full py-2 px-3 mt-1"
                  />
                </div>
              </div>

              {/* Cronograma */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700">Envio Cronograma</label>
                  <input
                    type="number"
                    {...register('envioCronograma')}
                    className="border rounded w-full py-2 px-3 mt-1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Até Cronograma</label>
                  <input
                    type="date"
                    {...register('ateCronograma')}
                    className="border rounded w-full py-2 px-3 mt-1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700">Vencimento Cronograma</label>
                  <input
                    type="date"
                    {...register('vencimentoCronograma')}
                    className="border rounded w-full py-2 px-3 mt-1"
                  />
                </div>
              </div>

              {/* Observações e Instruções */}
              <div className="mb-4">
                <label className="block text-gray-700">Observações</label>
                <textarea
                  {...register('observacoes')}
                  className="border rounded w-full py-2 px-3 mt-1"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Instruções</label>
                <textarea
                  {...register('instrucoes')}
                  className="border rounded w-full py-2 px-3 mt-1"
                />
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-gray-700">Empresa</label>
                <select
                  {...register('empresaId')}
                  className="border rounded w-full py-2 px-3 mt-1"
                >
                  <option value="">Selecione uma empresa</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nomeFantasia}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-800">CEP *</label>
                  <InputMask
                     value={endereco.cep}
                    mask="99999-999"
                    className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
                    onChange={handleCepChange}
                  />
                  {!endereco.cep && <p className="text-red-500 text-sm">CEP é obrigatório</p>}
              </div>

              {/* Endereço Completo */}
              <div className="grid grid-cols-[3fr,1fr] gap-4 mb-4">
                  <div>
                    <label className="block text-gray-800">Rua (Logradouro) *</label>
                    <input 
                    type='text'
                      value={endereco.rua}
                      onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
                      className="border rounded w-full py-1 px-3 mt-1 text-gray-800"        
                    />
                    {!endereco.rua && <p className="text-red-500 text-sm">Rua é obrigatória</p>}
                  </div>

                  <div>
                    <label className="block text-gray-800">Número *</label>
                    <input 
                    type='text'
                      value={endereco.numero}
                      onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
                      className="border rounded w-full py-1 px-3 mt-1 text-gray-800"   
                    />
                    {!endereco.numero && <p className="text-red-500 text-sm">Número é obrigatório</p>}
                  </div>
                </div>

                <div className="grid grid-cols-[1fr,2fr,2fr,1fr] gap-4 mb-4">
                  <div>
                    <label className="block text-gray-800">Complemento</label>
                    <input 
                    type='text'
                      value={endereco.complemento}
                      onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                      className="border rounded w-full py-1 px-3 mt-1 text-gray-800"     
                    />
                  </div>

                  <div>
                    <label className="block text-gray-800">Bairro *</label>
                    <input
                    type='text'
                      value={endereco.bairro}
                      onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                      className="border rounded w-full py-1 px-3 mt-1 text-gray-800"     
                    />
                    {!endereco.bairro && <p className="text-red-500 text-sm">Bairro é obrigatório</p>}
                  </div>

                  <div>
                    <label className="block text-gray-800">Cidade *</label>
                    <input
                    type='text'
                      value={endereco.cidade}
                      onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
                      className="border rounded w-full py-1 px-3 mt-1 text-gray-800"      
                    />
                    {!endereco.cidade && <p className="text-red-500 text-sm">Cidade é obrigatório</p>}
                  </div>

                  <div>
                    <label className="block text-gray-800">UF *</label>
                    <select
                      value={endereco.uf}
                      onChange={(e) => setEndereco({ ...endereco, uf: e.target.value })}
                      className="border rounded w-full py-2 px-3 mt-1"
                    >
                      <option value="">Selecione</option>
                      {ufOptions.map((option) => (
                        <option key={option.siglaUf} value={option.siglaUf}>
                          {option.siglaUf}
                        </option>
                      ))}
                    </select>
                    {!endereco.uf && <p className="text-red-500 text-sm">UF é obrigatória</p>}
                  </div>
                </div>
            </form>
          </>
        )}

        {/* Aba de TabelaPrecoItens */}
        {activeTab === 'planos' && plano && (
          <PlanoList convenioId={convenio.id!} />
        )}
      
      <div className="flex justify-end">
          <button type="button" onClick={onClose} className="mr-2 py-2 px-4 rounded bg-gray-500 text-white">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
