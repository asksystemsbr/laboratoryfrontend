"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { SetorCreateForm } from './setorcreate';
import { SetorEditForm } from './setoredit';
import { Snackbar } from '../snackbar';
import Modal from 'react-modal';
import axios from 'axios';
import { Setor } from '../../models/setor';
import { SnackbarState } from '../../models/snackbarState';
import Menu from '../../components/menu';
import ConfirmationModal from '../../components/confirmationModal';

Modal.setAppElement('#__next');

export default function SetorList() {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [filteredSetores, setFilteredSetores] = useState<Setor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSetor, setEditingSetor] = useState<Setor | null>(null);
  const [snackbar, setSnackbar] = useState(new SnackbarState());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [setorToDelete, setSetorToDelete] = useState<number | null>(null);
  const [progress, setProgress] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});

  // Função para carregar setores
  const loadSetores = useCallback(async () => {
    try {
      const response = await axios.get('/api/Setor');
      setSetores(response.data);
      setFilteredSetores(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao carregar setores!', 'error', true));
    }
  }, [setSnackbar]);

  useEffect(() => {
    loadSetores();
  }, [loadSetores]);

  // Função para controle do Snackbar
  useEffect(() => {
    if (snackbar.show) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev > 0 ? prev - 1 : 0));
      }, 50);

      const timer = setTimeout(() => {
        snackbar.hideSnackbar();
        setSnackbar(new SnackbarState());
        setProgress(100); // Reset progresso
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [snackbar]);

  // Função de busca
  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filtered = setores.filter((setor) =>
      setor.descricao.toLowerCase().includes(searchTerm)
    );

    setFilteredSetores(filtered);
  }, [setores]);

  const handleSave = useCallback(() => {
    setModalIsOpen(false);
    setSnackbar(new SnackbarState('Registro salvo com sucesso!', 'success', true));
    loadSetores();
  }, [loadSetores]);

  const handleDelete = useCallback(async () => {
    if (setorToDelete !== null) {
      try {
        await axios.delete(`/api/Setor/${setorToDelete}`);
        setSnackbar(new SnackbarState('Setor excluído com sucesso!', 'success', true));
        setDeleteConfirmOpen(false);
        loadSetores();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao excluir setor!', 'error', true));
      }
    }
  }, [setorToDelete, loadSetores]);

  const handleEdit = useCallback((setor: Setor) => {
    setEditingSetor(setor);
    setIsEditing(true);
    setModalIsOpen(true);
    setDropdownVisible({});
  }, []);

  const handleNewSetor = useCallback(() => {
    setIsEditing(false);
    setEditingSetor(null);
    setModalIsOpen(true);
  }, []);

  const toggleDropdown = useCallback((id: number) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleDeleteConfirmation = useCallback((id: number) => {
    setSetorToDelete(id);
    setDeleteConfirmOpen(true);
    setDropdownVisible({});
  }, []);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentSetores = filteredSetores.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = useCallback((pageNumber: number) => setCurrentPage(pageNumber), []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const isClickInside = (event.target as HTMLElement).closest('.dropdown-actions');
    if (!isClickInside) {
      setDropdownVisible({});
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Menu />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Setores</h1>
          <button
            onClick={handleNewSetor}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300"
          >
            Novo Setor
          </button>
        </div>

        {/* Campo de busca */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={handleSearch}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute right-4 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.9 14.32a8 8 0 111.42-1.42l4.28 4.29a1 1 0 11-1.42 1.42l-4.28-4.29zM8 14a6 6 0 100-12 6 6 0 000 12z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        {/* Tabela */}
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Descrição</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentSetores.map((setor) => (
              <tr key={setor.id} className="border-t border-gray-300 hover:bg-gray-100 transition">
                <td className="py-3 px-6 text-left text-sm text-gray-800">{setor.descricao}</td>
                <td className="py-3 px-6 text-left relative dropdown-actions">
                  <button
                    onClick={() => toggleDropdown(setor.id!)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded-lg shadow-sm transition-all duration-200"
                  >
                    Ações
                  </button>
                  {dropdownVisible[setor.id!] && (
                    <div className="absolute mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                      <ul className="py-1">
                        <li
                          className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleEdit(setor)}
                        >
                          Editar
                        </li>
                        <li
                          className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleDeleteConfirmation(setor.id!)}
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <span className="text-gray-600">Página {currentPage}</span>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredSetores.length / recordsPerPage)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200"
          >
            Próxima
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Modal de criação e edição */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="bg-white p-6 max-w-xl mx-auto rounded-lg shadow-lg w-full"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          {isEditing ? (
            <SetorEditForm
              setor={editingSetor!}
              onSave={handleSave}
              onClose={() => setModalIsOpen(false)}
              setSnackbar={setSnackbar}
            />
          ) : (
            <SetorCreateForm
              onSave={handleSave}
              onClose={() => setModalIsOpen(false)}
              setSnackbar={setSnackbar}
            />
          )}
        </Modal>

        {/* Modal de confirmação de exclusão */}
        <ConfirmationModal
          isOpen={deleteConfirmOpen}
          title="Confirmação de Exclusão"
          message="Tem certeza de que deseja excluir este setor? Esta ação não pode ser desfeita."
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmOpen(false)}
          confirmText="Excluir"
          cancelText="Cancelar"
        />

        {/* Snackbar */}
        {snackbar.show && (
          <Snackbar message={snackbar.message} type={snackbar.type} progress={progress} />
        )}
      </div>
    </div>
  );
}