import axios from 'axios';

// Vite automatically sets this to true when you deploy (npm run build)
// and false when you are developing locally (npm run dev)
const IS_PRODUCTION = import.meta.env.PROD;

const api = axios.create({
  baseURL: IS_PRODUCTION 
    ? 'https://nexusratings.onrender.com/api' 
    : 'http://localhost:5000/api', 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;