//src/app/grupousuario/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { GrupoUsuarioCreateForm } from './grupousuariocreate';
import { GrupoUsuarioEditForm } from './grupousuarioedit';
import { Snackbar } from '../snackbar';
import Modal from 'react-modal';
import axios from 'axios';
import { GrupoUsuario } from '../../models/grupoUsuario';
import { SnackbarState } from '../../models/snackbarState'; // Importa a classe
import Menu from '../../components/menu'; // Importa o menu
import ConfirmationModal from '../../components/confirmationModal'; // Importa a modal genérica

export default function GrupoUsuarioList() {
  const [grupoUsuarios, setGrupoUsuarios] = useState<GrupoUsuario[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<GrupoUsuario | null>(null);
  const [snackbar, setSnackbar] = useState(new SnackbarState()); // Instância de SnackbarState
  const [progress, setProgress] = useState(100); // Para a barra de progresso
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false); // Controla o modal de confirmação de exclusão
  const [grupoToDelete, setGrupoToDelete] = useState<number | null>(null); // Armazena o grupo a ser excluído  

  useEffect(() => {
    loadGrupoUsuarios();
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

  // Função para carregar os dados
  const loadGrupoUsuarios = async () => {
    try {
      const response = await axios.get('/api/GrupoUsuario');
      setGrupoUsuarios(response.data);
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao carregar grupos!', 'error', true));
    }
  };

  // Excluir grupo
  const handleDelete = async () => {
    if (grupoToDelete !== null) {
      try {
        await axios.delete(`/api/GrupoUsuario/${grupoToDelete}`);
        setSnackbar(new SnackbarState('Grupo excluído com sucesso!', 'success', true));
        loadGrupoUsuarios();
        closeDeleteConfirm(); // Fechar o modal de confirmação após a exclusão
      } catch (error) {
        setSnackbar(new SnackbarState('Erro ao excluir grupo!', 'error', true));
      }
    }
  };

    // Abrir modal de confirmação de exclusão
    const openDeleteConfirm = (id: number) => {
        setGrupoToDelete(id);
        setDeleteConfirmOpen(true);
      };
    
      // Fechar modal de confirmação
      const closeDeleteConfirm = () => {
        setGrupoToDelete(null);
        setDeleteConfirmOpen(false);
      };

  // Fechar modal e exibir snackbar ao salvar
  const handleSave = () => {
    setModalIsOpen(false);
    setSnackbar(new SnackbarState('Grupo salvo com sucesso!', 'success', true));
    loadGrupoUsuarios();
  };

  // Abrir modal para criar
  const handleCreate = () => {
    setIsEditing(false);
    setModalIsOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (grupo: GrupoUsuario) => {
    setEditingGrupo(grupo);
    setIsEditing(true);
    setModalIsOpen(true);
  };

  return (
    <div className="flex h-screen">
      {/* Inclui o menu no lado esquerdo */}
      <Menu />

      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Grupos de Usuários</h1>
          <button
            onClick={handleCreate}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Novo Grupo
          </button>
        </div>

        {/* Tabela de listagem */}
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left">Descrição</th>
              <th className="py-2 px-4 text-left">Editar</th>
              <th className="py-2 px-4 text-left">Excluir</th>
            </tr>
          </thead>
          <tbody>
            {grupoUsuarios.map((grupo) => (
              <tr key={grupo.id} className="border-t border-gray-200">
                <td className="py-2 px-4 text-left">{grupo.descricao}</td>
                <td className="py-2 px-4 text-left">
                  <button
                    className="text-yellow-500 hover:text-yellow-700 mr-2"
                    onClick={() => handleEdit(grupo)}
                  >
                    Editar
                  </button>
                </td>
                <td className="py-2 px-4">
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => openDeleteConfirm(grupo.id!)} // Usa a função de abrir o modal de confirmação
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
            <GrupoUsuarioEditForm grupoUsuario={editingGrupo!} onSave={handleSave} onClose={() => setModalIsOpen(false)} setSnackbar={setSnackbar} />
          ) : (
            <GrupoUsuarioCreateForm onSave={handleSave} onClose={() => setModalIsOpen(false)} setSnackbar={setSnackbar} />
          )}
        </Modal>

        {/* Modal de confirmação para exclusão */}
        <ConfirmationModal
          isOpen={deleteConfirmOpen}
          title="Confirmação de Exclusão"
          message="Tem certeza de que deseja excluir este grupo de usuários? Esta ação não pode ser desfeita."
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
