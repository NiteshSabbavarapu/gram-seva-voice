
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, Home, CheckCircle, Clock, FileText } from "lucide-react";
import { complaintsStore, Complaint } from "@/lib/complaintsStore";

const ComplaintTracking = () => {
  const [searchParams] = useSearchParams();
  const [complaintId, setComplaintId] = useState(searchParams.get('id') || "");
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setComplaintId(id);
      handleSearch(id);
    }
  }, [searchParams]);

  const handleSearch = (id?: string) => {
    const searchId = id || complaintId;
    if (!searchId.trim()) return;

    setIsSearching(true);
    setNotFound(false);
    
    // Simulate API call
    setTimeout(() => {
      const foundComplaint = complaintsStore.getComplaintById(searchId.trim());
      setComplaint(foundComplaint || null);
      setNotFound(!foundComplaint);
      setIsSearching(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Submitted":
        return <FileText className="h-5 w-5" />;
      case "In Progress":
        return <Clock className="h-5 w-5" />;
      case "Resolved":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
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
          <Card className="shadow-xl rounded-xl border-0 mb-6">
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
                    Complaint ID / ఫిర్యాదు ID
                  </Label>
                  <Input
                    id="complaintId"
                    type="text"
                    value={complaintId}
                    onChange={(e) => setComplaintId(e.target.value)}
                    className="mt-2 rounded-lg border-gray-300 focus:border-ts-primary"
                    placeholder="Enter your complaint ID (e.g., TS123456)"
                  />
                </div>

                <Button 
                  onClick={() => handleSearch()}
                  disabled={isSearching || !complaintId.trim()}
                  className="w-full bg-ts-accent hover:bg-teal-600 text-white font-semibold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {isSearching ? "Searching..." : "Track Complaint"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {notFound && (
            <Card className="shadow-lg rounded-xl border-0 text-center">
              <CardContent className="p-8">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-ts-text mb-2">
                  Complaint Not Found
                </h3>
                <p className="text-ts-text-secondary">
                  Please check your complaint ID and try again.
                </p>
              </CardContent>
            </Card>
          )}

          {complaint && (
            <Card className="shadow-xl rounded-xl border-0">
              <CardHeader className="border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-ts-text">
                      {complaint.category}
                    </CardTitle>
                    <p className="text-ts-text-secondary">ID: {complaint.id}</p>
                  </div>
                  <Badge className={`${getStatusColor(complaint.status)} border font-medium flex items-center`}>
                    {getStatusIcon(complaint.status)}
                    <span className="ml-1">{complaint.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-ts-text mb-2">Complaint Details</h4>
                    <p className="text-ts-text-secondary">{complaint.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-ts-text">Submitted Date:</span>
                      <p className="text-ts-text-secondary">
                        {new Date(complaint.submittedDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    {complaint.location && (
                      <div>
                        <span className="font-medium text-ts-text">Location:</span>
                        <p className="text-ts-text-secondary">{complaint.location}</p>
                      </div>
                    )}
                    {complaint.assignedOfficer && (
                      <div>
                        <span className="font-medium text-ts-text">Assigned Officer:</span>
                        <p className="text-ts-text-secondary">{complaint.assignedOfficer}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-ts-text">Contact:</span>
                      <p className="text-ts-text-secondary">{complaint.phone}</p>
                    </div>
                  </div>

                  {complaint.status === "Resolved" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">✅ Resolution</h4>
                      <p className="text-green-700">
                        Your complaint has been successfully resolved. Thank you for using TS Gram Seva.
                      </p>
                    </div>
                  )}
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
