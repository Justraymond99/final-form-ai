-- Force RLS on profiles table (ensures even table owners must pass RLS)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Force RLS on body_measurements table
ALTER TABLE public.body_measurements FORCE ROW LEVEL SECURITY;

-- Recreate profiles policies to explicitly target authenticated role only
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Recreate body_measurements policies to explicitly target authenticated role only
DROP POLICY IF EXISTS "Users can view their own body measurements" ON public.body_measurements;
DROP POLICY IF EXISTS "Users can insert their own body measurements" ON public.body_measurements;
DROP POLICY IF EXISTS "Users can update their own body measurements" ON public.body_measurements;
DROP POLICY IF EXISTS "Users can delete their own body measurements" ON public.body_measurements;

CREATE POLICY "Users can view their own body measurements" 
ON public.body_measurements FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own body measurements" 
ON public.body_measurements FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body measurements" 
ON public.body_measurements FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own body measurements" 
ON public.body_measurements FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);