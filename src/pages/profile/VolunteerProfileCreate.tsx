
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, VolunteerProfile } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";

// Predefined lists for selection
const skillsList = [
  "Teaching", "Cooking", "First Aid", "Carpentry", "Gardening",
  "Web Development", "Graphic Design", "Event Planning",
  "Photography", "Writing", "Accounting", "Legal Knowledge",
  "Childcare", "Elder Care", "Music", "Art", "Sports Coaching",
  "Foreign Languages", "Public Speaking"
];

const interestsList = [
  "Education", "Environment", "Animal Welfare", "Health",
  "Homelessness", "Hunger Relief", "Disaster Relief", "Poverty",
  "Children & Youth", "Seniors", "Veterans", "Disabilities",
  "Arts & Culture", "Community Development", "Human Rights",
  "Women's Issues", "LGBTQ+", "Technology"
];

const availabilityOptions = [
  "Weekday Mornings", "Weekday Afternoons", "Weekday Evenings",
  "Weekend Mornings", "Weekend Afternoons", "Weekend Evenings",
  "Flexible", "One-time Events", "Regular Commitment"
];

const VolunteerProfileCreate = () => {
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const { updateVolunteerProfile } = useAuth();
  const navigate = useNavigate();

  const handleSkillToggle = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleInterestToggle = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleAvailabilityToggle = (availability: string) => {
    if (availability.includes(availability)) {
      setAvailability(skills.filter(a => a !== availability));
    } else {
      setAvailability([...availability, availability]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (skills.length === 0 || interests.length === 0 || !bio || !location || availability.length === 0) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const profile: VolunteerProfile = {
      skills,
      interests,
      bio,
      location,
      availability
    };
    
    updateVolunteerProfile(profile);
    navigate("/dashboard");
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Volunteer Profile</CardTitle>
            <CardDescription>
              Tell us about your skills and interests to help us match you with the right opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Your Skills (select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map(skill => (
                    <Button
                      key={skill}
                      type="button"
                      variant={skills.includes(skill) ? "default" : "outline"}
                      onClick={() => handleSkillToggle(skill)}
                      className={skills.includes(skill) ? "bg-volunteer-primary hover:bg-volunteer-primary/90" : ""}
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Your Interests (select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {interestsList.map(interest => (
                    <Button
                      key={interest}
                      type="button"
                      variant={interests.includes(interest) ? "default" : "outline"}
                      onClick={() => handleInterestToggle(interest)}
                      className={interests.includes(interest) ? "bg-volunteer-primary hover:bg-volunteer-primary/90" : ""}
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself and why you want to volunteer..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
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
                <Label>Availability (select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {availabilityOptions.map(option => (
                    <Button
                      key={option}
                      type="button"
                      variant={availability.includes(option) ? "default" : "outline"}
                      onClick={() => handleAvailabilityToggle(option)}
                      className={availability.includes(option) ? "bg-volunteer-primary hover:bg-volunteer-primary/90" : ""}
                    >
                      {option}
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

export default VolunteerProfileCreate;
