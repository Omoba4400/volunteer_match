import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, PostgrestError, Session } from "@supabase/supabase-js";

// Define user types
export type UserRole = "volunteer" | "organization";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar_url?: string;
  profile_complete: boolean;
}

export interface VolunteerProfile {
  skills: string[];
  interests: string[];
  bio: string;
  location: string;
  availability: string[];
}

export interface OrganizationProfile {
  description: string;
  location: string;
  website: string;
  causes: string[];
  logo?: string;
}

// Define context type
interface AuthContextType {
  user: User | null;
  volunteerProfile: VolunteerProfile | null;
  organizationProfile: OrganizationProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateVolunteerProfile: (profile: VolunteerProfile) => Promise<void>;
  updateOrganizationProfile: (profile: OrganizationProfile) => Promise<void>;
  updateEmail: (newEmail: string, password: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  loading: boolean;
  session: Session | null;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create provider
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile | null>(null);
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile | null>(null);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession);
        setSession(currentSession);
        if (currentSession?.user) {
          fetchUserData(currentSession.user.id);
        } else {
          setUser(null);
          setVolunteerProfile(null);
          setOrganizationProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session:', currentSession);
      setSession(currentSession);
      if (currentSession?.user) {
        fetchUserData(currentSession.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      console.log('Fetching user data for:', userId);
      // Get user profile from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!profileData) {
        console.log('No profile found for user:', userId);
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('Found profile:', profileData);
      // Set user data
      const userData: User = {
        id: profileData.id,
        name: profileData.name || '',
        email: session?.user?.email || '',
        role: profileData.role as UserRole,
        profile_complete: profileData.profile_complete || false,
        avatar_url: profileData.profile_picture_url
      };

      setUser(userData);

      // If profile is complete, fetch the appropriate role-specific profile
      if (profileData.profile_complete) {
        if (profileData.role === 'volunteer') {
          await fetchVolunteerProfile(userId);
        } else if (profileData.role === 'organization') {
          await fetchOrganizationProfile(userId);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteerProfile = async (userId: string) => {
    try {
      console.log('Fetching volunteer profile for user:', userId);
      const { data, error } = await supabase
        .from('volunteer_profiles')
        .select('skills, interests, bio, location, availability')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching volunteer profile:', error);
        return;
      }
      
      console.log('Volunteer profile data:', data);
      
      if (data) {
        setVolunteerProfile({
          skills: data.skills || [],
          interests: data.interests || [],
          bio: data.bio || '',
          location: data.location || '',
          availability: data.availability || []
        });
      } else {
        // If no profile exists yet, set to null
        console.log('No volunteer profile found for user:', userId);
        setVolunteerProfile(null);
      }
    } catch (error) {
      console.error('Error in fetchVolunteerProfile:', error);
      setVolunteerProfile(null);
    }
  };

  const fetchOrganizationProfile = async (userId: string) => {
    try {
      console.log('Fetching organization profile for user:', userId);
      const { data, error } = await supabase
        .from('organization_profiles')
        .select('description, location, website, causes, logo')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching organization profile:', error);
        return;
      }
      
      console.log('Organization profile data:', data);
      
      if (data) {
        setOrganizationProfile({
          description: data.description || '',
          location: data.location || '',
          website: data.website || '',
          causes: data.causes || [],
          logo: data.logo || ''
        });
      } else {
        console.log('No organization profile found for user:', userId);
        setOrganizationProfile(null);
      }
    } catch (error) {
      console.error('Error in fetchOrganizationProfile:', error);
      setOrganizationProfile(null);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }

      // Immediately fetch user data after successful login
      if (data.user) {
        console.log('Login successful, fetching user data:', data.user.id);
        await fetchUserData(data.user.id);
      }

      console.log('Login and data fetch complete:', { session: data.session, user: data.user });
      toast.success(`Welcome back!`);
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof AuthError) {
        toast.error(error.message);
        throw error;
      }
      toast.error("Failed to login");
      throw new Error("Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setLoading(true);
    try {
      console.log('Registering new user:', { name, email, role });
      // Create user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) {
        throw error;
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            name,
            role,
            profile_complete: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (profileError) {
          throw profileError;
        }
      }

      console.log('Registration successful');
      toast.success(`Welcome, ${name}! Please complete your profile.`);
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof AuthError || error instanceof PostgrestError) {
        toast.error(error.message);
        throw error;
      }
      toast.error("Failed to register");
      throw new Error("Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("You've been logged out successfully");
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(error.message);
        throw error;
      }
      toast.error("Failed to logout");
      throw new Error("Failed to logout");
    }
  };

  const updateVolunteerProfile = async (profile: VolunteerProfile) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Insert the volunteer profile
      const { error: profileError } = await supabase
        .from('volunteer_profiles')
        .upsert({
          id: user.id,
          skills: profile.skills,
          interests: profile.interests,
          bio: profile.bio,
          location: profile.location,
          availability: profile.availability,
          updated_at: new Date().toISOString()
        });
      
      if (profileError) throw profileError;
      
      // Update the profile_complete flag
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_complete: true, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setVolunteerProfile(profile);
      setUser({...user, profile_complete: true});
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof PostgrestError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const updateOrganizationProfile = async (profile: OrganizationProfile) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Insert the organization profile
      const { error: profileError } = await supabase
        .from('organization_profiles')
        .upsert({
          id: user.id,
          description: profile.description,
          location: profile.location,
          website: profile.website,
          causes: profile.causes,
          logo: profile.logo,
          updated_at: new Date().toISOString()
        });
      
      if (profileError) throw profileError;
      
      // Update the profile_complete flag
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_complete: true, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setOrganizationProfile(profile);
      setUser({...user, profile_complete: true});
      
      toast.success("Organization profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof PostgrestError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const updateEmail = async (newEmail: string, password: string): Promise<void> => {
    try {
      setLoading(true);

      // First verify the password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: password
      });

      if (signInError) throw signInError;

      // Update email
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      toast.success("Email updated successfully! Please check your new email for verification.");
    } catch (error) {
      console.error('Error updating email:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update email");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setLoading(true);

      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });

      if (signInError) throw signInError;

      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast.success("Password updated successfully!");
    } catch (error) {
      console.error('Error updating password:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update password");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (password: string): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);

      // First verify the password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: password
      });

      if (signInError) throw signInError;

      // Delete profile data based on role
      if (user.role === 'volunteer') {
        const { error: volunteerError } = await supabase
          .from('volunteer_profiles')
          .delete()
          .eq('id', user.id);
        if (volunteerError) throw volunteerError;
      } else if (user.role === 'organization') {
        const { error: orgError } = await supabase
          .from('organization_profiles')
          .delete()
          .eq('id', user.id);
        if (orgError) throw orgError;
      }

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      if (profileError) throw profileError;

      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;

      // Sign out
      await logout();
      
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete account");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    volunteerProfile,
    organizationProfile,
    login,
    register,
    logout,
    updateVolunteerProfile,
    updateOrganizationProfile,
    updateEmail,
    updatePassword,
    deleteAccount,
    loading,
    session
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create hook for using context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
