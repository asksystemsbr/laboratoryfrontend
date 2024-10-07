//src/app/cliente/clienteedit.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import InputMask from 'react-input-mask-next';
import { differenceInYears } from 'date-fns';
import { SnackbarState } from '@/models/snackbarState';
import { Convenio } from '@/models/convenio';
import { Plano } from '@/models/plano';
import { Endereco } from '@/models/endereco'; 
import { Cliente } from '@/models/cliente'; 
import { validateCPF } from '@/utils/cpfValidator';
import { validarCNPJ } from '@/utils/cnpjValidator';
import { validateDate } from '@/utils/validateDate';
import { UF } from '@/models/uf';
import { formatDateForInput } from '@/utils/formatDateForInput';
import { buscarEnderecoViaCep } from '@/utils/endereco';
import { validatePhone } from '@/utils/phone';

interface ClienteEditFormProps {
  cliente: Cliente;
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const ClienteEditForm = ({ cliente, onSave, onClose, setSnackbar }: ClienteEditFormProps) => {
  const { register, handleSubmit, setValue, formState: { errors }, watch, setError } = useForm<Cliente>({
    defaultValues: cliente,
  });
  const [isCNPJ, setIsCNPJ] = useState(false);
  const [isPhoneFixo, setIsPhoneFixo] = useState(false);
  const [isPhoneFixoResponsavel, setIsPhoneFixoResponsavel] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [ufOptions, setUFOptions] = useState<UF[]>([]);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [endereco, setEndereco] = useState<Endereco>({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });

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

   
    const fetchUF = async () => {
      try {
        const response = await axios.get('/api/UF'); // Supondo que essa seja a rota da API
        setUFOptions(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar os tipos de solicitante', 'error', true));
      }
    };

    fetchConvenios();
    fetchPlanos();
    fetchUF();

    Promise.all([fetchConvenios(),fetchUF(),fetchPlanos()]).then(() => setIsLoaded(true));
  }, [setSnackbar]);

