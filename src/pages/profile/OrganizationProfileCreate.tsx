
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, OrganizationProfile } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";

// Predefined lists for selection
const causesList = [
  "Education", "Environment", "Animal Welfare", "Health",
  "Homelessness", "Hunger Relief", "Disaster Relief", "Poverty",
  "Children & Youth", "Seniors", "Veterans", "Disabilities",
  "Arts & Culture", "Community Development", "Human Rights",
  "Women's Issues", "LGBTQ+", "Technology", "Religious"
];

const OrganizationProfileCreate = () => {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [causes, setCauses] = useState<string[]>([]);
  const { updateOrganizationProfile } = useAuth();
  const navigate = useNavigate();

  const handleCauseToggle = (cause: string) => {
    if (causes.includes(cause)) {
      setCauses(causes.filter(c => c !== cause));
    } else {
      setCauses([...causes, cause]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !location || !website || causes.length === 0) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const profile: OrganizationProfile = {
      description,
      location,
      website,
      causes
    };
    
    updateOrganizationProfile(profile);
    navigate("/dashboard");
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Organization Profile</CardTitle>
            <CardDescription>
              Tell us about your organization to help volunteers find and connect with you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Organization Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your organization's mission and impact..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="www.yourorganization.org"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Causes (select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {causesList.map(cause => (
                    <Button
                      key={cause}
                      type="button"
                      variant={causes.includes(cause) ? "default" : "outline"}
                      onClick={() => handleCauseToggle(cause)}
                      className={causes.includes(cause) ? "bg-volunteer-primary hover:bg-volunteer-primary/90" : ""}
                    >
                      {cause}
                    </Button>
                  ))}
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" onClick={handleSubmit} className="w-full bg-volunteer-primary hover:bg-volunteer-primary/90">
              Complete Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default OrganizationProfileCreate;
