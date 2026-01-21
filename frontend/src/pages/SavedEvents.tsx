import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { EventCard } from '../components/EventCard';
import { savedEventsApi, getErrorMessage, type Event } from '../services/api';

export const SavedEvents: React.FC = () => {
  const navigate = useNavigate();
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await savedEventsApi.getMySavedEvents();
        setSavedEvents(response.data || []);
      } catch (err) {
        setError(getErrorMessage(err));
        setSavedEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSaved();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Heart className="w-10 h-10 text-red-500 fill-red-500" />
              Uložené Eventy
            </h1>
            <p className="text-gray-600">
              Eventy, ktoré ťa zaujali a chceš ich mať po ruke
            </p>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Načítavam uložené eventy...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-700">
              Nepodarilo sa načítať uložené eventy: {error}
            </div>
          )}

          {!isLoading && !error && savedEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={(event) => navigate(`/event/${event.id}`)}
                />
              ))}
            </div>
          )}

          {!isLoading && !error && savedEvents.length === 0 && (
            <div className="min-h-[500px] flex flex-col items-center justify-center text-center py-20 px-8 bg-white rounded-lg shadow-sm border border-gray-100">
              <Heart className="w-24 h-24 text-gray-300 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Zatiaľ nemáš žiadne uložené eventy
              </h2>
              <p className="text-gray-600 mb-8 max-w-md">
                Keď nájdeš event, ktorý ťa zaujme, môžeš si ho uložiť kliknutím na ikonku srdca.
              </p>
              <button
                onClick={() => navigate('/events')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Preskúmať eventy
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 text-center py-6 mt-12">
        <p className="text-sm">&copy; 2025 BitEvents. Všetky práva vyhradené.</p>
      </footer>
    </div>
  );
};
