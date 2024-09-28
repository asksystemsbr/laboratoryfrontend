"use client";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import InputMask from 'react-input-mask-next';
import { SnackbarState } from '@/models/snackbarState';
import { differenceInYears } from 'date-fns';
import { Convenio } from '@/models/convenio';
import { Plano } from '@/models/plano';

interface Cliente {
  id?: number;
  nome: string;
  sexo?: string;
  cpfCnpj: string;
  rg?: string;
  endereco: string;
  numero: string;
  telefone: string;
  email: string;
  situacaoId: number;
  dataCadastro?: Date;
  convenioId?: number;
  planoId?: number;

  nomeFantasia?: string;
  ie?: string;
  im?: string;
  nascimento?: Date | string;
  nomeResponsavel?: string;
  cpfResponsavel?: string;
  telefoneResponsavel?: string;
}

interface ClienteCreateFormProps {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const ClienteCreateForm = ({ onSave, onClose, setSnackbar }: ClienteCreateFormProps) => {
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<Cliente>();
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [uf, setUf] = useState('');
  const [isCNPJ, setIsCNPJ] = useState(false);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);

  const nascimento = watch('nascimento');
  const isMenorDeIdade = nascimento ? differenceInYears(new Date(), new Date(nascimento)) < 18 : false;

  useEffect(() => {
    const fetchConvenios = async () => {
      try {
        const response = await axios.get('/api/Convenio');
        setConvenios(response.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao carregar convênios!', 'error', true));
      }
    };

    const fetchPlanos = async () => {
      try {
        const response = await axios.get('/api/Plano');
        setPlanos(response.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao carregar planos!', 'error', true));
      }
    };

    fetchConvenios();
    fetchPlanos();
  }, []);

  const buscarEnderecoViaCep = async (cep: string) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (response.data.erro) {
        setSnackbar(new SnackbarState('CEP não encontrado!', 'error', true));
      } else {
        setLogradouro(response.data.logradouro);
        setComplemento(response.data.complemento);
        setBairro(response.data.bairro);
        setLocalidade(response.data.localidade);
        setUf(response.data.uf);
      }
    } catch {
      setSnackbar(new SnackbarState('Erro ao buscar CEP!', 'error', true));
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cepDigitado = e.target.value.replace(/\D/g, '');
    setCep(cepDigitado);
    if (cepDigitado.length === 8) {
      buscarEnderecoViaCep(cepDigitado);
    }
  };

  const onSubmit = async (data: Cliente) => {
    try {
      await axios.post('/api/Cliente', data);
      reset();
      onSave();
    } catch {
      setSnackbar(new SnackbarState('Erro ao criar o cliente!', 'error', true));
    }
  };

  const toggleMask = () => {
    setIsCNPJ(!isCNPJ);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="p-4 max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-y-auto max-h-screen">
        
        <h2 className="text-xl font-bold mb-2 text-gray-800">Novo Cliente</h2>

        {/* Nome e Email */}
        <div className="flex space-x-2 mb-3">
          <div className="w-1/2">
            <label className="block text-gray-800">Nome</label>
            <input 
              {...register('nome', { required: 'O nome é obrigatório' })} 
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800" 
            />
            {errors.nome && <p className="text-red-500 text-sm">{errors.nome?.message}</p>}
          </div>

          <div className="w-1/2">
            <label className="block text-gray-800">Email</label>
            <input 
              {...register('email', { 
                required: 'O e-mail é obrigatório',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'E-mail inválido'
                }
              })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800" 
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email?.message}</p>}
          </div>
        </div>

        {/* Sexo, Convênio, Plano e Situação */}
        <div className="flex space-x-2 mb-3">
          <div className="w-1/4">
            <label className="block text-gray-800">Sexo</label>
            <select {...register('sexo')} className="border rounded w-full py-1 px-3 mt-1 text-gray-800">
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>

          <div className="w-1/4">
            <label className="block text-gray-800">Convênio</label>
            <select {...register('convenioId')} className="border rounded w-full py-1 px-3 mt-1 text-gray-800">
              <option value="">Selecione</option>
              {convenios.map((convenio) => (
                <option key={convenio.id} value={convenio.id}>
                  {convenio.descricao}
                </option>
              ))}
            </select>
          </div>

          <div className="w-1/4">
            <label className="block text-gray-800">Plano</label>
            <select {...register('planoId')} className="border rounded w-full py-1 px-3 mt-1 text-gray-800">
              <option value="">Selecione</option>
              {planos.map((plano) => (
                <option key={plano.id} value={plano.id}>
                  {plano.descricao}
                </option>
              ))}
            </select>
          </div>

