//src/app/recepcao/page.tsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { RecepcaoCreateForm } from './recepcaocreate';
import { RecepcaoEditForm } from './recepcaoedit';
import { Snackbar } from '../snackbar';
import Modal from 'react-modal';
import axios from 'axios';
import { Recepcao } from '../../models/recepcao';
import { SnackbarState } from '../../models/snackbarState';
import Menu from '../../components/menu';
import ConfirmationModal from '../../components/confirmationModal';

Modal.setAppElement('#__next');

export default function RecepcaoList() {
  const [items, setItems] = useState<Recepcao[]>([]);
  const [filteredItems, setFilteredItems] = useState<Recepcao[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Recepcao | null>(null);
  const [snackbar, setSnackbar] = useState(new SnackbarState());
  const [progress, setProgress] = useState(100);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});

  const loadItems = useCallback(async () => {
    try {
      const response = await axios.get('/api/Recepcao');
      setItems(response.data);
      setFilteredItems(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao carregar dados!', 'error', true));
    }
  }, []);

  const hideSnackbar = () => {
    setSnackbar((prev) => new SnackbarState(prev.message, prev.type, false));
  };

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (snackbar.show) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev > 0 ? prev - 1 : 0));
      }, 50);

      const timer = setTimeout(() => {
        hideSnackbar();
        setProgress(100);
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [snackbar]);

  useEffect(() => {
    const filtered = items.filter((item) =>
      Object.values(item).some((value) =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const toggleDropdown = (id: number) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEdit = (item: Recepcao) => {
    setEditingItem(item);
    setIsEditing(true);
    setModalIsOpen(true);
    setDropdownVisible({});
  };

  const handleCreate = () => {
    setIsEditing(false);
    setEditingItem(null);
    setModalIsOpen(true);
  };

  const openDeleteConfirm = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
    setDropdownVisible({});
  };

  const handleDelete = async () => {
    if (itemToDelete !== null) {
      try {
        await axios.delete(`/api/Recepcao/${itemToDelete}`);
        setSnackbar(new SnackbarState('Registro excluído com sucesso!', 'success', true));
        loadItems();
        setDeleteConfirmOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao excluir registro!', 'error', true));
      }
    }
  };

  const handleSave = () => {
    setModalIsOpen(false);
    setSnackbar(new SnackbarState('Registro salvo com sucesso!', 'success', true));
    loadItems();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Menu />
      <div className="flex-1 pt-4">
        <div className="container mx-auto px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Recepção</h1>
            <button
              onClick={handleCreate}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300"
            >
              Nova Recepção
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </span>
          </div>

          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Nome Recepção</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className="border-t border-gray-300 hover:bg-gray-100 transition">
                  <td className="py-3 px-6 text-left text-sm text-gray-800">{item.nomeRecepcao}</td>
                  <td className="py-3 px-6 text-left relative dropdown-actions">
                    <button
                      onClick={() => toggleDropdown(item.id!)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded-lg shadow-sm transition-all duration-200"
                    >
                      Ações
                    </button>
                    {dropdownVisible[item.id!] && (
                      <div className="absolute mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                        <ul className="py-1">
                          <li
                            className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleEdit(item)}
                          >
                            Editar
                          </li>
                          <li
                            className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer"
                            onClick={() => openDeleteConfirm(item.id!)}
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Anterior
            </button>

            <span className="text-gray-600">Página {currentPage}</span>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredItems.length / recordsPerPage)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200"
            >
              Próxima
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 011.414-1.414l4 4a1 1 010 1.414l-4 4a1 1 01-1.414 0z" clipRule="evenodd" />
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
              <RecepcaoEditForm
                recepcao={editingItem!}
                onSave={handleSave}
                onClose={() => setModalIsOpen(false)}
                setSnackbar={setSnackbar}
              />
            ) : (
              <RecepcaoCreateForm
                onSave={handleSave}
                onClose={() => setModalIsOpen(false)}
                setSnackbar={setSnackbar}
              />
            )}
          </Modal>

          <ConfirmationModal
            isOpen={deleteConfirmOpen}
            title="Confirmação de Exclusão"
            message="Tem certeza de que deseja excluir este registro? Esta ação não pode ser desfeita."
            onConfirm={handleDelete}
            onCancel={() => setDeleteConfirmOpen(false)}
            confirmText="Excluir"
            cancelText="Cancelar"
          />

          {snackbar.show && (
            <Snackbar message={snackbar.message} type={snackbar.type} progress={progress} onClose={hideSnackbar} />
          )}
        </div>
      </div>
    </div>
  );
}
