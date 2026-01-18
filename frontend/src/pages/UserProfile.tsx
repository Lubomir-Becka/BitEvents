import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Ticket, Bell, Shield, Calendar, QrCode } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { EventCard } from '../components/EventCard';
import { useAuth } from '../context/useAuth';
import { useEvents } from '../hooks/useEvents';
import { registrationApi, userApi, type EventRegistration, type UpdateProfileDto, type ChangePasswordDto } from '../services/api';

type ActiveTab = 'overview' | 'tickets' | 'billing' | 'notifications' | 'security';

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events = [], isLoading } = useEvents();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [registeredEvents, setRegisteredEvents] = useState<EventRegistration[]>([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<UpdateProfileDto>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    profilePicture: user?.profilePicture || ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  
  // Password change state
  const [passwordData, setPasswordData] = useState<ChangePasswordDto>({
    currentPassword: '',
    newPassword: ''
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setIsLoadingRegistrations(true);
        setHasError(false);
        const response = await registrationApi.getMyRegistrations();
        // Ochrana ak response.data neexistuje
        setRegisteredEvents(response.data || []);
      } catch (error) {
        console.error('Failed to fetch registrations:', error);
        setHasError(true);
        setRegisteredEvents([]);
      } finally {
        setIsLoadingRegistrations(false);
      }
    };

    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        profilePicture: user.profilePicture || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      await userApi.updateProfile(profileData);
      // Update successful - data was saved
      setProfileSuccess('Profil bol úspešne aktualizovaný');
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nepodarilo sa aktualizovať profil';
      setProfileError(errorMessage);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Nové heslo musí mať aspoň 6 znakov');
      setIsSavingPassword(false);
      return;
    }

    try {
      await userApi.changePassword(passwordData);
      setPasswordSuccess('Heslo bolo úspešne zmenené');
      setPasswordData({ currentPassword: '', newPassword: '' });
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nepodarilo sa zmeniť heslo';
      setPasswordError(errorMessage);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const upcomingEventsCount = registeredEvents.length;
  const savedEventsCount = 5;
  const creditsCount = 150;
  const recommendedEvents = events.slice(0, 3);

  const menuItems = [
    { id: 'overview' as ActiveTab, label: 'Prehľad', icon: User },
    { id: 'tickets' as ActiveTab, label: 'Moje Vstupenky', icon: Ticket },
    { id: 'billing' as ActiveTab, label: 'Fakturačné údaje', icon: Ticket },
    { id: 'notifications' as ActiveTab, label: 'Notifikácie', icon: Bell },
    { id: 'security' as ActiveTab, label: 'Zabezpečenie', icon: Shield },
  ];

  const userTags = ['#Java', '#Security', '#AI'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <div className="text-center mb-6">
                  {/* OPRAVA: bg-gradient namiesto bg-linear */}
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-4xl font-bold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {user?.fullName || 'Ján Novák'}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Java Developer @ TechCorp
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {userTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('overview');
                      setIsEditingProfile(true);
                    }}
                    className="w-full px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                  >
                    Upraviť profil
                  </button>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Profile Edit Section */}
                  {isEditingProfile && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Upraviť profil</h2>
                        <button
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileError(null);
                            setProfileSuccess(null);
                            setProfileData({
                              fullName: user?.fullName || '',
                              email: user?.email || '',
                              profilePicture: user?.profilePicture || ''
                            });
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>

                      {profileSuccess && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                          {profileSuccess}
                        </div>
                      )}

                      {profileError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                          {profileError}
                        </div>
                      )}

                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div>
                          <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                            Celé meno
                          </label>
                          <input
                            id="fullName"
                            type="text"
                            value={profileData.fullName}
                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="profilePicture" className="block text-sm font-semibold text-gray-700 mb-2">
                            URL profilového obrázka
                          </label>
                          <input
                            id="profilePicture"
                            type="text"
                            value={profileData.profilePicture || ''}
                            onChange={(e) => setProfileData({ ...profileData, profilePicture: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/avatar.jpg"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={isSavingProfile}
                            className="flex-1 bg-blue-600! text-white! px-6 py-3 rounded-lg font-semibold hover:bg-blue-700! transition disabled:opacity-50"
                          >
                            {isSavingProfile ? 'Ukladám...' : 'Uložiť zmeny'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingProfile(false);
                              setProfileError(null);
                              setProfileData({
                                fullName: user?.fullName || '',
                                email: user?.email || '',
                                profilePicture: user?.profilePicture || ''
                              });
                            }}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                          >
                            Zrušiť
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Password Change Section */}
                  {isEditingProfile && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Zmeniť heslo</h2>

                      {passwordSuccess && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                          {passwordSuccess}
                        </div>
                      )}

                      {passwordError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                          {passwordError}
                        </div>
                      )}

                      <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                            Aktuálne heslo
                          </label>
                          <input
                            id="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                            Nové heslo
                          </label>
                          <input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            minLength={6}
                          />
                          <p className="text-sm text-gray-500 mt-1">Heslo musí mať aspoň 6 znakov</p>
                        </div>

                        <button
                          type="submit"
                          disabled={isSavingPassword}
                          className="w-full bg-blue-600! text-white! px-6 py-3 rounded-lg font-semibold hover:bg-blue-700! transition disabled:opacity-50"
                        >
                          {isSavingPassword ? 'Mením...' : 'Zmeniť heslo'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Welcome Stats */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Vitaj späť! 👋</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {upcomingEventsCount}
                        </div>
                        <div className="text-gray-600 font-medium">Nadchádzajúce eventy</div>
                      </div>
                      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {savedEventsCount}
                        </div>
                        <div className="text-gray-600 font-medium">Uložené</div>
                      </div>
                      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {creditsCount} b
                        </div>
                        <div className="text-gray-600 font-medium">Kredity</div>
                      </div>
                    </div>
                  </div>

                  {/* My Upcoming Events */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Moje najbližšie eventy
                    </h2>
                    {isLoadingRegistrations && (
                      <div className="text-center py-8">
                        <p className="text-gray-600">Načítavam...</p>
                      </div>
                    )}
                    
                    {hasError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                        <p className="text-red-600 mb-4">Nepodarilo sa načítať vaše registrácie</p>
                        <button
                          onClick={() => globalThis.location.reload()}
                          className="bg-red-600! text-white! px-6 py-3 rounded-lg font-semibold hover:bg-red-700! transition"
                        >
                          Skúsiť znova
                        </button>
                      </div>
                    )}
                    
                    {!isLoadingRegistrations && !hasError && registeredEvents.length === 0 && (
                      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <p className="text-gray-600 mb-4">Zatiaľ nie ste prihlásený na žiadne eventy</p>
                        <button
                          onClick={() => navigate('/events')}
                          className="bg-blue-600! text-white! px-6 py-3 rounded-lg font-semibold hover:bg-blue-700! transition"
                        >
                          Prehľadať eventy
                        </button>
                      </div>
                    )}
                    
                    {!isLoadingRegistrations && registeredEvents.length > 0 && (
                      <div className="space-y-4">
                        {registeredEvents.filter(reg => reg?.event?.startDateTime).map((registration) => {
                          const event = registration.event;
                          const eventDate = new Date(event.startDateTime);
                          return (
                          <button
                            key={registration.id}
                            onClick={() => navigate(`/event/${event.id}`)}
                            type="button"
                            className="w-full text-left bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                            aria-label={`Detaily eventu ${event.name}`}
                          >
                              <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
                                <div className="shrink-0 w-24 h-24 bg-blue-600! rounded-lg flex flex-col items-center justify-center text-white!">
                                  <div className="text-3xl font-bold">{eventDate.getDate()}</div>
                                  <div className="text-sm font-semibold">
                                    {eventDate.toLocaleDateString('sk-SK', { month: 'short' }).toUpperCase()}
                                  </div>
                                </div>

                                <div className="flex-1 text-center sm:text-left">
                                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {event.name}
                                  </h3>
                                  <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {event.venue?.city || 'Mesto neurčené'}
                                  </p>
                                </div>

                                <div className="flex flex-col gap-3 shrink-0">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/event/${event.id}`);
                                    }}
                                    className="flex items-center gap-2 bg-blue-600! text-white! px-6 py-3 rounded-lg font-semibold hover:bg-blue-700! transition"
                                  >
                                    <QrCode className="w-5 h-5" />
                                    Stiahnuť lístok
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/event/${event.id}`);
                                    }}
                                    className="flex items-center gap-2 bg-gray-100! text-gray-700! px-6 py-3 rounded-lg font-semibold hover:bg-gray-200! transition"
                                  >
                                    Detail eventu
                                  </button>
                                </div>
                              </div>

                              <div className="border-t-2 border-dashed border-gray-200"></div>
                              <div className="bg-gray-50 px-6 py-3 text-sm text-gray-600">
                                Lístok #{event.id} • {event.venue?.name || 'Miesto neurčené'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Recommended Events */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Odporúčané pre teba
                    </h2>
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
                        {recommendedEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onClick={(event) => navigate(`/event/${event.id}`)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'tickets' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Moje vstupenky</h1>
                    
                    {isLoadingRegistrations && (
                      <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">Načítavam vaše vstupenky...</p>
                      </div>
                    )}
                    
                    {hasError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                        <p className="text-red-600 mb-4">Nepodarilo sa načítať vaše vstupenky</p>
                        <button
                          onClick={() => globalThis.location.reload()}
                          className="bg-red-600! text-white! px-6 py-3 rounded-lg font-semibold hover:bg-red-700! transition"
                        >
                          Skúsiť znova
                        </button>
                      </div>
                    )}
                    
                    {!isLoadingRegistrations && !hasError && registeredEvents.length === 0 && (
                      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4 text-lg">Zatiaľ nemáte žiadne vstupenky</p>
                        <p className="text-gray-500 mb-6">Registrujte sa na eventy a získajte vstupenky</p>
                        <button
                          onClick={() => navigate('/events')}
                          className="bg-blue-600! text-white! px-8 py-3 rounded-lg font-semibold hover:bg-blue-700! transition"
                        >
                          Prehľadať eventy
                        </button>
                      </div>
                    )}
                    
                    {!isLoadingRegistrations && !hasError && registeredEvents.length > 0 && (
                      <>
                        {/* Upcoming Events Section */}
                        {registeredEvents.some(reg => reg?.event?.startDateTime && new Date(reg.event.startDateTime) >= new Date()) && (
                          <div className="space-y-4 mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nadchádzajüe eventy</h2>
                            {registeredEvents.filter(reg => reg?.event?.startDateTime && new Date(reg.event.startDateTime) >= new Date()).map((registration) => {
                              const event = registration.event;
                              const eventDate = new Date(event.startDateTime);
                              
                              return (
                                <div
                                  key={registration.id}
                                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                                >
                                  <div className="flex flex-col sm:flex-row items-stretch">
                                    {/* Left Side - Event Info */}
                                    <div className="flex-1 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                      {/* Date Box */}
                                      <div className="shrink-0 w-24 h-24 rounded-lg flex flex-col items-center justify-center text-white font-bold bg-blue-600!">
                                        <div className="text-3xl">{eventDate.getDate()}</div>
                                        <div className="text-sm font-semibold">
                                          {eventDate.toLocaleDateString('sk-SK', { month: 'short' }).toUpperCase()}
                                        </div>
                                      </div>

                                      {/* Event Details */}
                                      <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                          {event.name}
                                        </h3>
                                        <div className="space-y-1 text-sm text-gray-600">
                                          <p className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {eventDate.toLocaleDateString('sk-SK', { 
                                              weekday: 'long',
                                              year: 'numeric', 
                                              month: 'long', 
                                              day: 'numeric' 
                                            })}
                                          </p>
                                          <p className="flex items-center gap-2">
                                            <Ticket className="w-4 h-4" />
                                            Lístok #{event.id}
                                          </p>
                                          <p className="text-gray-500">
                                            {event.venue?.name || 'Miesto neurčené'} • {event.venue?.city || 'Mesto'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right Side - Actions */}
                                    <div className="flex flex-col items-stretch border-t sm:border-t-0 sm:border-l border-gray-200 p-6 gap-3 min-w-[180px]">
                                      <button 
                                        className="flex items-center justify-center gap-2 bg-blue-600! text-white! px-4 py-3 rounded-lg font-semibold hover:bg-blue-700! transition"
                                      >
                                        <QrCode className="w-5 h-5" />
                                        <span className="text-sm">QR kód</span>
                                      </button>
                                      <button 
                                        onClick={() => navigate(`/event/${event.id}`)}
                                        className="flex items-center justify-center gap-2 bg-gray-100! text-gray-700! px-4 py-3 rounded-lg font-semibold hover:bg-gray-200! transition"
                                      >
                                        <span className="text-sm">Detail</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Past Events Section */}
                        {registeredEvents.some(reg => reg?.event?.startDateTime && new Date(reg.event.startDateTime) < new Date()) && (
                          <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Minulé eventy</h2>
                            {registeredEvents.filter(reg => reg?.event?.startDateTime && new Date(reg.event.startDateTime) < new Date()).map((registration) => {
                              const event = registration.event;
                              const eventDate = new Date(event.startDateTime);
                              
                              return (
                                <div
                                  key={registration.id}
                                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow opacity-60"
                                >
                                  <div className="flex flex-col sm:flex-row items-stretch">
                                    {/* Left Side - Event Info */}
                                    <div className="flex-1 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                      {/* Date Box */}
                                      <div className="shrink-0 w-24 h-24 rounded-lg flex flex-col items-center justify-center text-white font-bold bg-gray-400!">
                                        <div className="text-3xl">{eventDate.getDate()}</div>
                                        <div className="text-sm font-semibold">
                                          {eventDate.toLocaleDateString('sk-SK', { month: 'short' }).toUpperCase()}
                                        </div>
                                      </div>

                                      {/* Event Details */}
                                      <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                          {event.name}
                                        </h3>
                                        <div className="space-y-1 text-sm text-gray-600">
                                          <p className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {eventDate.toLocaleDateString('sk-SK', { 
                                              weekday: 'long',
                                              year: 'numeric', 
                                              month: 'long', 
                                              day: 'numeric' 
                                            })}
                                          </p>
                                          <p className="flex items-center gap-2">
                                            <Ticket className="w-4 h-4" />
                                            Lístok #{event.id}
                                          </p>
                                          <p className="text-gray-500">
                                            {event.venue?.name || 'Miesto neurčené'} • {event.venue?.city || 'Mesto'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right Side - Actions */}
                                    <div className="flex flex-col items-stretch border-t sm:border-t-0 sm:border-l border-gray-200 p-6 gap-3 min-w-[180px]">
                                      <button 
                                        onClick={() => navigate(`/event/${event.id}`)}
                                        className="flex items-center justify-center gap-2 bg-gray-100! text-gray-700! px-4 py-3 rounded-lg font-semibold hover:bg-gray-200! transition"
                                      >
                                        <span className="text-sm">Detail</span>
                                      </button>
                                      <div className="text-center text-sm text-gray-500 py-2 font-medium">
                                        ✓ Skončené
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab !== 'overview' && activeTab !== 'tickets' && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {menuItems.find((item) => item.id === activeTab)?.label}
                  </h2>
                  <p className="text-gray-600">Táto sekcia bude čoskoro dostupná.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 text-center py-6 mt-12">
        <p className="text-sm">&copy; 2025 BitEvents. Všetky práva vyhradené.</p>
      </footer>
    </div>
  );
};