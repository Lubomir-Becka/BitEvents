import { createContext } from 'react';

export interface User {
  id: number;
  fullName: string;
  email: string;
  registrationDate: string;
  profilePicture: string | null;
  isOrganizer: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});
