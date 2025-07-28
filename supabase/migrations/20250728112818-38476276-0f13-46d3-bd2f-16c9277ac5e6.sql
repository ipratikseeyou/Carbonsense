-- Fix RLS policies for carbon_data and purchases tables

-- Create RLS policies for carbon_data table
CREATE POLICY "Allow all operations on carbon_data" 
ON public.carbon_data 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create RLS policies for purchases table  
CREATE POLICY "Allow all operations on purchases"
ON public.purchases
FOR ALL
USING (true)
WITH CHECK (true);