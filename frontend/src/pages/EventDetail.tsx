import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, Tag, User, ChevronRight, Loader2 } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { eventsApi, type Event, getErrorMessage } from '../services/api';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const response = await eventsApi.getById(Number(id));
        setEvent(response.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('sk-SK', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRegister = () => {
    setIsRegistering(true);
    // Registrácia na event - buďe implementovaná s backend API
    setTimeout(() => {
      setIsRegistering(false);
      alert('Registrácia úspešná!');
    }, 1500);
  };

  const openGoogleMaps = () => {
    if (event?.venue?.googleMapsUrl) {
      window.open(event.venue.googleMapsUrl, '_blank');
    } else if (event?.venue?.address) {
      const query = encodeURIComponent(`${event.venue.name}, ${event.venue.address}, ${event.venue.city}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Načítavam event...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event sa nenašiel</h2>
            <p className="text-gray-600 mb-6">{error || 'Tento event neexistuje alebo bol odstránený.'}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Späť na domovskú stránku
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string): { bg: string; text: string } => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      'Development': { bg: 'bg-blue-100', text: 'text-blue-700' },
      'Security': { bg: 'bg-red-100', text: 'text-red-700' },
      'AI & Data': { bg: 'bg-purple-100', text: 'text-purple-700' },
      'DevOps': { bg: 'bg-green-100', text: 'text-green-700' },
      'Infrastructure': { bg: 'bg-orange-100', text: 'text-orange-700' },
      'Design': { bg: 'bg-pink-100', text: 'text-pink-700' },
      'Mobile': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
      'Technológie': { bg: 'bg-blue-100', text: 'text-blue-700' },
      'Vzdelávanie': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      'KONFERENCIA': { bg: 'bg-gray-100', text: 'text-gray-700' },
    };
    return colorMap[category] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  };

  const colorClass = getCategoryColor(event.type);

  // Mock galéria obrázkov
  const galleryImages = [
    event.imageUrl || 'https://via.placeholder.com/400x300',
    'https://via.placeholder.com/400x300',
    'https://via.placeholder.com/400x300',
    'https://via.placeholder.com/400x300',
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition">
              Domov
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/" className="hover:text-blue-600 transition">
              Eventy
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate">{event.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-[1440px] mx-auto">
          {/* Hero Section */}
          <div className="mb-8">
            <span className={`${colorClass.bg} ${colorClass.text} px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide inline-block mb-4`}>
              {event.type || 'Event'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">{event.name}</h1>
            <p className="text-lg text-gray-600">Najväčšia rocková udalosť roka v Bratislave.</p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Image */}
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src={event.imageUrl || 'https://via.placeholder.com/800x400'}
                  alt={event.name}
                  className="w-full h-[400px] object-cover"
                />
              </div>

              {/* O evente */}
              <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">O evente</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {event.description}
                  </p>
                  
                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Agenda</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Otvorte si pomyselné dvere do sveta rockových rytmov a nechajte sa uniesť energiou 
                    koncertov najväčších hviezd. Čaká vás nezabudnuteľný zážitok plný hudby, svetiel a 
                    famóznej atmosféry.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Čo sa naučíte</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Pre koho je určený: Milovníkov rockovej hudby, fanúšikov live koncertov a všetkých, 
                    ktorí si chcú vychutnať nezabudnuteľný večer plný kvalitatého entertainmentu.
                  </p>
                </div>
              </div>

              {/* Organizátor */}
              <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Organizátor</h2>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{event.organizer.fullName}</h3>
                    <p className="text-gray-600 mb-3">{event.organizer.email}</p>
                    <p className="text-gray-700 leading-relaxed">
                      Líder v organizácii hudobných podujatí s dlhoročnými skúsenosťami.
                    </p>
                  </div>
                </div>
              </div>

              {/* Galéria */}
              <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Galéria</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {galleryImages.map((img, index) => (
                    <div key={`gallery-${img}-${index}`} className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer">
                      <img
                        src={img}
                        alt={`Galéria ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sticky Sidebar (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Info Card */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Kedy:</h3>
                  <div className="flex items-start gap-3 mb-6">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-900 font-medium">{formatDate(event.startDateTime)}</p>
                      <p className="text-gray-600 text-sm">
                        {formatTime(event.startDateTime)} – {formatTime(event.endDateTime)}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-4">Kde:</h3>
                  <div className="flex items-start gap-3 mb-6">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-900 font-medium">{event.venue.name}</p>
                      <p className="text-gray-600 text-sm">{event.venue.address}</p>
                      <p className="text-gray-600 text-sm">{event.venue.city}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-4">Vstupné:</h3>
                  <div className="flex items-center gap-3 mb-6">
                    <Tag className="w-5 h-5 text-blue-600 shrink-0" />
                    <p className="text-2xl font-bold text-blue-600">{event.price} €</p>
                  </div>

                  <button
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Registrujem...</span>
                      </>
                    ) : (
                      <span>REGISTROVAŤ SA NA EVENT</span>
                    )}
                  </button>
                </div>

                {/* Google Maps */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-64 bg-gray-200 relative">
                    <iframe
                      title="Mapa eventu"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(
                        `${event.venue.name}, ${event.venue.city}`
                      )}`}
                      allowFullScreen
                    />
                    {/* Fallback - statická mapa */}
                    <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-blue-100 to-blue-200">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-700 font-medium">{event.venue.name}</p>
                        <p className="text-xs text-gray-600">{event.venue.city}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <button
                      onClick={openGoogleMaps}
                      className="w-full bg-gray-100 text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Navigovať</span>
                    </button>
                  </div>
                </div>

                {/* Interaktívna Info Box */}
                <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <h4 className="font-bold text-green-900 mb-2">Interaktívna Tabačka Kulturfabrik</h4>
                  <p className="text-sm text-green-800">Gorkého Košice</p>
                  <button 
                    onClick={openGoogleMaps}
                    className="mt-3 text-sm font-semibold text-green-700 hover:text-green-900 flex items-center gap-1"
                  >
                    Zobraziť na mape <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 mt-12">
        <p className="text-sm">&copy; 2025 BitEvents. Všetky práva vyhradené.</p>
      </footer>
    </div>
  );
};
