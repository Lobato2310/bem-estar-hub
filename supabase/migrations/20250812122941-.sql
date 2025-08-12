-- 1) Unique constraint for nutrition_plans (client_id, meal_type) to allow upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'uq_nutrition_plans_client_meal_type'
  ) THEN
    CREATE UNIQUE INDEX uq_nutrition_plans_client_meal_type
      ON public.nutrition_plans (client_id, meal_type);
  END IF;
END $$;

-- 2) Add retention support to client_food_logs: expires_at column + trigger to set it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'client_food_logs' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE public.client_food_logs
      ADD COLUMN expires_at timestamp with time zone;
  END IF;
END $$;

-- Create or replace trigger function to set expires_at 45 days after eaten_at/created_at
CREATE OR REPLACE FUNCTION public.set_food_log_expiry()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  -- Prefer eaten_at; fallback to created_at
  NEW.expires_at := COALESCE(NEW.eaten_at, now()) + INTERVAL '45 days';
  RETURN NEW;
END;$$;

-- Upsert trigger for INSERTs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_food_logs_set_expiry' AND tgrelid = 'public.client_food_logs'::regclass
  ) THEN
    CREATE TRIGGER trg_food_logs_set_expiry
    BEFORE INSERT ON public.client_food_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.set_food_log_expiry();
  END IF;
END $$;

-- Ensure UPDATE also maintains consistency if eaten_at changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_food_logs_update_expiry' AND tgrelid = 'public.client_food_logs'::regclass
  ) THEN
    CREATE TRIGGER trg_food_logs_update_expiry
    BEFORE UPDATE OF eaten_at ON public.client_food_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.set_food_log_expiry();
  END IF;
END $$;

-- Optional helper function to purge expired logs (can be invoked manually or by a scheduler if configured)
CREATE OR REPLACE FUNCTION public.purge_expired_food_logs()
RETURNS void
LANGUAGE sql AS $$
  DELETE FROM public.client_food_logs WHERE expires_at IS NOT NULL AND expires_at < now();
$$;

-- Index to query recent logs efficiently
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_food_logs_client_eaten_at'
  ) THEN
    CREATE INDEX idx_food_logs_client_eaten_at
    ON public.client_food_logs (client_id, eaten_at DESC);
  END IF;
END $$;