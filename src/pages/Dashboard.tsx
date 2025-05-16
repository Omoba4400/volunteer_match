import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import VolunteerDashboard from "./dashboard/VolunteerDashboard";
import OrganizationDashboard from "./dashboard/OrganizationDashboard";

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // If profile is not complete, redirect to the appropriate profile creation page
  if (!user.profile_complete) {
    if (user.role === "volunteer") {
      return <Navigate to="/profile/volunteer/create" />;
    } else if (user.role === "organization") {
      return <Navigate to="/profile/organization/create" />;
    }
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold p-6 border-b bg-white">Dashboard</h1>
          
          {user.role === "volunteer" ? (
            <VolunteerDashboard />
          ) : (
            <OrganizationDashboard />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
