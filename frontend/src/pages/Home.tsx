import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Navigation } from '../components/Navigation';
import { SearchBar } from '../components/SearchBar';
import { Sidebar, type LocationFilters } from '../components/Sidebar';
import { EventCard } from '../components/EventCard';
import type { Event } from '../services/api';
import { useEvents } from '../hooks/useEvents';


export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<LocationFilters>({
    bratislava: true,
    kosice: true,
    online: false,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { events = [], isLoading, error, total, searchEvents, filterByLocations, loadMore } = useEvents();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchEvents(searchQuery);
    }
  };

  const toggleLocation = (location: keyof LocationFilters) => {
    setSelectedLocations((prev: LocationFilters) => ({
      ...prev,
      [location]: !prev[location],
    }));
    
    // Volaj filtrovanie po zmene
    const newLocations = {
      ...selectedLocations,
      [location]: !selectedLocations[location],
    };
    const activeLocations = Object.entries(newLocations)
      .filter(([, isActive]) => isActive)
      .map(([loc]) => loc);
    
    filterByLocations(activeLocations);
  };

  const resetFilters = () => {
    setSelectedLocations({
      bratislava: true,
      kosice: true,
      online: false,
    });
    setSearchQuery('');
    // Reset všetkých filtrov a načítaj znova eventy
    filterByLocations(['bratislava', 'kosice']);
    searchEvents('');
  };

  const handleEventClick = (event: Event) => {
    console.log('Event clicked:', event);
    // Tu v budúcnosti naviguj na detail eventu
    // navigate(`/event/${event.id}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
        <div className="text-center text-white max-w-md">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">BitEvents</h1>
          <p className="text-lg md:text-xl mb-8">Prihlás sa, aby si mohol pokračovať</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition w-full md:w-auto"
          >
            Prihlásiť sa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <div className="w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-16 px-4">
        <div className="max-w-[1440px] mx-auto text-center">
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSubmit={handleSearch}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grow w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Hidden on mobile, visible on desktop */}
          <aside className="hidden lg:block w-80 shrink-0">
            <Sidebar
              selectedLocations={selectedLocations}
              onToggleLocation={toggleLocation}
              onReset={resetFilters}
            />
          </aside>

          <div className="lg:hidden w-full">
            <details className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <summary className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                <span>Filtre</span>
                <span className="text-sm text-blue-600">▼</span>
              </summary>
              <div className="mt-4">
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
                <button
                  onClick={resetFilters}
                  className="mt-4 w-full text-blue-600 text-sm font-semibold hover:underline"
                >
                  Resetovať filtre
                </button>
              </div>
            </details>
          </div>

          {/* Events Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-8">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Nájdené eventy
                </h3>
                <p className="text-sm text-gray-500 mt-1">{total || 0} výsledkov</p>
              </div>
              <div className="flex gap-2 bg-white rounded-lg shadow-sm p-1 border border-gray-200">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded font-semibold text-sm transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="Grid view"
                  title="Mriežkový pohľad"
                >
                  ⊞ Mriežka
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded font-semibold text-sm transition-all ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="List view"
                  title="Zoznam"
                >
                  ☰ Zoznam
                </button>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-8 flex items-start gap-3">
                <span className="text-red-600 text-xl mt-0.5">⚠️</span>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Loading state */}
            {isLoading && events.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Načítavam eventy...</p>
              </div>
            )}

            {/* Events Grid/List */}
            {events && events.length > 0 && (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {events.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        onClick={handleEventClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                    {events.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        onClick={handleEventClick}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Empty state */}
            {!isLoading && events.length === 0 && (
              <div className="min-h-[500px] flex flex-col items-center justify-center text-center py-20 px-8 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="text-8xl mb-8 opacity-60 animate-bounce">🔍</div>
                <h4 className="text-gray-800 text-3xl font-bold mb-3">Nenašli sa žiadne eventy</h4>
                <p className="text-gray-500 text-base mb-10 max-w-md leading-relaxed">
                  Skús zmeniť filtre, odstrániť vyhľadávací výraz alebo resetovať všetky filtre.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={resetFilters}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full sm:w-auto"
                  >
                    Resetovať všetky filtre
                  </button>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition w-full sm:w-auto"
                  >
                    Vymazať vyhľadávanie
                  </button>
                </div>
              </div>
            )}

            {/* Load More */}
            {!isLoading && events.length > 0 && events.length < total && (
              <div className="text-center mt-8 sm:mt-12">
                <button 
                  onClick={loadMore}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {isLoading ? 'Načítavam...' : 'Načítať ďalšie eventy'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 mt-12">
        <p className="text-sm sm:text-base">&copy; 2025 BitEvents. Všetky práva vyhradené.</p>
      </footer>
    </div>
  );
};
