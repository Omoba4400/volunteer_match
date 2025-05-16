import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { OpportunityProvider } from "./contexts/OpportunityContext";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VolunteerProfileCreate from "./pages/profile/VolunteerProfileCreate";
import OrganizationProfileCreate from "./pages/profile/OrganizationProfileCreate";
import ProfileEdit from "./pages/profile/ProfileEdit";
import AcceptedApplications from "./pages/dashboard/AcceptedApplications";
import Dashboard from "./pages/Dashboard";
import OpportunitiesList from "./pages/opportunities/OpportunitiesList";
import OpportunityDetail from "./pages/opportunities/OpportunityDetail";
import Messages from "./pages/messaging/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <OpportunityProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile/volunteer/create" element={<VolunteerProfileCreate />} />
              <Route path="/profile/organization/create" element={<OrganizationProfileCreate />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />
              <Route path="/applications/accepted" element={<AcceptedApplications />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/opportunities" element={<OpportunitiesList />} />
              <Route path="/opportunities/:opportunityId" element={<OpportunityDetail />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OpportunityProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
