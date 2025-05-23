//src/app/portal/Cliente/create/clientecreate.tsx
import React, { useState } from 'react';
// import { useForm,FieldErrors, UseFormRegister } from 'react-hook-form';
import { useForm} from 'react-hook-form';
import axios from 'axios';
import InputMask from 'react-input-mask-next';
import { SnackbarState } from '@/models/snackbarState';
import { Cliente } from '@/models/cliente'; 
import { validateDateEmpty } from '@/utils/validateDate';
import { Endereco } from '@/models/endereco';
import { validatePhone } from '@/utils/phone';
import { useRouter } from 'next/navigation';
import InformativeModal from '@/components/InformativeModal';

interface ClienteCreateFormProps {
  setSnackbar: (state: SnackbarState) => void;
}

export const ClienteCreateForm = ({ 
      setSnackbar,  
   }: ClienteCreateFormProps) => {
  const { register, handleSubmit, reset, formState: { errors }, setError } = useForm<Cliente>({

  });
  const router = useRouter();
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

  // Novo estado para indicar se está processando a requisição
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const ContainerElement = isSimpleMode ? 'div' : 'form';
  const ContainerElement = 'form';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

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
      await axios.post('/api/ClientePortal/createPortal', clienteComEndereco);
      reset();
      setModalMessage('Usuário cadastrado com sucesso');
      setIsModalOpen(true);
    } catch {
      setSnackbar(new SnackbarState('Erro ao criar o cliente!', 'error', true));
    } finally {
      setIsSubmitting(false);
    }
  };


    
  return (
      <ContainerElement  
        {...({ onSubmit: handleSubmit(onSubmit) })} 
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-auto">
        
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
            onClick={() => router.push('../')}
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
            router.push('../');
          }}
        />
        </div>
      </ContainerElement >
  );
};