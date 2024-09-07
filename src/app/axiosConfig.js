// src/app/axiosConfig.js
import axios from 'axios';
import apiUrl from './config'; // Importa o apiUrl do arquivo config

// Define a baseURL para todas as requisições do axios
axios.defaults.baseURL = apiUrl;

export default axios;
