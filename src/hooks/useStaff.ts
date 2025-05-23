// src/hooks/useStaff.ts
import { useState, useEffect } from 'react';
import { apiRequest, API_ENDPOINTS, ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  specialty?: string;
  hourly_rate?: number;
  status: 'available' | 'busy' | 'on_event' | 'unavailable';
  rating: number;
  total_events: number;
  created_at: string;
}

export interface StaffFormData {
  name: string;
  email: string;
  phone?: string;
  role: string;
  specialty?: string;
  hourly_rate?: number;
}

export interface StaffUpdateData extends Partial<StaffFormData> {
  status?: StaffMember['status'];
}

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStaff = async (filters?: {
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
      
      const url = `${API_ENDPOINTS.staff.list()}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      const data = await apiRequest<StaffMember[]>(url);
      
      setStaff(data);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error fetching staff';
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

  const createStaffMember = async (staffData: StaffFormData): Promise<StaffMember | null> => {
    setLoading(true);
    
    try {
      const newStaff = await apiRequest<StaffMember>(API_ENDPOINTS.staff.create(), {
        method: 'POST',
        body: JSON.stringify(staffData),
      });
      
      setStaff(prev => [...prev, newStaff]);
      
      toast({
        title: 'Éxito',
        description: 'Miembro del personal creado exitosamente',
      });
      
      return newStaff;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error creating staff member';
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

  const updateStaffMember = async (id: number, staffData: StaffUpdateData): Promise<StaffMember | null> => {
    setLoading(true);
    
    try {
      const updatedStaff = await apiRequest<StaffMember>(API_ENDPOINTS.staff.update(id), {
        method: 'PUT',
        body: JSON.stringify(staffData),
      });
      
      setStaff(prev => prev.map(member => 
        member.id === id ? updatedStaff : member
      ));
      
      toast({
        title: 'Éxito',
        description: 'Miembro del personal actualizado exitosamente',
      });
      
      return updatedStaff;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error updating staff member';
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

  const updateStaffStatus = async (id: number, status: StaffMember['status']): Promise<boolean> => {
    setLoading(true);
    
    try {
      await apiRequest(`${API_ENDPOINTS.staff.updateStatus(id)}?status=${status}`, {
        method: 'PUT',
      });
      
      setStaff(prev => prev.map(member => 
        member.id === id ? { ...member, status } : member
      ));
      
      toast({
        title: 'Éxito',
        description: 'Estado del personal actualizado exitosamente',
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error updating staff status';
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

  const getStaffMember = async (id: number): Promise<StaffMember | null> => {
    setLoading(true);
    
    try {
      const staffMember = await apiRequest<StaffMember>(API_ENDPOINTS.staff.get(id));
      return staffMember;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error fetching staff member';
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

  // Fetch staff on mount
  useEffect(() => {
    fetchStaff();
  }, []);

  return {
    staff,
    loading,
    error,
    fetchStaff,
    createStaffMember,
    updateStaffMember,
    updateStaffStatus,
    getStaffMember,
  };
}