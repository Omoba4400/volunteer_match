-- Check if causes column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'opportunities'
        AND column_name = 'causes'
    ) THEN
        -- Add causes column as a text array
        ALTER TABLE opportunities ADD COLUMN causes text[] DEFAULT '{}';
    END IF;
END $$; 