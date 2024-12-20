"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { OrcamentoCreateForm } from './orcamentoCreate';
import { OrcamentoEditForm } from './orcamentoEdit';
import { Snackbar } from '../../snackbar';
import Modal from 'react-modal';
import axios from 'axios';
import { OrcamentoCabecalho } from '../../../models/orcamentoCabecalho';
import { SnackbarState } from '../../../models/snackbarState';
// import ConfirmationModal from '../../../components/confirmationModal';
import { formatDateTimeForGrid } from '@/utils/formatDateForInput';
import { formatCurrencyBRL } from '@/utils/numbers';
import { usePortalAuth } from '@/app/authPortal';
import { useRouter } from 'next/navigation';

Modal.setAppElement('#__next');

export default function EspecialidadeList() {
  const [orcamentos, setorcamentos] = useState<OrcamentoCabecalho[]>([]);
  const [filtered, setFiltered] = useState<OrcamentoCabecalho[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrcamento, seteditingOrcamento] = useState<OrcamentoCabecalho | null>(null);
  const [snackbar, setSnackbar] = useState(new SnackbarState());
  // const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  // const [orcamentoToDelete, setorcamentoToDelete] = useState<number | null>(null);
  const [progress, setProgress] = useState(100); // Barra de progresso para o snackbar
  const recordsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});

  const totalPages = Math.ceil(filtered.length / recordsPerPage);

  const authContext = usePortalAuth ();
  const { user } = authContext || {};
  const router = useRouter();

  // Função para carregar especialidades
  const loadOrcamentos = async () => {
    try {
      if (!user) return;
      const response = await axios.get(`/api/Orcamento/portal/${user.id}`);
      setorcamentos(response.data);
      setFiltered(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("./portal");
    }
  }, [user, router]);

  useEffect(() => {
    loadOrcamentos();
  }, []);

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
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [snackbar]);

  const hideSnackbar = () => {
    setSnackbar((prev) => {
      const newSnackbarState = new SnackbarState(prev.message, prev.type, false); // Cria uma nova instância de SnackbarState
      return newSnackbarState;
    });
  };

  const applySearch = useCallback(() => {
    const searchTermLower = searchTerm.toLowerCase();
    const filteredEspecialidades = orcamentos.filter((orcamento) =>
      Object.values(orcamento).some((value) =>
        String(value).toLowerCase().includes(searchTermLower)
      )
    );
    setFiltered(filteredEspecialidades);
  }, [searchTerm, orcamentos]);

  useEffect(() => {
    applySearch();
  }, [searchTerm, orcamentos, applySearch]);

  const handleSave = () => {
    setModalIsOpen(false);
    setSnackbar(new SnackbarState('Registro salvo com sucesso!', 'success', true));
    loadOrcamentos();
  };

  // const handleDelete = async () => {
  //   if (orcamentoToDelete !== null) {
  //     try {
  //         // Chamada à API para validação adicional
  //         const response = await axios.get<string>(`/api/Orcamento/validateCreatePedido/${orcamentoToDelete}`);
  //         const validationMessage = response.data;

  //         // Verifica se a mensagem é diferente de vazio
  //         if (validationMessage) {
  //           setSnackbar(new SnackbarState(validationMessage, 'error', true));
  //           return; // Impede que o processo continue
  //         }
  //         await axios.delete(`/api/Orcamento/${orcamentoToDelete}`);
  //         setSnackbar(new SnackbarState('Orcamento excluído com sucesso!', 'success', true));
  //         setDeleteConfirmOpen(false);
  //         loadOrcamentos();
  //       // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     } catch (error) {
  //       setSnackbar(new SnackbarState('Erro ao excluir orcamento!', 'error', true));
  //     }
  //   }
  // };

  const handleEdit = (orcamentoCabecalho: OrcamentoCabecalho) => {
    seteditingOrcamento(orcamentoCabecalho);
    setIsEditing(true);
    setModalIsOpen(true);
    setDropdownVisible({});
  };

  const handleNewOrcamento = () => {
    setIsEditing(false);
    seteditingOrcamento(null);
    setModalIsOpen(true);
  };

  const toggleDropdown = (id: number) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // const handleDeleteConfirmation = (id: number) => {
  //   setorcamentoToDelete(id);
  //   setDeleteConfirmOpen(true);
  //   setDropdownVisible({});
  // };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentOrcamentos = filtered.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
       <div className="container mx-auto px-4 py-6">
       <div className="flex flex-col md:flex-row justify-between items-center mb-6">
       <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">Orçamentos</h1>
          <button
            onClick={handleNewOrcamento}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 md:px-6 rounded-lg shadow-md w-full md:w-auto"
          >
            Novo Orçamento
          </button>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">          
          <button
              type="button"
              onClick={() => router.push('./Menu')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 md:px-6 rounded-lg shadow-md w-full md:w-auto"
            >
              Voltar
            </button>          
        </div>

        {/* Campo de busca */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
             className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
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
        <div className="overflow-x-auto">
        <table className="hidden md:table min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Nº</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Paciente</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Data</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Total</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Status</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentOrcamentos.map((orcamento) => (
              <tr key={orcamento.id} className="border-t border-gray-300 hover:bg-gray-100 transition">
                <td className="py-3 px-6 text-left text-sm text-gray-800">{orcamento.id}</td>
                <td className="py-3 px-6 text-left text-sm text-gray-800">{orcamento.nomePaciente}</td>
                <td className="py-3 px-6 text-left text-sm text-gray-800">{formatDateTimeForGrid(orcamento.dataHora)}</td>
                <td className="py-3 px-6 text-left text-sm text-gray-800">{formatCurrencyBRL(orcamento.total?? 0)}</td>
                <td className="py-3 px-6 text-left text-sm text-gray-800">
                    {Number(orcamento.status) === 0 && "Cancelado"}
                    {Number(orcamento.status) === 1 && "Ativo"}
                    {Number(orcamento.status) === 2 && "Finalizado"}
                </td>
                <td className="py-3 px-6 text-left relative dropdown-actions">
                  <button
                    onClick={() => toggleDropdown(orcamento.id!)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded-lg shadow-sm transition-all duration-200"
                  >
                    Ações
                  </button>
                  {dropdownVisible[orcamento.id!] && (
                    <div className="absolute mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                      <ul className="py-1">
                        <li
                          className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleEdit(orcamento)}
                        >
                          Editar
                        </li>
                        {/* <li
                          className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleDeleteConfirmation(orcamento.id!)}
                        >
                          Excluir
                        </li> */}
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      {/* Layout Mobile: Cards */}
      <div className="flex flex-col space-y-4 md:hidden">
        {currentOrcamentos.map((orcamento) => (
          <div key={orcamento.id} className="bg-white border rounded-lg shadow-md p-4 relative">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">Paciente: {orcamento.nomePaciente}</h2>
              {Number(orcamento.status) === 1 && (
                <button
                  onClick={() => handleEdit(orcamento)}                
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-4 rounded-lg transition-all duration-200"
                >
                  Editar
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600">Data: {formatDateTimeForGrid(orcamento.dataHora)}</p>
            <p className="text-sm text-gray-600">Total: {formatCurrencyBRL(orcamento.total ?? 0)}</p>
            <p className="text-sm text-gray-600">
              Status: {Number(orcamento.status) === 0
                ? 'Cancelado'
                : Number(orcamento.status) === 1
                ? 'Ativo'
                : 'Finalizado'}
            </p>
          </div>
        ))}
      </div>
    </div>

        {/* Paginação */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <span className="text-gray-600">Página {currentPage} de {totalPages}</span>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filtered.length / recordsPerPage)}
            className="text-gray-600 hover:text-gray-800"
          >            
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Próxima
          </button>
        </div>
        {/* Modal de criação e edição */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="bg-white p-6 w-full max-w-lg mx-auto rounded-lg shadow-lg"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          {isEditing ? (
            <OrcamentoEditForm
              orcamentoCabecalhoData={editingOrcamento!}
              onSave={handleSave}
              onClose={() => setModalIsOpen(false)}
              setSnackbar={setSnackbar}
            />
          ) : (
            <OrcamentoCreateForm
              onSave={handleSave}
              onClose={() => setModalIsOpen(false)}
              setSnackbar={setSnackbar}
            />
          )}
        </Modal>

        {/* Modal de confirmação de exclusão */}
        {/* <ConfirmationModal
          isOpen={deleteConfirmOpen}
          title="Confirmação de Exclusão"
          message="Tem certeza de que deseja excluir esta especialidade? Esta ação não pode ser desfeita."
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmOpen(false)}
          confirmText="Excluir"
          cancelText="Cancelar"
        /> */}

        {/* Snackbar */}
        {snackbar.show && (
          <Snackbar message={snackbar.message} type={snackbar.type} progress={progress} onClose={hideSnackbar} />
        )}
      </div>
    </div>
  );
}
