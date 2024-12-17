//src/app/orcamentos/forms/OrcamentoClienteForm.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InputMask from 'react-input-mask-next';
import { Cliente } from '@/models/cliente';
import { Endereco } from '@/models/endereco';
import { ClienteCreateForm } from '@/app/cliente/clientecreate'; // Import the ClienteCreateForm component
import ConfirmationModal from '@/components/confirmationModal';
import { usePortalAuth } from '@/app/authPortal';

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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Tracks the modal visibility
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  //const [newClienteId, setNewClienteId] = useState<number | null>(null); // Holds the newly created client ID

  const [nome, setNome] = useState(clienteData?.nome || "");
  const [telefone, setTelefone] = useState(clienteData?.telefone || "");

  const [endereco, setEndereco] = useState<Endereco>({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });

  const authContext = usePortalAuth ();
  const { user } = authContext || {};
  
    // Opens the create modal if no client is found
    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => setIsCreateModalOpen(false);
    const openConfirmationModal = () => {
      setIsConfirmationModalOpen(true);
    };
  
    const closeConfirmationModal = () => {
      setIsConfirmationModalOpen(false);
    };
  
    const confirmCreateClient = () => {
      closeConfirmationModal();
      openCreateModal();
    };

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

  useEffect(() => {
    // Carrega dados do cliente automaticamente se o CPF estiver preenchido
    const fetchClienteIdData = async () => {
      if (user?.id) {
        buscarClientePorId();
      }
    };
    fetchClienteIdData();
  }, [user]);

  const buscarClientePorNome = async () => {
    try {      
      if(!nome) return;
      const response = await axios.get(`/api/Cliente/clienteByNome/${nome}`);
      const cliente = response.data;
      preencherDadosCliente(cliente,'');
    } catch (error) {
      console.error('Cliente não encontrado', error);
      setClienteData(null);
      onClienteSelected(null,null);
      openConfirmationModal(); // Open confirmation modal if no client is found
    }
  };

  const buscarClientePorTelefone = async () => {
    try {      
      if(!telefone) return;
      const response = await axios.get(`/api/Cliente/clienteByTelefone/${telefone}`);
      const cliente = response.data;
      preencherDadosCliente(cliente,'');
    } catch (error) {
      console.error('Cliente não encontrado', error);
      setClienteData(null);
      onClienteSelected(null,null);
      openConfirmationModal(); // Open confirmation modal if no client is found
    }
  };

  const buscarClientePorCpf = async () => {
    try {
      if (!cpf || cpf.length < 11 || cpf=='___.___.___-__') return;
      const response = await axios.get(`/api/Cliente/clienteByCPF/${cpf}`);
      const cliente = response.data;
      preencherDadosCliente(cliente,'');
    } catch (error) {
      console.error('Cliente não encontrado', error);
      setClienteData(null);
      onClienteSelected(null,null);
      openConfirmationModal(); // Open confirmation modal if no client is found
    }
  };

  const buscarClientePorId = async () => {
    try {
      if (!user) return;
      const response = await axios.get(`/api/Cliente/${user.id}`);
      const cliente = response.data;
      preencherDadosCliente(cliente,'');
    } catch (error) {
      console.error('Cliente não encontrado', error);
      setClienteData(null);
      onClienteSelected(null,null);
      openConfirmationModal(); // Open confirmation modal if no client is found
    }
  };
  
  const buscarClientePorRg = async () => {
    try {
      if (!rg || rg.length < 9 || rg=='__.___.___-_') return;
      const response = await axios.get(`/api/Cliente/clienteByRG/${rg}`);
      const cliente = response.data;
      preencherDadosCliente(cliente,'');
    } catch (error) {
      console.error('Cliente não encontrado', error);
      setClienteData(null);
      onClienteSelected(null,null);
      openConfirmationModal(); // Open confirmation modal if no client is found
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
    setNome(cliente.nome || ""); 
    setTelefone(cliente.telefone || "");
    setCpf(cliente.cpfCnpj??"");
    setRg(cliente.rg ?? "")
    onClienteSelected(cliente.id ?? null,cliente.nome ?? null);
    await fetchEndereco(cliente.enderecoId ?? 0);
  };

    // Callback for when a new client is successfully created
    const handleClienteCreate = (newClient: Cliente) => {
      setClienteData(newClient);
      //setNewClienteId(newClient.id);
      setCpf(newClient.cpfCnpj ?? '');
      onClienteSelected(newClient.id?? null, newClient.nome); // Update the parent form with the new client
      closeCreateModal(); // Close the modal
    };

  return (
    <div className="form-section mt-4 border-t border-gray-300 py-1">
    <h3 className="text-lg font-semibold text-center mb-4">Dados do paciente</h3>

    {/* Primeira linha */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
      <div className="col-span-1">
          <InputMask
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            mask='999.999.999-99'
            className="border rounded w-full py-2 px-3 text-sm bg-gray-100"
            placeholder= 'CPF'
            onBlur= {buscarClientePorCpf}
            disabled
          />          
      </div>
      <div className="col-span-1">
        <InputMask
          value={rg }
          onChange={(e) => setRg(e.target.value)}
          onBlur={buscarClientePorRg}
          mask="99.999.999-9"
          className="border rounded w-full py-2 px-3 text-sm bg-gray-100"
          placeholder="RG"
          disabled
        />
      </div>      
      <div className="col-span-2">
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)} 
          className="border rounded w-full py-2 px-3 text-sm bg-gray-100"
          placeholder="Nome"
          onBlur= {buscarClientePorNome}
          disabled
        />
      </div>
      <div className="col-span-1">
        <select
          value={clienteData?.sexo || ''}
          disabled
          className="border rounded w-full py-2 px-3 text-sm text-gray-800 bg-gray-100"
        >
          <option value="">Sexo</option>
          <option value="M">Masculino</option>
          <option value="F">Feminino</option>
        </select>
      </div>
      <div className="col-span-1">
        <input
          type="date"
          value={
            clienteData?.nascimento
              ? new Date(clienteData.nascimento).toISOString().split("T")[0]
              : ""
          }
          readOnly
          disabled
          className="border rounded w-full py-2 px-3 text-sm text-gray-800 bg-gray-100"
          placeholder="Data de Nascimento"
        />
      </div>
    </div>


    {/* Segunda linha */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
      <div className="col-span-1">
        <InputMask
          value={endereco.cep}
          mask="99999-999"
          className="border rounded w-full py-2 px-3 text-sm"
          placeholder="CEP"
          disabled
        />
      </div>
      <div className="col-span-3">
        <input
          type="text"
          value={endereco.rua}
          onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
          className="border rounded w-full py-2 px-3 text-sm bg-gray-100"
          placeholder="Logradouro"
          disabled
        />
      </div>
      <div className="col-span-1">
        <input
          type="text"
          value={endereco.numero}
          onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
          className="border rounded w-full py-2 px-3 text-sm bg-gray-100"
          placeholder="Número"
          disabled
        />
      </div>
      <div className="col-span-2">
        <input
          type="text"
          value={endereco.cidade}
          onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
          className="border rounded w-full py-2 px-3 text-sm bg-gray-100"
          placeholder="Cidade"
          disabled
        />
      </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="col-span-1">
        <input
          type="text"
          value={telefone}
          className="border rounded w-full py-2 px-3 text-sm bg-gray-100"
          placeholder="Celular"
          onChange={(e) => setTelefone(e.target.value)} 
          onBlur= {buscarClientePorTelefone}
          disabled
        />
      </div>
      <div className="col-span-2">
        <input
          type="email"
          value={clienteData?.email || ""}
          className="border rounded w-full py-2 px-3 text-sm bg-gray-100"
          placeholder="Email"
          disabled
        />
      </div>
    </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        title="Cliente não encontrado"
        message="Deseja cadastrar um novo cliente?"
        onConfirm={confirmCreateClient} // Open create modal on confirm
        onCancel={closeConfirmationModal}
      />
      
    {/* Modal for ClienteCreateForm */}
    {isCreateModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
        <ClienteCreateForm
          initialCpf={cpf}
          initialRg={rg}
          onSave={(newClient) => handleClienteCreate(newClient)} // Callback to handle new client creation
          onClose={closeCreateModal}
          setSnackbar={() => {}} // Provide snackbar handler as required
          isSimpleMode={true}
        />
      </div>
    )}
  </div>
  );
};

export default OrcamentoClienteForm;
