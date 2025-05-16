import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useOpportunity } from "@/contexts/OpportunityContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Mail, CheckCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const OpportunityDetail = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const { opportunities, userApplications, applyToOpportunity, sendMessage } = useOpportunity();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [directMessage, setDirectMessage] = useState("");
  
  // Find the opportunity
  const opportunity = opportunities.find(opp => opp.id === opportunityId);
  
  // Check if the user has already applied
  const existingApplication = user 
    ? userApplications.find(app => app.opportunity_id === opportunityId && app.volunteer_id === user.id)
    : null;
  
  if (!opportunity) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Opportunity Not Found</h1>
          <p className="mb-6 text-gray-600">The opportunity you're looking for doesn't exist or may have been removed.</p>
          <Link to="/opportunities">
            <Button>Browse Opportunities</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  // Handle apply button click
  const handleApplyClick = () => {
    if (!user) {
      // If not logged in, redirect to login
      toast.error("Please log in to apply for opportunities");
      navigate("/login");
      return;
    }
    
    if (user.role !== "volunteer") {
      toast.error("Only volunteers can apply to opportunities");
      return;
    }
    
    if (!user.profile_complete) {
      toast.error("Please complete your profile before applying");
      navigate("/profile/volunteer/create");
      return;
    }
    
    // Open the application modal
    setIsModalOpen(true);
  };
  
  // Handle submit application
  const handleSubmitApplication = () => {
    if (!applicationMessage.trim()) {
      toast.error("Please include a message with your application");
      return;
    }
    
    applyToOpportunity(opportunity.id, applicationMessage);
    setIsModalOpen(false);
    setApplicationMessage("");
  };

  // Handle send direct message
  const handleSendDirectMessage = async () => {
    if (!directMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      await sendMessage(opportunity.created_by, directMessage);
      setIsMessageModalOpen(false);
      setDirectMessage("");
      toast.success("Message sent!");
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  // Handle message button click
  const handleMessageClick = () => {
    if (!user) {
      toast.error("Please log in to send messages");
      navigate("/login");
      return;
    }
    
    setIsMessageModalOpen(true);
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <div className="mb-6">
            <Link to="/opportunities" className="text-volunteer-primary hover:underline inline-flex items-center">
              ← Back to opportunities
            </Link>
          </div>

          {/* Opportunity header */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            {opportunity.image_url && (
              <div className="h-64 w-full">
                <img 
                  src={opportunity.image_url} 
                  alt={opportunity.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold">{opportunity.title}</h1>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{opportunity.location}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-6">
                {opportunity.causes.map((cause, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50">
                    {cause}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Opportunity details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Description</h2>
                  <p className="whitespace-pre-line">{opportunity.description}</p>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Application</h2>
                  
                  {existingApplication ? (
                    <div className="space-y-4">
                      {existingApplication.status === "accepted" ? (
                        <>
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Application Accepted!</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Congratulations! The organization has accepted your application. You can now message them to discuss next steps.
                          </p>
                        </>
                      ) : existingApplication.status === "rejected" ? (
                        <>
                          <div className="flex items-center space-x-2 text-red-600">
                            <X className="h-5 w-5" />
                            <span className="font-medium">Application Not Accepted</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Unfortunately, the organization has decided not to proceed with your application at this time.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2 text-blue-600">
                            <Clock className="h-5 w-5" />
                            <span className="font-medium">Application Pending</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Your application is being reviewed by the organization.
                          </p>
                        </>
                      )}
                      
                      <div className="mt-4 border-t pt-4">
                        <h3 className="font-medium mb-2">Contact Organization</h3>
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center"
                          onClick={handleMessageClick}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-4 text-gray-600">
                        Interested in this opportunity? Apply now to connect with the organization!
                      </p>
                      <Button 
                        onClick={handleApplyClick}
                        className="w-full bg-volunteer-primary hover:bg-volunteer-primary/90"
                      >
                        Apply Now
                      </Button>
                      
                      {user?.role === "volunteer" && (
                        <div className="mt-4 pt-4 border-t">
                          <Button 
                            variant="outline"
                            className="w-full flex items-center"
                            onClick={handleMessageClick}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Organization
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to "{opportunity.title}"</DialogTitle>
            <DialogDescription>
              Tell the organization why you're interested in this opportunity and any relevant experience you have.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Your message to the organization..."
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              rows={6}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitApplication}
              className="bg-volunteer-primary hover:bg-volunteer-primary/90"
            >
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Direct Message Modal */}
      <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message the Organization</DialogTitle>
            <DialogDescription>
              Send a message to the organization about this opportunity.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Your message..."
              value={directMessage}
              onChange={(e) => setDirectMessage(e.target.value)}
              rows={6}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendDirectMessage}
              className="bg-volunteer-primary hover:bg-volunteer-primary/90"
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default OpportunityDetail;
