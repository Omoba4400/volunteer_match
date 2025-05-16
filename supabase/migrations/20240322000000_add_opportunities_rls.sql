-- Enable RLS on opportunities table
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Allow organizations to manage their own opportunities
CREATE POLICY "Organizations can manage their own opportunities"
    ON opportunities
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'organization'
            AND opportunities.created_by = auth.uid()
        )
    );

-- Allow everyone to view active opportunities
CREATE POLICY "Everyone can view opportunities"
    ON opportunities
    FOR SELECT
    USING (true); 