import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../../components';
import { organizerApi, type Event, getErrorMessage } from '../../services/api';
import { Calendar, Users, TrendingUp, Plus } from 'lucide-react';

interface DashboardData {
  totalEvents: number;
  totalRegistrations: number;
  events: Event[];
}

export const OrganizerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await organizerApi.getDashboard();
        setDashboard(response.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Načítavam dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Organizátorský Dashboard</h1>
            <p className="mt-2 text-gray-600">Prehľad vašich eventov a štatistík</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Celkom Eventov</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{dashboard?.totalEvents || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Celkom Registrácií</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{dashboard?.totalRegistrations || 0}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Priemerná Účasť</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {dashboard?.totalEvents ? Math.round((dashboard.totalRegistrations / dashboard.totalEvents) * 10) / 10 : 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => navigate('/organizer/events/create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Vytvoriť Nový Event
            </button>
            <button
              onClick={() => navigate('/organizer/events')}
              className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition border border-gray-300"
            >
              Zobraziť Všetky Eventy
            </button>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Posledné Eventy</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {dashboard?.events && dashboard.events.length > 0 ? (
                dashboard.events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => navigate(`/organizer/events/${event.id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(event.startDateTime).toLocaleDateString('sk-SK', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <p>Zatiaľ nemáte žiadne eventy</p>
                  <button
                    onClick={() => navigate('/organizer/events/create')}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Vytvorte svoj prvý event
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
