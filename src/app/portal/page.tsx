//src/app/portal/Login/page.tsx
"use client"; 
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalAuth  } from '../authPortal';  
import axios from '../axiosConfig';

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
  const authContext = usePortalAuth (); 

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
  }, [snackbar]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    let message='';
    try {    
      await authContext?.login(credentials.Nome, credentials.Senha,'0');
      router.push('./portal/Menu');
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


  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-4 bg-gray-100">
        {/* Formulário de login */}
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-8 text-center">
            Informe seus dados abaixo
        </h2>
        <form onSubmit={handleLogin}>
            <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
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

            <button
            type="submit"
            className="w-full px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
            Entrar
            </button>
        </form>

        {/* Register Option */}
        <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <button
                onClick={() => router.push('/portal/Cliente/create')}
                className="text-blue-600 hover:underline"
            >
                Registre-se
            </button>
            </p>
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