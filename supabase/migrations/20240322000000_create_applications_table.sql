-- Begin transaction
BEGIN;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Volunteers can view their own applications" ON applications;
    DROP POLICY IF EXISTS "Organizations can view applications for their opportunities" ON applications;
    DROP POLICY IF EXISTS "Volunteers can create applications" ON applications;
    DROP POLICY IF EXISTS "Organizations can update applications for their opportunities" ON applications;
    DROP POLICY IF EXISTS "Organizations can delete applications for their opportunities" ON applications;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Create applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL DEFAULT 'pending',
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better query performance
-- Using IF NOT EXISTS to avoid errors if indexes already exist
CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id ON applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_volunteer_id ON applications(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Enable Row Level Security (RLS)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policies for applications table
-- Allow volunteers to view their own applications
CREATE POLICY "Volunteers can view their own applications"
    ON applications FOR SELECT
    USING (auth.uid() = volunteer_id);

-- Allow organizations to view applications for their opportunities
CREATE POLICY "Organizations can view applications for their opportunities"
    ON applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM opportunities
            WHERE opportunities.id = applications.opportunity_id
            AND opportunities.created_by = auth.uid()
        )
    );

-- Allow volunteers to create applications
CREATE POLICY "Volunteers can create applications"
    ON applications FOR INSERT
    WITH CHECK (
        auth.uid() = volunteer_id
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'volunteer'
        )
    );

-- Allow organizations to update applications for their opportunities
CREATE POLICY "Organizations can update applications for their opportunities"
    ON applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM opportunities
            WHERE opportunities.id = applications.opportunity_id
            AND opportunities.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM opportunities
            WHERE opportunities.id = applications.opportunity_id
            AND opportunities.created_by = auth.uid()
        )
    );

-- Allow organizations to delete applications for their opportunities
CREATE POLICY "Organizations can delete applications for their opportunities"
    ON applications FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM opportunities
            WHERE opportunities.id = applications.opportunity_id
            AND opportunities.created_by = auth.uid()
        )
    );

-- Add comment to the table for documentation
COMMENT ON TABLE applications IS 'Stores volunteer applications for opportunities';

-- Commit transaction
COMMIT; 