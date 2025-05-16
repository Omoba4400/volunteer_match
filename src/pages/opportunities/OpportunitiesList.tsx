import { useState, useMemo } from "react";
import { useOpportunity } from "@/contexts/OpportunityContext";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import Layout from "@/components/layout/Layout";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Define the categories for filtering
const allCauses = [
  "Education", "Environment", "Animal Welfare", "Health",
  "Homelessness", "Hunger Relief", "Disaster Relief", "Poverty",
  "Children & Youth", "Seniors", "Veterans", "Disabilities",
  "Arts & Culture", "Community Development", "Human Rights",
  "Women's Issues", "LGBTQ+", "Technology"
];

const OpportunitiesList = () => {
  const { opportunities, userApplications } = useOpportunity();
  const { user } = useAuth();
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  
  // Filtered and active opportunities
  const activeOpportunities = useMemo(() => 
    opportunities.filter(opp => opp.status === "active"),
  [opportunities]);
  
  // Filtered opportunities based on search and filters
  const filteredOpportunities = useMemo(() => {
    return activeOpportunities.filter(opp => {
      // Text search
      const matchesSearch = searchQuery === "" || 
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCauses = selectedCauses.length === 0 || 
        opp.causes.some(cause => selectedCauses.includes(cause));
      
      return matchesSearch && matchesCauses;
    });
  }, [activeOpportunities, searchQuery, selectedCauses]);
  
  // Check if a user has applied to an opportunity
  const hasApplied = (opportunityId: string) => {
    return userApplications.some(app => app.opportunity_id === opportunityId);
  };
  
  // Toggle a cause in the filter
  const toggleCause = (cause: string) => {
    setSelectedCauses(prev => 
      prev.includes(cause)
        ? prev.filter(c => c !== cause)
        : [...prev, cause]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedCauses([]);
    setSearchQuery("");
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Find Volunteer Opportunities</h1>
            <p className="mt-4 text-xl text-gray-600">
              Discover meaningful ways to contribute to your community
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search by title, description or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter size={16} /> Filters {selectedCauses.length > 0 && `(${selectedCauses.length})`}
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Opportunities</SheetTitle>
                  </SheetHeader>
                  <div className="py-6">
                    <h3 className="font-medium mb-3">Causes</h3>
                    <div className="space-y-2">
                      {allCauses.map((cause) => (
                        <div key={cause} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`cause-${cause}`} 
                            checked={selectedCauses.includes(cause)}
                            onCheckedChange={() => toggleCause(cause)}
                          />
                          <Label htmlFor={`cause-${cause}`} className="cursor-pointer">
                            {cause}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="mt-4 w-full"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="hidden md:flex" 
                disabled={searchQuery === "" && selectedCauses.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Selected filters display */}
          {selectedCauses.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCauses.map((cause) => (
                <Badge 
                  key={cause} 
                  variant="secondary"
                  className="pl-2 pr-1 py-1 flex items-center gap-1"
                >
                  {cause}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 rounded-full"
                    onClick={() => toggleCause(cause)}
                  >
                    &times;
                  </Button>
                </Badge>
              ))}
              <Button
                variant="link"
                size="sm"
                className="text-muted-foreground"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Search results info */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing {filteredOpportunities.length} of {activeOpportunities.length} opportunities
            </p>
          </div>

          {/* Opportunities grid */}
          {filteredOpportunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard 
                  key={opportunity.id} 
                  opportunity={opportunity}
                  applied={user ? hasApplied(opportunity.id) : false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query.</p>
              <Button onClick={clearFilters} className="mt-4 bg-volunteer-primary hover:bg-volunteer-primary/90">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OpportunitiesList;
