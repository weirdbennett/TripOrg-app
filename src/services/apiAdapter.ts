import { api, getAuthToken } from './api';
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

// Check if user is currently logged in
export const isAuthenticated = (): boolean => !!getAuthToken();

// Login user and return their profile
export const login = async (email: string, password: string): Promise<User> => {
  const response = await api.login(email, password);
  return response.user;
};

// Register new user and return their profile
export const register = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName: string;
}): Promise<User> => {
  const response = await api.register(data);
  return response.user;
};

// Log user out and clear auth token
export const logout = async (): Promise<void> => {
  await api.logout();
};

// Adapter layer that wraps API calls and provides a clean interface for the rest of the app to use
export const apiAdapter = {
  // User endpoints
  getCurrentUser: (): Promise<User> => api.getCurrentUser(),
  updateUser: (updates: Partial<User>): Promise<User> => api.updateUser(updates),
  uploadAvatar: (userId: string, file: File): Promise<User> => api.uploadAvatar(userId, file),
  deleteAvatar: (userId: string): Promise<User> => api.deleteAvatar(userId),
  
  // Trip endpoints
  getTrips: (): Promise<Trip[]> => api.getTrips(),
  getTrip: (id: string): Promise<Trip> => api.getTrip(id),
  createTrip: (data: CreateTripRequest): Promise<Trip> => api.createTrip(data),
  updateTrip: (id: string, data: UpdateTripRequest): Promise<Trip> => api.updateTrip(id, data),
  deleteTrip: (id: string): Promise<void> => api.deleteTrip(id),
  
  // Participant endpoints
  addParticipant: (tripId: string, userId: string): Promise<Trip> => api.addParticipant(tripId, userId),
  removeParticipant: (tripId: string, userId: string): Promise<Trip> => api.removeParticipant(tripId, userId),
  getParticipants: (tripId: string): Promise<User[]> => api.getParticipants(tripId),
  
  // Expense endpoints
  getExpenses: (tripId: string): Promise<Expense[]> => api.getExpenses(tripId),
  createExpense: (tripId: string, data: CreateExpenseRequest): Promise<Expense> => api.createExpense(tripId, data),
  updateExpense: (tripId: string, expenseId: string, data: UpdateExpenseRequest): Promise<Expense> => 
    api.updateExpense(tripId, expenseId, data),
  deleteExpense: (tripId: string, expenseId: string): Promise<void> => api.deleteExpense(tripId, expenseId),
  getBudgetSummary: (tripId: string): Promise<BudgetSummary> => api.getBudgetSummary(tripId),
  
  // Activity log endpoints
  getActivityLog: (tripId: string): Promise<ActivityLogEntry[]> => api.getActivityLog(tripId),
  
  // Chat endpoints
  getChatMessages: (tripId: string): Promise<ChatMessage[]> => api.getChatMessages(tripId),
  sendChatMessage: (tripId: string, data: SendMessageRequest): Promise<ChatMessage> => 
    api.sendChatMessage(tripId, data),
  
  // AI Chat endpoints
  getAIChatSession: (tripId: string): Promise<AIChatSession> => api.getAIChatSession(tripId),
  getAIMessages: (tripId: string): Promise<AIChatMessage[]> => api.getAIMessages(tripId),
  sendAIMessage: (tripId: string, data: SendAIMessageRequest): Promise<AIChatMessage> => 
    api.sendAIMessage(tripId, data),
  lockAIChat: (tripId: string, lock: boolean): Promise<AIChatSession> => api.lockAIChat(tripId, lock),
  
  // File endpoints
  uploadTicketFile: (tripId: string, file: File): Promise<TicketFile> => api.uploadTicketFile(tripId, file),
  deleteTicketFile: (tripId: string, fileId: string): Promise<void> => api.deleteTicketFile(tripId, fileId),
  downloadTicketFile: (tripId: string, fileId: string, fileName: string): Promise<void> => 
    api.downloadTicketFile(tripId, fileId, fileName),
  
  // Search endpoints
  searchUsers: (query: string): Promise<User[]> => api.searchUsers(query),
};

export default apiAdapter;
