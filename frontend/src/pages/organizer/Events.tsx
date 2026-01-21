import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../../components';
import { organizerApi, type Event, getErrorMessage } from '../../services/api';
import { Plus, Edit, Trash2, Calendar, MapPin, Users } from 'lucide-react';

export const OrganizerEvents: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await organizerApi.getMyEvents();
      setEvents(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm('Naozaj chcete odstrániť tento event?')) {
      return;
    }

    try {
      await organizerApi.deleteEvent(eventId);
      setEvents(events.filter(e => e.id !== eventId));
    } catch (err) {
      alert('Chyba pri odstraňovaní eventu: ' + getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Moje Eventy</h1>
              <p className="mt-2 text-gray-600">Spravujte svoje eventy</p>
            </div>
            <button
              onClick={() => navigate('/organizer/events/create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Vytvoriť Event
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Events Grid */}
          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Zatiaľ nemáte žiadne eventy</h3>
              <p className="text-gray-600 mb-6">Začnite vytvorením svojho prvého eventu</p>
              <button
                onClick={() => navigate('/organizer/events/create')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Vytvoriť Prvý Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                  {/* Event Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Calendar className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-900">
                        {event.status}
                      </span>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.startDateTime).toLocaleDateString('sk-SK', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.venue.city}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        Kapacita: {event.capacity || 'Neobmedzená'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                        className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Upraviť
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Odstrániť
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
