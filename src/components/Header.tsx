
import { Link } from "react-router-dom";
import { Home, FileText, LogOut, User, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import LoginModal from "@/components/LoginModal";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <header className="bg-ts-primary-dark shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <div className="bg-white p-2 rounded-lg shadow-md">
              <Home className="h-8 w-8 text-ts-primary" />
            </div>
            <div>
              <h1 className="text-white text-xl md:text-2xl font-bold font-poppins">
                TS Gram Seva
              </h1>
              <p className="text-white/80 text-sm font-telugu">
                తెలంగాణ గ్రామ సేవ
              </p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4 md:space-x-6">
            {isAuthenticated && (
              <div className="hidden md:flex items-center text-white/90 text-sm">
                <User className="h-4 w-4 mr-1" />
                <span>{user?.name}</span>
                <span className="ml-2 text-white/70">({user?.phone})</span>
              </div>
            )}

            {/* Home and Contact: Only visible on desktop */}
            <Link 
              to="/"
              className="hidden md:inline text-white hover:text-ts-secondary transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              to="/contact"
              className="hidden md:inline text-white hover:text-ts-secondary transition-colors font-medium"
            >
              Contact
            </Link>
            
            {/* My Complaints: Always visible */}
            <Link 
              to="/my-complaints" 
              className="flex items-center text-white hover:text-ts-secondary transition-colors font-medium"
            >
              <FileText className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">My Complaints</span>
              <span className="md:hidden">
                <FileText className="h-5 w-5" />
              </span>
            </Link>
            
            {/* Logout/Login button: Always visible, but correctly placed for mobile */}
            {isAuthenticated ? (
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-white hover:text-ts-secondary hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setShowLoginModal(true)}
                  size="sm"
                  className="bg-white text-ts-primary font-semibold hover:bg-ts-secondary hover:text-white"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  <span>Login</span>
                </Button>
                {showLoginModal && (
                  <LoginModal onClose={() => setShowLoginModal(false)} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
