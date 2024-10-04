"use client";

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { EmpresaCreateForm } from './empresacreate';
import { EmpresaEditForm } from './empresaedit';
import { Snackbar } from '../snackbar';
import Modal from 'react-modal';
import axios from 'axios';
import { Empresa } from '../../models/empresa';
import { SnackbarState } from '../../models/snackbarState';
import Menu from '../../components/menu';
import ConfirmationModal from '../../components/confirmationModal';

Modal.setAppElement('#__next');

export default function EmpresaPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filtered, setFiltered] = useState<Empresa[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [snackbar, setSnackbar] = useState(new SnackbarState());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<number | null>(null);
  const [progress, setProgress] = useState(100);

  const [sortConfig, setSortConfig] = useState<{ key: keyof Empresa; direction: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const applySearchAndSort = useCallback(() => {
    const searchTermLower = searchTerm.toLowerCase();

    const sortedEmpresas = [...empresas].filter((empresa) => {
      return Object.keys(empresa).some((key) => {
        const value = empresa[key as keyof Empresa];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchTermLower);
      });
    });

    if (sortConfig !== null) {
      sortedEmpresas.sort((a, b) => {
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

    setFiltered(sortedEmpresas);
  }, [searchTerm, sortConfig, empresas]);

  useEffect(() => {
    loadEmpresas();
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

  useEffect(() => {
    applySearchAndSort();
  }, [searchTerm, sortConfig, empresas, currentPage, applySearchAndSort]);

  const loadEmpresas = async () => {
    try {
      const response = await axios.get('/api/Empresa');
      setEmpresas(response.data);
      setFiltered(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao carregar empresas!', 'error', true));
    }
  };

  const handleSave = () => {
    setModalIsOpen(false);
    setSnackbar(new SnackbarState('Empresa salva com sucesso!', 'success', true));
    loadEmpresas();
  };

  const handleSort = (key: keyof Empresa) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentEmpresas = filtered.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});

  const toggleDropdown = (id: number) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setIsEditing(true);
    setModalIsOpen(true);
    setDropdownVisible({});
  };

  const handleDeleteConfirmation = (id: number) => {
    setEmpresaToDelete(id);
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

  const handleNewEmpresa = () => {
    setIsEditing(false);
    setEditingEmpresa(null);
    setModalIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/Empresa/${id}`);
      setSnackbar(new SnackbarState('Empresa excluída com sucesso!', 'success', true));
      setDeleteConfirmOpen(false);
      loadEmpresas();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao excluir empresa!', 'error', true));
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Menu />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Empresas</h1>
          <button
            onClick={handleNewEmpresa}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300"
          >
            Nova Empresa
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
                onClick={() => handleSort('cnpj')}
              >
                CNPJ {sortConfig?.key === 'cnpj' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b cursor-pointer"
                onClick={() => handleSort('razaoSocial')}
              >
                Razão Social {sortConfig?.key === 'razaoSocial' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b cursor-pointer"
                onClick={() => handleSort('email')}
              >
                Email {sortConfig?.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentEmpresas.map((empresa) => (
              <tr key={empresa.id} className="border-t border-gray-300 hover:bg-gray-100 transition">
                <td className="py-3 px-6 text-left text-sm text-gray-800">{empresa.cnpj}</td>
                <td className="py-3 px-6 text-left text-sm text-gray-800">{empresa.razaoSocial}</td>
                <td className="py-3 px-6 text-left text-sm text-gray-800">{empresa.email}</td>
                <td className="py-3 px-6 text-left relative dropdown-actions">
                  <button
                    onClick={() => toggleDropdown(empresa.id!)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded-lg shadow-sm transition-all duration-200"
                  >
                    Ações
                  </button>
                  {dropdownVisible[empresa.id!] && (
                    <div className="absolute mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                      <ul className="py-1">
                        <li
                          className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleEdit(empresa)}
                        >
                          Editar
                        </li>
                        <li
                          className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleDeleteConfirmation(empresa.id!)}
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

          <span className="text-gray-600">Página {currentPage}</span>

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
            <EmpresaEditForm
              empresa={editingEmpresa!}
              onSave={handleSave}
              onClose={() => setModalIsOpen(false)}
              setSnackbar={setSnackbar}
            />
          ) : (
            <EmpresaCreateForm
              onSave={handleSave}
              onClose={() => setModalIsOpen(false)}
              setSnackbar={setSnackbar}
            />
          )}
        </Modal>

        <ConfirmationModal
          isOpen={deleteConfirmOpen}
          title="Confirmação de Exclusão"
          message="Tem certeza de que deseja excluir esta empresa? Esta ação não pode ser desfeita."
          onConfirm={() => handleDelete(empresaToDelete!)}
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