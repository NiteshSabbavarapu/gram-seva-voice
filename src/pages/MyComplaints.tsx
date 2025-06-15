
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Eye, FileText, Home } from "lucide-react";
import { complaintsStore, Complaint } from "@/lib/complaintsStore";

const MyComplaints = () => {
  const [searchParams] = useSearchParams();
  const phoneNumber = searchParams.get('phone');
  
  // Get all complaints and filter by phone number if provided
  const allComplaints = complaintsStore.getComplaints();
  const userComplaints = phoneNumber 
    ? allComplaints.filter(complaint => complaint.phone === phoneNumber)
    : [];

  const [activeTab, setActiveTab] = useState("all");

  const getStatusColor = (status: Complaint['status']) => {
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

  const filteredComplaints = userComplaints.filter(complaint => {
    if (activeTab === "all") return true;
    return complaint.status.toLowerCase().replace(" ", "-") === activeTab;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-ts-accent hover:text-ts-primary transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <span className="text-ts-text-secondary mx-2">/</span>
          <span className="text-ts-text">My Complaints</span>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ts-text mb-2 flex items-center">
              <FileText className="mr-3 h-8 w-8 text-ts-primary" />
              My Complaints
            </h1>
            <p className="text-ts-text-secondary font-telugu">
              మీ ఫిర్యాదుల స్థితిని ట్రాక్ చేయండి
            </p>
          </div>

          {!phoneNumber ? (
            <Card className="shadow-lg rounded-xl border-0 text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-ts-text mb-2">
                  No Phone Number Provided
                </h3>
                <p className="text-ts-text-secondary mb-6">
                  Please access this page through the complaint submission confirmation.
                </p>
                <Link to="/submit-complaint">
                  <Button className="bg-ts-primary hover:bg-ts-primary-dark text-white">
                    Submit a Complaint
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : userComplaints.length === 0 ? (
            <Card className="shadow-lg rounded-xl border-0 text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-ts-text mb-2">
                  No Complaints Found
                </h3>
                <p className="text-ts-text-secondary mb-6">
                  You haven't submitted any complaints yet.
                </p>
                <Link to="/submit-complaint">
                  <Button className="bg-ts-primary hover:bg-ts-primary-dark text-white">
                    Submit Your First Complaint
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Status Filter Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-4 bg-white rounded-lg shadow-sm border">
                  <TabsTrigger value="all" className="data-[state=active]:bg-ts-primary data-[state=active]:text-white">
                    All ({userComplaints.length})
                  </TabsTrigger>
                  <TabsTrigger value="submitted" className="data-[state=active]:bg-ts-primary data-[state=active]:text-white">
                    Submitted ({userComplaints.filter(c => c.status === "Submitted").length})
                  </TabsTrigger>
                  <TabsTrigger value="in-progress" className="data-[state=active]:bg-ts-primary data-[state=active]:text-white">
                    In Progress ({userComplaints.filter(c => c.status === "In Progress").length})
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="data-[state=active]:bg-ts-primary data-[state=active]:text-white">
                    Resolved ({userComplaints.filter(c => c.status === "Resolved").length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  <div className="space-y-4">
                    {filteredComplaints.map((complaint) => (
                      <Card key={complaint.id} className="shadow-lg rounded-xl border-0 hover:shadow-xl transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg font-semibold text-ts-text">
                                {complaint.category}
                              </CardTitle>
                              <p className="text-sm text-ts-text-secondary mt-1">
                                ID: {complaint.id} • {formatDate(complaint.submittedDate)}
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(complaint.status)} border font-medium`}>
                              {complaint.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="mb-4">
                            <p className="text-ts-text line-clamp-2">
                              {complaint.description}
                            </p>
                            {complaint.location && (
                              <p className="text-sm text-ts-text-secondary mt-2">
                                📍 {complaint.location}
                              </p>
                            )}
                            {complaint.assignedOfficer && (
                              <p className="text-sm text-ts-accent mt-1">
                                👤 Assigned to: {complaint.assignedOfficer}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-ts-text-secondary">
                              Phone: {complaint.phone}
                            </div>
                            <Link to={`/track-complaint?id=${complaint.id}`}>
                              <Button 
                                size="sm" 
                                className="bg-ts-primary hover:bg-ts-primary-dark text-white"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MyComplaints;
