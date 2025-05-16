import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Tables = Database['public']['Tables'];
type OpportunityRow = Tables['opportunities']['Row'];
type OpportunityInsert = Tables['opportunities']['Insert'];
type OpportunityUpdate = Tables['opportunities']['Update'];

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  cause_type?: string;
  image_url?: string;
  image_path?: string;
  causes: string[];
  status: string;
}

export interface Application {
  id: string;
  opportunity_id: string;
  volunteer_id: string;
  status: "pending" | "accepted" | "rejected";
  message: string;
  created_at: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
  senderName?: string;
  receiverName?: string;
  senderRole?: string;
  receiverRole?: string;
}

interface MessageWithProfiles {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  read: boolean;
  created_at: string;
  sender: {
    name: string;
    role: string;
  } | null;
  receiver: {
    name: string;
    role: string;
  } | null;
}

interface MessageResponse {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: {
    name: string;
    role: string;
  };
  receiver?: {
    name: string;
    role: string;
  };
}

interface OpportunityContextType {
  opportunities: OpportunityRow[];
  userApplications: Application[];
  messages: Message[];
  createOpportunity: (opportunityData: OpportunityInsert) => Promise<OpportunityRow>;
  updateOpportunity: (id: string, opportunityData: OpportunityUpdate) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;
  approveOpportunity: (id: string) => Promise<void>;
  rejectOpportunity: (id: string) => Promise<void>;
  applyToOpportunity: (opportunityId: string, message: string) => void;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  acceptApplication: (applicationId: string) => Promise<void>;
  rejectApplication: (applicationId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const OpportunityContext = createContext<OpportunityContextType | undefined>(undefined);

export const OpportunityProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<OpportunityRow[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch opportunities when user changes
  useEffect(() => {
    console.log('Setting up opportunities subscription...');
    fetchOpportunities();
    
    // Set up real-time subscription for opportunities
    const channel = supabase
      .channel('public:opportunities')
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'opportunities' },
        (payload) => {
          console.log('Received DELETE event:', payload);
          // Type assertion since we know the structure of the payload
          const deletedId = (payload.old as { id: string })?.id;
          if (deletedId) {
            console.log('Removing opportunity from state:', deletedId);
            setOpportunities(prev => {
              const filtered = prev.filter(opp => opp.id !== deletedId);
              console.log('State after DELETE:', filtered.length, 'opportunities remaining');
              return filtered;
            });
          }
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'opportunities' },
        () => {
          console.log('Received INSERT event, refreshing opportunities...');
          fetchOpportunities();
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'opportunities' },
        () => {
          console.log('Received UPDATE event, refreshing opportunities...');
          fetchOpportunities();
        }
      );

    // Subscribe and log any subscription errors
    channel.subscribe(async (status) => {
      console.log('Subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to opportunities changes');
        // Fetch initial data after subscription
        await fetchOpportunities();
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Error subscribing to opportunities changes');
        toast.error('Error connecting to real-time updates');
      }
    });
      
    return () => {
      console.log('Cleaning up opportunities subscription...');
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Fetch opportunities from Supabase
  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching opportunities:', error);
        throw error;
      }

      if (data) {
        setOpportunities(data);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages when user changes
  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }
    
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages', filter: `sender_id=eq.${user.id}` },
        () => {
          fetchMessages();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        () => {
          fetchMessages();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  // Fetch messages from Supabase
  const fetchMessages = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Fetching messages for user:', user.id);
      
      // First fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });
        
      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      if (!messagesData || messagesData.length === 0) {
        console.log('No messages found');
        setMessages([]);
        return;
      }

      // Get unique user IDs from messages
      const userIds = Array.from(new Set([
        ...messagesData.map(msg => msg.sender_id),
        ...messagesData.map(msg => msg.receiver_id)
      ]));

      console.log('Fetching profiles for users:', userIds);

      // Fetch all profiles in a single query
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Create a map for quick profile lookups
      const profilesMap = new Map(
        profiles?.map(profile => [profile.id, profile]) || []
      );

      console.log('Profiles map:', Object.fromEntries(profilesMap));

      // Format messages with user information
      const formattedMessages: Message[] = messagesData.map(msg => {
        const sender = profilesMap.get(msg.sender_id);
        const receiver = profilesMap.get(msg.receiver_id);
        
        return {
          id: msg.id,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          content: msg.content,
          read: msg.read || false,
          createdAt: msg.created_at,
          senderName: sender?.name || 'Unknown User',
          receiverName: receiver?.name || 'Unknown User',
          senderRole: sender?.role || 'unknown',
          receiverRole: receiver?.role || 'unknown'
        };
      });
      
      console.log('Formatted messages:', formattedMessages);
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications from Supabase on mount and when user changes
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*');

        if (error) {
          throw error;
        }

        if (data) {
          setApplications(data);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Failed to fetch applications');
      }
    };

    fetchApplications();
  }, [user]);

