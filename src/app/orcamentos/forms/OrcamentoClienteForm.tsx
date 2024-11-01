//src/app/orcamentos/forms/OrcamentoClienteForm.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InputMask from 'react-input-mask-next';
import { Cliente } from '@/models/cliente';
import { Endereco } from '@/models/endereco';

interface ClienteFormProps {
  onClienteSelected: (id: number| null, nomePaciente: string | null) => void;
  nomePaciente?: string;
  pacienteId?: string;
}

const OrcamentoClienteForm: React.FC<ClienteFormProps> = ({ 
  onClienteSelected,
  nomePaciente = '',
  pacienteId = ''
 }) => {
  const [clienteData, setClienteData] = useState<Cliente | null>(null);
  const [pacienteIdData] = useState(pacienteId || '');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
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
    // Carrega dados do cliente automaticamente se o CPF estiver preenchido
    const fetchClienteData = async () => {
      if (pacienteIdData) {
        try {
          const response = await axios.get(`/api/cliente/${pacienteIdData}`);
          const cliente = response.data;
          preencherDadosCliente(cliente,cliente.nome);
        } catch (error) {
          console.error('Erro ao buscar dados do paciente:', error);
          setClienteData(null);
          onClienteSelected(null,null);
        }
      }
    };
    fetchClienteData();
  }, [pacienteIdData]);


  const buscarClientePorCpf = async () => {
    try {
      if (!cpf || cpf.length < 11) return;
      const response = await axios.get(`/api/Cliente/clienteByCPF/${cpf}`);
      const cliente = response.data;
      preencherDadosCliente(cliente,'');
    } catch (error) {
      console.error('Cliente não encontrado', error);
      setClienteData(null);
      onClienteSelected(null,null);
    }
  };
  
  const buscarClientePorRg = async () => {
    try {
      if (!rg || rg.length < 9) return;
      const response = await axios.get(`/api/Cliente/clienteByRG/${rg}`);
      const cliente = response.data;
      preencherDadosCliente(cliente,'');
    } catch (error) {
      console.error('Cliente não encontrado', error);
      setClienteData(null);
      onClienteSelected(null,null);
    }
  };

  const fetchEndereco = async (enderecoId: number) => {
    try {
      if (!enderecoId) return;
      const response = await axios.get(`/api/Endereco/${enderecoId}`);
      setEndereco(response.data);
    } catch (error) {
      console.error('Cliente não encontrado', error);
      setClienteData(null);
      onClienteSelected(null,null);
    }
  };

  const preencherDadosCliente = async (cliente: Cliente, nome: string) => {
    if(nomePaciente != null && nomePaciente !== '' && nome !== ''){
      cliente.nome = nomePaciente
    }
    setClienteData(cliente);
    setCpf(cliente.cpfCnpj??"");
    setRg(cliente.rg ?? "")
    onClienteSelected(cliente.id ?? null,cliente.nome ?? null);
    await fetchEndereco(cliente.enderecoId ?? 0);
  };

  return (
    <div className="form-section mt-4 border-t border-gray-300 py-1">
    <h3 className="text-lg font-semibold text-center mb-2">Dados do paciente</h3>

    {/* Primeira linha */}
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="basis-1/7">
          <InputMask
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            mask='999.999.999-99'
            className="border rounded w-full py-1 px-2 text-sm"
            placeholder= 'CPF'
            onBlur= {buscarClientePorCpf}
          />          
      </div>
      <div className="basis-1/8">
        <InputMask
          value={rg }
          onChange={(e) => setRg(e.target.value)}
          onBlur={buscarClientePorRg}
          mask="99.999.999-9"
          className="border rounded w-full py-1 px-2 text-sm"
          placeholder="RG"
        />
      </div>      
      <div className="basis-2/6 flex-grow">
        <input
          type="text"
          value={clienteData?.nome || ''}
          readOnly
          disabled
          className="border rounded w-full py-1 px-2 text-sm"
          placeholder="Nome"
        />
      </div>
      <div className="basis-1/6">
        <select
          value={clienteData?.sexo || ''}
          disabled
          className="border rounded w-full py-1 px-2 text-sm text-gray-800"
        >
          <option value="">Sexo</option>
          <option value="M">Masculino</option>
          <option value="F">Feminino</option>
        </select>
      </div>
      <div className="basis-1/7">
        <input
          type="date"
          value={
            clienteData?.nascimento
              ? new Date(clienteData.nascimento).toISOString().split("T")[0]
              : ""
          }
          readOnly
          disabled
          className="border rounded w-full py-1 px-2 text-sm"
          placeholder="Data de Nascimento"
        />
      </div>
    </div>


    {/* Segunda linha */}
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="basis-1/12">
        <InputMask
          value={endereco.cep}
          mask="99999-999"
          className="border rounded w-full py-1 px-2 text-sm"
          placeholder="CEP"
          disabled
        />
      </div>
      <div className="basis-4/12">
        <input
          type="text"
          value={endereco.rua}
          onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
          className="border rounded w-full py-1 px-2 text-sm text-gray-800"
          placeholder="Logradouro"
          disabled
        />
      </div>
      <div className="basis-1/12">
        <input
          type="text"
          value={endereco.numero}
          onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
          className="border rounded w-full py-1 px-2 text-sm text-gray-800"
          placeholder="Número"
          disabled
        />
      </div>
      <div className="basis-2/12">
        <input
          type="text"
          value={endereco.cidade}
          onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
          className="border rounded w-full py-1 px-2 text-sm text-gray-800"
          placeholder="Cidade"
          disabled
        />
      </div>
      <div className="basis-1/12">
        <input
          type="text"
          value={clienteData?.telefone || ""}
          className="border rounded w-full py-1 px-2 text-sm"
          placeholder="Celular"
          disabled
        />
      </div>
      <div className="basis-2/12 flex-grow">
        <input
          type="email"
          value={clienteData?.email || ""}
          className="border rounded w-full py-1 px-2 text-sm"
          placeholder="Email"
          disabled
        />
      </div>
    </div>
  </div>
  );
};

export default OrcamentoClienteForm;
