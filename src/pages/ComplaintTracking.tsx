
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, Home, Check, ArrowUp } from "lucide-react";

const ComplaintTracking = () => {
  const [complaintId, setComplaintId] = useState("");
  const [complaintData, setComplaintData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!complaintId.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock complaint data
      setComplaintData({
        id: complaintId,
        status: "In Progress",
        category: "Roads & Infrastructure",
        description: "Pothole on main road causing traffic issues",
        submittedDate: "2024-06-10",
        assignedOfficer: "Sri Ramesh Kumar",
        remarks: "Survey completed. Work order issued to contractor.",
        resolutionImage: null
      });
      setIsSearching(false);
    }, 1500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted": return "bg-ts-secondary text-black";
      case "In Progress": return "bg-ts-progress text-black";
      case "Resolved": return "bg-ts-success text-black";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusSteps = (currentStatus) => {
    const steps = ["Submitted", "In Progress", "Resolved"];
    const currentIndex = steps.indexOf(currentStatus);
    
    return steps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
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
          <span className="text-ts-text">Track Complaint</span>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl rounded-xl border-0 mb-8">
            <CardHeader className="bg-gradient-to-r from-ts-accent to-teal-600 text-white rounded-t-xl">
              <CardTitle className="text-2xl font-bold flex items-center">
                <Search className="mr-3 h-6 w-6" />
                Track Your Complaint
              </CardTitle>
              <p className="text-white/90 font-telugu">మీ ఫిర్యాదు స్థితిని తనిఖీ చేయండి</p>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="complaintId" className="text-ts-text font-medium">
                    Enter Complaint ID / ఫిర్యాదు ID ఎంటర్ చేయండి
                  </Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="complaintId"
                      type="text"
                      value={complaintId}
                      onChange={(e) => setComplaintId(e.target.value)}
                      className="rounded-lg border-gray-300 focus:border-ts-accent"
                      placeholder="e.g., TS123456"
                    />
                    <Button 
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="bg-ts-accent hover:bg-teal-600 text-white font-semibold px-6 rounded-lg"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {complaintData && (
            <Card className="shadow-xl rounded-xl border-0">
              <CardHeader className="bg-ts-card border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-ts-text mb-2">
                      Complaint ID: {complaintData.id}
                    </CardTitle>
                    <p className="text-ts-text-secondary">
                      Submitted on: {complaintData.submittedDate}
                    </p>
                  </div>
                  <Badge className={getStatusColor(complaintData.status)}>
                    {complaintData.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                {/* Progress Steps */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-ts-text mb-4">Progress</h3>
                  <div className="flex items-center justify-between">
                    {getStatusSteps(complaintData.status).map((step, index) => (
                      <div key={step.name} className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          step.completed 
                            ? 'bg-ts-primary text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {step.completed ? <Check className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
                        </div>
                        <span className={`text-sm font-medium ${
                          step.completed ? 'text-ts-primary' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </span>
                        {index < 2 && (
                          <div className={`h-1 w-full mt-2 ${
                            step.completed ? 'bg-ts-primary' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Complaint Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-ts-text mb-1">Category</h4>
                    <p className="text-ts-text-secondary">{complaintData.category}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-ts-text mb-1">Description</h4>
                    <p className="text-ts-text-secondary">{complaintData.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-ts-text mb-1">Assigned Officer</h4>
                    <p className="text-ts-text-secondary">{complaintData.assignedOfficer}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-ts-text mb-1">Latest Update</h4>
                    <p className="text-ts-text-secondary">{complaintData.remarks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ComplaintTracking;
