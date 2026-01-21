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
    latitude?: number;
    longitude?: number;
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

export interface CreateEventPayload {
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
    name: string;
    city: string;
    address: string;
    latitude?: number;
    longitude?: number;
    googleMapsUrl?: string;
  };
}

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
}
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

  create: (eventData: CreateEventPayload) =>
    api.post<Event>('/events', eventData),

  update: (id: number, eventData: Partial<CreateEventPayload>) =>
    api.put<Event>(`/events/${id}`, eventData),

  delete: (id: number) =>
    api.delete(`/events/${id}`),
};

export const savedEventsApi = {
  // Check if event is saved by user
  isSaved: (eventId: number) =>
    api.get<{ isSaved: boolean }>(`/saved-events/check/${eventId}`),

  // Save event to favorites
  saveEvent: (eventId: number) =>
    api.post(`/saved-events/${eventId}`),

  // Remove event from favorites
  unsaveEvent: (eventId: number) =>
    api.delete(`/saved-events/${eventId}`),

  // Get all saved events for current user
  getMySavedEvents: () =>
    api.get<Event[]>('/saved-events'),
};

export const registrationApi = {
  // Register for an event
  register: (eventId: number) =>
    api.post(`/registrations/events/${eventId}`),

  // Unregister from an event
  unregister: (eventId: number) =>
    api.delete(`/registrations/events/${eventId}`),

  // Get my registrations
  getMyRegistrations: () =>
    api.get<EventRegistration[]>('/registrations/events/my'),

  // Check if user is registered for an event
  isRegistered: (eventId: number) =>
    api.get<{ isRegistered: boolean }>(`/registrations/check/${eventId}`),
};

export const userApi = {
  // Get current user profile
  getCurrentUser: () =>
    api.get<UserResponseDto>('/users/me'),

  // Update profile
  updateProfile: (data: UpdateProfileDto) =>
    api.put<UserResponseDto>('/users/me', data),

  // Change password
  changePassword: (data: ChangePasswordDto) =>
    api.put<void>('/users/me/password', data),

  // Upload profile picture
  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ profilePictureUrl: string }>('/users/me/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteAccount: () =>
    api.delete<void>('/users/me'),
};

export const fileApi = {
  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{
      fileName: string;
      fileDownloadUri: string;
      fileType: string;
      size: string;
    }>('/files/upload/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadEventImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{
      fileName: string;
      fileDownloadUri: string;
      fileType: string;
      size: string;
    }>('/files/upload/event', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export interface EventImage {
  id: number;
  eventId: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder?: number;
}

export const eventImageApi = {
  // Upload image for event
  uploadImage: (eventId: number, file: File, isPrimary: boolean = false, displayOrder?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (isPrimary !== undefined) formData.append('isPrimary', String(isPrimary));
    if (displayOrder !== undefined) formData.append('displayOrder', String(displayOrder));

    return api.post<EventImage>(`/events/${eventId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get all images for event
  getEventImages: (eventId: number) =>
    api.get<EventImage[]>(`/events/${eventId}/images`),

  // Set image as primary
  setPrimaryImage: (eventId: number, imageId: number) =>
    api.put<void>(`/events/${eventId}/images/${imageId}/set-primary`),

  // Delete image
  deleteImage: (eventId: number, imageId: number) =>
    api.delete(`/events/${eventId}/images/${imageId}`),
};

export interface OrganizerDashboard {
  totalEvents: number;
  totalRegistrations: number;
  events: Event[];
}

export interface EventStatistics {
  eventId: number;
  eventName: string;
  totalRegistrations: number;
  capacity: number | null;
  availableSpots: number | null;
  registrations: EventRegistration[];
}

export const organizerApi = {
  // Get organizer dashboard
  getDashboard: () =>
    api.get<OrganizerDashboard>('/organizer/dashboard'),

  // Get all events by current organizer
  getMyEvents: () =>
    api.get<Event[]>('/organizer/events'),

  // Get event statistics
  getEventStatistics: (eventId: number) =>
    api.get<EventStatistics>(`/organizer/events/${eventId}/statistics`),

  // Create new event (organizer only) - with venue embedded
  createEvent: (eventData: CreateEventPayload) =>
    api.post<Event>('/organizer/events/with-venue', eventData),

  // Update event (organizer only)
  updateEvent: (eventId: number, eventData: Partial<CreateEventPayload>) =>
    api.put<Event>(`/organizer/events/${eventId}`, eventData),

  // Delete event (organizer only)
  deleteEvent: (eventId: number) =>
    api.delete(`/organizer/events/${eventId}`),
};

export default api;
