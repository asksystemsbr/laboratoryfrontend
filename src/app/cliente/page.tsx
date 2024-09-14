//src/app/cliente/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { ClienteCreateForm } from './clientecreate';
import { ClienteEditForm } from './clienteedit';
import { Snackbar } from '../snackbar';
import Modal from 'react-modal';
import axios from 'axios';
import { Cliente } from '../../models/cliente';
import { SnackbarState } from '../../models/snackbarState';
import Menu from '../../components/menu';
import ConfirmationModal from '../../components/confirmationModal';

Modal.setAppElement('#__next');

export default function ClienteList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo de busca
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [snackbar, setSnackbar] = useState(new SnackbarState());
  const [progress, setProgress] = useState(100);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    if (snackbar.show) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev > 0 ? prev - 1 : 0));
      }, 50);

      const timer = setTimeout(() => {
        snackbar.hideSnackbar();
        setSnackbar(new SnackbarState());
        setProgress(100);
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [snackbar]);

  const loadClientes = async () => {
    try {
      const response = await axios.get('/api/Cliente');
      setClientes(response.data);
      setFilteredClientes(response.data); 
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao carregar clientes!', 'error', true));
    }
  };

   // Função para filtrar os clientes com base no termo de busca
   useEffect(() => {
    const filtered = clientes.filter((cliente) => {
      // Obtenha todas as chaves (campos) do objeto `cliente`
        return Object.values(cliente).some((value) => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    });
    setFilteredClientes(filtered);
  }, [searchTerm, clientes]);

  const handleDelete = async () => {
    if (clienteToDelete !== null) {
      try {
        await axios.delete(`/api/Cliente/${clienteToDelete}`);
        setSnackbar(new SnackbarState('Cliente excluído com sucesso!', 'success', true));
        loadClientes();
        closeDeleteConfirm();
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao excluir cliente!', 'error', true));
      }
    }
  };

  const openDeleteConfirm = (id: number) => {
    setClienteToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setClienteToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleSave = () => {
    setModalIsOpen(false);
    setSnackbar(new SnackbarState('Cliente salvo com sucesso!', 'success', true));
    loadClientes();
  };

  const handleCreate = () => {
    setIsEditing(false);
    setModalIsOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsEditing(true);
    setModalIsOpen(true);
  };

  return (
    <div className="flex h-screen">
      <Menu />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Clientes</h1>
          <button
            onClick={handleCreate}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Novo Cliente
          </button>
        </div>

        {/* Campo de busca */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Atualiza o termo de busca
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
          />
        </div>

        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">Nome</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Editar</th>
              <th className="py-2 px-4 text-left">Excluir</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.map((cliente) => (
              <tr key={cliente.id} className="border-t border-gray-200">
                <td className="py-2 px-4 text-left">{cliente.nome}</td>
                <td className="py-2 px-4 text-left">{cliente.email}</td>
                <td className="py-2 px-4 text-left">
                  <button
                    className="text-yellow-500 hover:text-yellow-700 mr-2"
                    onClick={() => handleEdit(cliente)}
                  >
                    Editar
                  </button>
                </td>
                <td className="py-2 px-4">
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => openDeleteConfirm(cliente.id!)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="bg-white p-6 max-w-xl mx-auto rounded-lg shadow-lg w-full"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          {isEditing ? (
            <ClienteEditForm clienteId={editingCliente!.id!} onSave={handleSave} onClose={() => setModalIsOpen(false)} setSnackbar={setSnackbar} />
          ) : (
            <ClienteCreateForm onSave={handleSave} onClose={() => setModalIsOpen(false)} setSnackbar={setSnackbar} />
          )}
        </Modal>

        <ConfirmationModal
          isOpen={deleteConfirmOpen}
          title="Confirmação de Exclusão"
          message="Tem certeza de que deseja excluir este cliente? Esta ação não pode ser desfeita."
          onConfirm={handleDelete}
          onCancel={closeDeleteConfirm}
          confirmText="Excluir"
          cancelText="Cancelar"
        />

        {snackbar.show && (
          <Snackbar message={snackbar.message} type={snackbar.type} progress={progress} />
        )}
      </div>
    </div>
  );
}
