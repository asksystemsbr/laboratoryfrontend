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

interface ConvenioEditFormProps {
  convenio: Convenio;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const ConvenioEditForm = ({ convenio, onSave, onClose,setSnackbar  }: ConvenioEditFormProps) => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm<Convenio>({
    defaultValues: convenio,
  });

  const [activeTab, setActiveTab] = useState<string>('info');
  const [plano, setPlano] = useState<Plano | null>(null);
  const [isPlanoFetched, setIsPlanoFetched] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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
    fetchUF();

    Promise.all([fetchUF()]).then(() => setIsLoaded(true));
  }, [setSnackbar]);

  useEffect(() => {
    if (activeTab === 'planos'  && convenio.id !== undefined && !isPlanoFetched) {
      fetchPlanoByConvenioId(convenio.id); // Passa o ID do convênio para buscar o plano
      setIsPlanoFetched(true); 
    }
  }, [activeTab, convenio.id,isPlanoFetched]);

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
    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6"> {/* Ajusta a largura da modal */}
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
