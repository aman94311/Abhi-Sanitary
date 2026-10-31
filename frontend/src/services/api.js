import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected server error occurred',
      status: error.response?.status,
    };
    return Promise.reject(customError);
  }
);

export default api;
