-- Add sleep_hours column to client_checkins table
ALTER TABLE public.client_checkins 
ADD COLUMN sleep_hours integer CHECK (sleep_hours >= 1 AND sleep_hours <= 8);