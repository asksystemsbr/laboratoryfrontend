"use client";

import { useState, useEffect,useCallback  } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [snackbar, setSnackbar] = useState(new SnackbarState());
  const [progress, setProgress] = useState(100);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<number | null>(null);

  // Estado para a ordenação e paginação
  const [sortConfig, setSortConfig] = useState<{ key: keyof Cliente; direction: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const recordsPerPage = 10; // Registros por página ajustado para 10

  useEffect(() => {
    loadClientes();
  }, []);

    // Função para ordenar e aplicar a busca
    const applySearchAndSort =useCallback(() => {
      const sortedClientes = [...clientes].filter(
        (cliente) =>
          cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cliente?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
      if (sortConfig !== null) {
        sortedClientes.sort((a, b) => {
          let aValue: string | number = a[sortConfig.key] as string | number;
          let bValue: string | number = b[sortConfig.key] as string | number;
  
          if (typeof aValue === 'string') aValue = aValue.toLowerCase();
          if (typeof bValue === 'string') bValue = bValue.toLowerCase();
  
          // Comparação genérica
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
  
      setFilteredClientes(sortedClientes);
    }, [clientes, searchTerm, sortConfig]);

    
  useEffect(() => {
    applySearchAndSort();
    if (snackbar.show) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev > 0 ? prev - 1 : 0)); // Reduz progressivamente
      }, 50);

      const timer = setTimeout(() => {
        snackbar.hideSnackbar(); // Esconde o Snackbar
        setSnackbar(new SnackbarState()); // Atualiza para uma nova instância
        setProgress(100); // Reset progress
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [searchTerm, sortConfig, clientes, currentPage,applySearchAndSort,snackbar]); // Reaplica a lógica ao alterar esses parâmetros

  // Função para carregar os clientes
  const loadClientes = async () => {
    try {
      const response = await axios.get('/api/Cliente');
      setClientes(response.data);
      setFilteredClientes(response.data); // Inicializa com todos os clientes
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao carregar clientes!', 'error', true));
    }
  };


  // Função para alterar a ordenação
  const handleSort = (key: keyof Cliente) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Paginação: calcular o índice inicial e final dos registros na página atual
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentClientes = filteredClientes.slice(indexOfFirstRecord, indexOfLastRecord);

  // Função para mudar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Função para alternar a visibilidade do dropdown de ações
  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});

  const toggleDropdown = (id: number) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Função para definir o cliente que será editado
  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsEditing(true);
    setModalIsOpen(true);
    setDropdownVisible({});
  };

  // Função para definir o cliente a ser excluído
  const handleDeleteConfirmation = (id: number) => {
    setClienteToDelete(id);
    setDeleteConfirmOpen(true);
    setDropdownVisible({});
  };

  // Fechar dropdown de ações ao clicar fora
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const isClickInside = target.closest('.dropdown-actions');
    if (!isClickInside) {
      setDropdownVisible({});
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Função para abrir a modal de criação de novo cliente
  const handleNewClient = () => {
    setIsEditing(false);  // Certifique-se de que estamos no modo de criação, não de edição
    setEditingCliente(null);  // Resetar o cliente em edição
    setModalIsOpen(true);  // Abrir a modal
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Menu />
      <div className="container mx-auto p-8">
        {/* Título */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
          <button
            onClick={handleNewClient}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300"
          >
            Novo Cliente
          </button>
        </div>

        {/* Campo de busca com ícone */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="absolute right-4 top-2.5 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.9 14.32a8 8 0 111.42-1.42l4.28 4.29a1 1 0 11-1.42 1.42l-4.28-4.29zM8 14a6 6 0 100-12 6 6 0 000 12z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        {/* Tabela de Clientes */}
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b cursor-pointer"
                onClick={() => handleSort('nome')}
              >
                Nome {sortConfig?.key === 'nome' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b cursor-pointer"
                onClick={() => handleSort('email')}
              >
                Email {sortConfig?.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b cursor-pointer"
                onClick={() => handleSort('situacaoId')}
              >
                Situação {sortConfig?.key === 'situacaoId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentClientes.map((cliente) => (
              <tr key={cliente.id} className="border-t border-gray-300 hover:bg-gray-100 transition">
                <td className="py-3 px-6 text-left text-sm text-gray-800">{cliente.nome}</td>
                <td className="py-3 px-6 text-left text-sm text-gray-800">{cliente.email}</td>
                <td className="py-3 px-6 text-left text-sm">
                  {cliente.situacaoId === 1 ? (
                    <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm">Ativo</span>
                  ) : (
                    <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm">Inativo</span>
                  )}
                </td>
                <td className="py-3 px-6 text-left relative dropdown-actions">
                  <button
                    onClick={() => toggleDropdown(cliente.id!)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded-lg shadow-sm transition-all duration-200"
                  >
                    Ações
                  </button>
                  {dropdownVisible[cliente.id!] && (
                    <div className="absolute mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                      <ul className="py-1">
                        <li
                          className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleEdit(cliente)}
                        >
                          Editar
                        </li>
                        <li
                          className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleDeleteConfirmation(cliente.id!)}
                        >
                          Excluir
                        </li>
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginação */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.293 16.293a1 1 0 010-1.414L15.586 11H4a1 1 0 110-2h11.586l-3.293-3.293a1 1 1 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Anterior
          </button>

          <span className="text-gray-600">Página {currentPage}</span>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredClientes.length / recordsPerPage)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200"
          >
            Próxima
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.707 3.707a1 1 0 010 1.414L4.414 9H16a1 1 0 110 2H4.414l3.293 3.293a1 1 0 11-1.414 1.414l-5-5a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Modal de criação/edição */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="bg-white p-6 max-w-xl mx-auto rounded-lg shadow-lg w-full"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          {isEditing ? (
            <ClienteEditForm
              clienteId={editingCliente!.id!}
              onSave={loadClientes}
              onClose={() => setModalIsOpen(false)}
              setSnackbar={setSnackbar}
            />
          ) : (
            <ClienteCreateForm
              onSave={loadClientes}
              onClose={() => setModalIsOpen(false)}
              setSnackbar={setSnackbar}
            />
          )}
        </Modal>

        {/* Modal de confirmação de exclusão */}
        <ConfirmationModal
          isOpen={deleteConfirmOpen}
          title="Confirmação de Exclusão"
          message="Tem certeza de que deseja excluir este cliente? Esta ação não pode ser desfeita."
          onConfirm={() => handleDeleteConfirmation(clienteToDelete!)}
          onCancel={() => setDeleteConfirmOpen(false)}
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