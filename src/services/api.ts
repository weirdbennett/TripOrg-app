import type {
  User,
  Trip,
  Expense,
  ActivityLogEntry,
  ChatMessage,
  AIChatMessage,
  AIChatSession,
  BudgetSummary,
  TicketFile,
} from '@/types';
import type {
  CreateTripRequest,
  UpdateTripRequest,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  SendMessageRequest,
  SendAIMessageRequest,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// JWT token management (stored in localStorage for persistence)
let authToken: string | null = localStorage.getItem('triporg_token');

// Update token in memory and storage
export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('triporg_token', token);
  } else {
    localStorage.removeItem('triporg_token');
  }
};

// Retrieve current auth token
export const getAuthToken = () => authToken;

// Generic fetch wrapper that handles auth headers and error parsing
const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Add auth token to every request
  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If request failed, throw error with message from server
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  // Return empty object for 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

// File upload handler (FormData instead of JSON)
const uploadFile = async <T>(
  endpoint: string,
  file: File
): Promise<T> => {
  const formData = new FormData();
  formData.append('file', file);

  const headers: HeadersInit = {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// All API endpoints grouped by feature
export const api = {
  // Authentication endpoints
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    displayName: string;
  }): Promise<{ user: User; token: string }> => {
    const response = await request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Save token after registration
    setAuthToken(response.token);
    return response;
  },

  // Login and save token
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(response.token);
    return response;
  },

  // Logout and clear token
  logout: async (): Promise<void> => {
    await request('/auth/logout', { method: 'POST' }).catch(() => {});
    setAuthToken(null);
  },

  // Get current logged-in user
  getCurrentUser: async (): Promise<User> => {
    const response = await request<{ user: User }>('/auth/me');
    return response.user;
  },

  // Update user profile information
  updateUser: async (updates: Partial<User>): Promise<User> => {
    const currentUser = await api.getCurrentUser();
    const response = await request<{ user: User }>(`/users/${currentUser.id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.user;
  },

  // Upload user avatar as file
  uploadAvatar: async (userId: string, file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data.user;
  },

  // Remove user's avatar
  deleteAvatar: async (userId: string): Promise<User> => {
    const response = await request<{ user: User }>(`/users/${userId}/avatar`, {
      method: 'DELETE',
    });
    return response.user;
  },

  // Search for users (for adding to trips)
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await request<{ users: User[] }>(`/users/search?q=${encodeURIComponent(query)}`);
    return response.users;
  },

  // Trip endpoints
  getTrips: async (): Promise<Trip[]> => {
    const response = await request<{ trips: Trip[] }>('/trips');
    return response.trips;
  },

  // Get single trip details
  getTrip: async (id: string): Promise<Trip> => {
    const response = await request<{ trip: Trip }>(`/trips/${id}`);
    return response.trip;
  },

  // Create new trip
  createTrip: async (data: CreateTripRequest): Promise<Trip> => {
    const response = await request<{ trip: Trip }>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.trip;
  },

  // Update existing trip
  updateTrip: async (id: string, data: UpdateTripRequest): Promise<Trip> => {
    const response = await request<{ trip: Trip }>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.trip;
  },

  // Delete trip
  deleteTrip: async (id: string): Promise<void> => {
    await request(`/trips/${id}`, { method: 'DELETE' });
  },

  // Add participant to trip
  addParticipant: async (tripId: string, userId: string): Promise<Trip> => {
    const response = await request<{ trip: Trip }>(`/trips/${tripId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return response.trip;
  },

  // Remove participant from trip
  removeParticipant: async (tripId: string, userId: string): Promise<Trip> => {
    const response = await request<{ trip: Trip }>(`/trips/${tripId}/participants/${userId}`, {
      method: 'DELETE',
    });
    return response.trip;
  },

  // Get all participants of a trip
  getParticipants: async (tripId: string): Promise<User[]> => {
    const response = await request<{ participants: User[] }>(`/trips/${tripId}/participants`);
    return response.participants;
  },

  // Expense endpoints
  getExpenses: async (tripId: string): Promise<Expense[]> => {
    const response = await request<{ expenses: Expense[] }>(`/trips/${tripId}/expenses`);
    return response.expenses;
  },

  // Create new expense
  createExpense: async (tripId: string, data: CreateExpenseRequest): Promise<Expense> => {
    const response = await request<{ expense: Expense }>(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.expense;
  },

  // Update existing expense
  updateExpense: async (
    tripId: string,
    expenseId: string,
    data: UpdateExpenseRequest
  ): Promise<Expense> => {
    const response = await request<{ expense: Expense }>(
      `/trips/${tripId}/expenses/${expenseId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.expense;
  },

  // Delete expense
  deleteExpense: async (tripId: string, expenseId: string): Promise<void> => {
    await request(`/trips/${tripId}/expenses/${expenseId}`, { method: 'DELETE' });
  },

  // Get budget summary with totals per participant
  getBudgetSummary: async (tripId: string): Promise<BudgetSummary> => {
    const response = await request<{ summary: BudgetSummary }>(`/trips/${tripId}/budget`);
    return response.summary;
  },

  // Activity log endpoints
  getActivityLog: async (tripId: string): Promise<ActivityLogEntry[]> => {
    const response = await request<{ entries: ActivityLogEntry[]; total: number }>(
      `/trips/${tripId}/activity-log`
    );
    return response.entries;
  },

  // Chat endpoints
  getChatMessages: async (tripId: string): Promise<ChatMessage[]> => {
    const response = await request<{ messages: ChatMessage[]; total: number }>(
      `/trips/${tripId}/chat/messages`
    );
    return response.messages;
  },

  // Send message in trip chat
  sendChatMessage: async (tripId: string, data: SendMessageRequest): Promise<ChatMessage> => {
    const response = await request<{ message: ChatMessage }>(
      `/trips/${tripId}/chat/messages`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.message;
  },

  // AI Chat endpoints
  getAIChatSession: async (tripId: string): Promise<AIChatSession> => {
    const response = await request<{ session: AIChatSession }>(`/trips/${tripId}/ai-chat/session`);
    return response.session;
  },

  // Get all AI chat messages for trip
  getAIMessages: async (tripId: string): Promise<AIChatMessage[]> => {
    const response = await request<{ messages: AIChatMessage[] }>(
      `/trips/${tripId}/ai-chat/messages`
    );
    return response.messages;
  },

  // Send message to AI assistant
  sendAIMessage: async (tripId: string, data: SendAIMessageRequest): Promise<AIChatMessage> => {
    const response = await request<{ message: AIChatMessage; session: AIChatSession }>(
      `/trips/${tripId}/ai-chat/messages`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.message;
  },

  // Lock or unlock AI chat for the trip
  lockAIChat: async (tripId: string, lock: boolean): Promise<AIChatSession> => {
    const response = await request<{ session: AIChatSession }>(
      `/trips/${tripId}/ai-chat/lock`,
      {
        method: 'POST',
        body: JSON.stringify({ lock }),
      }
    );
    return response.session;
  },

  // Ticket file endpoints
  uploadTicketFile: async (tripId: string, file: File): Promise<TicketFile> => {
    const response = await uploadFile<{ ticketFile: TicketFile }>(
      `/trips/${tripId}/tickets/files`,
      file
    );
    return response.ticketFile;
  },

  // Delete ticket file
  deleteTicketFile: async (tripId: string, fileId: string): Promise<void> => {
    await request(`/trips/${tripId}/tickets/files/${fileId}`, { method: 'DELETE' });
  },

  // Download ticket file to user's computer
  downloadTicketFile: async (tripId: string, fileId: string, fileName: string): Promise<void> => {
    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/tickets/files/${fileId}/download`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: HTTP ${response.status}`);
    }

    // Create blob and trigger browser download
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

export default api;

