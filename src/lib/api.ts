// src/lib/api.ts
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/v1' 
  : 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
  // Events
  events: {
    list: () => `${API_BASE_URL}/events`,
    create: () => `${API_BASE_URL}/events`,
    get: (id: number) => `${API_BASE_URL}/events/${id}`,
    update: (id: number) => `${API_BASE_URL}/events/${id}`,
    delete: (id: number) => `${API_BASE_URL}/events/${id}`,
    availability: (id: number) => `${API_BASE_URL}/events/${id}/availability`,
  },
  // Clients
  clients: {
    list: () => `${API_BASE_URL}/clients`,
    create: () => `${API_BASE_URL}/clients`,
    get: (id: number) => `${API_BASE_URL}/clients/${id}`,
    update: (id: number) => `${API_BASE_URL}/clients/${id}`,
    delete: (id: number) => `${API_BASE_URL}/clients/${id}`,
  },
  // Staff
  staff: {
    list: () => `${API_BASE_URL}/staff`,
    create: () => `${API_BASE_URL}/staff`,
    get: (id: number) => `${API_BASE_URL}/staff/${id}`,
    update: (id: number) => `${API_BASE_URL}/staff/${id}`,
    updateStatus: (id: number) => `${API_BASE_URL}/staff/${id}/status`,
  },
  // Inventory
  inventory: {
    list: () => `${API_BASE_URL}/inventory`,
    create: () => `${API_BASE_URL}/inventory`,
    get: (id: number) => `${API_BASE_URL}/inventory/${id}`,
    update: (id: number) => `${API_BASE_URL}/inventory/${id}`,
    restock: (id: number) => `${API_BASE_URL}/inventory/${id}/restock`,
  },
  // Analytics
  analytics: {
    summary: () => `${API_BASE_URL}/analytics/summary`,
  },
};

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status message
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new ApiError(response.status, errorMessage, errorData);
    }

    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other fetch errors
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { ApiError };