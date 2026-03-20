import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '@/hooks/useTrip';
import { useUser } from '@/context/UserContext';
import { apiAdapter } from '@/services/apiAdapter';
import { TripHeader } from '@/components/trip/TripHeader';
import { TripSection } from '@/components/trip/TripSection';
import { ExpensesList } from '@/components/trip/ExpensesList';
import { BudgetOverview } from '@/components/trip/BudgetOverview';
import { ActivityLog } from '@/components/trip/ActivityLog';
import { ChatPanel } from '@/components/trip/ChatPanel';
import { AIChatPanel } from '@/components/trip/AIChatPanel';
import { EditableTickets } from '@/components/trip/EditableTickets';
import { EditableAccommodation } from '@/components/trip/EditableAccommodation';
import { EditableActivities } from '@/components/trip/EditableActivities';
import { EditableList } from '@/components/trip/EditableList';
import { EditableText } from '@/components/trip/EditableText';
import { ParticipantInvite } from '@/components/trip/ParticipantInvite';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Activity, Accommodation, TransportType } from '@/types';

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { trip, loading, error, refetch } = useTrip(id);
  
  // Budget refresh trigger to force rerender of BudgetOverview when related data changes
  const [budgetRefreshKey, setBudgetRefreshKey] = useState(0);
  const refreshBudget = useCallback(() => setBudgetRefreshKey(k => k + 1), []);
  
  // Activity log refresh function reference  to trigger refresh after activity changes
  const [activityLogRefresh, setActivityLogRefresh] = useState<(() => void) | null>(null);
  
  // Activities add form state (for header button)
  const [showActivityAddForm, setShowActivityAddForm] = useState(false);
  
  // Expenses add form state (for header button)
  const [showExpenseAddForm, setShowExpenseAddForm] = useState(false);
  
  // Combined refresh for budget and trip data (used when expenses change)
  const handleExpenseChange = useCallback(() => {
    refreshBudget();
    refetch(); // Also refresh trip data in case auto-generated expense was deleted
  }, [refreshBudget, refetch]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading trip...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600 dark:text-red-400">Error: {error || 'Trip not found'}</div>
        <Button onClick={() => navigate('/trips')} className="mt-4">Back to Trips</Button>
      </div>
    );
  }

  const handleUpdateTransport = async (transportType: TransportType, ticketsStatus: 'purchased' | 'not_purchased', ticketPrice?: number) => {
    await apiAdapter.updateTrip(trip.id, { transportType, ticketsStatus, ticketPrice });
    refetch();
    refreshBudget();
  };

  const handleDeleteTransport = async () => {
    await apiAdapter.updateTrip(trip.id, { 
      transportType: 'plane', 
      ticketsStatus: 'not_purchased', 
      ticketPrice: undefined 
    });
    refetch();
    refreshBudget();
  };

  const handleUploadTicketFile = async (file: File) => {
    await apiAdapter.uploadTicketFile(trip.id, file);
    refetch();
  };

  const handleDeleteTicketFile = async (fileId: string) => {
    await apiAdapter.deleteTicketFile(trip.id, fileId);
    refetch();
  };

  const handleDownloadTicketFile = async (fileId: string, fileName: string) => {
    await apiAdapter.downloadTicketFile(trip.id, fileId, fileName);
  };

  const handleInviteParticipant = async (userId: string) => {
    await apiAdapter.addParticipant(trip.id, userId);
    refetch();
    refreshBudget(); // Update participant count in budget
  };

  const handleRemoveParticipant = async (userId: string) => {
    try {
      await apiAdapter.removeParticipant(trip.id, userId);
      await refetch();
      refreshBudget();
    } catch (err) {
      console.error('Failed to remove participant:', err);
      throw err;
    }
  };

  const handleSaveAccommodation = async (accommodation: Accommodation) => {
    await apiAdapter.updateTrip(trip.id, { accommodation });
    refetch();
    refreshBudget();
  };

  const handleDeleteAccommodation = async () => {
    // Send accommodation with empty name to trigger deletion on backend
    await apiAdapter.updateTrip(trip.id, { 
      accommodation: {
        type: 'hotel',
        name: '',
        address: '',
        checkInDate: trip.startDate,
        checkOutDate: trip.endDate
      } 
    });
    refetch();
    refreshBudget();
  };

  const handleAddActivity = async (activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `act${Date.now()}`,
    };
    const updatedActivities = [...trip.activities, newActivity];
    await apiAdapter.updateTrip(trip.id, { activities: updatedActivities });
    refetch();
    refreshBudget();
  };

  const handleEditActivity = async (id: string, activity: Omit<Activity, 'id'>) => {
    const updatedActivities = trip.activities.map(a => a.id === id ? { ...activity, id } : a);
    await apiAdapter.updateTrip(trip.id, { activities: updatedActivities });
    refetch();
    refreshBudget();
  };

  const handleDeleteActivity = async (id: string) => {
    const updatedActivities = trip.activities.filter(a => a.id !== id);
    await apiAdapter.updateTrip(trip.id, { activities: updatedActivities });
    refetch();
    refreshBudget();
  };

  const handleAddDocument = async (item: string) => {
    const updatedChecklist = [...trip.documentsChecklist, item];
    await apiAdapter.updateTrip(trip.id, { documentsChecklist: updatedChecklist });
    refetch();
  };

  const handleEditDocument = async (index: number, newValue: string) => {
    const updatedChecklist = [...trip.documentsChecklist];
    updatedChecklist[index] = newValue;
    await apiAdapter.updateTrip(trip.id, { documentsChecklist: updatedChecklist });
    refetch();
  };

  const handleDeleteDocument = async (index: number) => {
    const updatedChecklist = trip.documentsChecklist.filter((_, i) => i !== index);
    await apiAdapter.updateTrip(trip.id, { documentsChecklist: updatedChecklist });
    refetch();
  };

  const handleUpdateFoodStrategy = async (foodStrategy: string, estimatedDailyFoodBudgetPerPerson?: number) => {
    await apiAdapter.updateTrip(trip.id, { foodStrategy: foodStrategy as any, estimatedDailyFoodBudgetPerPerson });
    refetch();
    refreshBudget();
  };

  const handleDeleteFoodStrategy = async () => {
    // Send 0 to clear the budget, undefined gets omitted from JSON 
    await apiAdapter.updateTrip(trip.id, { 
      foodStrategy: 'mixed', 
      estimatedDailyFoodBudgetPerPerson: 0 
    });
    refetch();
    refreshBudget();
  };

  const handleUpdateSharedNotes = async (value: string) => {
    await apiAdapter.updateTrip(trip.id, { sharedNotes: value });
    refetch();
  };

  const handleUpdateLocalTransport = async (value: string) => {
    await apiAdapter.updateTrip(trip.id, { localTransportNotes: value });
    refetch();
  };

  const handleUpdateDeadlines = async (value: string) => {
    await apiAdapter.updateTrip(trip.id, { importantDeadlines: value });
    refetch();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/trips')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Trips
        </Button>
      </div>

      <TripHeader trip={trip} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Participants*/}
          <TripSection title="Participants">
            <ParticipantInvite
              tripId={trip.id}
              currentParticipants={trip.participants}
              createdBy={trip.createdBy}
              currentUserId={user?.id}
              onInvite={handleInviteParticipant}
              onRemove={handleRemoveParticipant}
              onLeave={async () => {
                if (!user?.id) {
                  throw new Error('User not authenticated');
                }
                try {
                  await apiAdapter.removeParticipant(trip.id, user.id);
                  navigate('/trips');
                } catch (err) {
                  console.error('Failed to leave trip:', err);
                  throw err;
                }
              }}
              onDelete={async () => {
                await apiAdapter.deleteTrip(trip.id);
                navigate('/trips');
              }}
            />
          </TripSection>

          {/* Budget Overview */}
          <TripSection title="Budget Overview">
            <BudgetOverview tripId={trip.id} baseCurrency={trip.baseCurrency} refreshKey={budgetRefreshKey} />
          </TripSection>

          {/* Expenses */}
          <TripSection 
            title="Expenses"
            actions={
              !showExpenseAddForm && (
                <Button size="sm" onClick={() => setShowExpenseAddForm(true)}>
                  + Add Expense
                </Button>
              )
            }
          >
            <ExpensesList 
              tripId={trip.id} 
              baseCurrency={trip.baseCurrency} 
              onExpenseChange={handleExpenseChange} 
              refreshKey={budgetRefreshKey}
              showAddForm={showExpenseAddForm}
              onAddFormChange={setShowExpenseAddForm}
            />
          </TripSection>

          {/* Tickets Block */}
          <TripSection title="Tickets & Transport">
            <EditableTickets
              transportType={trip.transportType}
              ticketsStatus={trip.ticketsStatus}
              ticketPrice={trip.ticketPrice}
              ticketFiles={trip.ticketFiles}
              baseCurrency={trip.baseCurrency}
              onUpdateTransport={handleUpdateTransport}
              onUploadFile={handleUploadTicketFile}
              onDeleteFile={handleDeleteTicketFile}
              onDownloadFile={handleDownloadTicketFile}
              onDeleteTransport={handleDeleteTransport}
            />
          </TripSection>

          {/* Accommodation Block */}
          <TripSection title="Accommodation">
            <EditableAccommodation
              accommodation={trip.accommodation}
              onSave={handleSaveAccommodation}
              onDelete={handleDeleteAccommodation}
              baseCurrency={trip.baseCurrency}
              defaultCheckIn={trip.startDate}
              defaultCheckOut={trip.endDate}
            />
          </TripSection>

          {/* Food and Daily Expenses */}
          <TripSection title="Food & Daily Expenses">
            <EditableFoodStrategy
              foodStrategy={trip.foodStrategy}
              estimatedDailyFoodBudgetPerPerson={trip.estimatedDailyFoodBudgetPerPerson}
              baseCurrency={trip.baseCurrency}
              onSave={handleUpdateFoodStrategy}
              onDelete={handleDeleteFoodStrategy}
            />
          </TripSection>

          {/* Activities */}
          <TripSection 
            title="Activities & Attractions"
            actions={
              !showActivityAddForm && (
                <Button size="sm" onClick={() => setShowActivityAddForm(true)}>
                  + Add Activity
                </Button>
              )
            }
          >
            <EditableActivities
              activities={trip.activities}
              onAdd={handleAddActivity}
              onEdit={handleEditActivity}
              onDelete={handleDeleteActivity}
              baseCurrency={trip.baseCurrency}
              showAddForm={showActivityAddForm}
              onAddFormChange={setShowActivityAddForm}
            />
          </TripSection>

          {/* Shared Notes */}
          <TripSection title="Shared Notes">
            <EditableText
              value={trip.sharedNotes}
              onSave={handleUpdateSharedNotes}
              placeholder="Add shared notes..."
              multiline
            />
          </TripSection>

          {/* Local Transport Notes */}
          <TripSection title="Local Transport">
            <EditableText
              value={trip.localTransportNotes}
              onSave={handleUpdateLocalTransport}
              placeholder="Add local transport notes..."
              multiline
            />
          </TripSection>

          {/* Important Deadlines */}
          <TripSection title="Important Deadlines">
            <EditableText
              value={trip.importantDeadlines}
              onSave={handleUpdateDeadlines}
              placeholder="Add important deadlines..."
              multiline
            />
          </TripSection>

          {/* Documents Checklist */}
          <TripSection title="Documents Checklist">
            <EditableList
              items={trip.documentsChecklist}
              onAdd={handleAddDocument}
              onEdit={handleEditDocument}
              onDelete={handleDeleteDocument}
              placeholder="Add document item..."
            />
          </TripSection>

          {/* Activity Log */}
          <TripSection 
            title="Activity Log"
            actions={
              <button
                onClick={() => activityLogRefresh?.()}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Refresh
              </button>
            }
          >
            <ActivityLog 
              tripId={trip.id} 
              onRefreshReady={(fn) => setActivityLogRefresh(() => fn)} 
            />
          </TripSection>
        </div>

        {/* Sidebar with Chats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-20">
            <div className="space-y-6">
              <div className="h-96">
                <ChatPanel tripId={trip.id} position="left" />
              </div>
              <div className="h-96">
                <AIChatPanel tripId={trip.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Food Strategy Component
interface EditableFoodStrategyProps {
  foodStrategy: string;
  estimatedDailyFoodBudgetPerPerson?: number;
  baseCurrency: string;
  onSave: (foodStrategy: string, estimatedDailyFoodBudgetPerPerson?: number) => Promise<void>;
  onDelete: () => Promise<void>;
}

const EditableFoodStrategy: React.FC<EditableFoodStrategyProps> = ({
  foodStrategy,
  estimatedDailyFoodBudgetPerPerson,
  baseCurrency,
  onSave,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);
  const [localFoodStrategy, setLocalFoodStrategy] = React.useState(foodStrategy);
  const [localBudget, setLocalBudget] = React.useState(estimatedDailyFoodBudgetPerPerson?.toString() || '');

  // Check if food data has been explicitly set (budget is defined and > 0)
  const hasData = estimatedDailyFoodBudgetPerPerson != null && estimatedDailyFoodBudgetPerPerson > 0;

  const handleSave = async () => {
    await onSave(localFoodStrategy, localBudget ? parseFloat(localBudget) : undefined);
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setLocalFoodStrategy(foodStrategy);
    setLocalBudget(estimatedDailyFoodBudgetPerPerson?.toString() || '');
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete food information?')) return;
    await onDelete();
  };

  // Show empty state if no data has been set
  if (!hasData && !isAdding) {
    return (
      <div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">No information added yet.</p>
        <Button onClick={() => setIsAdding(true)}>Add Food Information</Button>
      </div>
    );
  }

  if (isEditing || isAdding) {
    return (
      <div className="space-y-4">
        <Select
          label="Food Strategy"
          value={localFoodStrategy}
          onChange={(e) => setLocalFoodStrategy(e.target.value)}
          options={[
            { value: 'eating_out', label: 'Eating Out' },
            { value: 'mixed', label: 'Mixed' },
            { value: 'self_cooking', label: 'Self Cooking' },
          ]}
        />
        <Input
          label="Estimated Daily Budget per Person"
          type="number"
          step="0.01"
          value={localBudget}
          onChange={(e) => setLocalBudget(e.target.value)}
          placeholder={`Amount in ${baseCurrency}`}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button size="sm" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Food Strategy</p>
          <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
            {foodStrategy.replace('_', ' ')}
          </p>
          {estimatedDailyFoodBudgetPerPerson && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Estimated Daily Budget per Person</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {baseCurrency} {estimatedDailyFoodBudgetPerPerson}
              </p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDelete} className="text-red-600 dark:text-red-400">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};