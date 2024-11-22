//src/app/portal/Cliente/page.tsx
"use client";

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { ClienteCreateForm } from './create/clientecreate';
import { ClienteEditForm } from './edit/page';
import { Snackbar } from '../../snackbar';
import Modal from 'react-modal';
import axios from 'axios';
import { Cliente } from '../../../models/cliente';
import { SnackbarState } from '../../../models/snackbarState';
import Menu from '../../../components/menu';
import ConfirmationModal from '../../../components/confirmationModal';

Modal.setAppElement('#__next');

export default function ClienteList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtered, setFiltered] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [snackbar, setSnackbar] = useState(new SnackbarState());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<number | null>(null);
  const [progress, setProgress] = useState(100); // Para a barra de progresso

  const [sortConfig, setSortConfig] = useState<{ key: keyof Cliente; direction: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalPages = Math.ceil(filtered.length / recordsPerPage);

  const hideSnackbar = () => {
    setSnackbar((prev) => {
      const newSnackbarState = new SnackbarState(prev.message, prev.type, false); // Cria uma nova instância de SnackbarState
      return newSnackbarState;
    });
  };

  const applySearchAndSort = useCallback(() => {
    const searchTermLower = searchTerm.toLowerCase();

   const sortedClientes = [...clientes].filter((cliente) => {
    // Filtrar baseado em todos os campos
    return Object.keys(cliente).some((key) => {
      const value = cliente[key as keyof Cliente]; // Acessa dinamicamente os valores de cada campo

      // Ignora campos indefinidos ou nulos
      if (value == null) return false;

      // Converte todos os valores para string e verifica se o termo de busca está incluído
      return String(value).toLowerCase().includes(searchTermLower);
    });
  });

  if (sortConfig !== null) {
    sortedClientes.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        return 0;
      }
    });
  }

  setFiltered(sortedClientes);
  }, [searchTerm, sortConfig, clientes]);

  useEffect(() => {
    loadClientes();
  }, []);

    // Timer para fechar o snackbar automaticamente
    useEffect(() => {
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
    }, [snackbar]);
  useEffect(() => {
    applySearchAndSort();
  }, [searchTerm, sortConfig, clientes, currentPage, applySearchAndSort]);

  const loadClientes = async () => {
    try {
      const response = await axios.get('/api/Cliente');
      setClientes(response.data);
      setFiltered(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao carregar clientes!', 'error', true));
    }
  };

  const handleSave = () => {
    setModalIsOpen(false);
    setSnackbar(new SnackbarState('Registro salvo com sucesso!', 'success', true));
    loadClientes();
  };

  const handleSort = (key: keyof Cliente) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentClientes = filtered.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});

  const toggleDropdown = (id: number) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsEditing(true);
    setModalIsOpen(true);
    setDropdownVisible({});
  };

  const handleDeleteConfirmation = (id: number) => {
    setClienteToDelete(id);
    setDeleteConfirmOpen(true);
    setDropdownVisible({});
  };

  const handleClickOutside = (event: MouseEvent) => {
    const isClickInside = (event.target as HTMLElement).closest('.dropdown-actions');
    if (!isClickInside) {
      setDropdownVisible({});
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleNewClient = () => {
    setIsEditing(false);
    setEditingCliente(null);
    setModalIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/Cliente/${id}`);
      setSnackbar(new SnackbarState('Cliente excluído com sucesso!', 'success', true));
      setDeleteConfirmOpen(false);
      loadClientes(); // Recarregar a lista de clientes após a exclusão
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao excluir cliente!', 'error', true));
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Menu />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
          <button
            onClick={handleNewClient}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300"
          >
            Novo Cliente
          </button>
        </div>

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

        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b cursor-pointer"
                onClick={() => handleSort('id')}
              >
                Código {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>              
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
                <td className="py-3 px-6 text-left text-sm text-gray-800">{cliente.id}</td>
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

        <div className="flex justify-between mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Anterior
          </button>

          <span className="text-gray-600">Página {currentPage} de {totalPages}</span>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filtered.length / recordsPerPage)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200"
          >
            Próxima
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="bg-white p-6 max-w-xl mx-auto rounded-lg shadow-lg w-full"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          {isEditing ? (
            <ClienteEditForm
              cliente={editingCliente!}
              onSave={handleSave}
              onClose={() => setModalIsOpen(false)}
              setSnackbar={setSnackbar}
            />
          ) : (
            <ClienteCreateForm
              onSave={handleSave}
              onClose={() => setModalIsOpen(false)}
              setSnackbar={setSnackbar}
            />
          )}
        </Modal>

        <ConfirmationModal
          isOpen={deleteConfirmOpen}
          title="Confirmação de Exclusão"
          message="Tem certeza de que deseja excluir este cliente? Esta ação não pode ser desfeita."
          onConfirm={() => handleDelete(clienteToDelete!)} // Chamar handleDelete na confirmação
          onCancel={() => setDeleteConfirmOpen(false)}
          confirmText="Excluir"
          cancelText="Cancelar"
        />

        {snackbar.show && (
          <Snackbar message={snackbar.message} type={snackbar.type} progress={progress} onClose={hideSnackbar} />
        )}
      </div>
    </div>
  );
}