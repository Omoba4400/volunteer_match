-- Create a function to delete an opportunity and its related records
CREATE OR REPLACE FUNCTION delete_opportunity(opportunity_id UUID, user_id UUID)
RETURNS void AS $$
BEGIN
    -- Verify the user is an organization and owns the opportunity
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id
        AND role = 'organization'
    ) THEN
        RAISE EXCEPTION 'Only organizations can delete opportunities';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM opportunities
        WHERE id = opportunity_id
        AND created_by = user_id
    ) THEN
        RAISE EXCEPTION 'Opportunity not found or you do not have permission to delete it';
    END IF;

    -- Delete admin approvals
    DELETE FROM admin_approvals WHERE opportunity_id = $1;

    -- Delete the opportunity
    DELETE FROM opportunities WHERE id = $1 AND created_by = $2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 