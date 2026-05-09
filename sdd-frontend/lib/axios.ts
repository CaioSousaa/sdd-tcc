import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333',
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      (error.response.data as { message?: string }).message ===
        'Token expirado, faça login novamente'
    ) {
      localStorage.removeItem('token');
      alert('Token expirado, faça login novamente');
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

export default api;
