"use client";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Recepcao } from '../../models/recepcao';
import { SnackbarState } from '@/models/snackbarState';
import { Endereco } from '@/models/endereco';
import { UF } from '@/models/uf';
import { buscarEnderecoViaCep } from '@/utils/endereco';
import InputMask from 'react-input-mask-next';
import { Convenio } from '../../models/convenio';
import { Plano } from '../../models/plano';
import ConvenioPlanoSelector from './convenioplanoseletor';

interface RecepcaoEditFormProps {
  recepcao: Recepcao;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

interface ConvenioComPlanos extends Convenio {
  id: number;
  planos: (Plano & { selecionado: boolean })[];
  selecionado: boolean;
}

export const RecepcaoEditForm = ({ recepcao, onSave, onClose, setSnackbar }: RecepcaoEditFormProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Recepcao>({
    defaultValues: recepcao,
  });

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
  const [activeTab, setActiveTab] = useState('informacoes');
  const [conveniosEPlanos, setConveniosEPlanos] = useState<ConvenioComPlanos[]>([]);

  // Função para alterar a aba ativa (informações ou convênios e planos)
  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    if (tab === 'conveniosPlanos') {
      try {
        const response = await axios.get(`/api/RecepcaoConvenioPlano/byRecepcao/${recepcao.id}`);
        setConveniosEPlanos(response.data);
      } catch (error) {
        console.error("Erro ao buscar convênios e planos", error);
        setSnackbar(new SnackbarState('Erro ao carregar os convênios e planos', 'error', true));
      }
    }
  };

