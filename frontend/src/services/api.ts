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
      const currentPath = globalThis.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        globalThis.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface Event {
  id: number;
  name: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  type: string;
  imageUrl?: string;
  capacity: number;
  price: number;
  status: string;
  venue: {
    id: number;
    name: string;
    city: string;
    address: string;
    googleMapsUrl?: string;
  };
  organizer: {
    id: number;
    fullName: string;
    email: string;
    isOrganizer: boolean;
  };
  creationDateTime: string;
}

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
}

export interface EventFilters {
  search?: string;
  city?: string[];
  category?: string;
  page?: number;
  limit?: number;
}

export interface EventRegistration {
  id: number;
  event: Event;
  registrationDateTime: string;
}

export interface UpdateProfileDto {
  fullName: string;
  email: string;
  profilePicture?: string | null;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  isOrganizer: boolean;
  profilePicture: string | null;
  registrationDate: string;
}

export const authApi = {
  login: (credentials: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', credentials),

  register: (data: RegistrationRequest) =>
    api.post<AuthResponse>('/auth/register', data),
};

export const eventsApi = {
  getAll: (filters?: EventFilters) =>
    api.get<EventsResponse>('/events', { params: filters }),

  getById: (id: number) =>
    api.get<Event>(`/events/${id}`),

  create: (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'organizerId'>) =>
    api.post<Event>('/events', eventData),

  update: (id: number, eventData: Partial<Event>) =>
    api.put<Event>(`/events/${id}`, eventData),

  delete: (id: number) =>
    api.delete(`/events/${id}`),

  isSaved: (eventId: number) =>
    api.get<{ isSaved: boolean }>(`/events/${eventId}/saved`),

  saveEvent: (eventId: number) =>
    api.post(`/events/${eventId}/save`),

  unsaveEvent: (eventId: number) =>
    api.delete(`/events/${eventId}/save`),
};

export const registrationApi = {
  register: (eventId: number) =>
    api.post(`/registrations/events/${eventId}`),

  unregister: (eventId: number) =>
    api.delete(`/registrations/events/${eventId}`),

  getMyRegistrations: () =>
    api.get<EventRegistration[]>('/registrations/events/my'),

  
  isRegistered: (eventId: number) =>
    api.get<{ isRegistered: boolean }>(`/registrations/check/${eventId}`),
};

export const userApi = {
  updateProfile: (data: UpdateProfileDto) =>
    api.put<UserResponseDto>('/auth/me', data),

  changePassword: (data: ChangePasswordDto) =>
    api.put<void>('/auth/me/password', data),
};

export default api;
