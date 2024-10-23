//src/app/login/page.tsx
"use client"; 
import React, { useRef } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth';  
import axios from '../axiosConfig';
import Image from 'next/image';
import { Recepcao } from '@/models/recepcao';

interface Credentials {
  Nome: string;
  Senha: string;
  token: string;
  permissions: string[];
  unidadeId: string;
}

export default function Login() {
  const [credentials, setCredentials] = useState<Credentials>({ Nome: '', Senha: '', token: '', permissions: [], unidadeId: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', color: '', duration: 5000 });
  const [progress, setProgress] = useState(100);  
  const router = useRouter();
  const authContext = useAuth(); 
  const [unidades, setUnidades] = useState<Recepcao[]>([]);
  const unidadeRef = useRef<HTMLSelectElement>(null); // Referência para o campo de unidade
  const [unidadeError, setUnidadeError] = useState(false);

  useEffect(() => {
    if (snackbar.show) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev > 0 ? prev - 1 : 0)); 
      }, snackbar.duration / 100);

      const timer = setTimeout(() => {
        setSnackbar({ ...snackbar, show: false });
        setProgress(100);
      }, snackbar.duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }

    const fetchUnidades = async () => {
      try {
        const response = await axios.get('/api/Recepcao');
        setUnidades(response.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
          const message = axios.isAxiosError(error)
          ? error.response?.data || 'Erro no servidor ou na conexão ao carregar unidades'
          : 'Erro desconhecido.';
        setSnackbar({
          show: true,
          message,
          color: 'bg-red-500',
          duration: 5000,
        });
      }
    };
    fetchUnidades();
  }, [snackbar]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    let message='';
    try {
      if(credentials.unidadeId=='')
      {            
        message='Selecione a Unidade';
          setSnackbar({
            show: true,
            message,
            color: 'bg-red-500',
            duration: 5000,
          });
          setUnidadeError(true); // Marca o campo de unidade com erro
          unidadeRef.current?.focus(); // Dá foco ao campo de unidade
        return;
      }
      await authContext?.login(credentials.Nome, credentials.Senha,credentials.unidadeId);
      router.push('/dashboard');
    } catch (error) {
        message = axios.isAxiosError(error)
        ? error.response?.data || 'Erro no servidor ou na conexão'
        : 'Erro desconhecido.';
      setSnackbar({
        show: true,
        message,
        color: 'bg-red-500',
        duration: 5000,
      });
    }
  };

  const handleUnidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCredentials({ ...credentials, unidadeId: e.target.value });
    setUnidadeError(false); // Remove o erro ao selecionar uma unidade válida
  };

  return (
    <div className="flex min-h-screen">
      {/* Coluna da esquerda: Formulário */}
      <div className="w-1/3 flex flex-col justify-center items-center bg-white p-8">
      
        {/* Formulário de login */}
        <div className="w-full max-w-xs">
          <h2 className="text-xl font-semibold text-gray-700 mb-8 text-center">Informe seus dados abaixo</h2>
          <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              value={credentials.Nome}
              onChange={(e) => setCredentials({ ...credentials, Nome: e.target.value })}
              className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-blue-400"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Senha *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.Senha}
                onChange={(e) => setCredentials({ ...credentials, Senha: e.target.value })}
                className="block w-full px-4 py-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-400"
                required
              />
              <span
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁'}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <a href="#" className="text-sm text-blue-600 hover:underline">Esqueci minha senha</a>
          </div>


          <div className="mb-6">
            <div className="relative">
              <select 
                ref={unidadeRef}
                value={credentials.unidadeId} // Use the unidadeId from credentials
                onChange={handleUnidadeChange} // Update unidadeId on change
                className={`block w-full px-4 py-2 mt-2 text-gray-700 bg-white border ${unidadeError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-blue-400`}
              >
                <option value="">Unidade</option>
                {unidades.map((unidade) => (
                  <option key={unidade.id} value={unidade.id}>
                    {unidade.nomeRecepcao}
                  </option>
                ))}
              </select>
                {unidadeError && (
                    <p className="text-red-500 text-sm mt-1">Por favor, selecione uma unidade.</p>
                  )}
            </div>
          </div> 

            <button
              type="submit"
              className="w-full px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>

      {/* Coluna da direita: Banner */}
      <div className="w-2/3 bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center p-8 text-white">
        <div className="text-center">
          <h2 className="text-3xl font-semibold mb-4">O seu laboratório de exames clínicos</h2>
          <p className="mb-4">Mais transparência e agilidade nos processos.</p>
          {/* Utilização do componente Image */}
          <Image 
            src="/imgs/laboratorio.jpg"  // Caminho relativo ao diretório public
            alt="Mobile App Preview" 
            width={512}  // Largura da imagem
            height={512} // Altura da imagem
            priority={true} // Opcional: carrega a imagem com prioridade
            style={{ width: '100%', height: 'auto' }}
          />       
          <p className="text-sm">Confira a área de exames</p>
        </div>
      </div>

      {/* Snackbar Notification */}
      {snackbar.show && (
        <div
          className={`fixed top-5 right-5 p-4 mb-4 text-white rounded-md shadow-lg ${snackbar.color} animate-slide-up`}
          style={{ width: '300px' }}
        >
          <p>{snackbar.message}</p>
          <div className="relative w-full h-1 mt-2 bg-gray-300">
            <div
              className="absolute left-0 top-0 h-full bg-white"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <button
            onClick={() => setSnackbar({ ...snackbar, show: false })}
            className="text-sm underline focus:outline-none"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}