  // Get only the applications related to the current user
  const userApplications = useMemo(() => {
    if (!user) return [];
    
    return applications.filter(app => {
      if (user.role === "volunteer") {
        return app.volunteer_id === user.id;
      } else if (user.role === "organization") {
        const opportunity = opportunities.find(opp => opp.id === app.opportunity_id);
        return opportunity?.created_by === user.id;
      }
      return false;
    });
  }, [applications, opportunities, user]);

  // Create a new opportunity
  const createOpportunity = async (opportunityData: OpportunityInsert): Promise<OpportunityRow> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ensure required fields are present
      if (!opportunityData.title) throw new Error('Title is required');
      if (!opportunityData.description) throw new Error('Description is required');
      if (!opportunityData.location) throw new Error('Location is required');

      // Prepare the data for insert
      const insertData: OpportunityInsert = {
        title: opportunityData.title.trim(),
        description: opportunityData.description.trim(),
        location: opportunityData.location.trim(),
        created_by: user.id,
        causes: Array.isArray(opportunityData.causes) ? opportunityData.causes.filter(Boolean) : [],
        status: 'active' // Set default status to active
      };

      // Only add optional fields if they have values
      if (opportunityData.image_url) insertData.image_url = opportunityData.image_url;
      if (opportunityData.image_path) insertData.image_path = opportunityData.image_path;
      if (opportunityData.cause_type) insertData.cause_type = opportunityData.cause_type;

      console.log('Attempting to insert opportunity with data:', JSON.stringify(insertData, null, 2));

