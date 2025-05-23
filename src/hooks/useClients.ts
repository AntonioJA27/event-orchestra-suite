// src/hooks/useClients.ts
import { useState, useEffect } from 'react';
import { apiRequest, API_ENDPOINTS, ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  is_corporate: boolean;
  created_at: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  is_corporate?: boolean;
}

export interface ClientUpdateData extends Partial<ClientFormData> {}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchClients = async (filters?: {
    skip?: number;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams();
      if (filters?.skip) searchParams.set('skip', filters.skip.toString());
      if (filters?.limit) searchParams.set('limit', filters.limit.toString());
      
      const url = `${API_ENDPOINTS.clients.list()}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      const data = await apiRequest<Client[]>(url);
      
      setClients(data);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error fetching clients';
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

  const createClient = async (clientData: ClientFormData): Promise<Client | null> => {
    setLoading(true);
    
    try {
      const newClient = await apiRequest<Client>(API_ENDPOINTS.clients.create(), {
        method: 'POST',
        body: JSON.stringify(clientData),
      });
      
      setClients(prev => [...prev, newClient]);
      
      toast({
        title: 'Éxito',
        description: 'Cliente creado exitosamente',
      });
      
      return newClient;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error creating client';
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

  const updateClient = async (id: number, clientData: ClientUpdateData): Promise<Client | null> => {
    setLoading(true);
    
    try {
      const updatedClient = await apiRequest<Client>(API_ENDPOINTS.clients.update(id), {
        method: 'PUT',
        body: JSON.stringify(clientData),
      });
      
      setClients(prev => prev.map(client => 
        client.id === id ? updatedClient : client
      ));
      
      toast({
        title: 'Éxito',
        description: 'Cliente actualizado exitosamente',
      });
      
      return updatedClient;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error updating client';
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

  const deleteClient = async (id: number): Promise<boolean> => {
    setLoading(true);
    
    try {
      await apiRequest(API_ENDPOINTS.clients.delete(id), {
        method: 'DELETE',
      });
      
      setClients(prev => prev.filter(client => client.id !== id));
      
      toast({
        title: 'Éxito',
        description: 'Cliente eliminado exitosamente',
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error deleting client';
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

  const getClient = async (id: number): Promise<Client | null> => {
    setLoading(true);
    
    try {
      const client = await apiRequest<Client>(API_ENDPOINTS.clients.get(id));
      return client;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error fetching client';
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

  // Helper functions
  const getCorporateClients = () => {
    return clients.filter(client => client.is_corporate);
  };

  const getIndividualClients = () => {
    return clients.filter(client => !client.is_corporate);
  };

  const searchClients = (query: string) => {
    if (!query) return clients;
    
    const lowercaseQuery = query.toLowerCase();
    return clients.filter(client => 
      client.name.toLowerCase().includes(lowercaseQuery) ||
      client.email.toLowerCase().includes(lowercaseQuery) ||
      (client.company && client.company.toLowerCase().includes(lowercaseQuery))
    );
  };

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    getClient,
    // Helper functions
    getCorporateClients,
    getIndividualClients,
    searchClients,
  };
}