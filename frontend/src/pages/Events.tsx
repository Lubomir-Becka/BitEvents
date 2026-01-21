import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { Sidebar, type LocationFilters } from '../components/Sidebar';
import { EventCard } from '../components/EventCard';
import type { Event as ApiEvent } from '../services/api';
import { useEvents } from '../hooks/useEvents';


export const Events: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<LocationFilters>({
    bratislava: true,
    kosice: true,
    online: false,
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string>('');

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
    setSelectedCategories([]);
    setDateFilter('');
    setSearchQuery('');
    // Reset všetkých filtrov a načítaj znova eventy
    filterByLocations(['bratislava', 'kosice']);
    searchEvents('');
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleDateChange = (date: string) => {
    setDateFilter(date);
  };

  const handleEventClick = (event: ApiEvent) => {
    navigate(`/event/${event.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <div className="w-full bg-[#1a3b8c] py-24 px-4">
        <div className="max-w-[1440px] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Tvoj kompas v slovenskom IT svete
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Objavuj najlepšie konferencie, meetupy a hackatony v Bratislave, Košiciach a online...
          </p>

          {/* Floating Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="bg-white rounded-full shadow-2xl flex items-center px-6 py-4 hover:shadow-3xl transition-shadow">
              <Search className="w-6 h-6 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hľadať eventy (napr. Java, Security)..."
                className="flex-1 px-4 text-gray-900 placeholder-gray-400 focus:outline-none text-lg"
              />
              <button
                type="submit"
                className="bg-blue-600! text-white! px-8 py-3 rounded-full font-semibold hover:bg-blue-700! transition shrink-0"
              >
                Hľadať
              </button>
            </div>
          </form>
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
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              dateFilter={dateFilter}
              onDateChange={handleDateChange}
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

            {/* Events Grid */}
            {events && events.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onClick={handleEventClick}
                  />
                ))}
              </div>
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
