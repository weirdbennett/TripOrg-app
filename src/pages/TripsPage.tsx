import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrips } from '@/hooks/useTrips';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { format } from 'date-fns';
import { apiAdapter } from '@/services/apiAdapter';

export const TripsPage: React.FC = () => {
  const { trips, loading, error, refetch } = useTrips();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    specificPlace: '',
    startDate: '',
    endDate: '',
    baseCurrency: 'USD',
    transportType: 'plane' as const,
    ticketsStatus: 'not_purchased' as const,
    foodStrategy: 'mixed' as const,
    estimatedDailyFoodBudgetPerPerson: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      await apiAdapter.createTrip({
        ...formData,
        estimatedDailyFoodBudgetPerPerson: formData.estimatedDailyFoodBudgetPerPerson
          ? parseFloat(formData.estimatedDailyFoodBudgetPerPerson)
          : undefined,
      });
      setShowCreateForm(false);
      setFormData({
        name: '',
        country: '',
        city: '',
        specificPlace: '',
        startDate: '',
        endDate: '',
        baseCurrency: 'USD',
        transportType: 'plane',
        ticketsStatus: 'not_purchased',
        foodStrategy: 'mixed',
        estimatedDailyFoodBudgetPerPerson: '',
      });
      refetch();
    } catch (err) {
      console.error('Failed to create trip:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to create trip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading trips...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Trips</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : '+ New Trip'}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Trip name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                required
              />
              <input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                required
              />
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                required
              />
              <input
                type="text"
                placeholder="Specific place (optional)"
                value={formData.specificPlace}
                onChange={(e) => setFormData({ ...formData, specificPlace: e.target.value })}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
              <input
                type="date"
                placeholder="Start date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                required
              />
              <input
                type="date"
                placeholder="End date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                required
              />
              <Select
                label="Base Currency"
                value={formData.baseCurrency}
                onChange={(e) => setFormData({ ...formData, baseCurrency: e.target.value })}
                options={[
                  { value: 'USD', label: 'USD - US Dollar' },
                  { value: 'EUR', label: 'EUR - Euro' },
                  { value: 'PLN', label: 'PLN - Polish Zloty' },
                  { value: 'GBP', label: 'GBP - British Pound' },
                  { value: 'JPY', label: 'JPY - Japanese Yen' },
                  { value: 'CAD', label: 'CAD - Canadian Dollar' },
                  { value: 'AUD', label: 'AUD - Australian Dollar' },
                  { value: 'CHF', label: 'CHF - Swiss Franc' },
                  { value: 'CNY', label: 'CNY - Chinese Yuan' },
                  { value: 'INR', label: 'INR - Indian Rupee' },
                  { value: 'BRL', label: 'BRL - Brazilian Real' },
                ]}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Trip'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map(trip => (
          <Link key={trip.id} to={`/trips/${trip.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {trip.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {trip.city}, {trip.country}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-500">
                  {trip.participants.length} participant{trip.participants.length !== 1 ? 's' : ''}
                </span>
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {trip.baseCurrency}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {trips.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No trips yet. Create your first trip!</p>
        </div>
      )}
    </div>
  );
};

