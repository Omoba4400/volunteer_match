import { useState } from "react";
import { useOpportunity } from "@/contexts/OpportunityContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Calendar, Mail, Plus, CheckCircle, UserCheck, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { OpportunityImageUpload } from '@/components/OpportunityImageUpload';
import { Database } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AcceptedVolunteers from "@/components/opportunities/AcceptedVolunteers";

type OpportunityRow = Database['public']['Tables']['opportunities']['Row'];
type OpportunityInsert = Database['public']['Tables']['opportunities']['Insert'];
type Message = Database['public']['Tables']['messages']['Row'];

const OrganizationDashboard = () => {
  const { userApplications, opportunities, messages, createOpportunity, updateOpportunity, deleteOpportunity, acceptApplication, rejectApplication, loading } = useOpportunity();
  const { user } = useAuth();
  
  // New opportunity form state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState<Partial<OpportunityInsert>>({
    title: '',
    description: '',
    location: '',
    causes: [],
    image_url: '',
    image_path: '',
    cause_type: ''
  });
  
  // Filter to get only this organization's opportunities
  const orgOpportunities = opportunities.filter(opp => opp.created_by === user?.id);
  
  // Get applications for this organization's opportunities with opportunity details
  const orgApplications = userApplications.map(app => {
    const opportunity = opportunities.find(opp => opp.id === app.opportunity_id);
    return {
      ...app,
      opportunityTitle: opportunity?.title || 'Unknown Opportunity'
    };
  });

  // Filter pending applications
  const pendingApplications = orgApplications.filter(app => app.status === "pending");
  
  // Filter rejected applications
  const rejectedApplications = orgApplications.filter(app => app.status === "rejected");
  
  // Get unread messages
  const unreadMessages = messages.filter(msg => !msg.read && msg.receiverId === user?.id);

  // Add state for delete confirmation
  const [opportunityToDelete, setOpportunityToDelete] = useState<string | null>(null);

  const handleImageUploaded = (imageUrl: string, imagePath: string) => {
    setNewOpportunity(prev => ({
      ...prev,
      image_url: imageUrl,
      image_path: imagePath
    }));
  };

  const handleCreateOpportunity = async () => {
    if (!user) {
      toast.error('You must be logged in to create opportunities');
      return;
    }

    // Validate required fields
    if (!newOpportunity.title?.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!newOpportunity.description?.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!newOpportunity.location?.trim()) {
      toast.error('Location is required');
      return;
    }

    try {
      if (newOpportunity.id) {
        // Update existing opportunity
        await updateOpportunity(newOpportunity.id, newOpportunity);
        toast.success('Opportunity updated successfully!');
      } else {
        // Create new opportunity
        const opportunityData: OpportunityInsert = {
          created_by: user.id,
          title: newOpportunity.title.trim(),
          description: newOpportunity.description.trim(),
          location: newOpportunity.location.trim(),
          causes: Array.isArray(newOpportunity.causes) ? newOpportunity.causes.filter(Boolean) : []
        };

        // Only add optional fields if they have values
        if (newOpportunity.image_url) opportunityData.image_url = newOpportunity.image_url;
        if (newOpportunity.image_path) opportunityData.image_path = newOpportunity.image_path;
        if (newOpportunity.cause_type) opportunityData.cause_type = newOpportunity.cause_type;

        console.log('Creating opportunity with data:', JSON.stringify(opportunityData, null, 2));
        await createOpportunity(opportunityData);
        toast.success('Opportunity created successfully!');
      }

      // Reset form
      setNewOpportunity({
        title: '',
        description: '',
        location: '',
        causes: [],
        image_url: '',
        image_path: '',
        cause_type: ''
      });
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error saving opportunity:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save opportunity');
      }
    }
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove skill handling since it's not in the schema
  };

  const handleCauseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const causesArray = e.target.value.split(",").map(cause => cause.trim());
    setNewOpportunity(prev => ({
      ...prev,
      causes: causesArray.filter(Boolean)
    }));
  };

  // Predefined skills list
  const predefinedSkills = [
    "Teaching", "Cooking", "First Aid", "Carpentry", "Gardening",
    "Web Development", "Graphic Design", "Event Planning"
  ];

  const handleDelete = async (id: string) => {
    try {
      await deleteOpportunity(id);
      setOpportunityToDelete(null);
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Failed to delete opportunity');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* Summary Stats */}
      <Card className="md:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle>Welcome back, {user?.name}!</CardTitle>
          <CardDescription>
            Manage your volunteer opportunities and applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-muted p-4 rounded-lg flex items-center space-x-4">
              <div className="rounded-full bg-volunteer-primary p-2">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Opportunities</p>
                <p className="text-2xl font-bold">
                  {orgOpportunities.length}
                </p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg flex items-center space-x-4">
              <div className="rounded-full bg-volunteer-primary p-2">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Applications</p>
                <p className="text-2xl font-bold">{pendingApplications.length}</p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg flex items-center space-x-4">
              <div className="rounded-full bg-volunteer-primary p-2">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accepted Volunteers</p>
                <p className="text-2xl font-bold">
                  {userApplications.filter(app => app.status === "accepted").length}
                </p>
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
          </div>
        </CardContent>
      </Card>

      {/* Post New Opportunity */}
      <Card>
        <CardHeader>
          <CardTitle>Create Opportunity</CardTitle>
          <CardDescription>
            Post a new volunteer opportunity.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-volunteer-primary hover:bg-volunteer-primary/90">
                <Plus className="mr-2 h-4 w-4" /> New Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {newOpportunity.id ? 'Edit Opportunity' : 'Create New Volunteer Opportunity'}
                </DialogTitle>
                <DialogDescription>
                  {newOpportunity.id ? 'Update your volunteering opportunity.' : 'Fill in the details of your volunteering opportunity.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newOpportunity.title || ''}
                    onChange={(e) => setNewOpportunity(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Weekend Food Drive"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newOpportunity.description || ''}
                    onChange={(e) => setNewOpportunity(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what volunteers will be doing..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newOpportunity.location || ''}
                      onChange={(e) => setNewOpportunity(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., City Park"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="causes">Causes</Label>
                  <Input
                    id="causes"
                    value={newOpportunity.causes?.join(", ") || ''}
                    onChange={handleCauseChange}
                    placeholder="e.g., Environment, Education, Health"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Opportunity Image</Label>
                  <OpportunityImageUpload 
                    opportunityId={newOpportunity.id || 'new'}
                    organizationId={user?.id || ''}
                    onImageUploaded={handleImageUploaded}
                    initialImageUrl={newOpportunity.image_url || ''}
                    initialImagePath={newOpportunity.image_path || ''}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOpportunity} disabled={loading}>
                  {loading ? 'Saving...' : newOpportunity.id ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Pending Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>
            Review and manage volunteer applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApplications.length > 0 ? (
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-2">
                      <h3 className="font-medium">{application.opportunityTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        Applied on: {new Date(application.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-2">{application.message}</p>
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 hover:bg-red-100 text-red-600"
                          onClick={() => rejectApplication(application.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => acceptApplication(application.id)}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pending applications.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejected Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Rejected Applications</CardTitle>
          <CardDescription>
            Review previously rejected applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rejectedApplications.length > 0 ? (
            <div className="space-y-4">
              {rejectedApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-2">
                      <h3 className="font-medium">{application.opportunityTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        Applied on: {new Date(application.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-2">{application.message}</p>
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => acceptApplication(application.id)}
                        >
                          Accept Back
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No rejected applications.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Opportunities */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Opportunities</CardTitle>
              <CardDescription>
                Manage your posted volunteer opportunities.
              </CardDescription>
            </div>
            <Link to="/opportunities">
              <Button variant="outline" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                View in Public List
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orgOpportunities.map(opportunity => (
              <Card key={opportunity.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {opportunity.image_url && (
                      <div className="w-32 h-32 flex-shrink-0">
                        <img
                          src={opportunity.image_url}
                          alt={opportunity.title}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            console.error('Failed to load image:', opportunity.image_url);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{opportunity.title}</h3>
                          <p className="text-sm text-muted-foreground">{opportunity.location}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {opportunity.causes?.map((cause, index) => (
                              <Badge key={index} variant="outline" className="bg-blue-50">
                                {cause}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={`/opportunities/${opportunity.id}`} target="_blank">
                            <Button variant="ghost" size="sm" className="text-volunteer-primary">
                              <Search className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <p className="mt-2 text-sm line-clamp-2">{opportunity.description}</p>
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNewOpportunity(opportunity);
                            setShowCreateDialog(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setOpportunityToDelete(opportunity.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <AcceptedVolunteers opportunityId={opportunity.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
            {orgOpportunities.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No opportunities posted yet.</p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="mt-4 bg-volunteer-primary hover:bg-volunteer-primary/90"
                >
                  Create Your First Opportunity
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!opportunityToDelete} onOpenChange={() => setOpportunityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this opportunity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => opportunityToDelete && handleDelete(opportunityToDelete)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrganizationDashboard;
