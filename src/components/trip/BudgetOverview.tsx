import React, { useState, useEffect } from 'react';
import type { BudgetSummary } from '@/types';
import { apiAdapter } from '@/services/apiAdapter';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface BudgetOverviewProps {
  tripId: string;
  baseCurrency: string;
  refreshKey?: number;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ tripId, baseCurrency, refreshKey = 0 }) => {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await apiAdapter.getBudgetSummary(tripId);
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch budget summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [tripId, refreshKey]);

  if (loading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading budget...</div>;
  }

  if (!summary) {
    return <div className="text-gray-500 dark:text-gray-400">No budget data available.</div>;
  }

  const pieData = Object.entries(summary.expensesByCategory)
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value,
    }));

  const barData = Object.entries(summary.expensesByCategory).map(([category, value]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    amount: value,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Shared Cost</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {baseCurrency} {summary.totalSharedCost.toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Cost per Participant</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {baseCurrency} {summary.costPerParticipant.toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Participants</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Object.keys(summary.balancePerUser).length}
          </p>
        </div>
      </div>

      {pieData.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Expenses by Category</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${baseCurrency} ${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {barData.some(d => d.amount > 0) && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Category Breakdown</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${baseCurrency} ${value.toFixed(2)}`} />
              <Bar dataKey="amount" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