          <div className="w-1/4">
            <label className="block text-gray-800">Situação</label>
            <select 
              {...register('situacaoId', { required: 'A situação é obrigatória' })}
              className={`border rounded w-full py-1 px-3 mt-1 text-gray-800 ${Number(watch('situacaoId')) === 0 ? 'bg-red-200' : 'bg-green-200'}`}
            >
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </select>
          </div>
        </div>

        {/* CPF/CNPJ, RG, CEP e Data de Nascimento */}
        <div className="flex space-x-2 items-end mb-3">
          <div className="w-1/2">
            <label className="block text-gray-800">CPF/CNPJ</label>
            <div className="flex items-center">
              <InputMask
                {...register('cpfCnpj', { required: 'CPF/CNPJ é obrigatório' })}
                mask={isCNPJ ? '99.999.999/9999-99' : '999.999.999-99'}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
                placeholder={isCNPJ ? 'CNPJ' : 'CPF'}
              />
              <button
                type="button"
                onClick={toggleMask}
                className="ml-2 py-1 px-2 bg-blue-500 text-white rounded"
              >
                Usar {isCNPJ ? 'CPF' : 'CNPJ'}
              </button>
            </div>
            {errors.cpfCnpj && <p className="text-red-500 text-sm">{errors.cpfCnpj?.message}</p>}
          </div>

          <div className="w-1/4">
            <label className="block text-gray-800">RG</label>
            <InputMask
              {...register('rg')}
              mask="99.999.999-9"
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div className="w-1/4">
            <label className="block text-gray-800">CEP</label>
            <InputMask
              value={cep}
              mask="99999-999"
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              onChange={handleCepChange}
            />
          </div>

          <div className="w-1/4">
            <label className="block text-gray-800">Data de Nascimento</label>
            <input
              type="date"
              {...register('nascimento')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>
        </div>

        {/* Campos para CNPJ (Nome Fantasia, IE, IM) */}
        {isCNPJ && (
          <div className="flex space-x-2 mb-3">
            <div className="w-1/3">
              <label className="block text-gray-800">Nome Fantasia</label>
              <input 
                {...register('nomeFantasia')}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
            </div>

            <div className="w-1/3">
              <label className="block text-gray-800">Inscrição Estadual (IE)</label>
              <input 
                {...register('ie')}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
            </div>

            <div className="w-1/3">
              <label className="block text-gray-800">Inscrição Municipal (IM)</label>
              <input 
                {...register('im')}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
            </div>
          </div>
        )}

        {/* Campos para Menores de Idade */}
        {isMenorDeIdade && (
          <div className="flex space-x-2 mb-3">
            <div className="w-1/3">
              <label className="block text-gray-800">Nome do Responsável</label>
              <input 
                {...register('nomeResponsavel')}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
            </div>

            <div className="w-1/3">
              <label className="block text-gray-800">CPF do Responsável</label>
              <InputMask
                {...register('cpfResponsavel')}
                mask="999.999.999-99"
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
            </div>

            <div className="w-1/3">
              <label className="block text-gray-800">Telefone do Responsável</label>
              <InputMask
                {...register('telefoneResponsavel')}
                mask="(99) 99999-9999"
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
            </div>
          </div>
        )}

        {/* Endereço Completo */}
        <div className="flex space-x-2 mb-3">
          <div className="w-3/4">
            <label className="block text-gray-800">Rua (Logradouro)</label>
            <input 
              value={logradouro} 
              onChange={(e) => setLogradouro(e.target.value)} 
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800 bg-gray-200" 
            />
          </div>

          <div className="w-1/4">
            <label className="block text-gray-800">Número</label>
            <input 
              {...register('numero')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800 bg-gray-200" 
            />
          </div>
        </div>

        <div className="flex space-x-2 mb-3">
          <div className="w-1/3">
            <label className="block text-gray-800">Complemento</label>
            <input 
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800 bg-gray-200"
            />
          </div>

          <div className="w-1/3">
            <label className="block text-gray-800">Bairro</label>
            <input
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800 bg-gray-200"
            />
          </div>

          <div className="w-1/3">
            <label className="block text-gray-800">Cidade</label>
            <input
              value={localidade}
              onChange={(e) => setLocalidade(e.target.value)}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800 bg-gray-200"
            />
          </div>

          <div className="w-1/6">
            <label className="block text-gray-800">UF</label>
            <input
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800 bg-gray-200"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="mr-2 py-2 px-4 rounded bg-gray-500 text-white">
            Cancelar
          </button>
          <button type="submit" className="py-2 px-4 rounded bg-blue-500 text-white">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};