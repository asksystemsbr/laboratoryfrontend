//src/app/laboratorioApoio/laboratorioApoiocreate.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import InputMask from 'react-input-mask-next';
import axios from 'axios';
import { LaboratorioApoio } from '../../models/laboratorioApoio';
import { SnackbarState } from '@/models/snackbarState';
import { UF } from '@/models/uf';
import { Endereco } from '@/models/endereco';
import { buscarEnderecoViaCep } from '@/utils/endereco';
import { validarCNPJ } from '@/utils/cnpjValidator';
import { Empresa } from '@/models/empresa';
// import { MaterialApoio } from '../../models/materialApoio'; // Model para MaterialApoio
// import { ExameApoio } from '../../models/exameApoio'; // Model para ExameApoio


interface LaboratorioApoioCreateFormProps   {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const LaboratorioApoioCreateForm   = ({ onSave, onClose,setSnackbar  }: LaboratorioApoioCreateFormProps  ) => {
  const { register, handleSubmit, reset,formState: { errors } ,setError,clearErrors} = useForm<LaboratorioApoio>();
  
  const [empresas, setEmpresa] = useState<Empresa[]>([]);
  const [cpfInUse, setCpfInUse] = useState<boolean>(false);
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listas dinâmicas para adicionar materiais e exames
  // const [materiais, setMateriais] = useState<MaterialApoio[]>([]);
  // const [exames, setExames] = useState<ExameApoio[]>([]);

  // Listas de opções para selects
  // const [availableMateriais, setAvailableMateriais] = useState<MaterialApoio[]>([]);
  // const [availableExames, setAvailableExames] = useState<ExameApoio[]>([]);

// Estados para controlar abas
  //const [activeTab, setActiveTab] = useState<'info' | 'materiais' | 'exames'>('info'); // Define abas

  // Efeito para carregar Materiais e Exames
  // useEffect(() => {
  //   const loadMateriais = async () => {
  //     try {
  //       const response = await axios.get('/api/MaterialApoio');
  //       setAvailableMateriais(response.data);
  //     } catch (error) {
  //       setSnackbar(new SnackbarState('Erro ao carregar materiais!', 'error', true));
  //     }
  //   };

  //   const loadExames = async () => {
  //     try {
  //       const response = await axios.get('/api/ExameApoio');
  //       setAvailableExames(response.data);
  //     } catch (error) {
  //       setSnackbar(new SnackbarState('Erro ao carregar exames!', 'error', true));
  //     }
  //   };

  //   if (activeTab === 'materiais') {
  //     loadMateriais();
  //   } else if (activeTab === 'exames') {
  //     loadExames();
  //   }
  // }, [activeTab, setSnackbar]);

  // Para adicionar MaterialApoio
  // const addMaterial = (materialId: number) => {
  //   const selectedMaterial = availableMateriais.find(m => m.id === materialId);
  //   if (selectedMaterial && !materiais.find(m => m.id === materialId)) {
  //     setMateriais([...materiais, selectedMaterial]);
  //   }
  // };

  // // Para adicionar ExameApoio
  // const addExame = (exameId: number) => {
  //   const selectedExame = availableExames.find(e => e.id === exameId);
  //   if (selectedExame && !exames.find(e => e.id === exameId)) {
  //     setExames([...exames, selectedExame]);
  //   }
  // };

  // Para remover Material da lista
  // const removeMaterial = (event: React.MouseEvent<HTMLButtonElement>, materialId: number) => {
  //   event.preventDefault(); // Evita que o botão dispare o submit do formulário
  //   setMateriais(materiais.filter(m => m.id !== materialId));
  // };

  // // Para remover Exame da lista
  // const removeExame = (event: React.MouseEvent<HTMLButtonElement>, exameId: number) => {
  //   event.preventDefault(); // Evita que o botão dispare o submit do formulário
  //   setExames(exames.filter(e => e.id !== exameId));
  // };

  useEffect(() => {
    const fetchUF = async () => {
      try {
        const response = await axios.get('/api/UF'); // Supondo que essa seja a rota da API
        setUFOptions(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar UF', 'error', true));
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

  const onSubmit = async (data: LaboratorioApoio) => {

    if (isSubmitting) return;

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
    if (!validarCNPJ(cpfCnpj)) {
      setError('cpfCnpj', { type: 'manual', message: 'CNPJ inválido!' });
      return;
    }

    checkCpfExists(cpfCnpj);
    if (cpfInUse) {
      setSnackbar(new SnackbarState('O CNPJ já está em uso', 'error', true));
      return;
    }
    try {
      const laboratorioComEndereco = {
        ...data,
        endereco,  // Inclui o endereço completo ao enviar o cliente
      };
      setIsSubmitting(true); 
        // Primeiro salva o LaboratorioApoio
        const response = await axios.post('/api/LaboratorioApoio', laboratorioComEndereco);
        console.log(response);
        //const laboratorioId = response.data.id; // Assume que o backend retorna o ID

        // // Salvar LaboratorioApoioMateriais
        // for (const material of materiais) {
        //   await axios.post(`/api/LaboratorioApoioMateriais`, {
        //     laboratorioApoioId: laboratorioId,
        //     materialApoioId: material.id,
        //   });
        // }
  
        // // Salvar LaboratorioApoioExameApoio
        // for (const exame of exames) {
        //   await axios.post(`/api/LaboratorioApoioExameApoio`, {
        //     laboratorioApoioId: laboratorioId,
        //     exameApoioId: exame.id,
        //   });
        // }

        reset();
        onSave();
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao criar o registro!', 'error', true)); // Exibe erro via snackbar
      }finally {
        setIsSubmitting(false); 
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

    // Função para verificar se o cnpj já existe
    const checkCpfExists = async (cnpj: string) => {
    try {
      const onlyNumbersCnpj = cnpj.replace(/\D/g, '');
      setCpfInUse(true);
      const response = await axios.get(`/api/LaboratorioApoio/existsByCNPJ/${onlyNumbersCnpj}`);
      if (response.data) {
        setError('cpfCnpj', {
          type: 'manual',
          message: 'O CNPJ já está cadastrado',
        });
        setCpfInUse(true);
      } else {
        clearErrors('cpfCnpj');
        setCpfInUse(false);
      }
    } catch (error) {
      console.log('Erro ao verificar o CNPJ:', error);
    }
  };

      
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Novo Laboratório de Apoio</h2>

     
        <div className="mb-4">
          <label className="block text-gray-700">Nome do Laboratório</label>
          <input
            {...register('nomeLaboratorio', { required: 'O nome do laboratório é obrigatório' })}
            className="border rounded w-full py-2 px-3 mt-1"
          />
          {errors.nomeLaboratorio && <p className="text-red-500 text-sm">{errors.nomeLaboratorio?.message}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700">CNPJ *</label>
          <InputMask
                {...register('cpfCnpj', { required: 'CNPJ é obrigatório' })}
                mask='99.999.999/9999-99'
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
                placeholder={'CNPJ'}
                onBlur={(e) => {
                  const cpf = e.target.value;

                  if (!validarCNPJ(cpf)) {
                    setError('cpfCnpj', {
                      type: 'manual',
                      message: 'CNPJ inválido',
                    });
                    return;
                  }                    

                  checkCpfExists(cpf);
                }}
              />     
          {errors.cpfCnpj && <p className="text-red-500 text-sm">{errors.cpfCnpj?.message}</p>}
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

        <div className="mb-4">
          <label className="block text-gray-700">URL da API</label>
          <input
            {...register('urlApi')}
            className="border rounded w-full py-2 px-3 mt-1"
          />
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
