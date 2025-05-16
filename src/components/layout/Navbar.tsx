import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X } from "lucide-react";
import { NotificationSystem } from "@/components/NotificationSystem";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-volunteer-primary">VolunteerMatch</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/opportunities" className="text-gray-700 hover:text-volunteer-primary px-3 py-2 rounded-md">
              Find Opportunities
            </Link>
            
            {user?.role === "organization" && (
              <Link to="/dashboard" className="text-gray-700 hover:text-volunteer-primary px-3 py-2 rounded-md">
                Post Opportunities
              </Link>
            )}
            
            <Link to="/about" className="text-gray-700 hover:text-volunteer-primary px-3 py-2 rounded-md">
              About Us
            </Link>
            
            {!user ? (
              <>
                <Link to="/login">
                  <Button variant="outline" className="ml-4">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button className="ml-2 bg-volunteer-primary hover:bg-volunteer-primary/90">Sign Up</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/messages" className="text-gray-700 hover:text-volunteer-primary px-3 py-2 rounded-md">
                  Messages
                </Link>
                <NotificationSystem />
                <Link to="/dashboard" className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user.name} />
                    <AvatarFallback className="bg-volunteer-secondary text-white">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Link to="/profile/edit" className="text-gray-700 hover:text-volunteer-primary px-3 py-2 rounded-md">
                  Edit Profile
                </Link>
                <Button variant="ghost" onClick={logout}>
                  Log Out
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {user && <NotificationSystem />}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-volunteer-primary hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/opportunities" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-volunteer-primary hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Opportunities
            </Link>
            
            {user?.role === "organization" && (
              <Link 
                to="/dashboard" 
                className="block px-3 py-2 rounded-md text-gray-700 hover:text-volunteer-primary hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Post Opportunities
              </Link>
            )}
            
            <Link 
              to="/about" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:text-volunteer-primary hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            
            {!user ? (
              <div className="space-y-2 pt-2">
                <Link 
                  to="/login" 
                  className="block w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full">Log In</Button>
                </Link>
                <Link 
                  to="/register" 
                  className="block w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button className="w-full bg-volunteer-primary hover:bg-volunteer-primary/90">Sign Up</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <Link 
                  to="/messages" 
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-volunteer-primary hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Messages
                </Link>
                <Link 
                  to="/dashboard" 
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-volunteer-primary hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile/edit" 
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-volunteer-primary hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:text-volunteer-primary hover:bg-gray-100"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