      const { data, error } = await supabase
        .from('opportunities')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Database error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          attemptedData: insertData
        });
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      console.log('Successfully created opportunity:', JSON.stringify(data, null, 2));

      // Create admin approval record - only if admin exists
      try {
        const { data: adminData, error: adminError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin')
          .single();

        if (!adminError && adminData) {
          const { error: approvalError } = await supabase
            .from('admin_approvals')
            .insert({
              opportunity_id: data.id,
              admin_id: adminData.id,
              status: 'pending',
              created_at: new Date().toISOString()
            });

          if (approvalError) {
            console.error('Error creating admin approval:', approvalError);
          }
        } else {
          console.log('No admin found, skipping admin approval creation');
        }
      } catch (adminError) {
        console.error('Error finding admin:', adminError);
      }

      // Fetch fresh data instead of updating state directly
      await fetchOpportunities();
      
      return data;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred while creating the opportunity');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply to an opportunity
  const applyToOpportunity = async (opportunityId: string, message: string): Promise<void> => {
    if (!user) {
      console.error('No user object available');
      toast.error("You must be logged in to apply");
      return;
    }

    if (user.role !== "volunteer") {
      console.error('Invalid user role:', user.role);
      toast.error("Only volunteers can apply to opportunities");
      return;
    }

    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) {
      console.error('Opportunity not found:', opportunityId);
      toast.error("Opportunity not found");
      return;
    }

    try {
      // Get current auth state
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log('Auth state:', {
        hasUser: !!authData?.user,
        userId: authData?.user?.id,
        error: authError
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast.error("Authentication error. Please log in again.");
        return;
      }

      if (!authData?.user) {
        console.error('No authenticated user found');
        toast.error("Please log in again to continue");
        return;
      }

      // Verify session is active
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session state:', {
        hasSession: !!session,
        sessionUser: session?.user?.id,
        error: sessionError
      });

      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error("Session error. Please log in again.");
        return;
      }

      if (!session) {
        console.error('No active session found');
        toast.error("Your session has expired. Please log in again.");
        return;
      }

      // Verify session matches user
      if (session.user.id !== user.id) {
        console.error('Session user mismatch:', {
          sessionUserId: session.user.id,
          contextUserId: user.id
        });
        toast.error("Session mismatch. Please log in again.");
        return;
      }

      console.log('Submitting application:', { 
        opportunityId, 
        volunteerId: user.id, 
        message,
        authStatus: {
          hasSession: !!session,
          sessionUser: session.user.id,
          contextUser: user.id
        }
      });

      // First check if an application already exists
      const { data: existingApp, error: checkError } = await supabase
        .from('applications')
        .select('id, status')
        .eq('opportunity_id', opportunityId)
        .eq('volunteer_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing application:', checkError);
        throw checkError;
      }

      if (existingApp) {
        console.log('Existing application found:', existingApp);
        toast.error("You have already applied to this opportunity");
        return;
      }

      const now = new Date().toISOString();

      // Create application in Supabase
      const { data, error } = await supabase
        .from('applications')
        .insert({
          opportunity_id: opportunityId,
          volunteer_id: user.id,
          status: 'pending',
          message: message,
          created_at: now
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error submitting application:', {
          error,
          context: {
            opportunityId,
            volunteerId: user.id,
            sessionExists: !!session,
            userRole: user.role,
            errorCode: error.code,
            errorMessage: error.message,
            errorDetails: error.details
          }
        });
        throw error;
      }

      if (data) {
        console.log('Application submitted successfully:', data);
        
        // Update local state
        setApplications(prev => [...prev, data as Application]);
        
        // Create a notification for the organization
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: opportunity.created_by,
            opportunity_id: opportunityId,
            type: 'application',
            message: `${user.name || 'A volunteer'} has applied to your opportunity "${opportunity.title}"`,
            created_at: now,
            is_read: false
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
          // Log the full error details
          console.error('Notification error details:', {
            code: notificationError.code,
            message: notificationError.message,
            details: notificationError.details,
            hint: notificationError.hint
          });
        }
        
        toast.success("Application submitted successfully!");
      }
    } catch (error) {
      console.error('Error in applyToOpportunity:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('auth')) {
          toast.error("Authentication error. Please log in again.");
        } else if (error.message.includes('duplicate')) {
          toast.error("You have already applied to this opportunity");
        } else if (error.message.includes('foreign key')) {
          toast.error("Invalid opportunity or volunteer ID");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
      
      throw error;
    }
  };
  
  // Send message
  const sendMessage = async (receiverId: string, content: string): Promise<void> => {
    if (!user) {
      toast.error("You must be logged in to send messages");
      return;
    }
    
    try {
      const now = new Date().toISOString();
      
      // First fetch the receiver's profile
      const { data: receiverProfile, error: profileError } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', receiverId)
        .single();
        
      if (profileError) {
        console.error('Error fetching receiver profile:', profileError);
        throw profileError;
      }
      
      // Insert the message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: content,
          sender_id: user.id,
          receiver_id: receiverId,
          read: false,
          created_at: now
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Format the new message with user information
        const newMessage: Message = {
          id: data.id,
          senderId: data.sender_id,
          receiverId: data.receiver_id,
          content: data.content,
          read: data.read,
          createdAt: data.created_at,
          senderName: user.name,
          senderRole: user.role,
          receiverName: receiverProfile.name || 'Unknown User',
          receiverRole: receiverProfile.role || 'unknown'
        };
        
        setMessages(prev => [...prev, newMessage]);

        // Create a notification for the message recipient
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: receiverId,
            type: 'message',
            message: `New message from ${user.name || (user.role === 'volunteer' ? 'Volunteer' : 'Organization')}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
            created_at: now,
            is_read: false
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
          // Log the full error details
          console.error('Notification error details:', {
            code: notificationError.code,
            message: notificationError.message,
            details: notificationError.details,
            hint: notificationError.hint
          });
        }

        toast.success("Message sent successfully!");
      }
    } catch (error: unknown) {
      console.error('Error sending message:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to send message");
      }
    }
  };
  
  // Mark message as read
  const markMessageAsRead = async (messageId: string): Promise<void> => {
    if (!user) {
      toast.error("You must be logged in to mark messages as read");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
        .eq('receiver_id', user.id);
      
      if (error) throw error;
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (error: unknown) {
      console.error('Error marking message as read:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to mark message as read");
      }
    }
  };
  
  // Update opportunity
  const updateOpportunity = async (id: string, opportunityData: OpportunityUpdate): Promise<void> => {
    try {
      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .update(opportunityData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setOpportunities(prev => 
        prev.map(opp => opp.id === id ? { ...opp, ...opportunity } : opp)
      );
    } catch (error: unknown) {
      console.error('Error updating opportunity:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred while updating the opportunity');
    }
  };

  // Delete opportunity
  const deleteOpportunity = async (id: string): Promise<void> => {
    if (!user || user.role !== "organization") {
      toast.error("Only organizations can delete opportunities");
      return;
    }
    
    setLoading(true);
    try {
      console.log('Starting deletion process for opportunity:', id);
      console.log('Current user:', { id: user.id, role: user.role });

      // First, get the opportunity and verify ownership
      const { data: opportunity, error: fetchError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching opportunity:', fetchError);
        throw fetchError;
      }

      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      console.log('Found opportunity:', opportunity);

      // Verify ownership explicitly
      if (opportunity.created_by !== user.id) {
        console.error('Permission denied - User does not own this opportunity', {
          opportunityCreator: opportunity.created_by,
          currentUser: user.id
        });
        throw new Error('You do not have permission to delete this opportunity');
      }

      // Delete admin approvals first
      console.log('Deleting admin approvals...');
      const { error: approvalsError } = await supabase
        .from('admin_approvals')
        .delete()
        .eq('opportunity_id', id);

      if (approvalsError) {
        console.error('Error deleting admin approvals:', approvalsError);
        // Don't throw here, continue with deletion
      }

      // Delete the image if it exists
      if (opportunity.image_path) {
        console.log('Deleting image from storage:', opportunity.image_path);
        const { error: storageError } = await supabase.storage
          .from('opportunity_images')
          .remove([opportunity.image_path]);

        if (storageError) {
          console.error('Error deleting image:', storageError);
          // Don't throw here, continue with opportunity deletion
        }
      }

      // Delete the opportunity
      console.log('Deleting opportunity record...');
      const { error: deleteError } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error(`Failed to delete opportunity: ${deleteError.message}`);
      }

      // Verify the deletion
      const { data: checkData } = await supabase
        .from('opportunities')
        .select('id')
        .eq('id', id)
        .maybeSingle();

      if (checkData) {
        console.error('Opportunity still exists after deletion');
        throw new Error('Failed to delete opportunity - still exists in database');
      }

      // Update local state
      setOpportunities(prev => {
        const filtered = prev.filter(opp => opp.id !== id);
        console.log('Local state updated:', {
          before: prev.length,
          after: filtered.length,
          removed: prev.length - filtered.length
        });
        return filtered;
      });

      toast.success("Opportunity deleted successfully!");

    } catch (error: unknown) {
      console.error('Error in deleteOpportunity:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete opportunity");
      }
      // Refresh opportunities to ensure UI is in sync with backend
      await fetchOpportunities();
    } finally {
      setLoading(false);
    }
  };

  // Approve opportunity
  const approveOpportunity = async (id: string): Promise<void> => {
    if (!user || user.role !== "organization") {
      toast.error("Only organizations can approve opportunities");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({})
        .eq('id', id)
        .eq('created_by', user.id);
      
      if (error) throw error;
      
      setOpportunities(prev => prev.map(opp => 
        opp.id === id ? { ...opp } : opp
      ));
      toast.success("Opportunity approved successfully!");
    } catch (error: unknown) {
      console.error('Error approving opportunity:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to approve opportunity");
      }
    }
  };

  const rejectOpportunity = async (id: string) => {
    if (!user || user.role !== "organization") {
      toast.error("Only organizations can reject opportunities");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({})
        .eq('id', id)
        .eq('created_by', user.id);
      
      if (error) throw error;
      
      setOpportunities(prev => prev.map(opp => 
        opp.id === id ? { ...opp } : opp
      ));
      toast.success("Opportunity rejected successfully!");
    } catch (error) {
      console.error('Error rejecting opportunity:', error);
      toast.error("Failed to reject opportunity");
    }
  };

  // Accept application
  const acceptApplication = async (applicationId: string): Promise<void> => {
    if (!user || user.role !== "organization") {
      toast.error("Only organizations can accept applications");
      return;
    }

    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        toast.error("Application not found");
        return;
      }

      // Verify the organization owns the opportunity
      const opportunity = opportunities.find(opp => opp.id === application.opportunity_id);
      if (!opportunity || opportunity.created_by !== user.id) {
        toast.error("You don't have permission to manage this application");
        return;
      }

      const now = new Date().toISOString();

      // Update application status in Supabase
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', applicationId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: "accepted" } : app
      ));

      // Create notification for the volunteer
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: application.volunteer_id,
          opportunity_id: application.opportunity_id,
          type: 'application_accepted',
          message: `Your application for "${opportunity.title}" has been accepted! The organization will contact you with next steps.`,
          created_at: now,
          is_read: false
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Log the full error details
        console.error('Notification error details:', {
          code: notificationError.code,
          message: notificationError.message,
          details: notificationError.details,
          hint: notificationError.hint
        });
      }

      toast.success("Application accepted successfully!");
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error("Failed to accept application");
    }
  };

  // Reject application
  const rejectApplication = async (applicationId: string): Promise<void> => {
    if (!user || user.role !== "organization") {
      toast.error("Only organizations can reject applications");
      return;
    }

    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        toast.error("Application not found");
        return;
      }

      // Verify the organization owns the opportunity
      const opportunity = opportunities.find(opp => opp.id === application.opportunity_id);
      if (!opportunity || opportunity.created_by !== user.id) {
        toast.error("You don't have permission to manage this application");
        return;
      }

      const now = new Date().toISOString();

      // Update application status in Supabase
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: "rejected" } : app
      ));

      // Create notification for the volunteer
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: application.volunteer_id,
          opportunity_id: application.opportunity_id,
          type: 'application_rejected',
          message: `Your application for "${opportunity.title}" has been reviewed. Unfortunately, the organization has decided not to proceed with your application at this time.`,
          created_at: now,
          is_read: false
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Log the full error details
        console.error('Notification error details:', {
          code: notificationError.code,
          message: notificationError.message,
          details: notificationError.details,
          hint: notificationError.hint
        });
      }

      toast.success("Application rejected successfully!");
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error("Failed to reject application");
    }
  };

  const value = {
    opportunities,
    userApplications,
    messages,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    approveOpportunity,
    rejectOpportunity,
    applyToOpportunity,
    sendMessage,
    markMessageAsRead,
    acceptApplication,
    rejectApplication,
    loading,
    error
  };

  return <OpportunityContext.Provider value={value}>{children}</OpportunityContext.Provider>;
};

// Create hook for using context
const useOpportunity = () => {
  const context = useContext(OpportunityContext);
  if (context === undefined) {
    throw new Error("useOpportunity must be used within an OpportunityProvider");
  }
  return context;
};

export { useOpportunity };
export default OpportunityProvider;
