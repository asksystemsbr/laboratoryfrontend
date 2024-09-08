"use client"; // <-- Certifique-se de que isso está no topo do arquivo
import { useState,useEffect  } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../login/auth';  // Importa o hook de autenticação
import axios from '../axiosConfig';


interface Credentials {
  Nome: string;
  Senha: string;
  token: string;
  permissions:string[];
}

export default function Login() {
  const [credentials, setCredentials] = useState<Credentials>({ Nome: '', Senha: '',token: '',permissions:[] });
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', color: '' , duration: 5000 });
  const [progress, setProgress] = useState(100);  // Inicializa a progress bar em 100%
  const router = useRouter();
  //const { login } = useAuth(); 
  const authContext = useAuth(); // Pega o contexto de autenticação

  useEffect(() => {
    if (snackbar.show) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev > 0 ? prev - 1 : 0));  // Reduz progressivamente
      }, snackbar.duration / 100);  // Duração para reduzir até 0

      // Oculta a snackbar após o tempo definido (5 segundos)
      const timer = setTimeout(() => {
        setSnackbar({ ...snackbar, show: false });
        setProgress(100);  // Reset progress quando a snackbar some
      }, snackbar.duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [snackbar]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // const response = await axios.post('/api/Usuarios/authenticate', credentials);
      // const userData = response.data;

      // Chama a função login do contexto de autenticação
      //login(userData);
      await authContext?.login(credentials.Nome,credentials.Senha);

      // Redireciona para o dashboard após o login
      router.push('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSnackbar({
          show: true,
          message: error.response?.data || 'Erro no servidor ou na conexão',
          color: 'bg-red-500',
          duration: 5000,
        });
      } else {
        setSnackbar({
          show: true,
          message: 'Erro desconhecido.',
          color: 'bg-red-500',
          duration: 5000,
        });
      }      
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white border border-gray-300 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-center text-gray-700">Login</h2>
        <form onSubmit={handleLogin} className="mt-6">
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.Senha}
                onChange={(e) => setCredentials({ ...credentials, Senha: e.target.value })}
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-blue-400"
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
          <button
            type="submit"
            className="w-full px-4 py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-blue-400"
          >
            Entrar
          </button>
        </form>

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
    </div>
  );
}