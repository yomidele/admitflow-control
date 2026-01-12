-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'super_admin');

-- Create application_status enum
CREATE TYPE public.application_status AS ENUM (
  'submitted',
  'under_review',
  'selection_pending',
  'admitted',
  'waitlisted',
  'rejected'
);

-- Create admission_type enum
CREATE TYPE public.admission_type AS ENUM ('regular', 'early_decision', 'transfer');

-- Create programs table
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  slots INTEGER NOT NULL DEFAULT 100,
  cutoff INTEGER NOT NULL DEFAULT 150,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  nin TEXT NOT NULL,
  passport_photo_url TEXT,
  program_id UUID REFERENCES public.programs(id) NOT NULL,
  admission_type public.admission_type NOT NULL DEFAULT 'regular',
  gpa DECIMAL(3,2) NOT NULL CHECK (gpa >= 0 AND gpa <= 4),
  test_score INTEGER NOT NULL CHECK (test_score >= 0 AND test_score <= 200),
  total_score INTEGER GENERATED ALWAYS AS ((gpa * 25)::INTEGER + test_score) STORED,
  status public.application_status NOT NULL DEFAULT 'submitted',
  rank INTEGER,
  admission_round INTEGER,
  matriculation_number TEXT UNIQUE,
  scholarship_status TEXT CHECK (scholarship_status IN ('eligible', 'awarded', 'not_eligible')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create admin_settings table
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  applications_locked BOOLEAN DEFAULT false,
  result_release_date TIMESTAMP WITH TIME ZONE,
  selection_scheduled TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create selection_runs table for audit
CREATE TABLE public.selection_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('scheduled', 'running', 'completed', 'released')) DEFAULT 'scheduled',
  rounds JSONB,
  cutoffs_used JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create matriculation_sequences table for unique numbers per program
CREATE TABLE public.matriculation_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id) NOT NULL UNIQUE,
  current_sequence INTEGER DEFAULT 0,
  year INTEGER DEFAULT EXTRACT(YEAR FROM now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selection_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculation_sequences ENABLE ROW LEVEL SECURITY;

-- Create has_role function for checking admin access
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is any admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  )
$$;

-- Programs policies (public read, admin write)
CREATE POLICY "Programs are viewable by everyone"
ON public.programs FOR SELECT
USING (true);

CREATE POLICY "Admins can manage programs"
ON public.programs FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Applications policies
CREATE POLICY "Anyone can submit applications"
ON public.applications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own application"
ON public.applications FOR SELECT
USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all applications"
ON public.applications FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- User roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Admin settings policies
CREATE POLICY "Admin settings viewable by admins"
ON public.admin_settings FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update settings"
ON public.admin_settings FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Selection runs policies
CREATE POLICY "Selection runs viewable by admins"
ON public.selection_runs FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage selection runs"
ON public.selection_runs FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Matriculation sequences policies
CREATE POLICY "Admins can manage matriculation sequences"
ON public.matriculation_sequences FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_programs_updated_at
BEFORE UPDATE ON public.programs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matriculation_sequences_updated_at
BEFORE UPDATE ON public.matriculation_sequences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate matriculation number
CREATE OR REPLACE FUNCTION public.generate_matriculation_number(p_program_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_program_code TEXT;
  v_year INTEGER;
  v_sequence INTEGER;
  v_matric TEXT;
BEGIN
  -- Get program code
  SELECT code INTO v_program_code FROM public.programs WHERE id = p_program_id;
  
  -- Get current year
  v_year := EXTRACT(YEAR FROM now());
  
  -- Get and increment sequence
  INSERT INTO public.matriculation_sequences (program_id, current_sequence, year)
  VALUES (p_program_id, 1, v_year)
  ON CONFLICT (program_id) 
  DO UPDATE SET 
    current_sequence = CASE 
      WHEN matriculation_sequences.year != v_year THEN 1
      ELSE matriculation_sequences.current_sequence + 1
    END,
    year = v_year
  RETURNING current_sequence INTO v_sequence;
  
  -- Generate matriculation number: DEPT/YEAR/SEQUENCE
  v_matric := v_program_code || '/' || v_year || '/' || LPAD(v_sequence::TEXT, 4, '0');
  
  RETURN v_matric;
END;
$$;

-- Insert default programs
INSERT INTO public.programs (name, code, slots, cutoff, description) VALUES
('Computer Science', 'CSC', 150, 170, 'Bachelor of Science in Computer Science'),
('Electrical Engineering', 'EEE', 120, 165, 'Bachelor of Engineering in Electrical Engineering'),
('Mechanical Engineering', 'MEE', 100, 160, 'Bachelor of Engineering in Mechanical Engineering'),
('Business Administration', 'BUS', 200, 155, 'Bachelor of Science in Business Administration'),
('Medicine & Surgery', 'MED', 80, 185, 'Bachelor of Medicine, Bachelor of Surgery');

-- Insert default admin settings
INSERT INTO public.admin_settings (application_deadline, applications_locked, result_release_date)
VALUES (now() + interval '30 days', false, now() + interval '60 days');

-- Create storage bucket for passport photos
INSERT INTO storage.buckets (id, name, public) VALUES ('passport-photos', 'passport-photos', true);

-- Storage policies for passport photos
CREATE POLICY "Anyone can upload passport photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'passport-photos');

CREATE POLICY "Anyone can view passport photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'passport-photos');

CREATE POLICY "Admins can delete passport photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'passport-photos' AND public.is_admin(auth.uid()));