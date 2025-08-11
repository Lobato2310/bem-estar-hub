-- Remove Market tab data and add features for Nutrition and Psychology password verification

-- 1) Ensure pgcrypto for password verification
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Add end time for meal intervals in nutrition_plans
ALTER TABLE public.nutrition_plans
ADD COLUMN IF NOT EXISTS meal_time_end time without time zone;

-- 3) RPC to verify psychology password for professionals
CREATE OR REPLACE FUNCTION public.verify_psych_password(p_password text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.professional_settings s
    WHERE s.user_id = auth.uid()
      AND s.psych_password_hash = crypt(p_password, s.psych_password_hash)
  );
$$;

-- 4) Drop Market products (and its policies) as requested
DROP TABLE IF EXISTS public.market_products CASCADE;