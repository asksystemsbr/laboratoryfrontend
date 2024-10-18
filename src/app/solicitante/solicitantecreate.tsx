//src/app/solicitante/solicitantecreate.tsx
"use client";
import React, { useEffect, useState }  from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import InputMask from 'react-input-mask-next';
import { Solicitante } from '../../models/solicitante';
import { TipoSolicitante } from '../../models/tipoSolicitante';
import { SnackbarState } from '@/models/snackbarState';
import { UF } from '@/models/uf';
import { validateCPF } from '@/utils/cpfValidator';
import { Especialidade } from '@/models/especialidade';

interface SolicitanteCreateFormProps {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const SolicitanteCreateForm = ({ onSave, onClose,setSnackbar  }: SolicitanteCreateFormProps) => {
  const { register, handleSubmit, reset, setError, clearErrors, formState: { errors } } = useForm<Solicitante>();
  const [tipoSolicitanteOptions, setTipoSolicitanteOptions] = useState<TipoSolicitante[]>([]);
  const [ufOptions, setUFOptions] = useState<UF[]>([]);
  const [cpfInUse, setCpfInUse] = useState<boolean>(false);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTipoSolicitantes = async () => {
      try {
        const response = await axios.get('/api/TipoSolicitante'); // Supondo que essa seja a rota da API
        setTipoSolicitanteOptions(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar os tipos de solicitante', 'error', true));
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
    const loadEspecialidades = async () => {
      try {
        const response = await axios.get('/api/Especialidade');
        setEspecialidades(response.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
      }
    };

    fetchTipoSolicitantes();
    fetchUF();
    loadEspecialidades();
  }, [setSnackbar]);

   // Função para verificar se o CPF já existe
   const checkCpfExists = async (cpf: string) => {
    try {
      const response = await axios.get(`/api/Solicitante/existsByCPF/${cpf}`);
      if (response.data) {
        setError('cpf', {
          type: 'manual',
          message: 'O CPF já está cadastrado',
        });
        setCpfInUse(true);
      } else {
        clearErrors('cpf');
        setCpfInUse(false);
      }
    } catch (error) {
      console.log('Erro ao verificar o CPF:', error);
    }
  };

  const onSubmit = async (data: Solicitante) => {
    if (isSubmitting) return;
    const cpfInput = data.cpf;
    if (!validateCPF(cpfInput)) {
      setError('cpf', {
        type: 'manual',
        message: 'CPF inválido',
      });
      return;
    }
    checkCpfExists(cpfInput);
    if (cpfInUse) {
      setSnackbar(new SnackbarState('O CPF já está em uso', 'error', true));
      return;
    }

    try {
      setIsSubmitting(true); 
        await axios.post('/api/Solicitante', data);
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
        <h2 className="text-xl font-bold mb-4">Novo Solicitante</h2>

        {/* Campo de descrição */}
        <div className="mb-4">
          <label className="block text-gray-700">Nome</label>
          <textarea
            {...register('descricao', { required: 'O nome é obrigatório' })}
            className="border rounded w-full py-2 px-3 mt-1"
          />
          {errors.descricao && <p className="text-red-500 text-sm">{errors.descricao?.message}</p>}
        </div>



        {/* Campo de UF do CRM */}
        <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Campo de CRM */}
        <div className="mb-4">
          <label className="block text-gray-700">CRM</label>
          <input
            {...register('crm', { required: 'O CRM é obrigatório' })}
            type="text"
            className="border rounded w-full py-2 px-3 mt-1"
          />
          {errors.crm && <p className="text-red-500 text-sm">{errors.crm?.message}</p>}
        </div>

          {/* Campo de UF do CRM */}
          <div>
            <label className="block text-gray-700">UF do CRM</label>
            <select
              {...register('ufCrm', { required: 'A UF do CRM é obrigatória' })}
              className="border rounded w-full py-2 px-3 mt-1"
            >
              <option value="">Selecione um tipo</option>
              {ufOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.siglaUf}
                </option>
              ))}
            </select>
            {errors.ufCrm && <p className="text-red-500 text-sm">{errors.ufCrm?.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Campo de CPF */}
          <div>
            <label className="block text-gray-700">CPF</label>
            <InputMask
              {...register('cpf', { 
                required: 'O CPF é obrigatório',
                pattern: {
                  value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                  message: 'Formato de CPF inválido',
                },
               })}
              mask= '999.999.999-99'
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              placeholder= 'CPF'
              onBlur={(e) => {
                const cpf = e.target.value;
                if (!validateCPF(cpf)) {
                  setError('cpf', {
                    type: 'manual',
                    message: 'CPF inválido',
                  });
                  return;
                }
                checkCpfExists(cpf);
              }}
            />
            {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf?.message}</p>}
          </div>
          {/* Campo de Telefone */}
          <div>
            <label className="block text-gray-700">Telefone</label>
            <InputMask
              {...register('telefone', { 
                required: 'O telefone é obrigatório' ,
                pattern: {
                  value: /^\(\d{2}\) \d{5}-\d{4}$/,
                  message: 'Formato de telefone inválido',
                },
              })}
              mask="(99) 99999-9999"
              className="border rounded w-full py-2 px-3 mt-1"
            />
            {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone?.message}</p>}
          </div>          
        </div>

        {/* Campo de E-mail */}
        <div className="mb-4">
          <label className="block text-gray-700">E-mail</label>
          <input
            {...register('email', { 
              required: 'O e-mail é obrigatório',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'E-mail inválido'
              }
            })}
            type="text"
            className="border rounded w-full py-2 px-3 mt-1"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email?.message}</p>}
        </div>



        {/* Campo de Tipo de Solicitante (select) */}
        <div className="mb-4">
          <label className="block text-gray-700">Tipo de Solicitante</label>
          <select
            {...register('tipoSolicitanteId', { required: 'O tipo de solicitante é obrigatório' })}
            className="border rounded w-full py-2 px-3 mt-1"
          >
            <option value="">Selecione um tipo</option>
            {tipoSolicitanteOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.descricao}
              </option>
            ))}
          </select>
          {errors.tipoSolicitanteId && <p className="text-red-500 text-sm">{errors.tipoSolicitanteId?.message}</p>}
        </div>
          {/* Especialidade */}
          <div className="mb-4">
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
        {/* Botões de ação */}
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
