-- Begin transaction
BEGIN;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

-- Create policies for notifications table
-- Allow users to insert notifications
CREATE POLICY "Users can insert their own notifications"
    ON notifications FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND (
            -- Allow users to create notifications for themselves
            user_id = auth.uid()
            OR
            -- Allow users to create notifications for opportunity owners
            EXISTS (
                SELECT 1 FROM opportunities
                WHERE opportunities.id = opportunity_id
                AND opportunities.created_by = user_id
            )
        )
    );

-- Allow users to update their own notifications
CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    USING (user_id = auth.uid());

-- Add comment to the table for documentation
COMMENT ON TABLE notifications IS 'Stores user notifications for various events';

-- Commit transaction
COMMIT; 