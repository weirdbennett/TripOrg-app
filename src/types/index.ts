// TYPES FOR TRIPORG APPLICATION

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatar?: string;
  preferredCurrency: string;
}

export interface UserProfile extends User {
  themePreference: 'light' | 'dark';
}

export type TransportType = 'plane' | 'train' | 'car' | 'bus' | 'mixed' | 'other';
export type AccommodationType = 'hotel' | 'apartment' | 'hostel' | 'other';
export type FoodStrategy = 'eating_out' | 'mixed' | 'self_cooking';
export type ExpenseCategory = 'transport' | 'accommodation' | 'food' | 'activities' | 'other';

export interface TicketFile {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Accommodation {
  type: AccommodationType;
  name: string;
  address: string;
  checkInDate: string;
  checkOutDate: string;
  pricePerNight?: number;
  notes?: string;
}

export interface Activity {
  id: string;
  name: string;
  estimatedCost?: number;
  notes?: string;
}

export interface Trip {
  id: string;
  name: string;
  country: string;
  city: string;
  specificPlace?: string;
  startDate: string;
  endDate: string;
  baseCurrency: string;
  
  transportType: TransportType;
  ticketsStatus: 'purchased' | 'not_purchased';
  ticketPrice?: number;
  ticketFiles: TicketFile[];
  
  accommodation?: Accommodation;
  
  foodStrategy: FoodStrategy;
  estimatedDailyFoodBudgetPerPerson?: number;
  
  activities: Activity[];
  localTransportNotes?: string;
  sharedNotes?: string;
  importantDeadlines?: string;
  documentsChecklist: string[];
  
  // Metadata
  createdAt: string;
  createdBy: string;
  participants: string[]; // User IDs
}

export interface Expense {
  id: string;
  tripId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  author: string; // User ID
  authorName?: string; // Display name of the author
  timestamp: string;
  isShared: boolean;
}

export interface PersonalExpense extends Expense {
  isShared: false;
}

export interface SharedExpense extends Expense {
  isShared: true;
}

export interface BudgetSummary {
  totalSharedCost: number;
  costPerParticipant: number;
  balancePerUser: Record<string, number>; // userId -> balance
  expensesByCategory: Record<ExpenseCategory, number>;
}

export type ActionType = 'create' | 'update' | 'delete' | 'add' | 'remove' | 'leave';
export type EntityType = 'trip' | 'expense' | 'participant' | 'accommodation' | 'activity' | 'message';

export interface ActivityLogEntry {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  actionType: ActionType;
  entityType: EntityType;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
}

export interface AIChatMessage {
  id: string;
  tripId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIChatSession {
  tripId: string;
  isLocked: boolean;
  messages: AIChatMessage[];
}


