-- Add ticket_price column to trips table
ALTER TABLE trips ADD COLUMN ticket_price DECIMAL(10, 2);

-- Add auto-generation tracking columns to expenses table
ALTER TABLE expenses ADD COLUMN is_auto_generated BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE expenses ADD COLUMN auto_source VARCHAR(50);
