-- Add profile picture column to profiles table
ALTER TABLE profiles ADD COLUMN profile_picture_url TEXT;

-- Add cause type to opportunities table
ALTER TABLE opportunities ADD COLUMN cause_type TEXT;

-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create admin_approvals table
CREATE TABLE admin_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Add RLS policies for admin_approvals
ALTER TABLE admin_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage approvals"
    ON admin_approvals FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create function to notify users
CREATE OR REPLACE FUNCTION notify_user(
    p_user_id UUID,
    p_opportunity_id UUID,
    p_type TEXT,
    p_message TEXT
) RETURNS void AS $$
BEGIN
    INSERT INTO notifications (user_id, opportunity_id, type, message)
    VALUES (p_user_id, p_opportunity_id, p_type, p_message);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 