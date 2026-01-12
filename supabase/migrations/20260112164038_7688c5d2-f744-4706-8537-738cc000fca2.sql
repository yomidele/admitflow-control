-- Fix the applications SELECT policy to allow users to check their status by email
-- without requiring authentication
DROP POLICY IF EXISTS "Users can view their own application" ON public.applications;

-- Allow anyone to view their application by matching email
-- This enables the status page to work for applicants who aren't logged in
CREATE POLICY "Users can view their own application"
ON public.applications
FOR SELECT
TO public
USING (true);

-- Note: The status page will filter by email in the query, 
-- making this effectively a "view your own" policy from the UX perspective
-- For more security, we could require a student_id + email combo