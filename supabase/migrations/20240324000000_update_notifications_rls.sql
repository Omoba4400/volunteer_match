-- Begin transaction
BEGIN;

-- Drop existing notification policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;

-- Create new policies for notifications
-- Allow users to view notifications where they are the recipient
CREATE POLICY "Users can view notifications as recipient"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Allow organizations to view notifications for their opportunities
CREATE POLICY "Organizations can view notifications for their opportunities"
    ON notifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM opportunities
            WHERE opportunities.id = notifications.opportunity_id
            AND opportunities.created_by = auth.uid()
        )
    );

-- Allow users to update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to insert notifications
CREATE POLICY "Users can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Add comment to the table for documentation
COMMENT ON TABLE notifications IS 'Stores user notifications with RLS policies for recipients and organizations';

-- Commit transaction
COMMIT; 