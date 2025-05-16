import { useOpportunity } from "@/contexts/OpportunityContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Calendar, Mail, User, CheckCircle } from "lucide-react";

const VolunteerDashboard = () => {
  const { userApplications, opportunities, messages } = useOpportunity();
  const { user, volunteerProfile } = useAuth();
  
  // Filter opportunities by interests if profile exists
  const recommendedOpportunities = volunteerProfile?.interests 
    ? opportunities
        .filter(opp => 
          opp.causes?.some(cause => 
            volunteerProfile.interests?.includes(cause)
          )
        )
        .slice(0, 3)
    : [];
  
  // Get applied opportunities details
  const appliedOpportunities = userApplications.map(app => {
    const opp = opportunities.find(o => o.id === app.opportunity_id);
    return { 
      ...app, 
      title: opp ? opp.title : "Unknown Opportunity",
      organization: "Organization Name" // In a real app, we'd fetch the org name
    };
  });
  
  // Get accepted applications
  const acceptedApplications = appliedOpportunities.filter(app => app.status === "accepted");
  
  // Get unread messages
  const unreadMessages = messages.filter(msg => !msg.read && msg.receiverId === user?.id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* Profile Summary */}
      <Card className="md:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle>Welcome back, {user?.name}!</CardTitle>
          <CardDescription>
            Here's what's happening with your volunteering.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-muted p-4 rounded-lg flex items-center space-x-4">
              <div className="rounded-full bg-volunteer-primary p-2">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied Opportunities</p>
                <p className="text-2xl font-bold">{appliedOpportunities.length}</p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg flex items-center space-x-4">
              <div className="rounded-full bg-volunteer-primary p-2">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accepted Applications</p>
                <p className="text-2xl font-bold">{acceptedApplications.length}</p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg flex items-center space-x-4">
              <div className="rounded-full bg-volunteer-primary p-2">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
                <p className="text-2xl font-bold">{unreadMessages.length}</p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg flex items-center space-x-4">
              <div className="rounded-full bg-volunteer-primary p-2">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Skills</p>
                <p className="text-2xl font-bold">{volunteerProfile?.skills?.length || 0}</p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg flex items-center space-x-4">
              <div className="rounded-full bg-volunteer-primary p-2">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recommended</p>
                <p className="text-2xl font-bold">{recommendedOpportunities.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accepted Applications */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Accepted Applications</CardTitle>
              <CardDescription>
                Organizations that have accepted your applications.
              </CardDescription>
            </div>
            <Link to="/applications/accepted">
              <Button variant="outline" className="flex items-center gap-2">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {acceptedApplications.length > 0 ? (
            <div className="space-y-4">
              {acceptedApplications.slice(0, 3).map((app) => (
                <div key={app.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{app.title}</p>
                    <p className="text-sm text-muted-foreground">{app.organization}</p>
                    <p className="text-sm text-muted-foreground">
                      Accepted on: {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link to={`/opportunities/${app.opportunity_id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                    <Link to="/messages">
                      <Button size="sm" className="bg-volunteer-primary hover:bg-volunteer-primary/90">
                        Message
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {acceptedApplications.length > 3 && (
                <div className="text-center pt-4">
                  <Link to="/applications/accepted">
                    <Button variant="link" className="text-volunteer-primary">
                      View All Accepted Applications
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No accepted applications yet.</p>
              <Link to="/opportunities">
                <Button className="mt-4 bg-volunteer-primary hover:bg-volunteer-primary/90">
                  Browse Opportunities
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applied Opportunities */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
          <CardDescription>
            Track the status of your volunteer applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appliedOpportunities.length > 0 ? (
            <div className="space-y-4">
              {appliedOpportunities.map((app) => (
                <div key={app.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{app.title}</p>
                    <p className="text-sm text-muted-foreground">{app.organization}</p>
                  </div>
                  <Badge 
                    variant={app.status === "accepted" 
                      ? "default" 
                      : app.status === "rejected" 
                        ? "destructive" 
                        : "outline"
                    }
                  >
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You haven't applied to any opportunities yet.</p>
              <Link to="/opportunities">
                <Button className="mt-4 bg-volunteer-primary hover:bg-volunteer-primary/90">
                  Browse Opportunities
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended for You</CardTitle>
          <CardDescription>
            Based on your skills and interests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendedOpportunities.length > 0 ? (
            <div className="space-y-4">
              {recommendedOpportunities.map((opp) => (
                <div key={opp.id} className="border-b pb-3">
                  <p className="font-medium">{opp.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{opp.description}</p>
                  <Link to={`/opportunities/${opp.id}`}>
                    <Button variant="link" className="p-0 h-auto text-volunteer-primary">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
              <Link to="/opportunities" className="block text-center">
                <Button variant="outline" className="w-full">
                  See More
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                {volunteerProfile
                  ? "No recommended opportunities found."
                  : "Complete your profile to see recommendations."}
              </p>
              {!volunteerProfile && (
                <Link to="/profile/volunteer/edit">
                  <Button className="mt-4 bg-volunteer-primary hover:bg-volunteer-primary/90">
                    Complete Profile
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages Preview */}
      <Card className="md:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>
              Stay in touch with organizations.
            </CardDescription>
          </div>
          <Link to="/messages">
            <Button variant="outline">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {unreadMessages.length > 0 ? (
            <div className="space-y-4">
              {unreadMessages.slice(0, 3).map((msg) => (
                <div key={msg.id} className="flex items-start space-x-4 border-b pb-4">
                  <Badge variant="outline" className="mt-1">
                    New
                  </Badge>
                  <div>
                    <p className="font-medium">From: Organization</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{msg.content}</p>
                    <Link to="/messages">
                      <Button variant="link" className="p-0 h-auto text-volunteer-primary">
                        Reply
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              No unread messages at this time.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VolunteerDashboard;
