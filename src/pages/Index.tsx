
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { ArrowRight, FileText, Search, Shield, MapPin, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSubmitComplaint = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 font-poppins">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-ts-text mb-6">
            Voice Your Concerns,
            <span className="text-ts-primary block">Drive Change</span>
          </h1>
          <p className="text-xl text-ts-text-secondary mb-4 max-w-2xl mx-auto">
            A digital platform connecting Telangana citizens with government officials for faster complaint resolution
          </p>
          <p className="text-lg font-telugu text-ts-accent mb-8">
            తెలంగాణ ప్రజల గొంతుకను ప్రభుత్వానికి చేరవేసే డిజిటల్ వేదిక
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <Link to="/submit-complaint">
                <Button size="lg" className="bg-ts-primary hover:bg-ts-primary-dark text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
                  Submit Complaint
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button 
                size="lg" 
                onClick={handleSubmitComplaint}
                className="bg-ts-primary hover:bg-ts-primary-dark text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Submit Complaint
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            
            <Link to="/track-complaint">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-ts-primary text-ts-primary hover:bg-ts-primary hover:text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200"
              >
                <Search className="mr-2 h-5 w-5" />
                Track Status
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-ts-text mb-4">
            How TS Gram Seva Works
          </h2>
          <p className="text-center text-ts-text-secondary mb-12 font-telugu">
            సులభమైన ప్రక్రియలో మీ సమస్యలను పరిష్కరించుకోండి
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow border-0">
              <CardHeader className="pb-4">
                <div className="mx-auto bg-ts-primary p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-ts-text">
                  Submit Complaint
                </CardTitle>
                <p className="text-sm text-ts-text-secondary font-telugu">
                  ఫిర్యాదు నమోదు చేయండి
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-ts-text-secondary">
                  Register your complaint with location, category, and detailed description for quick processing.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow border-0">
              <CardHeader className="pb-4">
                <div className="mx-auto bg-ts-accent p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-ts-text">
                  Official Review
                </CardTitle>
                <p className="text-sm text-ts-text-secondary font-telugu">
                  అధికారిక సమీక్ష
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-ts-text-secondary">
                  Government officials review and assign your complaint to the appropriate department.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow border-0">
              <CardHeader className="pb-4">
                <div className="mx-auto bg-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-ts-text">
                  Resolution
                </CardTitle>
                <p className="text-sm text-ts-text-secondary font-telugu">
                  సమస్య పరిష్కారం
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-ts-text-secondary">
                  Track your complaint status and receive updates until the issue is resolved.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-ts-text mb-12">
            Quick Actions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="shadow-lg hover:shadow-xl transition-shadow border-0">
              <CardHeader className="bg-gradient-to-r from-ts-primary to-ts-primary-dark text-white">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <MapPin className="mr-3 h-6 w-6" />
                  Submit New Complaint
                </CardTitle>
                <p className="text-white/90 font-telugu">
                  కొత్త ఫిర్యాదు నమోదు చేయండి
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-ts-text-secondary mb-4">
                  Report issues related to roads, water supply, electricity, healthcare, and more.
                </p>
                {isAuthenticated ? (
                  <Link to="/submit-complaint">
                    <Button className="w-full bg-ts-primary hover:bg-ts-primary-dark text-white">
                      Submit Complaint
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={handleSubmitComplaint}
                    className="w-full bg-ts-primary hover:bg-ts-primary-dark text-white"
                  >
                    Login & Submit Complaint
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow border-0">
              <CardHeader className="bg-gradient-to-r from-ts-accent to-teal-600 text-white">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Clock className="mr-3 h-6 w-6" />
                  Track Complaint Status
                </CardTitle>
                <p className="text-white/90 font-telugu">
                  ఫిర్యాదు స్థితిని తనిఖీ చేయండి
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-ts-text-secondary mb-4">
                  Enter your complaint ID to check the current status and progress.
                </p>
                <Link to="/track-complaint">
                  <Button className="w-full bg-ts-accent hover:bg-teal-600 text-white">
                    Track Status
                    <Search className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      <Footer />
    </div>
  );
};

export default Index;
