"use client";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import InputMask from 'react-input-mask-next';
import { Empresa } from '../../models/empresa';
import { SnackbarState } from '@/models/snackbarState';
import { UF } from '@/models/uf';
import { EmpresaCategoria } from '@/models/empresaCategoria';
import { Endereco } from '@/models/endereco';
import { buscarEnderecoViaCep } from '@/utils/endereco';

interface EmpresaCreateFormProps {
  onSave: () => void;
  onClose: () => void;
  setSnackbar: (state: SnackbarState) => void;
}

export const EmpresaCreateForm = ({ onSave, onClose, setSnackbar }: EmpresaCreateFormProps) => {
  const { register, handleSubmit, reset, formState: { errors },setValue } = useForm<Empresa>();  
  const [empresaCategoriaOptions, setempresaCategoriaOptions] = useState<EmpresaCategoria[]>([]);
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

    const fetchEmpresaCategoria = async () => {
      try {
        const response = await axios.get('/api/Empresa/getEmpresaCategoria'); // Supondo que essa seja a rota da API
        setempresaCategoriaOptions(response.data);
      } catch (error) {
        console.log(error);
        setSnackbar(new SnackbarState('Erro ao carregar os tipos de solicitante', 'error', true));
      }
    };
    
    fetchUF();
    fetchEmpresaCategoria();
  }, [setSnackbar]);

  const onSubmit = async (data: Empresa) => {
    if(!endereco.cep  
      || !endereco.rua 
      || !endereco.numero  
      || !endereco.bairro
      || !endereco.cidade
      || !endereco.uf  
  ){
    return;
  }

    if (isSubmitting) return;

    const itemComEndereco = {
      ...data,
      endereco,  // Inclui o endereço completo ao enviar o cliente
    };

    try {
      setIsSubmitting(true);
      await axios.post('/api/Empresa', itemComEndereco);
      reset();
      onSave();
    } catch (error) {
      console.log(error);
      setSnackbar(new SnackbarState('Erro ao criar a empresa!', 'error', true));
    }finally {
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
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-4 max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-y-auto max-h-screen"
      >
        <h2 className="text-xl font-bold mb-2 text-gray-800">Nova Empresa</h2>

        {/* CNPJ e Razão Social */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">CNPJ *</label>
            <InputMask
              mask="99.999.999/9999-99"
              {...register('cnpj', { required: 'O CNPJ é obrigatório' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.cnpj && <p className="text-red-500 text-sm">{errors.cnpj?.message}</p>}
          </div>

          <div>
            <label className="block text-gray-800">Razão Social *</label>
            <input
              {...register('razaoSocial', { required: 'A Razão Social é obrigatória' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.razaoSocial && <p className="text-red-500 text-sm">{errors.razaoSocial?.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Nome Fantasia e Endereço */}
          <div>
            <div>
              <label className="block text-gray-800">Nome Fantasia *</label>
              <input
                {...register('nomeFantasia', { required: 'O Nome Fantasia é obrigatório' })}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
              {errors.nomeFantasia && <p className="text-red-500 text-sm">{errors.nomeFantasia?.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-700">Categoria</label>
            <select
              {...register('categoriaEmpresaId', { required: 'A categoria é obrigatória' })}
              className="border rounded w-full py-2 px-3 mt-1"
            >
              <option value="">Selecione uma categoria</option>
              {empresaCategoriaOptions.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.descricao}
                </option>
              ))}
            </select>
            {errors.categoriaEmpresaId && <p className="text-red-500 text-sm">{errors.categoriaEmpresaId?.message}</p>}
          </div>


        </div>

        {/* Telefone e Email */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">Telefone *</label>
            <InputMask
              mask="(99) 99999-9999"
              {...register('telefone', { required: 'O Telefone é obrigatório' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone?.message}</p>}
          </div>

          <div>
            <label className="block text-gray-800">Email *</label>
            <input
              type='text'
              {...register('email', { required: 'O Email é obrigatório' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email?.message}</p>}
          </div>
        </div>

        {/* Emails adicionais */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">Email Adicional 1</label>
            <input
              type='text'
              {...register('email1')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-gray-800">Email Adicional 2</label>
            <input
              type='text'
              {...register('email2')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-gray-800">Email Adicional 3</label>
            <input
              type='text'
              {...register('email3')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>
        </div>

        {/* Data de Abertura, Natureza Jurídica, Situação Cadastral e Capital Social */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">Data de Abertura *</label>
            <input
              type="date"
              {...register('dataAbertura', { required: 'A Data de Abertura é obrigatória' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.dataAbertura && <p className="text-red-500 text-sm">{errors.dataAbertura?.message}</p>}
          </div>

          <div>
            <label className="block text-gray-800">Natureza Jurídica *</label>
            <input
              type='text'
              {...register('naturezaJuridica', { required: 'A Natureza Jurídica é obrigatória' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.naturezaJuridica && <p className="text-red-500 text-sm">{errors.naturezaJuridica?.message}</p>}
          </div>

          <div>
            <label className="block text-gray-800">Situação Cadastral *</label>
            <input
              type='text'
              {...register('situacaoCadastral', { required: 'A Situação Cadastral é obrigatória' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.situacaoCadastral && <p className="text-red-500 text-sm">{errors.situacaoCadastral?.message}</p>}
          </div>

          <div>
            <label className="block text-gray-800">Capital Social *</label>
            <input
              type="number"
              step="0.01"
              {...register('capitalSocial', { required: 'O Capital Social é obrigatório' })}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
            {errors.capitalSocial && <p className="text-red-500 text-sm">{errors.capitalSocial?.message}</p>}
          </div>
        </div>

        {/* URL de Integração e Banco */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">URL de Integração</label>
            <input
              type='text'
              {...register('urlIntegracao')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-gray-800">Nome do Banco</label>
            <input
              type='text'
              {...register('nomeBanco')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-gray-800">Agência do Banco</label>
            <input
              {...register('agenciaBanco')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-gray-800">Conta do Banco</label>
            <input
              {...register('contaBanco')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>
        </div>
        {/* Impostos e Retenções */}
        <div className="grid grid-cols-8 gap-4 mb-4">
          <div>
            <label className="block text-gray-800">IRPF</label>
            <input
              type="number"
              step="0.01"
              {...register('irpf')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-gray-800">PIS</label>
            <input
              type="number"
              step="0.01"
              {...register('pis')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-gray-800">COFINS</label>
            <input
              type="number"
              step="0.01"
              {...register('cofins')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-gray-800">CSLL</label>
            <input
              type="number"
              step="0.01"
              {...register('csll')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
            />
          </div>


        {/* Retenções */}
          <div>
            <label className="block text-gray-800">Reter ISS</label>
            <input
              type="checkbox"
              {...register('reterIss')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              onChange={(e) => setValue('reterIss', e.target.checked)}
            />
          </div>

          <div>
            <label className="block text-gray-800">Reter IR</label>
            <input
              type="checkbox"
              {...register('reterIr')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              onChange={(e) => setValue('reterIr', e.target.checked)}
            />
          </div>

          <div>
            <label className="block text-gray-800">Reter PCC</label>
            <input
              type="checkbox"
              {...register('reterPcc')}
              className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              onChange={(e) => setValue('reterPcc', e.target.checked)}
            />
          </div>
        </div>

        {/* Optante pelo Simples e NS Certificado Digital */}
          <div className="grid grid-cols-4 gap-4 mb-4">          
            <div>
                <label className="block text-gray-800">Optante pelo Simples</label>
                <input
                  type="checkbox"
                  {...register('optanteSimples')}
                  className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
                  onChange={(e) => setValue('optanteSimples', e.target.checked)}
                />
              </div>            
            <div>
              <label className="block text-gray-800">NS Certificado Digital</label>
              <input
                {...register('numeroSerialCertificadoDigital')}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-gray-800">CNES</label>
              <input
                type='text'
                {...register('cnes')}
                className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-gray-800">CEP *</label>
                <InputMask
                  value={cep}
                  mask="99999-999"
                  className="border rounded w-full py-1 px-3 mt-1 text-gray-800"
                  onChange={handleCepChange}
                />
                {!endereco.cep && <p className="text-red-500 text-sm">CEP é obrigatório</p>}
            </div>            
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

        {/* Botões */}
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