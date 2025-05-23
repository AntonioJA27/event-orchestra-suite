// src/hooks/useInventory.ts
import { useState, useEffect } from 'react';
import { apiRequest, API_ENDPOINTS, ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_cost?: number;
  location?: string;
  supplier?: string;
  last_restocked?: string;
  created_at: string;
}

export interface InventoryItemFormData {
  name: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_cost?: number;
  location?: string;
  supplier?: string;
}

export interface InventoryItemUpdateData extends Partial<InventoryItemFormData> {}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInventory = async (filters?: {
    skip?: number;
    limit?: number;
    category?: string;
    low_stock?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams();
      if (filters?.skip) searchParams.set('skip', filters.skip.toString());
      if (filters?.limit) searchParams.set('limit', filters.limit.toString());
      if (filters?.category) searchParams.set('category', filters.category);
      if (filters?.low_stock) searchParams.set('low_stock', 'true');
      
      const url = `${API_ENDPOINTS.inventory.list()}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      const data = await apiRequest<InventoryItem[]>(url);
      
      setInventory(data);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error fetching inventory';
      setError(errorMessage);
      
      // If API fails, use mock data for development
      console.warn('API call failed, using mock data:', errorMessage);
      setInventory(getMockInventoryData());
      
      toast({
        title: 'Warning',
        description: 'Using mock data - API connection failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createInventoryItem = async (itemData: InventoryItemFormData): Promise<InventoryItem | null> => {
    setLoading(true);
    
    try {
      const newItem = await apiRequest<InventoryItem>(API_ENDPOINTS.inventory.create(), {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
      
      setInventory(prev => [...prev, newItem]);
      
      toast({
        title: 'Éxito',
        description: 'Item de inventario creado exitosamente',
      });
      
      return newItem;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error creating inventory item';
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

  const updateInventoryItem = async (id: number, itemData: InventoryItemUpdateData): Promise<InventoryItem | null> => {
    setLoading(true);
    
    try {
      const updatedItem = await apiRequest<InventoryItem>(API_ENDPOINTS.inventory.update(id), {
        method: 'PUT',
        body: JSON.stringify(itemData),
      });
      
      setInventory(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ));
      
      toast({
        title: 'Éxito',
        description: 'Item de inventario actualizado exitosamente',
      });
      
      return updatedItem;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error updating inventory item';
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

  const restockItem = async (id: number, quantity: number): Promise<InventoryItem | null> => {
    setLoading(true);
    
    try {
      const updatedItem = await apiRequest<InventoryItem>(API_ENDPOINTS.inventory.restock(id), {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      
      setInventory(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ));
      
      toast({
        title: 'Éxito',
        description: `Stock actualizado exitosamente (+${quantity} unidades)`,
      });
      
      return updatedItem;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error restocking item';
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

  const getInventoryItem = async (id: number): Promise<InventoryItem | null> => {
    setLoading(true);
    
    try {
      const item = await apiRequest<InventoryItem>(API_ENDPOINTS.inventory.get(id));
      return item;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Error fetching inventory item';
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

  // Mock data for development/fallback
  const getMockInventoryData = (): InventoryItem[] => [
    {
      id: 1,
      name: 'Manteles Blancos',
      category: 'Mantelería',
      current_stock: 45,
      minimum_stock: 20,
      maximum_stock: 100,
      unit_cost: 25.50,
      location: 'Almacén Principal',
      supplier: 'Textiles Premium',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Copas de Cristal',
      category: 'Cristalería',
      current_stock: 8,
      minimum_stock: 25,
      maximum_stock: 200,
      unit_cost: 12.00,
      location: 'Almacén Principal',
      supplier: 'Cristales y Más',
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Platos Principales',
      category: 'Vajilla',
      current_stock: 150,
      minimum_stock: 100,
      maximum_stock: 300,
      unit_cost: 8.75,
      location: 'Cocina',
      supplier: 'Vajillas SA',
      created_at: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'Sillas Chiavari',
      category: 'Mobiliario',
      current_stock: 0,
      minimum_stock: 50,
      maximum_stock: 200,
      unit_cost: 45.00,
      location: 'Bodega Externa',
      supplier: 'Mobiliario Eventos',
      created_at: new Date().toISOString(),
    },
    {
      id: 5,
      name: 'Centros de Mesa',
      category: 'Decoración',
      current_stock: 25,
      minimum_stock: 15,
      maximum_stock: 80,
      unit_cost: 35.00,
      location: 'Almacén Secundario',
      supplier: 'Decoraciones Elegantes',
      created_at: new Date().toISOString(),
    },
  ];

  // Fetch inventory on mount
  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    loading,
    error,
    fetchInventory,
    createInventoryItem,
    updateInventoryItem,
    restockItem,
    getInventoryItem,
  };
}