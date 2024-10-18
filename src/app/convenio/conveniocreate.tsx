//src/app/convenio/conveniocreate.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import InputMask from 'react-input-mask-next';
import { Convenio } from '../../models/convenio';
import { SnackbarState } from '@/models/snackbarState';
import { buscarEnderecoViaCep } from '@/utils/endereco';
import { Endereco } from '@/models/endereco';
import { UF } from '@/models/uf';
import { Empresa } from '@/models/empresa';

interface ConvenioCreateFormProps {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const ConvenioCreateForm = ({ onSave, onClose,setSnackbar  }: ConvenioCreateFormProps) => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm<Convenio>();

  const [empresas, setEmpresa] = useState<Empresa[]>([]);
  const [ufOptions, setUFOptions] = useState<UF[]>([]);
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState<Endereco>({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });
  // Novo estado para indicar se está processando a requisição
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

    fetchUF();
    fetchEmpresa();
  }, [setSnackbar]);

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
        // Verifica se a requisição já está em andamento
        if (isSubmitting) return;

      try {
        setIsSubmitting(true);
        await axios.post('/api/Convenio', convenioComEndereco);
        reset();
        onSave();
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao criar o registro!', 'error', true)); // Exibe erro via snackbar
      } finally {
        setIsSubmitting(false); // Encerra o estado de submissão
      }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cepDigitado = e.target.value.replace(/\D/g, '');
    setCep(cepDigitado);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} 
    className="p-4 max-h-[75vh] max-w-[90vw] overflow-x-auto overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Novo Convênio</h2>
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

      <div className="mb-4">
        <label className="block text-gray-800">CEP *</label>
          <InputMask
            value={cep}
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
