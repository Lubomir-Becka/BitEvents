import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Ticket, Heart, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-gray-700 font-medium hover:text-blue-600 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline">{user?.fullName || 'Novák'}</span>
                <span className="text-xs">▼</span>
              </button>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                  {/* Header with Avatar and Info */}
                  <div className="px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg font-bold shrink-0">
                        {user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user?.fullName || 'Ján Novák'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email || 'jan.novak@gmail.com'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/profile?tab=overview');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
                    >
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">Môj Profil</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/profile?tab=tickets');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Ticket className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">Moje Vstupenky</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/saved-events');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Heart className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">Uložené Eventy</span>
                    </button>
                  </div>

                  {/* Organizer Section */}
                  {user?.isOrganizer && (
                    <>
                      <div className="border-t border-gray-100"></div>
                      <div className="py-2 bg-blue-50">
                        <div className="px-4 py-2">
                          <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                            Organizátor
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            navigate('/profile?tab=organizer');
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-100 transition"
                        >
                          <Ticket className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">Moje Eventy</span>
                        </button>
                      </div>
                    </>
                  )}

                  {/* Separator */}
                  <div className="border-t border-gray-100"></div>

                  {/* Settings */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/profile?tab=settings');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Settings className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">Nastavenia</span>
                    </button>
                  </div>

                  {/* Separator */}
                  <div className="border-t border-gray-100"></div>

                  {/* Logout */}
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Odhlásiť sa</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 font-semibold hover:text-blue-700 transition"
              >
                Prihlásiť sa
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Registrovať sa
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