  // Carrega os dados de UF e convênios ao montar o componente
  useEffect(() => {
    const fetchUF = async () => {
      try {
        const response = await axios.get('/api/UF');
        setUFOptions(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar os tipos de solicitante', 'error', true));
      }
    };

    fetchUF();
    setIsLoaded(true);
  }, [setSnackbar, recepcao.id]);

  // Busca os dados do endereço da recepção
  useEffect(() => {
    const fetchEndereco = async () => {
      try {
        const response = await axios.get(`/api/Endereco/${recepcao.enderecoId}`);
        setEndereco(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar endereço', 'error', true));
      }
    };

    if (isLoaded) {
      fetchEndereco();
    }
  }, [isLoaded, recepcao.enderecoId, setSnackbar]);

  // Atualiza os campos de endereço baseado no CEP digitado
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cepDigitado = e.target.value.replace(/\D/g, '');
    setEndereco({ ...endereco, cep: e.target.value });

    if (cepDigitado.length === 8) {
      const enderecoAtualizado = await buscarEnderecoViaCep(cepDigitado);
      
      if (enderecoAtualizado) {
        setEndereco({
          ...enderecoAtualizado,
          numero: endereco.numero
        });
      } else {
        setSnackbar(new SnackbarState('CEP não encontrado!', 'error', true));
      }
    }
  };

  // Lógica para salvar os dados da recepção
  // Função para salvar os dados da recepção
const onSubmit = async (data: Recepcao) => {
  if (!endereco.cep || !endereco.rua || !endereco.numero || !endereco.bairro || !endereco.cidade || !endereco.uf) {
    setSnackbar(new SnackbarState('Todos os campos de endereço são obrigatórios', 'error', true));
    return;
  }

  const itemComEndereco = {
    ...data,
    endereco,
  };

  try {
    // Salva as informações da recepção
    await axios.put(`/api/Recepcao/${itemComEndereco.id}`, itemComEndereco);

    // Salva os convênios e planos com a nova estrutura
    const conveniosPlanosSelecionados = conveniosEPlanos.map(c => ({
      recepcaoId: itemComEndereco.id,
      convenioId: c.id,
      planosId: c.planos.filter(p => p.selecionado).map(p => p.id) // Use planosId ao invés de planos
    }));

    await axios.post(`/api/RecepcaoConvenioPlano/addOrUpdate/${itemComEndereco.id}`, conveniosPlanosSelecionados);

    reset();
    onSave();
  } catch (error) {
    console.log(error);
    setSnackbar(new SnackbarState('Erro ao editar o registro!', 'error', true));
  }
};


  // Função que atualiza o estado local de convênios e planos
  const handleConveniosPlanosSave = async (selectedData: { convenioId: number; planosId: number[] }[]) => {
    const updatedConveniosEPlanos = conveniosEPlanos.map(convenio => {
      const selectedConvenio = selectedData.find(sd => sd.convenioId === convenio.id);
      if (selectedConvenio) {
        return {
          ...convenio,
          selecionado: true,
          planos: convenio.planos.map(plano => ({
            ...plano,
            selecionado: selectedConvenio.planosId.includes(plano.id!) // Use planosId aqui
          }))
        };
      }
      return {
        ...convenio,
        selecionado: false,
        planos: convenio.planos.map(plano => ({ ...plano, selecionado: false }))
      };
    });
  
    setConveniosEPlanos(updatedConveniosEPlanos);
  
    try {
      await axios.post(`/api/RecepcaoConvenioPlano/addOrUpdate/${recepcao.id}`, selectedData);
      setSnackbar(new SnackbarState('Convênios e planos atualizados com sucesso!', 'success', true));
    } catch (error) {
      console.error('Erro ao atualizar convênios e planos:', error);
      setSnackbar(new SnackbarState('Erro ao atualizar convênios e planos!', 'error', true));
    }
  };
  

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      <h2 className="text-xl font-bold mb-4">Editar Recepção</h2>

      <div className="flex border-b">
        <button
          type="button"
          className={`py-2 px-4 ${activeTab === 'informacoes' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleTabChange('informacoes')}
        >
          Informações
        </button>
        <button
          type="button"
          className={`py-2 px-4 ${activeTab === 'conveniosPlanos' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleTabChange('conveniosPlanos')}
        >
          Convênios e Planos
        </button>
      </div>

      {activeTab === 'informacoes' && (
        <>
          <div className="mb-4">
            <label className="block text-gray-700">Descrição</label>
            <textarea
              {...register('nomeRecepcao', { required: 'A descrição é obrigatória' })}
              className="border rounded w-full py-2 px-3 mt-1"
            />
            {errors.nomeRecepcao && <p className="text-red-500 text-sm">{errors.nomeRecepcao?.message}</p>}
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

          <div className="grid grid-cols-[3fr,1fr] gap-4 mb-4">
            <div>
              <label className="block text-gray-800">Rua (Logradouro) *</label>
              <input
                type="text"
                value={endereco.rua}
                onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
              {!endereco.rua && <p className="text-red-500 text-sm">Rua é obrigatória</p>}
            </div>

            <div>
              <label className="block text-gray-800">Número *</label>
              <input
                type="text"
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
                type="text"
                value={endereco.complemento}
                onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-gray-800">Bairro *</label>
              <input
                type="text"
                value={endereco.bairro}
                onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
              {!endereco.bairro && <p className="text-red-500 text-sm">Bairro é obrigatório</p>}
            </div>

            <div>
              <label className="block text-gray-800">Cidade *</label>
              <input
                type="text"
                value={endereco.cidade}
                onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
              {!endereco.cidade && <p className="text-red-500 text-sm">Cidade é obrigatória</p>}
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
        </>
      )}

      {activeTab === 'conveniosPlanos' && (
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-4">Convênios e Planos</h3>
          <ConvenioPlanoSelector
            onSave={handleConveniosPlanosSave}
            recepcaoId={recepcao.id}
            setSnackbar={setSnackbar}
          />
        </div>
      )}

      <div className="flex justify-end">
        <button type="button" onClick={onClose} className="mr-2 py-2 px-4 rounded bg-gray-500 text-white">
          Cancelar
        </button>
        <button type="submit" className="py-2 px-4 rounded bg-blue-500 text-white">
          Salvar
        </button>
      </div>
    </form>
  );
};