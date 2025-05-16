import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useOpportunity } from "@/contexts/OpportunityContext";
import { supabase } from "@/integrations/supabase/client";
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

type OpportunityRow = Database['public']['Tables']['opportunities']['Row'];

interface OpportunityCardProps {
  opportunity: OpportunityRow;
  applied?: boolean;
}

const OpportunityCard = ({ opportunity, applied = false }: OpportunityCardProps) => {
  const { user } = useAuth();
  const { deleteOpportunity } = useOpportunity();
  const isOwner = user?.id === opportunity.created_by;
  const [imageError, setImageError] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [organizationName, setOrganizationName] = useState("");

  useEffect(() => {
    const fetchOrganizationName = async () => {
      if (!opportunity.created_by) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', opportunity.created_by)
          .single();

        if (error) {
          console.error('Error fetching organization name:', error);
          return;
        }

        if (data?.name) {
          setOrganizationName(data.name);
        }
      } catch (error) {
        console.error('Error in fetchOrganizationName:', error);
      }
    };

    fetchOrganizationName();
  }, [opportunity.created_by]);

  // Debug logging
  console.log('OpportunityCard - Rendering opportunity:', {
    id: opportunity.id,
    title: opportunity.title,
    image_url: opportunity.image_url
  });

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Failed to load image:', opportunity.image_url);
    setImageError(true);
    e.currentTarget.style.display = 'none';
  };

  const handleDelete = async () => {
    try {
      await deleteOpportunity(opportunity.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting opportunity:', error);
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
        {opportunity.image_url && !imageError && (
          <div className="w-full h-48 overflow-hidden bg-gray-100">
            <img 
              src={opportunity.image_url} 
              alt={opportunity.title} 
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{opportunity.title}</CardTitle>
              <CardDescription className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {opportunity.location}
              </CardDescription>
              {organizationName && (
                <CardDescription className="mt-1 text-volunteer-primary">
                  Posted by {organizationName}
                </CardDescription>
              )}
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {opportunity.causes?.map((cause, index) => (
              <Badge key={index} variant="outline" className="bg-blue-50">
                {cause}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-gray-700 mb-4 line-clamp-3">
            {opportunity.description}
          </p>
        </CardContent>
        <CardFooter>
          {isOwner ? (
            <Link to={`/opportunities/${opportunity.id}/manage`} className="w-full">
              <Button variant="outline" className="w-full">Manage</Button>
            </Link>
          ) : applied ? (
            <Button variant="secondary" className="w-full" disabled>
              Applied
            </Button>
          ) : (
            <Link to={`/opportunities/${opportunity.id}`} className="w-full">
              <Button className="w-full bg-volunteer-primary hover:bg-volunteer-primary/90">
                View Details
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{opportunity.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OpportunityCard;
