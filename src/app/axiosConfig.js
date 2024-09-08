// src/app/axiosConfig.js
import axios from 'axios';
import apiUrl from './config'; // Importa o apiUrl do arquivo config

// Define a baseURL para todas as requisições do axios
axios.defaults.baseURL = apiUrl;

axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token'); // Recupera o token do localStorage
      if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Adiciona o token no cabeçalho
      }
      return config;
    },
    (error) => {
      return Promise.reject(error); // Rejeita a requisição em caso de erro
    }
  );
  
export default axios;
