
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-ts-primary-dark text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 font-poppins">TS Gram Seva</h3>
            <p className="text-white/80 text-sm mb-2 font-telugu">
              తెలంగాణ గ్రామ సేవ
            </p>
            <p className="text-white/80 text-sm">
              Your Voice, Our Action - Connecting rural citizens with government services
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link 
                to="/submit-complaint" 
                className="block text-white/80 hover:text-ts-secondary transition-colors text-sm"
              >
                Submit Complaint
              </Link>
              <Link 
                to="/track-complaint" 
                className="block text-white/80 hover:text-ts-secondary transition-colors text-sm"
              >
                Track Complaint
              </Link>
              <Link 
                to="/contact" 
                className="block text-white/80 hover:text-ts-secondary transition-colors text-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Contact Info</h4>
            <div className="space-y-2 text-sm text-white/80">
              <p>Helpline: 1800-123-4567</p>
              <p>Email: help@tsgramseva.gov.in</p>
              <p>Office Hours: 9 AM - 6 PM</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-6 text-center">
          <p className="text-white/70 text-sm">
            © 2024 Government of Telangana. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
