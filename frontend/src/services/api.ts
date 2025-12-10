import axios, { AxiosError } from 'axios';

const API_BASE_URL = '/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistrationRequest {
  fullName: string;
  email: string;
  password: string;
  isOrganizer: boolean;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    registrationDate: string;
    profilePicture: string | null;
    isOrganizer: boolean;
  };
}

// API error response interface
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: number;
}

// Utility funkcia na extrahovanie chybovej správy z API response
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    // Ak server vráti správu
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    
    // HTTP status code správy
    switch (axiosError.response?.status) {
      case 400:
        return 'Neplatná požiadavka. Skontrolujte zadané údaje.';
      case 401:
        return 'Nesprávne prihlasovacie údaje.';
      case 403:
        return 'Prístup zamietnutý.';
      case 404:
        return 'Služba nie je dostupná.';
      case 409:
        return 'Používateľ s týmto emailom už existuje.';
      case 500:
        return 'Chyba servera. Skúste to neskôr.';
      default:
        break;
    }
    
    // Network error
    if (axiosError.code === 'ERR_NETWORK') {
      return 'Nedá sa pripojiť k serveru. Skontrolujte pripojenie.';
    }
  }
  
  // Fallback
  return 'Nastala neočakávaná chyba. Skúste to znova.';
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 sekúnd timeout
});

// Pridaj token do request headerov
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor pre automatický logout pri 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired alebo neplatný - vyčisti localStorage
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', credentials),

  register: (data: RegistrationRequest) =>
    api.post<AuthResponse>('/auth/register', data),
};

export default api;
