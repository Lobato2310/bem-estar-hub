-- Add foreign key relationship between workout_schedules and workout_plans
ALTER TABLE public.workout_schedules 
ADD CONSTRAINT fk_workout_schedules_workout_plan 
FOREIGN KEY (workout_plan_id) REFERENCES public.workout_plans(id) ON DELETE CASCADE;