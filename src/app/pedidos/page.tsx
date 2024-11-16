//src/app/pedidos/page.tsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Snackbar } from '../snackbar';
import Modal from 'react-modal';
import axios from 'axios';
import { OrcamentoCabecalho } from '../../models/orcamentoCabecalho';
import { SnackbarState } from '../../models/snackbarState';
import Menu from '../../components/menu';
import { formatDateTimeForGrid } from '@/utils/formatDateForInput';
import { formatCurrencyBRL } from '@/utils/numbers';
import { PedidosEditForm } from './pedidosEdit';

Modal.setAppElement('#__next');

export default function EspecialidadeList() {
  const [orcamentos, setorcamentos] = useState<OrcamentoCabecalho[]>([]);
  const [filtered, setFiltered] = useState<OrcamentoCabecalho[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingOrcamento, seteditingOrcamento] = useState<OrcamentoCabecalho | null>(null);
  const [snackbar, setSnackbar] = useState(new SnackbarState());
  const [progress, setProgress] = useState(100); // Barra de progresso para o snackbar
  const recordsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});

  const totalPages = Math.ceil(filtered.length / recordsPerPage);

  // Função para carregar especialidades
  const loadOrcamentos = async () => {
    try {
      const response = await axios.get('/api/Orcamento/getItemsPedido');
      setorcamentos(response.data);
      setFiltered(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar(new SnackbarState('Erro ao carregar especialidades!', 'error', true));
    }
  };

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
      }, 5000);

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


  const handleEdit = (orcamentoCabecalho: OrcamentoCabecalho) => {
    seteditingOrcamento(orcamentoCabecalho);
    setModalIsOpen(true);
    setDropdownVisible({});
  };


  const toggleDropdown = (id: number) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };


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
    <div className="flex h-screen bg-gray-100">
      <Menu />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Pedidos</h1>
        </div>

        {/* Campo de busca */}
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
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Nº</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Paciente</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Data</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 border-b">Total</th>
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
                          Visualizar
                        </li>
                        <li
                          className="px-4 py-2 text-sm text-blue-500 hover:bg-gray-100 cursor-pointer"
                          // onClick={() => handleDeleteConfirmation(orcamento.id!)}
                        >
                          Gerar NFSe
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

          <span className="text-gray-600">Página {currentPage} de {totalPages}</span>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filtered.length / recordsPerPage)}
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
            <PedidosEditForm
              orcamentoCabecalhoData={editingOrcamento!}
              onSave={handleSave}
              onClose={() => setModalIsOpen(false)}
              setSnackbar={setSnackbar}
            />
        </Modal>

        {/* Snackbar */}
        {snackbar.show && (
          <Snackbar message={snackbar.message} type={snackbar.type} progress={progress} onClose={hideSnackbar} />
        )}
      </div>
    </div>
  );
}
