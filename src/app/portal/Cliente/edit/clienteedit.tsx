//src/app/portal/Cliente/create/clientecreate.tsx
"use client"; 

import React, { useEffect, useState } from 'react';
import { useForm} from 'react-hook-form';
import axios from 'axios';
import InputMask from 'react-input-mask-next';
import { Cliente } from '@/models/cliente'; 
import { validateDateEmpty } from '@/utils/validateDate';
import { Endereco } from '@/models/endereco';
import { validatePhone } from '@/utils/phone';
import { useRouter } from 'next/navigation';
import InformativeModal from '@/components/InformativeModal';
import { usePortalAuth  } from '../../../authPortal'; // Importa o hook de autenticação
import { formatDateForInput } from '@/utils/formatDateForInput';
import { validateCPF } from '@/utils/cpfValidator';


export const ClienteEditForm = () => {
  const router = useRouter();
  const authContext = usePortalAuth ();
  
  const { user } = authContext || {};

  const { register, handleSubmit, reset, setValue, formState: { errors }, setError } = useForm<Cliente>({
    defaultValues: undefined,
  });


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isPhoneFixo, setIsPhoneFixo] = useState(false);
  const [endereco] = useState<Endereco>({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });


  const [isLoading, setIsLoading] = useState(true);
    
  useEffect(() => {
    if (!user) {
      router.push("./portal");
    }
  }, [user, router]);

    useEffect(() => {
      if (!user) return;

      const fetchUserData = async () => {
        try {
          const response = await axios.get(`/api/ClientePortal/${user.id}`);
          const clienteData = response.data;
  
          // Populate form fields with fetched data
          Object.keys(clienteData).forEach((key) => {
            setValue(key as keyof Cliente, clienteData[key]);
          });
  
          setValue('nascimento',clienteData.nascimento ?  formatDateForInput(clienteData.nascimento):''); // Converter a data para o formato correto
        } catch (error) {
          console.error("Erro ao buscar os dados do cliente:", error);
          setModalMessage("Erro ao carregar os dados do cliente.");
          setIsModalOpen(true);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    }, [user?.id, setValue]);


  const onSubmit = async (data: Cliente) => {

  

    const clienteComEndereco = {
      ...data,
      endereco,  // Inclui o endereço completo ao enviar o cliente

       // Comparação correta de convenioId e planoId para valores numéricos ou string vazia
       convenioId: null,
       planoId: null ,
       sexo: data.sexo === '' ? null : data.sexo,
       nomeResponsavel:  null,
       cpfResponsavel:  null ,
       telefoneResponsavel: null,
       foto: null,
       validadeMatricula: null,
       dataCadastro: new Date().toISOString(),
       nascimento: data.nascimento || null,  // Garantir que `nascimento` seja null
    };


    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await axios.put(`/api/ClientePortal/updatePortal/${data.id}`, clienteComEndereco);
      reset();
      setModalMessage('Usuário atualizado com sucesso');
      setIsModalOpen(true);
    } catch {
      setModalMessage('Erro ao atualizar o usuário');
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return <div>Carregando dados...</div>;
  }
    
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-auto">
        
        <h2 className="text-xl font-bold mb-6">Registrar-se</h2>

      {/* Nome */}
      <div className="mb-4">
        <label className="block text-gray-700">Nome *</label>
        <input
          type="text"
          {...register("nome", { required: "O nome é obrigatório" })}
          className="w-full px-4 py-2 border rounded-md"
        />
        {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
      </div>

      {/* CPF */}
      <div className="mb-4">
        <label className="block text-gray-700">CPF *</label>
        <InputMask
                {...register('cpfCnpj')}
                mask={'999.999.999-99'}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
                placeholder={'CPF'}
                onBlur={(e) => {
                  const cpf = e.target.value;
                    if (!validateCPF(cpf)) {
                      setError('cpfCnpj', {
                        type: 'manual',
                        message: 'CPF inválido',
                      });
                      return;
                    } 
                }}
              /> 
        {errors.cpfCnpj && <p className="text-red-500 text-sm">{errors.cpfCnpj.message}</p>}
      </div>

      {/* Data de Nascimento */}
      <div>
        <label className="block text-gray-700">Data de Nascimento</label>
        <input
          type="date"
          {...register('nascimento', { 
            required: 'Obrigatória',
            validate: validateDateEmpty
            })}
          className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
        />
        {errors.nascimento && <p className="text-red-500 text-sm">{errors.nascimento?.message}</p>}
      </div>

      {/* Sexo */}
      <div className="mb-4">
        <label className="block text-gray-700">Sexo *</label>
        <select
          {...register("sexo", { required: "O sexo é obrigatório" })}
          className="w-full px-4 py-2 border rounded-md"
        >
          <option value="">Selecione</option>
          <option value="M">Masculino</option>
          <option value="F">Feminino</option>
        </select>
        {errors.sexo && <p className="text-red-500 text-sm">{errors.sexo.message}</p>}
      </div>

      {/* Telefone */}
      <div className="mb-4">
          <label className="block text-gray-700">Telefone *</label>
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

      {/* Email */}
      <div className="mb-4">
        <label className="block text-gray-700">Email *</label>
        <input
          type="email"
          {...register("email", { required: "O email é obrigatório" })}
          className="w-full px-4 py-2 border rounded-md"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      {/* Senha */}
      <div className="mb-4">
        <label className="block text-gray-700">Senha *</label>
        <input
          type="password"
          {...register("senha", { required: "A senha é obrigatória" })}
          className="w-full px-4 py-2 border rounded-md"
        />
        {errors.senha && <p className="text-red-500 text-sm">{errors.senha.message}</p>}
      </div>
     
            
        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={() => router.push('../Menu')}
            className="px-6 py-3 text-lg bg-gray-400 text-white rounded-md hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-3 text-lg bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Salvar
          </button>

          {/* Informative Modal */}
          <InformativeModal
          isOpen={isModalOpen}
          title="Atenção"
          message={modalMessage}
          onClose={() => {
            setIsModalOpen(false);
            router.push('../Menu');
          }}
        />
        </div>
      </form>
  );
};