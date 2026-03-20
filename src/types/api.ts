
// REST API Contract Definitions
// These interfaces define the contract between frontend and backend, all endpoints return JSON and use standard HTTP status codes


// AUTHENTICATION & USER API

// What frontend sends to login
export interface LoginRequest {
  email: string;
  password: string;
}

// What backend returns after successful login (user data + JWT token)
export interface LoginResponse {
  user: User;
  token: string;
}

// Response when fetching user details
export interface GetUserResponse {
  user: User;
}

// Fields that can be updated in user profile
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  preferredCurrency?: string;
  themePreference?: 'light' | 'dark';
}

// Response after updating user profile
export interface UpdateUserResponse {
  user: User;
}

// TRIP API

// Data needed to create a new trip
export interface CreateTripRequest {
  name: string;
  country: string;
  city: string;
  specificPlace?: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  baseCurrency: string;
  transportType: TransportType;
  ticketsStatus: 'purchased' | 'not_purchased';
  foodStrategy: FoodStrategy;
  estimatedDailyFoodBudgetPerPerson?: number;
}

// Response when creating a trip
export interface CreateTripResponse {
  trip: Trip;
}

// Response when fetching a single trip
export interface GetTripResponse {
  trip: Trip;
}

// Response when fetching all user's trips
export interface GetTripsResponse {
  trips: Trip[];
}

// Fields that can be updated in a trip
export interface UpdateTripRequest {
  name?: string;
  country?: string;
  city?: string;
  specificPlace?: string;
  startDate?: string;
  endDate?: string;
  baseCurrency?: string;
  transportType?: TransportType;
  ticketsStatus?: 'purchased' | 'not_purchased';
  ticketPrice?: number;
  accommodation?: Accommodation;
  foodStrategy?: FoodStrategy;
  estimatedDailyFoodBudgetPerPerson?: number;
  activities?: Activity[];
  localTransportNotes?: string;
  sharedNotes?: string;
  importantDeadlines?: string;
  documentsChecklist?: string[];
}

// Response after updating a trip
export interface UpdateTripResponse {
  trip: Trip;
}

// Response when deleting a trip
export interface DeleteTripResponse {
  success: boolean;
}

// PARTICIPANTS API

// Data needed to add someone to a trip
export interface AddParticipantRequest {
  userId: string;
}

// Response after adding a participant
export interface AddParticipantResponse {
  trip: Trip;
}

// Data needed to remove someone from a trip
export interface RemoveParticipantRequest {
  userId: string;
}

// Response after removing a participant
export interface RemoveParticipantResponse {
  trip: Trip;
}

// Response when fetching all trip participants
export interface GetParticipantsResponse {
  participants: User[];
}

// EXPENSES API

// Data needed to create a new expense
export interface CreateExpenseRequest {
  amount: number;
  category: ExpenseCategory;
  description: string;
  isShared: boolean;
}

// Response when creating an expense
export interface CreateExpenseResponse {
  expense: Expense;
}

// Response when fetching all trip expenses
export interface GetExpensesResponse {
  expenses: Expense[];
}

// Fields that can be updated in an expense
export interface UpdateExpenseRequest {
  amount?: number;
  category?: ExpenseCategory;
  description?: string;
}

// Response after updating an expense
export interface UpdateExpenseResponse {
  expense: Expense;
}

// Response when deleting an expense
export interface DeleteExpenseResponse {
  success: boolean;
}

// Response when getting budget summary (totals and per-person breakdown)
export interface GetBudgetSummaryResponse {
  summary: BudgetSummary;
}

// ACTIVITY LOG API

// Response when fetching activity log (who did what and when)
export interface GetActivityLogResponse {
  entries: ActivityLogEntry[];
  total: number;
}

// Optional query parameters for filtering activity log
export interface GetActivityLogQuery {
  limit?: number;
  offset?: number;
  entityType?: EntityType;
  actionType?: ActionType;
}

// CHAT API

// Data needed to send a message in trip chat
export interface SendMessageRequest {
  content: string;
}

// Response after sending a message
export interface SendMessageResponse {
  message: ChatMessage;
}

// Response when fetching chat messages
export interface GetMessagesResponse {
  messages: ChatMessage[];
  total: number;
}

// Optional query parameters for pagination when fetching chat messages
export interface GetMessagesQuery {
  limit?: number;
  offset?: number;
}

// AI CHAT API

// Data needed to send a message to AI assistant
export interface SendAIMessageRequest {
  content: string;
}

// Response after sending AI message (includes session state)
export interface SendAIMessageResponse {
  message: AIChatMessage;
  session: AIChatSession;
}

// Response when fetching AI chat session
export interface GetAIChatSessionResponse {
  session: AIChatSession;
}

// Response when fetching all AI chat messages
export interface GetAIMessagesResponse {
  messages: AIChatMessage[];
}

// Data needed to lock/unlock AI chat for the trip
export interface LockAIChatRequest {
  lock: boolean;
}

// Response after locking/unlocking AI chat
export interface LockAIChatResponse {
  session: AIChatSession;
}

// TICKET FILES API

// Data needed to upload a ticket file
export interface UploadTicketFileRequest {
  file: File;
}

// Response after uploading a file
export interface UploadTicketFileResponse {
  ticketFile: TicketFile;
}

// Response when deleting a file
export interface DeleteTicketFileResponse {
  success: boolean;
}

// API ENDPOINT PATHS (for reference)

/**
 * Base URL: /api/v1
 * 
 * Authentication:
 * POST   /auth/login
 * POST   /auth/logout
 * GET    /auth/me
 * 
 * Users:
 * GET    /users/:id
 * PUT    /users/:id
 * 
 * Trips:
 * GET    /trips
 * POST   /trips
 * GET    /trips/:id
 * PUT    /trips/:id
 * DELETE /trips/:id
 * 
 * Participants:
 * GET    /trips/:id/participants
 * POST   /trips/:id/participants
 * DELETE /trips/:id/participants/:userId
 * 
 * Expenses:
 * GET    /trips/:id/expenses
 * POST   /trips/:id/expenses
 * GET    /trips/:id/expenses/:expenseId
 * PUT    /trips/:id/expenses/:expenseId
 * DELETE /trips/:id/expenses/:expenseId
 * GET    /trips/:id/budget
 * 
 * Activity Log:
 * GET    /trips/:id/activity-log
 * 
 * Chat:
 * GET    /trips/:id/chat/messages
 * POST   /trips/:id/chat/messages
 * 
 * AI Chat:
 * GET    /trips/:id/ai-chat/session
 * GET    /trips/:id/ai-chat/messages
 * POST   /trips/:id/ai-chat/messages
 * POST   /trips/:id/ai-chat/lock
 * 
 * Ticket Files:
 * POST   /trips/:id/tickets/files
 * DELETE /trips/:id/tickets/files/:fileId
 */

import type {
  User,
  Trip,
  Accommodation,
  Activity,
  ExpenseCategory,
  TransportType,
  FoodStrategy,
  ActionType,
  Expense,
  BudgetSummary,
  ActivityLogEntry,
  EntityType,
  ChatMessage,
  AIChatMessage,
  AIChatSession,
  TicketFile,
} from './index';

