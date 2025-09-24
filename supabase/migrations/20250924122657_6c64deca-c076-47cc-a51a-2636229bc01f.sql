-- Create trigger to auto-confirm review user email (only email_confirmed_at)
CREATE OR REPLACE FUNCTION public.auto_confirm_review_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm the review user email
  IF NEW.email = 'revisao@teste.com' THEN
    NEW.email_confirmed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-confirming review user
DROP TRIGGER IF EXISTS auto_confirm_review_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_review_user_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_review_user();

-- Also update existing review user if exists (only email_confirmed_at)
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'revisao@teste.com' 
AND email_confirmed_at IS NULL;