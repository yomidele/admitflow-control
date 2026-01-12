-- Fix RLS policy for admin_settings to allow public read of deadline info
DROP POLICY IF EXISTS "Admin settings viewable by admins" ON public.admin_settings;

-- Allow everyone to view admin settings (they only contain non-sensitive config)
CREATE POLICY "Admin settings viewable by everyone"
ON public.admin_settings
FOR SELECT
USING (true);

-- Ensure the INSERT policy for applications works for anonymous users
-- The existing policy looks correct, but let's verify total_score is being calculated
-- by adding a trigger for it

-- Create a trigger to auto-calculate total_score on insert/update
CREATE OR REPLACE FUNCTION public.calculate_total_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_score := (NEW.gpa * 25) + NEW.test_score;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS calculate_total_score_trigger ON public.applications;

CREATE TRIGGER calculate_total_score_trigger
BEFORE INSERT OR UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.calculate_total_score();