  useEffect(() => {
    const fetchEndereco = async () => {
      try {
        const response = await axios.get(`/api/Endereco/${cliente.enderecoId}`);
        setEndereco(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar endereço', 'error', true));
      }
    };

    if (isLoaded) {
      setValue('convenioId', cliente.convenioId);
      setValue('planoId', cliente.planoId);
      setValue('nascimento', formatDateForInput(cliente.nascimento)); // Converter a data para o formato correto
      if ((cliente?.cpfCnpj ?? '').length > 14) {
        setIsCNPJ(true);
      }
      else{
        setIsCNPJ(false);
      }
      fetchEndereco();
    }
  }, [isLoaded, cliente, setValue,setSnackbar]);


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

  //const toggleMask = () => setIsCNPJ((prev) => !prev);


  const onSubmit = async (data: Cliente) => {
        if(!endereco.cep  
          || !endereco.rua 
          || !endereco.numero  
          || !endereco.bairro
          || !endereco.cidade
          || !endereco.uf  
      ){
        return;
      }
      // Validação de CPF/CNPJ
      const cpfCnpj = data.cpfCnpj || '';
      if (!isCNPJ && !validateCPF(cpfCnpj)) {
        setError('cpfCnpj', { type: 'manual', message: 'CPF inválido!' });
        return;
      } else if (isCNPJ && !validarCNPJ(cpfCnpj)) {
        setError('cpfCnpj', { type: 'manual', message: 'CNPJ inválido!' });
        return;
      }
      const clienteComEndereco = {
        ...data,
        endereco,  // Inclui o endereço completo ao enviar o cliente

        // Comparação correta de convenioId e planoId para valores numéricos ou string vazia
        convenioId: typeof data.convenioId === 'string' && data.convenioId === '' ? null : data.convenioId,
        planoId: typeof data.planoId === 'string' && data.planoId === '' ? null : data.planoId,
        sexo: data.sexo === '' ? null : data.sexo,
        nomeResponsavel: data.nomeResponsavel === '' ? null : data.nomeResponsavel,
        cpfResponsavel: data.cpfResponsavel === '' ? null : data.cpfResponsavel,
        telefoneResponsavel: data.telefoneResponsavel === '' ? null : data.telefoneResponsavel,
      };

    try {
      await axios.put(`/api/Cliente/${clienteComEndereco.id}`, clienteComEndereco);
      setSnackbar(new SnackbarState('Cliente editado com sucesso!', 'success', true));
      onSave();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao editar o cliente!', 'error', true));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="p-4 max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-y-auto max-h-screen">
        
        <h2 className="text-xl font-bold mb-2 text-gray-800">Novo Cliente</h2>

        {/* Nome */}
        <div className="flex space-x-2 mb-3">
          <div className="w-full">
            <label className="block text-gray-800">Nome *</label>
            <input 
            type='text'
              {...register('nome', { required: 'O nome é obrigatório' })} 
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800" 
            />
            {errors.nome && <p className="text-red-500 text-sm">{errors.nome?.message}</p>}
          </div>
        </div>

        {/* E-mail e Telefone */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">Email *</label>
            <input 
            type='text'
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

          <div>
            <label className="block text-gray-800">Telefone *</label>
            <InputMask
                {...register('telefone', { 
                  required: 'Telefone obrigatório',
                 })}
                mask={isPhoneFixo ? '(99) 9999-9999' : '(99) 99999-9999'}
                maskPlaceholder={null}
                alwaysShowMask={false}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
                onBlur={(e) => {
                  const phoneImput = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número;
                  if (phoneImput.length === 10) {
                    setIsPhoneFixo(true);
                  }
                  else{
                    setIsPhoneFixo(false);
                  }
                    if (!validatePhone(phoneImput)) {
                      setError('telefone', {
                        type: 'manual',
                        message: 'Telefone obrigatório',
                      });
                      return;
                    }                    
                }}
              />
            {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone?.message}</p>}
          </div>
        </div>

        {/* Sexo, Convênio, Plano e Situação */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">Sexo *</label>
            <select {...register('sexo', { required: 'O sexo é obrigatório' })} className="border rounded w-full py-1 px-3 mt-1 text-gray-800">
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
            {errors.sexo && <p className="text-red-500 text-sm">{errors.sexo?.message}</p>}
          </div>

          <div>
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

          <div>
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

          <div>
            <label className="block text-gray-800">Situação *</label>
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
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">CPF/CNPJ *</label>
            <div className="flex items-center">
              <InputMask
                {...register('cpfCnpj', { required: 'CPF/CNPJ é obrigatório' })}
                mask={isCNPJ ? '99.999.999/9999-99' : '999.999.999-99'}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
                placeholder={isCNPJ ? 'CNPJ' : 'CPF'}
                disabled
                onBlur={(e) => {
                  const cpf = e.target.value;
                  if(isCNPJ)
                  {
                    if (!validarCNPJ(cpf)) {
                      setError('cpfCnpj', {
                        type: 'manual',
                        message: 'CNPJ inválido',
                      });
                      return;
                    }                    
                  }
                  else
                  {
                    if (!validateCPF(cpf)) {
                      setError('cpfCnpj', {
                        type: 'manual',
                        message: 'CPF inválido',
                      });
                      return;
                    } 
                  }
                }}
              />             
            </div>
            {errors.cpfCnpj && <p className="text-red-500 text-sm">{errors.cpfCnpj?.message}</p>}
          </div>

          <div>
            <label className="block text-gray-800">RG</label>
            <InputMask
              {...register('rg')}
              mask="99.999.999-9"
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-gray-800">CEP *</label>
            <InputMask
              value={endereco.cep}
              mask="99999-999"
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              onChange={handleCepChange}
            />
            {!endereco.cep && <p className="text-red-500 text-sm">CEP é obrigatório</p>}
          </div>

          <div>
            <label className="block text-gray-800">Data de Nascimento *</label>
            <input
              type="date"
              {...register('nascimento', { 
                required: 'Obrigatória',
                validate: validateDate
               })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.nascimento && <p className="text-red-500 text-sm">{errors.nascimento?.message}</p>}
          </div>
        </div>

        {/* Campos para CNPJ (Nome Fantasia, IE, IM) */}
        {isCNPJ && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-800">Nome Fantasia *</label>
              <input 
              type='text'
                 {...register('nomeFantasia', { required: isCNPJ && 'Nome fantasia obrigatório' })}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
              {errors.nomeFantasia && <p className="text-red-500 text-sm">{errors.nomeFantasia?.message}</p>}
            </div>

            <div>
              <label className="block text-gray-800">Inscrição Estadual (IE)</label>
              <input 
              type='text'
                {...register('ie')}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-gray-800">Inscrição Municipal (IM)</label>
              <input 
              type='text'
                {...register('im')}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
            </div>
          </div>
        )}

        {/* Campos para Menores de Idade */}
        {isMenorDeIdade && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-800">Nome do Responsável *</label>
              <input 
              type='text'
              {...register('nomeResponsavel', { required: isMenorDeIdade && 'Nome do responsável obrigatório' })}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
              {errors.nomeResponsavel && <p className="text-red-500 text-sm">{errors.nomeResponsavel?.message}</p>}
            </div>

            <div>
              <label className="block text-gray-800">CPF do Responsável </label>
              <InputMask
                  {...register('cpfResponsavel')}
                mask="999.999.999-99"
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
                onBlur={(e) => {
                  const cpf = e.target.value;
                  if (!validateCPF(cpf)) {
                    setError('cpfResponsavel', {
                      type: 'manual',
                      message: 'CPF do responsável inválido',
                    });
                    return;
                  }
                }}
              />
              {errors.cpfResponsavel && <p className="text-red-500 text-sm">{errors.cpfResponsavel?.message}</p>}
            </div>

            <div>
              <label className="block text-gray-800">Telefone do Responsável *</label>
              <InputMask
                {...register('telefoneResponsavel', { 
                  required: isMenorDeIdade && 'Telefone do responsável obrigatório',
                 })}
                mask={isPhoneFixoResponsavel ? '(99) 9999-9999' : '(99) 99999-9999'}
                maskPlaceholder={null}
                alwaysShowMask={false}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
                onBlur={(e) => {
                  const phoneImput = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número;
                  if (phoneImput.length === 10) {
                    setIsPhoneFixoResponsavel(true);
                  }
                  else{
                    setIsPhoneFixoResponsavel(false);
                  }
                    if (!validatePhone(phoneImput)) {
                      setError('telefoneResponsavel', {
                        type: 'manual',
                        message: 'Telefone do responsável obrigatório',
                      });
                      return;
                    }                    
                }}
              />
              {errors.telefoneResponsavel && <p className="text-red-500 text-sm">{errors.telefoneResponsavel?.message}</p>}
            </div>
          </div>
        )}

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