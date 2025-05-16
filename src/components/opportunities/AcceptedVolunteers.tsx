import { useOpportunity } from "@/contexts/OpportunityContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AcceptedVolunteersProps {
  opportunityId: string;
}

interface Volunteer {
  id: string;
  name: string;
  applicationId: string;
  applicationDate: string;
}

const AcceptedVolunteers = ({ opportunityId }: AcceptedVolunteersProps) => {
  const { userApplications } = useOpportunity();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  useEffect(() => {
    const fetchVolunteers = async () => {
      // Get accepted applications for this opportunity
      const acceptedApplications = userApplications.filter(
        app => app.opportunity_id === opportunityId && app.status === "accepted"
      );

      // Fetch volunteer profiles for accepted applications
      const volunteerPromises = acceptedApplications.map(async (app) => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', app.volunteer_id)
          .single();

        if (error || !data) {
          console.error('Error fetching volunteer profile:', error);
          return null;
        }

        return {
          id: data.id,
          name: data.name || 'Anonymous Volunteer',
          applicationId: app.id,
          applicationDate: app.created_at
        };
      });

      const volunteerData = await Promise.all(volunteerPromises);
      setVolunteers(volunteerData.filter((v): v is Volunteer => v !== null));
    };

    fetchVolunteers();
  }, [opportunityId, userApplications]);

  if (volunteers.length === 0) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-center text-gray-500">No accepted volunteers yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accepted Volunteers</CardTitle>
        <CardDescription>
          Volunteers who have been accepted for this opportunity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {volunteers.map((volunteer) => (
            <div
              key={volunteer.applicationId}
              className="flex items-center justify-between border-b pb-4 last:border-b-0"
            >
              <div>
                <p className="font-medium">{volunteer.name}</p>
                <p className="text-sm text-gray-500">
                  Accepted on: {new Date(volunteer.applicationDate).toLocaleDateString()}
                </p>
              </div>
              <Link to="/messages">
                <Button size="sm" className="bg-volunteer-primary hover:bg-volunteer-primary/90">
                  <Mail className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AcceptedVolunteers; 