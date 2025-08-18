-- Fix all infinite recursion in RLS policies by removing references to profiles table from within profiles policies

-- First, drop ALL existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Professionals can view assigned client profiles" ON public.profiles;

-- Recreate the simple policies without any recursion
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- For the professional policy, we'll create a simple one that allows professionals to view client profiles
-- but without complex checks that cause recursion
CREATE POLICY "Professionals can view client profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow professionals to see client profiles only
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data ->> 'user_type' = 'professional'
  ) 
  AND user_type = 'client'::user_type
);

-- Also need to fix policies in other tables that reference profiles
-- Let's check client_food_logs policies and fix them

-- Drop problematic policies in client_food_logs
DROP POLICY IF EXISTS "Professionals can view client food logs" ON public.client_food_logs;

-- Recreate without referencing profiles
CREATE POLICY "Professionals can view client food logs" 
ON public.client_food_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data ->> 'user_type' = 'professional'
  )
);

-- Fix similar issues in other tables
DROP POLICY IF EXISTS "Professionals can view all client check-ins" ON public.client_checkins;
DROP POLICY IF EXISTS "Professionals can update check-ins (feedback)" ON public.client_checkins;

CREATE POLICY "Professionals can view all client check-ins" 
ON public.client_checkins 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data ->> 'user_type' = 'professional'
  )
);

CREATE POLICY "Professionals can update check-ins (feedback)" 
ON public.client_checkins 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data ->> 'user_type' = 'professional'
  )
);

-- Fix client_measurements policies
DROP POLICY IF EXISTS "Professionals can manage client measurements" ON public.client_measurements;

CREATE POLICY "Professionals can manage client measurements" 
ON public.client_measurements 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data ->> 'user_type' = 'professional'
  )
);

-- Update functions to fix search path warnings
CREATE OR REPLACE FUNCTION public.is_professional()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data ->> 'user_type' = 'professional'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_professional()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data ->> 'user_type' = 'professional'
  );
$$;