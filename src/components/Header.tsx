
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const Header = () => {
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
          
          <div className="hidden md:flex space-x-6">
            <Link 
              to="/" 
              className="text-white hover:text-ts-secondary transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              to="/contact" 
              className="text-white hover:text-ts-secondary transition-colors font-medium"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
