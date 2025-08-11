-- Apply DB changes excluding password verification function

-- 1) Add end time for meal intervals in nutrition_plans
ALTER TABLE public.nutrition_plans
ADD COLUMN IF NOT EXISTS meal_time_end time without time zone;

-- 2) Drop Market products (and its policies) as requested
DROP TABLE IF EXISTS public.market_products CASCADE;