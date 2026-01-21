import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Code, Shield, TrendingUp, Palette, Rocket } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { EventCard } from '../components/EventCard';
import { useEvents } from '../hooks/useEvents';


export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { events = [], isLoading } = useEvents();

  // Zobraziť len prvé 3 eventy
  const featuredEvents = events.slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    { icon: Code, label: 'Vývoj', value: 'development' },
    { icon: Shield, label: 'Security', value: 'security' },
    { icon: TrendingUp, label: 'Data', value: 'data' },
    { icon: Palette, label: 'Design', value: 'design' },
    { icon: Rocket, label: 'Startup', value: 'startup' },
  ];

  // Helper funkcia pre obrázky miest
  const getCityImage = (cityName: string): string => {
    if (cityName === 'Bratislava') {
      return 'https://images.unsplash.com/photo-1555084276-f8dea1ff8f6d?w=800&q=80';
    }
    if (cityName === 'Košice') {
      return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80';
  };

  // Vypočítaj populárne mestá z eventov zo servera
  const cityMap = new Map<string, number>();
  
  events.forEach(event => {
    if (event.venue?.city) {
      const city = event.venue.city;
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
    }
  });

  const popularCities = Array.from(cityMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      image: getCityImage(name),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 2); // Len prvé 2 mestá

  return (
    <div className="min-h-screen bg-white flex flex-col">
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

      {/* Categories Section */}
      <div className="w-full bg-white py-16 px-4">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Čo ťa zaujíma?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => navigate(`/events?search=${encodeURIComponent(category.label)}`)}
                  className="flex flex-col items-center justify-center p-8 rounded-xl bg-white border-2 border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                    {category.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="w-full bg-gray-50 py-16 px-4">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Najbližšie eventy</h2>
            <Link
              to="/events"
              className="text-blue-600 font-semibold hover:text-blue-700 transition flex items-center gap-2"
            >
              Zobražiť všetko <span>→</span>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={(event) => navigate(`/event/${event.id}`)}
                />
              ))}
            </div>
          )}

          {!isLoading && featuredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Žiadne eventy zatiaľ nie sú dostupné.</p>
            </div>
          )}
        </div>
      </div>

      {/* Popular Cities Section */}
      <div className="w-full bg-white py-16 px-4">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Populárne mestá
          </h2>
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          )}
          {!isLoading && popularCities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => navigate(`/events?city=${city.name.toLowerCase()}`)}
                  className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                >
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <h3 className="text-3xl font-bold mb-2">{city.name}</h3>
                    <p className="text-lg text-blue-200">{city.count} eventov</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {!isLoading && popularCities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Žiadne mestá k dispozícii.</p>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="w-full bg-gray-100 py-16 px-4">
        <div className="max-w-[1440px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nechceš, aby ti ušiel ďalší hackathon?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Prihlás sa k odberu a dostávaj novinky o eventoch priamo do emailu
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Email adresa"
              className="flex-1 px-6 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-[#1a3b8c]! text-white! px-8 py-4 rounded-lg font-semibold hover:bg-[#15306f]! transition shrink-0"
            >
              Odoberať novinky
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
            {/* Column 1 - Logo & Mission */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">▶</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">BitEvents</span>
              </div>
              <p className="text-gray-600">
                Spájame IT komunitu. Nájdi eventy, ktoré ťa posunú vpred.
              </p>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Quick links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-blue-600 transition">
                    Domov
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="text-gray-600 hover:text-blue-600 transition">
                    Eventy
                  </Link>
                </li>
                <li>
                  <Link to="/map" className="text-gray-600 hover:text-blue-600 transition">
                    Mapa
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Social */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Social icons</h3>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                  aria-label="Facebook"
                >
                  f
                </button>
                <button
                  type="button"
                  className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                  aria-label="Twitter"
                >
                  𝕏
                </button>
                <button
                  type="button"
                  className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                  aria-label="LinkedIn"
                >
                  in
                </button>
                <button
                  type="button"
                  className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                  aria-label="YouTube"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>Copyright © 2025 BitEvents</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
