import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">▶ BitEvents</Link>
          <div className="hidden md:flex gap-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition">Domov</Link>
            <Link to="/events" className="text-gray-700 hover:text-blue-600 font-medium transition">Eventy</Link>
            <Link to="/map" className="text-gray-700 hover:text-blue-600 font-medium transition">Mapa</Link>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => navigate('/create-event')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Pridať event
          </button>
          <div className="relative group">
            <button className="text-gray-700 font-medium hover:text-blue-600">
              {user?.fullName} ▼
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg hidden group-hover:block z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              >
                Odhlásiť sa
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
