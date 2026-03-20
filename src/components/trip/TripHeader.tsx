import React from 'react';
import type { Trip } from '@/types';
import { format } from 'date-fns';

interface TripHeaderProps {
  trip: Trip;
}

export const TripHeader: React.FC<TripHeaderProps> = ({ trip }) => {
  return (
    <div className="mb-6">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {trip.name}
      </h1>
      <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
        <span className="flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {trip.city}, {trip.country}
          {trip.specificPlace && ` - ${trip.specificPlace}`}
        </span>
        <span className="flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
        </span>
        <span className="flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {trip.baseCurrency}
        </span>
      </div>
    </div>
  );
};


