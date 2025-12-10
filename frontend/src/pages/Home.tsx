import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState({
    bratislava: true,
    kosice: true,
    online: false,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Hľadám:', searchQuery);
  };

  const toggleLocation = (location: keyof typeof selectedLocations) => {
    setSelectedLocations((prev) => ({
      ...prev,
      [location]: !prev[location],
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">BitEvents</h1>
          <p className="text-xl mb-8">Prihlás sa, aby si mohol pokračovať</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Prihlásiť sa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-blue-600">▶ BitEvents</h1>
            <div className="hidden md:flex gap-6">
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Domov</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Eventy</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Mapa</a>
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

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold mb-4">
            Tvoj kompas v slovenskom <span className="text-blue-400">IT svete</span>
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl">
            Objavuj najlepšie konferencie, meetupy a hackatony v Bratislave, Košiciach a online.
            Buduj svoju kariéru a networkuj s ľuďmi v odvetví.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-4xl">
            <div className="flex-1 flex items-center bg-white rounded-lg px-4 py-3">
              <span className="text-gray-400 mr-3">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hľadať eventy (napr. Java, Security)..."
                className="flex-1 text-gray-900 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Hľadať ▶
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Sidebar - Filters */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Filtre</h3>
                <a href="#" className="text-blue-600 text-sm font-semibold hover:underline">
                  Resetovať
                </a>
              </div>

              {/* Location Filter */}
              <div className="mt-6">
                <h4 className="font-bold text-gray-900 mb-4">MIESTO</h4>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedLocations.bratislava}
                      onChange={() => toggleLocation('bratislava')}
                      className="w-4 h-4 text-blue-600 rounded accent-blue-600"
                    />
                    <span className="ml-3 text-gray-700 group-hover:text-blue-600">Bratislava</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedLocations.kosice}
                      onChange={() => toggleLocation('kosice')}
                      className="w-4 h-4 text-blue-600 rounded accent-blue-600"
                    />
                    <span className="ml-3 text-gray-700 group-hover:text-blue-600">Košice</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedLocations.online}
                      onChange={() => toggleLocation('online')}
                      className="w-4 h-4 text-blue-600 rounded accent-blue-600"
                    />
                    <span className="ml-3 text-gray-700 group-hover:text-blue-600">Online</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Nájdené eventy (7)</h3>
              <div className="flex gap-2 bg-white rounded-lg shadow-sm p-1">
                <button className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold">
                  ⊞
                </button>
                <button className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  ☰
                </button>
              </div>
            </div>

            {/* Events Grid - 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 1, title: 'Java Workshop', type: 'Development', color: 'blue' },
                { id: 2, title: 'Security Conference', type: 'Security', color: 'red' },
                { id: 3, title: 'AI & Data Summit', type: 'AI & Data', color: 'purple' },
                { id: 4, title: 'DevOps Meetup', type: 'DevOps', color: 'green' },
                { id: 5, title: 'Frontend Hackathon', type: 'Development', color: 'blue' },
                { id: 6, title: 'Cloud Talk', type: 'Infrastructure', color: 'orange' },
              ].map((event) => {
                const colors: Record<string, { bg: string; text: string }> = {
                  blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
                  red: { bg: 'bg-red-100', text: 'text-red-700' },
                  purple: { bg: 'bg-purple-100', text: 'text-purple-700' },
                  green: { bg: 'bg-green-100', text: 'text-green-700' },
                  orange: { bg: 'bg-orange-100', text: 'text-orange-700' },
                };
                const colorClass = colors[event.color] || colors.blue;

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <div className="h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <span className="text-gray-500 text-4xl">📅</span>
                    </div>
                    <div className="p-5">
                      <div className="flex gap-2 mb-3">
                        <span className={`${colorClass.bg} ${colorClass.text} px-3 py-1 rounded-full text-xs font-semibold`}>
                          {event.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h4>
                      <p className="text-gray-600 text-sm mb-1">📍 Bratislava</p>
                      <p className="text-gray-500 text-xs">Pred 2 dňami</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Načítať ďalšie eventy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 mt-12">
        <p>&copy; 2025 BitEvents. Všetky práva vyhradené.</p>
      </footer>
    </div>
  );
};
