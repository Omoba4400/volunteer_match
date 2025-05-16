import { useAuth } from "@/contexts/AuthContext";
import { useOpportunity } from "@/contexts/OpportunityContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import Layout from "@/components/layout/Layout";

const AcceptedApplications = () => {
  const { user } = useAuth();
  const { userApplications, opportunities } = useOpportunity();

  // Filter accepted applications and get opportunity details
  const acceptedApplications = userApplications
    .filter(app => app.status === "accepted")
    .map(app => {
      const opportunity = opportunities.find(opp => opp.id === app.opportunity_id);
      return {
        ...app,
        opportunity
      };
    });

  if (!user || user.role !== "volunteer") {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">This page is only accessible to volunteers.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Accepted Applications</h2>
            <p className="text-gray-600">Organizations that have accepted your applications</p>
          </div>
          <Link to="/opportunities">
            <Button className="bg-volunteer-primary hover:bg-volunteer-primary/90">
              Browse More Opportunities
            </Button>
          </Link>
        </div>

        {acceptedApplications.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-gray-600">No accepted applications yet.</p>
                <Link to="/opportunities">
                  <Button className="mt-4 bg-volunteer-primary hover:bg-volunteer-primary/90">
                    Browse Opportunities
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {acceptedApplications.map(({ opportunity, id, created_at }) => {
              if (!opportunity) return null;
              
              return (
                <Card key={id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {opportunity.location}
                        </CardDescription>
                      </div>
                      {opportunity.image_url && (
                        <img
                          src={opportunity.image_url}
                          alt={opportunity.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {opportunity.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {opportunity.causes?.map((cause, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50">
                            {cause}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Accepted on: {new Date(created_at).toLocaleDateString()}
                      </div>

                      <div className="flex justify-end space-x-2 mt-4">
                        <Link to={`/opportunities/${opportunity.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                        <Link to="/messages">
                          <Button className="bg-volunteer-primary hover:bg-volunteer-primary/90">
                            Message Organization
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AcceptedApplications; 