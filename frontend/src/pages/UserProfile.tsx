import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Ticket, Calendar, QrCode, Settings, Plus, Trash, Search, MoreVertical, Edit2, X } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { EventCard } from '../components/EventCard';
import { useAuth } from '../context/useAuth';
import { useEvents } from '../hooks/useEvents';
import { savedEventsApi, registrationApi, userApi, fileApi, organizerApi, getErrorMessage, type EventRegistration, type UpdateProfileDto, type ChangePasswordDto, type Event, type CreateEventPayload } from '../services/api';

type ActiveTab = 'overview' | 'tickets' | 'organizer' | 'settings';
const ALLOWED_TABS_SET = new Set<ActiveTab>(['overview', 'tickets', 'organizer', 'settings']);

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { events = [], isLoading } = useEvents();
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const tab = searchParams.get('tab');
    return tab && ALLOWED_TABS_SET.has(tab as ActiveTab) ? (tab as ActiveTab) : 'overview';
  });
  const [registeredEvents, setRegisteredEvents] = useState<EventRegistration[]>([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [isLoadingSavedEvents, setIsLoadingSavedEvents] = useState(false);
  const [savedEventsError, setSavedEventsError] = useState<string | null>(null);
  
  // Organizer state
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [isLoadingOrganizerEvents, setIsLoadingOrganizerEvents] = useState(false);
  const [organizerEventsError, setOrganizerEventsError] = useState<string | null>(null);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState<CreateEventPayload>({
    name: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    type: 'CONFERENCE',
    capacity: 0,
    price: 0,
    status: 'DRAFT',
    venue: {
      name: '',
      city: '',
      address: ''
    }
  });
  
  // Profile edit state (removed isEditingProfile)
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
  
  // Delete account state
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const fetchSavedEvents = async () => {
      try {
        setIsLoadingSavedEvents(true);
        setSavedEventsError(null);
        const response = await savedEventsApi.getMySavedEvents();
        setSavedEvents(response.data || []);
      } catch (error) {
        setSavedEventsError(getErrorMessage(error));
        setSavedEvents([]);
      } finally {
        setIsLoadingSavedEvents(false);
      }
    };

    if (user) {
      fetchSavedEvents();
    }
  }, [user]);

  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      try {
        setIsLoadingOrganizerEvents(true);
        setOrganizerEventsError(null);
        const response = await organizerApi.getMyEvents();
        setOrganizerEvents(response.data || []);
      } catch (error) {
        setOrganizerEventsError(getErrorMessage(error));
        setOrganizerEvents([]);
      } finally {
        setIsLoadingOrganizerEvents(false);
      }
    };

    if (user?.isOrganizer) {
      fetchOrganizerEvents();
    }
  }, [user?.isOrganizer]);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        profilePicture: user.profilePicture || ''
      });
    }
  }, [user]);

  // Sync activeTab with URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ALLOWED_TABS_SET.has(tab as ActiveTab)) {
      setActiveTab(tab as ActiveTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      await userApi.updateProfile(profileData);
      // Update successful - data was saved
      setProfileSuccess('Profil bol úspešne aktualizovaný');
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

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    
    try {
      await userApi.deleteAccount();
      // Clear auth and redirect
      logout();
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nepodarilo sa vymazať účet';
      setProfileError(errorMessage);
      setShowDeleteConfirmation(false);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setProfileError('Prosím, nahrajte obrázok');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Obrázok je príliš veľký. Maximálna veľkosť je 5MB');
      return;
    }

    setIsUploadingImage(true);
    setProfileError(null);

    try {
      // Upload image
      const response = await fileApi.uploadProfileImage(file);
      
      // Update profile data with the file download URI
      setProfileData({ ...profileData, profilePicture: response.data.fileDownloadUri });
      
      // Set preview
      setImagePreview(response.data.fileDownloadUri);
      
      setProfileSuccess('Obrázok bol úspešne nahraný');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nepodarilo sa nahrať obrázok';
      setProfileError(errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingEvent(true);
    setCreateEventError(null);

    try {
      await organizerApi.createEvent(eventFormData);
      // Refresh events list
      const response = await organizerApi.getMyEvents();
      setOrganizerEvents(response.data || []);
      // Close modal and reset form
      setShowCreateEventModal(false);
      setEventFormData({
        name: '',
        description: '',
        startDateTime: '',
        endDateTime: '',
        type: 'CONFERENCE',
        capacity: 0,
        price: 0,
        status: 'DRAFT',
        venue: {
          name: '',
          city: '',
          address: ''
        }
      });
    } catch (error) {
      setCreateEventError(getErrorMessage(error));
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const upcomingEventsCount = registeredEvents.length;
  const savedEventsCount = savedEvents.length;
  const recommendedEvents = events.slice(0, 3);

  const menuItems = [
    { id: 'overview' as ActiveTab, label: 'Prehľad', icon: User },
    { id: 'tickets' as ActiveTab, label: 'Moje Vstupenky', icon: Ticket },
    ...(user?.isOrganizer ? [{ id: 'organizer' as ActiveTab, label: 'Organizátor', icon: Calendar }] : []),
    { id: 'settings' as ActiveTab, label: 'Nastavenia', icon: Settings },
  ];

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
                  {/* Clickable avatar with hover overlay */}
                  <button
                    type="button"
                    className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer border-0 p-0 bg-transparent"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Nahrať profilový obrázok"
                  >
                    {(imagePreview || user?.profilePicture) ? (
                      <img
                        src={imagePreview || user?.profilePicture || ''}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-4xl font-bold">
                        {user?.fullName?.charAt(0) || 'U'}
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus className="w-12 h-12 text-white" />
                    </div>
                    {isUploadingImage && (
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-70 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </button>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {user?.fullName || 'Ján Novák'}
                  </h2>

                  <button
                    onClick={() => handleTabChange('settings')}
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
                        onClick={() => handleTabChange(item.id)}
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
                  {/* Welcome Stats */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Vitaj späť! 👋</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

                  {/* Saved (favorite) events */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Obľúbené eventy</h2>
                    {isLoadingSavedEvents && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    )}

                    {savedEventsError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-700">
                        Nepodarilo sa načítať obľúbené eventy: {savedEventsError}
                      </div>
                    )}

                    {!isLoadingSavedEvents && !savedEventsError && savedEvents.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onClick={() => navigate(`/event/${event.id}`)}
                          />
                        ))}
                      </div>
                    )}

                    {!isLoadingSavedEvents && !savedEventsError && savedEvents.length === 0 && (
                      <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-600">
                        Zatiaľ nemáte žiadne obľúbené eventy.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Nastavenia</h1>
                  
                  {/* Profile Edit Section */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Upraviť profil</h2>

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

                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="w-full bg-blue-600! text-white! px-6 py-3 rounded-lg font-semibold hover:bg-blue-700! transition disabled:opacity-50"
                      >
                        {isSavingProfile ? 'Ukladám...' : 'Uložiť zmeny'}
                      </button>
                    </form>
                  </div>

                  {/* Password Change Section */}
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

                  {/* Delete Account Section */}
                  <div id="danger-zone" className="bg-white rounded-lg shadow-sm p-6 border-2 border-red-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h2 className="text-2xl font-bold text-red-600">Nebezpečná zóna</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Vymazanie účtu je trvalé a nemožno ho vrátiť späť. Všetky vaše dáta budú permanentne odstránené.
                    </p>
                    <button
                        onClick={() => setShowDeleteConfirmation(true)}
                        className="inline-flex items-center justify-center gap-2 bg-red-600! text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                        <Trash className="w-4 h-4" /> Vymazať účet
                    </button>
                    {showDeleteConfirmation && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
                        <p className="text-red-800 font-semibold">
                          Ste si istí, že chcete vymazať váš účet? Táto akcia je nevratná!
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={isDeletingAccount}
                            className="flex-1 bg-red-600! text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {isDeletingAccount ? 'Vymazávam...' : 'Áno, vymazať účet'}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirmation(false)}
                            disabled={isDeletingAccount}
                            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                          >
                            Zrušiť
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'organizer' && user?.isOrganizer && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Prehľad mojich eventov</h1>
                    
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Hľadať eventy..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                        <option>Stav: Všetky</option>
                        <option>Aktívny</option>
                        <option>Koncept</option>
                        <option>Ukončený</option>
                      </select>
                      <button 
                        onClick={() => setShowCreateEventModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Vytvoriť Event</span>
                      </button>
                    </div>

                    {/* Events List */}
                    {isLoadingOrganizerEvents && (
                      <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">Načítavam vaše eventy...</p>
                      </div>
                    )}

                    {organizerEventsError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                        <p className="text-red-600 mb-4">Nepodarilo sa načítať vaše eventy: {organizerEventsError}</p>
                        <button
                          onClick={() => {
                            setIsLoadingOrganizerEvents(true);
                            organizerApi.getMyEvents().then(response => {
                              setOrganizerEvents(response.data || []);
                              setOrganizerEventsError(null);
                            }).catch(error => {
                              setOrganizerEventsError(getErrorMessage(error));
                            }).finally(() => {
                              setIsLoadingOrganizerEvents(false);
                            });
                          }}
                          className="bg-red-600! text-white! px-6 py-3 rounded-lg font-semibold hover:bg-red-700! transition"
                        >
                          Skúsiť znova
                        </button>
                      </div>
                    )}

                    {!isLoadingOrganizerEvents && !organizerEventsError && organizerEvents.length === 0 && (
                      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4 text-lg">Zatiaľ nemáte žiadne eventy</p>
                        <p className="text-gray-500 mb-6">Začnite vytváraním nového eventu</p>
                        <button
                          onClick={() => setShowCreateEventModal(true)}
                          className="bg-blue-600! text-white! px-8 py-3 rounded-lg font-semibold hover:bg-blue-700! transition"
                        >
                          <Plus className="inline-block w-5 h-5 mr-2" />
                          Vytvoriť Event
                        </button>
                      </div>
                    )}

                    {!isLoadingOrganizerEvents && !organizerEventsError && organizerEvents.length > 0 && (
                      <div className="space-y-4">
                        {organizerEvents.map((event) => {
                          const eventDate = new Date(event.startDateTime);
                          const statusMap: Record<string, { label: string; color: string }> = {
                            'ACTIVE': { label: 'Aktívny', color: 'bg-green-100 text-green-800' },
                            'DRAFT': { label: 'Koncept', color: 'bg-yellow-100 text-yellow-800' },
                            'ENDED': { label: 'Ukončený', color: 'bg-gray-100 text-gray-800' },
                          };
                          const status = statusMap[event.status] || { label: event.status, color: 'bg-gray-100 text-gray-800' };
                          
                          return (
                            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                              <div className="flex flex-col sm:flex-row items-stretch">
                                {/* Event Image */}
                                {event.imageUrl && (
                                  <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-gray-200 overflow-hidden">
                                    <img
                                      src={event.imageUrl}
                                      alt={event.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}

                                {/* Event Info */}
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-start justify-between mb-3 gap-4">
                                      <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                          {event.name}
                                        </h3>
                                        <p className="text-gray-600 flex items-center gap-2">
                                          <Calendar className="w-4 h-4" />
                                          {eventDate.toLocaleDateString('sk-SK', { 
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                          })} um {eventDate.toLocaleTimeString('sk-SK', { 
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </div>
                                      <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${status.color}`}>
                                        {status.label}
                                      </span>
                                    </div>

                                    {/* KPI Stats */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">0</div>
                                        <div className="text-sm text-gray-600">Predané</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">0 €</div>
                                        <div className="text-sm text-gray-600">Tržby</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">0</div>
                                        <div className="text-sm text-gray-600">Kapacita</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col items-stretch border-t sm:border-t-0 sm:border-l border-gray-200 p-6 gap-3 min-w-[150px] justify-center">
                                  <button 
                                    className="flex items-center justify-center gap-2 bg-blue-600! text-white! px-4 py-3 rounded-lg font-semibold hover:bg-blue-700! transition"
                                  >
                                    <Edit2 className="w-5 h-5" />
                                    <span className="text-sm">Upraviť</span>
                                  </button>
                                  <button 
                                    className="flex items-center justify-center bg-gray-100! text-gray-700! px-4 py-3 rounded-lg font-semibold hover:bg-gray-200! transition"
                                  >
                                    <MoreVertical className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Create Event Modal */}
                  {showCreateEventModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                          <h2 className="text-2xl font-bold text-gray-900">Vytvoriť nový event</h2>
                          <button
                            onClick={() => {
                              setShowCreateEventModal(false);
                              setCreateEventError(null);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>

                        <form onSubmit={handleCreateEvent} className="p-6 space-y-6">
                          {createEventError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                              {createEventError}
                            </div>
                          )}

                          {/* Basic Info */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Základné informácie</h3>
                            
                            <div>
                              <label htmlFor="eventName" className="block text-sm font-semibold text-gray-700 mb-2">
                                Názov eventu *
                              </label>
                              <input
                                id="eventName"
                                type="text"
                                value={eventFormData.name}
                                onChange={(e) => setEventFormData({ ...eventFormData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>

                            <div>
                              <label htmlFor="eventDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                                Popis eventu *
                              </label>
                              <textarea
                                id="eventDescription"
                                value={eventFormData.description}
                                onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="eventType" className="block text-sm font-semibold text-gray-700 mb-2">
                                  Typ eventu *
                                </label>
                                <select
                                  id="eventType"
                                  value={eventFormData.type}
                                  onChange={(e) => setEventFormData({ ...eventFormData, type: e.target.value })}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                >
                                  <option value="CONFERENCE">Konferencia</option>
                                  <option value="WORKSHOP">Workshop</option>
                                  <option value="CONCERT">Koncert</option>
                                  <option value="SPORTS">Šport</option>
                                  <option value="EXHIBITION">Výstava</option>
                                  <option value="OTHER">Iné</option>
                                </select>
                              </div>

                              <div>
                                <label htmlFor="eventStatus" className="block text-sm font-semibold text-gray-700 mb-2">
                                  Stav *
                                </label>
                                <select
                                  id="eventStatus"
                                  value={eventFormData.status}
                                  onChange={(e) => setEventFormData({ ...eventFormData, status: e.target.value })}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                >
                                  <option value="DRAFT">Koncept</option>
                                  <option value="ACTIVE">Aktívny</option>
                                  <option value="ENDED">Ukončený</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Date and Time */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Dátum a čas</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="startDateTime" className="block text-sm font-semibold text-gray-700 mb-2">
                                  Začiatok *
                                </label>
                                <input
                                  id="startDateTime"
                                  type="datetime-local"
                                  value={eventFormData.startDateTime}
                                  onChange={(e) => setEventFormData({ ...eventFormData, startDateTime: e.target.value })}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                              </div>

                              <div>
                                <label htmlFor="endDateTime" className="block text-sm font-semibold text-gray-700 mb-2">
                                  Koniec *
                                </label>
                                <input
                                  id="endDateTime"
                                  type="datetime-local"
                                  value={eventFormData.endDateTime}
                                  onChange={(e) => setEventFormData({ ...eventFormData, endDateTime: e.target.value })}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* Venue Info */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Miesto konania</h3>
                            
                            <div>
                              <label htmlFor="venueName" className="block text-sm font-semibold text-gray-700 mb-2">
                                Názov miesta *
                              </label>
                              <input
                                id="venueName"
                                type="text"
                                value={eventFormData.venue.name}
                                onChange={(e) => setEventFormData({ 
                                  ...eventFormData, 
                                  venue: { ...eventFormData.venue, name: e.target.value }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="venueCity" className="block text-sm font-semibold text-gray-700 mb-2">
                                  Mesto *
                                </label>
                                <input
                                  id="venueCity"
                                  type="text"
                                  value={eventFormData.venue.city}
                                  onChange={(e) => setEventFormData({ 
                                    ...eventFormData, 
                                    venue: { ...eventFormData.venue, city: e.target.value }
                                  })}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                              </div>

                              <div>
                                <label htmlFor="venueAddress" className="block text-sm font-semibold text-gray-700 mb-2">
                                  Adresa *
                                </label>
                                <input
                                  id="venueAddress"
                                  type="text"
                                  value={eventFormData.venue.address}
                                  onChange={(e) => setEventFormData({ 
                                    ...eventFormData, 
                                    venue: { ...eventFormData.venue, address: e.target.value }
                                  })}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* Pricing and Capacity */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Kapacita a cena</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="capacity" className="block text-sm font-semibold text-gray-700 mb-2">
                                  Kapacita *
                                </label>
                                <input
                                  id="capacity"
                                  type="number"
                                  min="0"
                                  value={eventFormData.capacity}
                                  onChange={(e) => setEventFormData({ ...eventFormData, capacity: Number.parseInt(e.target.value) || 0 })}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                              </div>

                              <div>
                                <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                                  Cena (€) *
                                </label>
                                <input
                                  id="price"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={eventFormData.price}
                                  onChange={(e) => setEventFormData({ ...eventFormData, price: Number.parseFloat(e.target.value) || 0 })}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-4 pt-4 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={() => {
                                setShowCreateEventModal(false);
                                setCreateEventError(null);
                              }}
                              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                              disabled={isCreatingEvent}
                            >
                              Zrušiť
                            </button>
                            <button
                              type="submit"
                              disabled={isCreatingEvent}
                              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                            >
                              {isCreatingEvent ? 'Vytváram...' : 'Vytvoriť event'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab !== 'overview' && activeTab !== 'tickets' && activeTab !== 'settings' && activeTab !== 'organizer' && (
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