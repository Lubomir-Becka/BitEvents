import axios from 'axios';

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

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Pridaj token do request headerov
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', credentials),

  register: (data: RegistrationRequest) =>
    api.post<AuthResponse>('/auth/register', data),
};

export default api;
