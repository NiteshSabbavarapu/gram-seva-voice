
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home } from "lucide-react";

const OfficialLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    employeeId: "",
    password: ""
  });
  const [isLogging, setIsLogging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both Employee ID and Password.",
        variant: "destructive"
      });
      return;
    }

    setIsLogging(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLogging(false);
      
      // Simple validation (in real app, this would be server-side)
      if (formData.employeeId === "admin" && formData.password === "admin123") {
        toast({
          title: "Login Successful",
          description: "Welcome to the Admin Dashboard!",
          className: "bg-ts-success text-black"
        });
        navigate("/admin-dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid Employee ID or Password.",
          variant: "destructive"
        });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-ts-background font-poppins">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-ts-accent hover:text-ts-primary transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <span className="text-ts-text-secondary mx-2">/</span>
          <span className="text-ts-text">Official Login</span>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="shadow-xl rounded-xl border-0">
            <CardHeader className="bg-gradient-to-r from-ts-primary-dark to-black text-white rounded-t-xl">
              <CardTitle className="text-2xl font-bold text-center">
                Official Login
              </CardTitle>
              <p className="text-white/90 text-center font-telugu">అధికారిక లాగిన్</p>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="employeeId" className="text-ts-text font-medium">
                    Employee ID / ఉద్యోగి ID
                  </Label>
                  <Input
                    id="employeeId"
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    className="mt-2 rounded-lg border-gray-300 focus:border-ts-primary"
                    placeholder="Enter your Employee ID"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-ts-text font-medium">
                    Password / పాస్‌వర్డ్
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="mt-2 rounded-lg border-gray-300 focus:border-ts-primary"
                    placeholder="Enter your password"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLogging}
                  className="w-full bg-ts-primary hover:bg-ts-primary-dark text-white font-semibold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {isLogging ? "Logging in..." : "Login"}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-ts-background rounded-lg">
                <p className="text-sm text-ts-text-secondary text-center">
                  Demo Credentials:<br />
                  Employee ID: <strong>admin</strong><br />
                  Password: <strong>admin123</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OfficialLogin;
