// src/hooks/useEvents.ts
import { useState, useEffect } from 'react';
import { apiRequest, API_ENDPOINTS, ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: number;
  name: string;
  client_id: number;
  event_type: string;
  date: string; // ISO date string
  start_time: string; // ISO datetime string
  end_time: string; // ISO datetime string
  venue: string;
  guests_count: number;
  budget: number;
  status: 'planning' | 'confirmed' | 'in_preparation' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EventFormData {
  name: string;
  client_id: number;
  event_type: string;
  date: string; // ISO date string
  start_time: string; // ISO datetime string
  end_time: string; // ISO datetime string
  venue: string;
  guests_count: number;
  budget: number;
  notes?: string;
}

export interface EventUpdateData extends Partial<EventFormData> {
  status?: Event['status'];
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEvents = async (filters?: {
    skip?: number;
    limit?: number;
    status_filter?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams();
      if (filters?.skip) searchParams.set('skip', filters.skip.toString());
      if (filters?.limit) searchParams.set('limit', filters.limit.toString());
      if (filters?.status_filter) searchParams.set('status_filter', filters.status_filter);
      
      const url = `${API_ENDPOINTS.events.list()}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      const data = await apiRequest<Event[]>(url);
      
      setEvents(data);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error fetching events';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: EventFormData): Promise<Event | null> => {
    setLoading(true);
    
    try {
      const newEvent = await apiRequest<Event>(API_ENDPOINTS.events.create(), {
        method: 'POST',
        body: JSON.stringify(eventData),
      });
      
      setEvents(prev => [...prev, newEvent]);
      
      toast({
        title: 'Éxito',
        description: 'Evento creado exitosamente',
      });
      
      return newEvent;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error creating event';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (id: number, eventData: EventUpdateData): Promise<Event | null> => {
    setLoading(true);
    
    try {
      const updatedEvent = await apiRequest<Event>(API_ENDPOINTS.events.update(id), {
        method: 'PUT',
        body: JSON.stringify(eventData),
      });
      
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ));
      
      toast({
        title: 'Éxito',
        description: 'Evento actualizado exitosamente',
      });
      
      return updatedEvent;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error updating event';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: number): Promise<boolean> => {
    setLoading(true);
    
    try {
      await apiRequest(API_ENDPOINTS.events.delete(id), {
        method: 'DELETE',
      });
      
      setEvents(prev => prev.filter(event => event.id !== id));
      
      toast({
        title: 'Éxito',
        description: 'Evento eliminado exitosamente',
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error deleting event';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getEvent = async (id: number): Promise<Event | null> => {
    setLoading(true);
    
    try {
      const event = await apiRequest<Event>(API_ENDPOINTS.events.get(id));
      return event;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error fetching event';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (id: number) => {
    try {
      const availability = await apiRequest(API_ENDPOINTS.events.availability(id));
      return availability;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error checking availability';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    checkAvailability,
  };
}