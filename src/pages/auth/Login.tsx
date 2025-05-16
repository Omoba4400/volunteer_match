import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, session, loading } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('Login component - Auth state:', { 
      user, 
      session, 
      loading, 
      isSubmitting,
      hasSession: !!session,
      hasUser: !!user,
      userRole: user?.role,
      profileComplete: user?.profile_complete
    });
  }, [user, session, loading, isSubmitting]);

  // Handle redirection after login
  useEffect(() => {
    if (!loading && user && session) {
      console.log('Redirecting user:', { role: user.role, profileComplete: user.profile_complete });
      
      // If profile is not complete, redirect to profile creation
      if (!user.profile_complete) {
        const profilePath = user.role === 'volunteer' 
          ? '/profile/volunteer/create'
          : '/profile/organization/create';
        navigate(profilePath);
      } else {
        // If profile is complete, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [user, session, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    
    setError("");
    setIsSubmitting(true);

    try {
      console.log('Attempting login with:', email);
      await login(email, password);
      // Login successful - redirection will be handled by the effect
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : "An error occurred during login");
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-12 px-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to sign in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-volunteer-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button 
                type="submit" 
                className="w-full bg-volunteer-primary hover:bg-volunteer-primary/90" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-gray-600 text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-volunteer-primary hover:underline">
                Sign up
              </Link>
            </div>
           
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
