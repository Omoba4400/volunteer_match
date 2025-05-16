
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOpportunity } from "@/contexts/OpportunityContext";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import Layout from "@/components/layout/Layout";

const Home = () => {
  const { opportunities } = useOpportunity();
  
  // Get only the 3 most recent active opportunities
  const featuredOpportunities = opportunities
    .filter(opp => opp.status === "active")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <Layout>
      {/* Hero section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-volunteer-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:w-2/3 animate-enter">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Make a Difference in Your Community
            </h1>
            <p className="text-xl mb-8">
              Connect with organizations that need your skills and passion. Start making an impact today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/opportunities">
                <Button size="lg" className="bg-white text-volunteer-primary hover:bg-gray-100">
                  Find Opportunities
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured opportunities */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Opportunities</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Discover exciting volunteering opportunities available in your area that match your skills and interests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOpportunities.map(opportunity => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/opportunities">
              <Button size="lg">
                Browse All Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to connect volunteers with meaningful opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-volunteer-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Sign Up</h3>
              <p className="text-gray-600">
                Create your volunteer profile or register your organization to start connecting.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-volunteer-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Find or Post</h3>
              <p className="text-gray-600">
                Volunteers can find opportunities, and organizations can post their needs.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-volunteer-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Connect</h3>
              <p className="text-gray-600">
                Apply to opportunities, message each other, and start making a difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 bg-volunteer-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Volunteering?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community today and find opportunities that match your passion and schedule.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-volunteer-accent hover:bg-gray-100">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
