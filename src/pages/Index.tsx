
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowUp, Check, Search } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-ts-background font-poppins">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ts-primary to-ts-primary-dark text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in">
            Your Voice, Our Action
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-2 font-telugu">
            మీ గొంతు, మా చర్య
          </p>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Connect with Telangana Government services. Submit grievances, track progress, and get solutions.
          </p>
          
          {/* CTA Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-12">
            <Link to="/submit-complaint">
              <Button 
                size="lg" 
                className="w-full bg-ts-secondary hover:bg-ts-secondary/90 text-black font-semibold py-6 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <ArrowUp className="mr-2 h-5 w-5 flex-shrink-0" />
                <span className="whitespace-nowrap">Submit a Complaint</span>
              </Button>
            </Link>
            
            <Link to="/track-complaint">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-2 border-white text-white hover:bg-white hover:text-ts-primary font-semibold py-6 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Search className="mr-2 h-5 w-5 flex-shrink-0" />
                <span className="whitespace-nowrap">Track Complaint</span>
              </Button>
            </Link>
            
            <Link to="/official-login">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-2 border-white text-white hover:bg-white hover:text-ts-primary font-semibold py-6 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <span className="whitespace-nowrap">Login as Official</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-ts-text mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center p-6 shadow-lg rounded-xl border-0 hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-ts-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowUp className="h-8 w-8 text-ts-primary" />
                </div>
                <h3 className="text-xl font-semibold text-ts-text mb-2">1. Submit</h3>
                <p className="text-ts-text-secondary">
                  Share your grievance with location and details
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 shadow-lg rounded-xl border-0 hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-ts-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-ts-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-ts-text mb-2">2. Track</h3>
                <p className="text-ts-text-secondary">
                  Monitor progress with your complaint ID
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 shadow-lg rounded-xl border-0 hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-ts-success/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-ts-primary" />
                </div>
                <h3 className="text-xl font-semibold text-ts-text mb-2">3. Resolve</h3>
                <p className="text-ts-text-secondary">
                  Get solutions from assigned officials
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-ts-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-ts-text mb-12">
            Our Impact
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="text-center p-6 bg-gradient-to-br from-ts-primary to-ts-primary-dark text-white rounded-xl shadow-lg">
              <CardContent className="pt-6">
                <h3 className="text-3xl font-bold mb-2">12,847</h3>
                <p className="text-white/90">Complaints Resolved</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 bg-gradient-to-br from-ts-secondary to-yellow-400 text-black rounded-xl shadow-lg">
              <CardContent className="pt-6">
                <h3 className="text-3xl font-bold mb-2">1,200+</h3>
                <p className="text-black/80">Villages Reached</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 bg-gradient-to-br from-ts-accent to-teal-500 text-white rounded-xl shadow-lg">
              <CardContent className="pt-6">
                <h3 className="text-3xl font-bold mb-2">98%</h3>
                <p className="text-white/90">Satisfaction Rate</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 bg-gradient-to-br from-ts-success to-green-400 text-black rounded-xl shadow-lg">
              <CardContent className="pt-6">
                <h3 className="text-3xl font-bold mb-2">24/7</h3>
                <p className="text-black/80">Service Available</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
