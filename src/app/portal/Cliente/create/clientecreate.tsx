//src/app/portal/Cliente/create/clientecreate.tsx
import React, { useEffect, useState } from 'react';
// import { useForm,FieldErrors, UseFormRegister } from 'react-hook-form';
import { useForm} from 'react-hook-form';
import axios from 'axios';
import InputMask from 'react-input-mask-next';
import { SnackbarState } from '@/models/snackbarState';
import { Cliente } from '@/models/cliente'; 
import { validateCPF } from '@/utils/cpfValidator';
import { validateDateEmpty } from '@/utils/validateDate';
import { UF } from '@/models/uf';
import { buscarEnderecoViaCep} from '@/utils/endereco';
import { Endereco } from '@/models/endereco';
import { validatePhone } from '@/utils/phone';

interface ClienteCreateFormProps {
  onSave: (newClient: Cliente) => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const ClienteCreateForm = ({ 
      onSave, 
      onClose, 
      setSnackbar,  
   }: ClienteCreateFormProps) => {
  const { register, handleSubmit, reset, formState: { errors }, setError,clearErrors } = useForm<Cliente>({

  });
  const [cep, setCep] = useState('');
  const [isPhoneFixo, setIsPhoneFixo] = useState(false);
  const [cpfInUse, setCpfInUse] = useState<boolean>(false);
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

  // Novo estado para indicar se está processando a requisição
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const ContainerElement = isSimpleMode ? 'div' : 'form';
  const ContainerElement = 'form';


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
  }, [setSnackbar]);

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

     // Função para verificar se o CPF já existe
     const checkCpfExists = async (cpf: string) => {
      try {
        setCpfInUse(true);
        const response = await axios.get(`/api/Cliente/existsByCPF/${cpf}`);
        if (response.data) {
          setError('cpfCnpj', {
            type: 'manual',
            message: 'O CPF/CNPJ já está cadastrado',
          });
          setCpfInUse(true);
        } else {
          clearErrors('cpfCnpj');
          setCpfInUse(false);
        }
      } catch (error) {
        console.log('Erro ao verificar o CPF/CNPJ:', error);
      }
    };

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
    if(cpfCnpj!=''){
      if ( !validateCPF(cpfCnpj)) {
        setError('cpfCnpj', { type: 'manual', message: 'CPF inválido!' });
        return;
      }

      checkCpfExists(cpfCnpj);
      if (cpfInUse) {
        setSnackbar(new SnackbarState('O CPF/CNPJ já está em uso', 'error', true));
        return;
      }
    }
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
      const response = await axios.post('/api/Cliente', clienteComEndereco);
      reset();
      onSave(response.data);
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
        
        {/* CPF */}
        <div className="mb-4">
        <label className="block text-gray-700">CPF</label>
            <div className="flex items-center">
              <InputMask
                {...register('cpfCnpj')}
                mask= '999.999.999-99'
                className="border rounded w-full py-1 px-3 mt-1 text-gray-700"
                placeholder= 'CPF'
                onBlur={(e) => {
                  const cpf = e.target.value;
                    if (!validateCPF(cpf)) {
                      setError('cpfCnpj', {
                        type: 'manual',
                        message: 'CPF inválido',
                      });
                      return;
                    } 
                  
                  checkCpfExists(cpf);
                }}
              />          
            </div>
            {errors.cpfCnpj && <p className="text-red-500 text-sm">{errors.cpfCnpj?.message}</p>}
        </div>

        {/* CEP */}
        <div className="mb-4">
          <label className="block text-gray-700">CEP *</label>
              <InputMask
                value={cep}
                mask="99999-999"
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
                onChange={handleCepChange}
              />
              {!!endereco.cep && <p className="text-red-500 text-sm">CEP é obrigatório</p>}
        </div>

        {/* Rua */}
        <div className="mb-4">
        <label className="block text-gray-800">Rua (Logradouro) *</label>
            <input 
            type='text'
              value={endereco.rua}
              onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"        
            />
             {!endereco.rua && <p className="text-red-500 text-sm">Rua é obrigatória</p>}
        </div>

        {/* Número */}
        <div className="mb-4">
        <label className="block text-gray-800">Número *</label>
            <input 
            type='text'
              value={endereco.numero}
              onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"   
            />
             { !endereco.numero && <p className="text-red-500 text-sm">Número é obrigatório</p>}
        </div>

        {/* Complemento */}
        <div className="mb-4">
          <label className="block text-gray-800">Complemento</label>
              <input 
              type='text'
                value={endereco.complemento}
                onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"     
              />
        </div>

        {/* Bairro */}
        <div className="mb-4">
          <label className="block text-gray-800">Bairro *</label>
              <input
              type='text'
                value={endereco.bairro}
                onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"     
              />
              { !endereco.bairro && <p className="text-red-500 text-sm">Bairro é obrigatório</p>}
        </div>

        {/* Cidade */}
        <div className="mb-4">
        <label className="block text-gray-800">Cidade *</label>
            <input
            type='text'
              value={endereco.cidade}
              onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"      
            />
            { !endereco.cidade && <p className="text-red-500 text-sm">Cidade é obrigatório</p>}
        </div>

         {/* UF */}
         <div className="mb-4">
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
            { !endereco.uf && <p className="text-red-500 text-sm">UF é obrigatória</p>}
         </div>
              
        {/* Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Salvar
          </button>
        </div>
      </ContainerElement >
  );
};