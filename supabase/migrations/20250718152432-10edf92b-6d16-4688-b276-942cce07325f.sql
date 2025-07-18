-- Fix RLS policy issue for projects table
-- Since this appears to be a public carbon offset marketplace,
-- we'll allow public read access and public insert for project creation

-- Enable RLS on projects table (if not already enabled)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all projects
CREATE POLICY "Projects are publicly viewable" 
ON public.projects 
FOR SELECT 
USING (true);

-- Allow public insert for creating new projects
CREATE POLICY "Anyone can create projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (true);

-- Allow public updates to projects (optional - you may want to restrict this later)
CREATE POLICY "Anyone can update projects" 
ON public.projects 
FOR UPDATE 
USING (true);

-- Allow public delete (optional - you may want to restrict this later)
CREATE POLICY "Anyone can delete projects" 
ON public.projects 
FOR DELETE 
USING (true);