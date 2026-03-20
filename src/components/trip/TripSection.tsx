import React from 'react';
import { Card } from '@/components/ui/Card';

interface TripSectionProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const TripSection: React.FC<TripSectionProps> = ({
  title,
  children,
  actions,
  className = '',
}) => {
  return (
    <Card title={title} actions={actions} className={`mb-6 ${className}`}>
      {children}
    </Card>
  );
};


