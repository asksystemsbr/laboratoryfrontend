//src/app/recepcao/recepcaocreate.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Recepcao } from '../../models/recepcao';
import { SnackbarState } from '@/models/snackbarState';
import { buscarEnderecoViaCep } from '@/utils/endereco';
import { Endereco } from '@/models/endereco';
import { UF } from '@/models/uf';
import InputMask from 'react-input-mask-next';

interface RecepcaoCreateFormProps {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void; // Adiciona o setSnackbar como prop
}

export const RecepcaoCreateForm = ({ onSave, onClose,setSnackbar  }: RecepcaoCreateFormProps) => {
  const { register, handleSubmit, reset,formState: { errors } } = useForm<Recepcao>();

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

  const onSubmit = async (data: Recepcao) => {
      if(!endereco.cep  
        || !endereco.rua 
        || !endereco.numero  
        || !endereco.bairro
        || !endereco.cidade
        || !endereco.uf  
    ){
      return;
    }
      const dataComEndereco = {
        ...data,
        endereco,  // Inclui o endereço completo ao enviar o cliente
      };
    try {
        await axios.post('/api/Recepcao', dataComEndereco);
        reset();
        onSave();
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao criar o registro!', 'error', true)); // Exibe erro via snackbar
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
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h2 className="text-xl font-bold mb-4">Nova Recepção</h2>
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
