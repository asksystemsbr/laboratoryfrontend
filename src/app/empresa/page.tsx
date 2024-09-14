"use client";
import { useState, useEffect } from 'react';
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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [snackbar, setSnackbar] = useState(new SnackbarState());
  const [progress, setProgress] = useState(100);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<number | null>(null);

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

  const loadEmpresas = async () => {
    try {
      const response = await axios.get('/api/Empresa');
      setEmpresas(response.data);
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao carregar empresas!', 'error', true));
    }
  };

  const handleDelete = async () => {
    if (empresaToDelete !== null) {
      try {
        await axios.delete(`/api/Empresa/${empresaToDelete}`);
        setSnackbar(new SnackbarState('Empresa excluída com sucesso!', 'success', true));
        loadEmpresas();
        closeDeleteConfirm();
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao excluir empresa!', 'error', true));
      }
    }
  };

  const openDeleteConfirm = (id: number) => {
    setEmpresaToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setEmpresaToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleSave = () => {
    setModalIsOpen(false);
    setSnackbar(new SnackbarState('Empresa salva com sucesso!', 'success', true));
    loadEmpresas();
  };

  const handleCreate = () => {
    setIsEditing(false);
    setModalIsOpen(true);
  };

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setIsEditing(true);
    setModalIsOpen(true);
  };

  return (
    <div className="flex h-screen">
      <Menu />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Empresas</h1>
          <button
            onClick={handleCreate}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Nova Empresa
          </button>
        </div>

        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">CNPJ</th>
              <th className="py-2 px-4 text-left">Razão Social</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Editar</th>
              <th className="py-2 px-4 text-left">Excluir</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((empresa) => (
              <tr key={empresa.id} className="border-t border-gray-200">
                <td className="py-2 px-4 text-left">{empresa.cnpj}</td>
                <td className="py-2 px-4 text-left">{empresa.razaoSocial}</td>
                <td className="py-2 px-4 text-left">{empresa.email}</td>
                <td className="py-2 px-4 text-left">
                  <button
                    className="text-yellow-500 hover:text-yellow-700 mr-2"
                    onClick={() => handleEdit(empresa)}
                  >
                    Editar
                  </button>
                </td>
                <td className="py-2 px-4">
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => openDeleteConfirm(empresa.id!)}
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
            <EmpresaEditForm empresaId={editingEmpresa!.id!} onSave={handleSave} onClose={() => setModalIsOpen(false)} setSnackbar={setSnackbar} />
          ) : (
            <EmpresaCreateForm onSave={handleSave} onClose={() => setModalIsOpen(false)} setSnackbar={setSnackbar} />
          )}
        </Modal>

        <ConfirmationModal
          isOpen={deleteConfirmOpen}
          title="Confirmação de Exclusão"
          message="Tem certeza de que deseja excluir esta empresa? Esta ação não pode ser desfeita."
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