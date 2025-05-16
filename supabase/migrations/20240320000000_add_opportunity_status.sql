-- Add status column to opportunities table
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Update existing opportunities to have 'active' status
UPDATE opportunities SET status = 'active' WHERE status IS NULL;

-- Make status column NOT NULL after setting default values
ALTER TABLE opportunities ALTER COLUMN status SET NOT NULL; 