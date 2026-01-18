import { useState, useCallback, useEffect } from 'react';
import { eventsApi, type Event, type EventFilters, getErrorMessage } from '../services/api';

export interface UseEventsReturn {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  searchEvents: (query: string) => void;
  filterByLocations: (locations: string[]) => void;
  loadMore: () => void;
  refetch: () => void;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<EventFilters>({ page: 1, limit: 12 });

  // Volaj API keď sa zmenia filtre
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await eventsApi.getAll(filters);
        
        // Server vracia buď pole priamo, alebo objekt s events poľom
        const eventsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.events || [];
        
        const totalCount = Array.isArray(response.data)
          ? response.data.length
          : response.data.total || 0;
        
        if (filters.page && filters.page > 1) {
          // Pri loadMore pridaj k existujúcim eventom
          setEvents(prev => [...prev, ...eventsData]);
        } else {
          // Inak nahraď všetky eventy
          setEvents(eventsData);
        }
        
        setTotal(totalCount);
        setCurrentPage(filters.page || 1);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        console.error('Error fetching events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [filters]);

  const searchEvents = useCallback((query: string) => {
    setFilters(prev => ({
      ...prev,
      search: query || undefined,
      page: 1,
    }));
  }, []);

  const filterByLocations = useCallback((locations: string[]) => {
    setFilters(prev => ({
      ...prev,
      city: locations.length > 0 ? locations : undefined,
      page: 1,
    }));
  }, []);

  const loadMore = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  }, []);

  const refetch = useCallback(() => {
    setFilters(prev => ({ ...prev }));
  }, []);

  return {
    events,
    isLoading,
    error,
    total,
    currentPage,
    searchEvents,
    filterByLocations,
    loadMore,
    refetch,
  };
}
