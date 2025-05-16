import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface VolunteerProfileData {
  id: string;
  skills: string[];
  interests: string[];
  bio: string | null;
  location: string | null;
  availability: string[];
  created_at: string;
  updated_at: string;
}

interface VolunteerProfile {
  id: string;
  name: string;
  role: string;
  profileData?: VolunteerProfileData;
}

interface AcceptedVolunteersProps {
  opportunityId: string;
}

export default function AcceptedVolunteers({ opportunityId }: AcceptedVolunteersProps) {
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchVolunteers = async () => {
    try {
      console.log('Fetching accepted applications for opportunity:', opportunityId);
      
      // First get all accepted applications
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select('volunteer_id')
        .eq('opportunity_id', opportunityId)
        .eq('status', 'accepted');

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        throw applicationsError;
      }

      if (!applications || applications.length === 0) {
        console.log('No accepted applications found');
        setVolunteers([]);
        setLoading(false);
        return;
      }

      console.log('Found accepted applications:', applications);

      // Get volunteer IDs from applications
      const volunteerIds = applications.map(app => app.volunteer_id);

      // Fetch profiles for these volunteers
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .in('id', volunteerIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      if (!profiles) {
        console.log('No profiles found');
        setVolunteers([]);
        setLoading(false);
        return;
      }

      // Fetch volunteer profile data
      const { data: volunteerProfiles, error: volunteerProfilesError } = await supabase
        .from('volunteer_profiles')
        .select('id, skills, interests, bio, location, availability, created_at, updated_at')
        .in('id', volunteerIds);

      if (volunteerProfilesError) {
        console.error('Error fetching volunteer profiles:', volunteerProfilesError);
        // Don't throw here, we can still show basic profile info
      }

      // Combine the data
      const combinedProfiles = profiles.map(profile => ({
        ...profile,
        profileData: volunteerProfiles?.find(vp => vp.id === profile.id)
      }));

      console.log('Combined volunteer profiles:', combinedProfiles);
      setVolunteers(combinedProfiles);

    } catch (error) {
      console.error('Error fetching volunteer profiles:', error);
      toast.error('Failed to load volunteer profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (opportunityId) {
      fetchVolunteers();
    }
  }, [opportunityId]);

  const handleMessage = async (volunteerId: string) => {
    try {
      // Navigate to messages with this volunteer
      console.log('Starting conversation with volunteer:', volunteerId);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  if (loading) {
    return <div>Loading volunteers...</div>;
  }

  if (volunteers.length === 0) {
    return <div>No accepted volunteers yet.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Accepted Volunteers</h3>
      <div className="space-y-4">
        {volunteers.map((volunteer) => (
          <div key={volunteer.id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h4 className="font-medium">{volunteer.name}</h4>
                {volunteer.profileData?.location && (
                  <p className="text-sm text-gray-600">📍 {volunteer.profileData.location}</p>
                )}
                {volunteer.profileData?.bio && (
                  <p className="text-sm text-gray-600">{volunteer.profileData.bio}</p>
                )}
                {volunteer.profileData?.skills && volunteer.profileData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {volunteer.profileData.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Link to={`/messages?userId=${volunteer.id}`}>
                <Button
                  onClick={() => handleMessage(volunteer.id)}
                  variant="outline"
                  size="sm"
                >
                  Message
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 