//src/app/recepcao/recepcaoedit.tsx
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

interface RecepcaoEditFormProps {
  recepcao: Recepcao;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

interface ConvenioComPlanos extends Convenio {
  id: number; // Linha 21
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

    const fetchConveniosEPlanos = async () => {
      // Dados fictícios para convenios e planos
      const dadosFicticios: ConvenioComPlanos[] = [
        {
          id: 1,
          descricao: 'Convênio Teste',
          enderecoId: 1,
          selecionado: false,
          planos: [
            { id: 1, descricao: 'Plano 1', tabelaPrecoId: 1, convenioId: 1, custoHorario: 100, filme: 50, codigoArnb: 'A1', selecionado: false },
            { id: 2, descricao: 'Plano 2', tabelaPrecoId: 1, convenioId: 1, custoHorario: 150, filme: 75, codigoArnb: 'A2', selecionado: false },
            { id: 3, descricao: 'Plano 3', tabelaPrecoId: 1, convenioId: 1, custoHorario: 200, filme: 100, codigoArnb: 'A3', selecionado: false },
          ]
        },
        {
          id: 2,
          descricao: 'Convênio Teste2',
          enderecoId: 2,
          selecionado: false,
          planos: [
            { id: 4, descricao: 'Plano 1', tabelaPrecoId: 2, convenioId: 2, custoHorario: 120, filme: 60, codigoArnb: 'B1', selecionado: false },
            { id: 5, descricao: 'Plano 2', tabelaPrecoId: 2, convenioId: 2, custoHorario: 180, filme: 90, codigoArnb: 'B2', selecionado: false },
            { id: 6, descricao: 'Plano 3', tabelaPrecoId: 2, convenioId: 2, custoHorario: 240, filme: 120, codigoArnb: 'B3', selecionado: false },
          ]
        },
      ];
      setConveniosEPlanos(dadosFicticios);
    };

    fetchUF();
    fetchConveniosEPlanos();
    Promise.all([fetchUF(), fetchConveniosEPlanos()]).then(() => setIsLoaded(true));
  }, [setSnackbar]);
  
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

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cepDigitado = e.target.value.replace(/\D/g, '');
    setEndereco({ ...endereco, cep: e.target.value })

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

    const handleConvenioChange = (convenioId: number | undefined) => {
    if (convenioId === undefined) return;
    setConveniosEPlanos(prevConvenios =>
      prevConvenios.map(convenio => {
        if (convenio.id === convenioId) {
          const novoSelecionado = !convenio.selecionado;
          return {
            ...convenio,
            selecionado: novoSelecionado,
            planos: convenio.planos.map(plano => ({
              ...plano,
              selecionado: novoSelecionado
            }))
          };
        }
        return convenio;
      })
    );
  };

  const handlePlanoChange = (convenioId: number | undefined, planoId: number | undefined) => {
    if (convenioId === undefined || planoId === undefined) return;
    setConveniosEPlanos(prevConvenios =>
      prevConvenios.map(convenio => {
        if (convenio.id === convenioId) {
          const planosAtualizados = convenio.planos.map(plano =>
            plano.id === planoId ? { ...plano, selecionado: !plano.selecionado } : plano
          );
          return {
            ...convenio,
            selecionado: planosAtualizados.every(plano => plano.selecionado),
            planos: planosAtualizados
          };
        }
        return convenio;
      })
    );
  };

  const onSubmit = async (data: Recepcao) => {
    if(!endereco.cep || !endereco.rua || !endereco.numero || !endereco.bairro || !endereco.cidade || !endereco.uf) {
      return;
    }

    const itemComEndereco = {
      ...data,
      endereco,
    };
    try {
      await axios.put(`/api/Recepcao/${itemComEndereco.id}`, itemComEndereco);
      reset();
      onSave();
    } catch (error) {
      console.log(error);
      setSnackbar(new SnackbarState('Erro ao editar o registro!', 'error', true));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Recepção</h2>
      
      <div className="mb-4">
        <div className="flex border-b">
          <button
            type="button"
            className={`py-2 px-4 ${activeTab === 'informacoes' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('informacoes')}
          >
            Informações
          </button>
          <button
            type="button"
            className={`py-2 px-4 ${activeTab === 'conveniosPlanos' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('conveniosPlanos')}
          >
            Convênios e Planos
          </button>
        </div>
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
        </>
      )}

       {activeTab === 'conveniosPlanos' && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Convênios e Planos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded p-4">
                <h4 className="font-semibold mb-2">Convênios</h4>
                {conveniosEPlanos.map((convenio) => (
                  <div key={convenio.id ?? `convenio-${Math.random()}`} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600 mr-2"
                      checked={convenio.selecionado}
                      onChange={() => handleConvenioChange(convenio.id)}
                    />
                    <span>{convenio.descricao}</span>
                  </div>
                ))}
              </div>
              <div className="border rounded p-4">
                <h4 className="font-semibold mb-2">Planos</h4>
                {conveniosEPlanos.flatMap((convenio) => 
                  convenio.planos.map((plano) => (
                    <div key={plano.id ?? `plano-${Math.random()}`} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 mr-2"
                        checked={plano.selecionado}
                        onChange={() => handlePlanoChange(convenio.id, plano.id)}
                      />
                      <span>{plano.descricao}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
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