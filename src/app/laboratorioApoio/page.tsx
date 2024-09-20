//src/app/laboratorioApoio/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { LaboratorioApoioCreateForm } from './laboratorioApoiocreate';
import { LaboratorioApoioEditForm } from './laboratorioApoioedit';
import { Snackbar } from '../snackbar';
import Modal from 'react-modal';
import axios from 'axios';
import { LaboratorioApoio } from '../../models/laboratorioApoio'; 
import { SnackbarState } from '../../models/snackbarState'; // Importa a classe
import Menu from '../../components/menu'; // Importa o menu
import ConfirmationModal from '../../components/confirmationModal'; // Importa a modal genérica

Modal.setAppElement('#__next');

export default function ItemsList() {
  const [items, setItems] = useState<LaboratorioApoio []>([]);
  const [filtered, setFiltered] = useState<LaboratorioApoio []>([]);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo de busca
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<LaboratorioApoio  | null>(null);
  const [snackbar, setSnackbar] = useState(new SnackbarState()); // Instância de SnackbarState
  const [progress, setProgress] = useState(100); // Para a barra de progresso
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false); // Controla o modal de confirmação de exclusão
  const [itemToDelete, setItemToDelete] = useState<number | null>(null); 

  useEffect(() => {
    loadItems();
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
    const filtered = items.filter((item) => {
      // Obtenha todas as chaves (campos) do objeto `cliente`
        return Object.values(item).some((value) => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    });
    setFiltered(filtered);
  }, [searchTerm, items]);

  // Função para carregar os dados
  const loadItems = async () => {
    try {
      const response = await axios.get('/api/LaboratorioApoio');
      setItems(response.data);
      setFiltered(response.data); 
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao carregar dados!', 'error', true));
    }
  };

  const handleDelete = async () => {
    if (itemToDelete !== null) {
      try {
        await axios.delete(`/api/LaboratorioApoio/${itemToDelete}`);
        setSnackbar(new SnackbarState('Registro excluído com sucesso!', 'success', true));
        loadItems();
        closeDeleteConfirm(); // Fechar o modal de confirmação após a exclusão
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao excluir registro!', 'error', true));
      }
    }
  };

    // Abrir modal de confirmação de exclusão
    const openDeleteConfirm = (id: number) => {
        setItemToDelete(id);
        setDeleteConfirmOpen(true);
      };
    
      // Fechar modal de confirmação
      const closeDeleteConfirm = () => {
        setItemToDelete(null);
        setDeleteConfirmOpen(false);
      };

  // Fechar modal e exibir snackbar ao salvar
  const handleSave = () => {
    setModalIsOpen(false);
    setSnackbar(new SnackbarState('Registro salvo com sucesso!', 'success', true));
    loadItems();
  };

  // Abrir modal para criar
  const handleCreate = () => {
    setIsEditing(false);
    setModalIsOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (item: LaboratorioApoio ) => {
    setEditingItem(item);
    setIsEditing(true);
    setModalIsOpen(true);
  };

  return (
    <div className="flex h-screen">
      {/* Inclui o menu no lado esquerdo */}
      <Menu />

      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Laboratório de Apoio</h1>
          <button
            onClick={handleCreate}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Novo Laboratório de Apoio
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

        {/* Tabela de listagem */}
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">Nome do Laboratório</th>
              <th className="py-2 px-4 text-left">Editar</th>
              <th className="py-2 px-4 text-left">Excluir</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t border-gray-200">
                <td className="py-2 px-4 text-left">{item.nomeLaboratorio}</td>
                <td className="py-2 px-4 text-left">
                  <button
                    className="text-yellow-500 hover:text-yellow-700 mr-2"
                    onClick={() => handleEdit(item)}
                  >
                    Editar
                  </button>
                </td>
                <td className="py-2 px-4">
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => openDeleteConfirm(item.id!)} // Usa a função de abrir o modal de confirmação
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal para criar ou editar */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="bg-white p-6 max-w-xl mx-auto rounded-lg shadow-lg w-full" // Tornando o modal maior
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" // Classe para o overlay
        >
          {isEditing ? (
            <LaboratorioApoioEditForm   laboratorioApoio={editingItem!} onSave={handleSave} onClose={() => setModalIsOpen(false)} setSnackbar={setSnackbar} />
          ) : (
            <LaboratorioApoioCreateForm   onSave={handleSave} onClose={() => setModalIsOpen(false)} setSnackbar={setSnackbar} />
          )}
        </Modal>

        {/* Modal de confirmação para exclusão */}
        <ConfirmationModal
          isOpen={deleteConfirmOpen}
          title="Confirmação de Exclusão"
          message="Tem certeza de que deseja excluir este registro? Esta ação não pode ser desfeita."
          onConfirm={handleDelete} // Não passa parâmetros aqui
          onCancel={closeDeleteConfirm} // Fecha o modal
          confirmText="Excluir"
          cancelText="Cancelar"
        />

        {/* Snackbar de feedback */}
        {snackbar.show && (
          <Snackbar message={snackbar.message} type={snackbar.type} progress={progress} />
        )}
      </div>
    </div>
  );
}
