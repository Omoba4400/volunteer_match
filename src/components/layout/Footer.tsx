
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-10 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">VolunteerMatch</h3>
            <p className="text-gray-600 mb-4">
              Connecting volunteers with meaningful opportunities to serve their communities.
            </p>
            <p className="text-gray-600">© {new Date().getFullYear()} VolunteerMatch. All rights reserved.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/opportunities" className="text-gray-600 hover:text-volunteer-primary">
                  Find Opportunities
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-volunteer-primary">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-volunteer-primary">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Email: contact@volunteermatch.example</li>
              <li>Phone: (555) 123-4567</li>
              <li>Address: 123 Main St, Anytown USA</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Created with passion to help communities around the world.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
