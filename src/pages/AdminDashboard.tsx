
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, Check } from "lucide-react";
import { complaintsStore, Complaint } from "@/lib/complaintsStore";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState("all");
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    const loadComplaints = () => {
      setComplaints(complaintsStore.getComplaints());
    };
    
    loadComplaints();
    
    const unsubscribe = complaintsStore.subscribe(loadComplaints);
    return unsubscribe;
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted": return "bg-ts-secondary text-black";
      case "In Progress": return "bg-ts-progress text-black";
      case "Resolved": return "bg-ts-success text-black";
      default: return "bg-gray-500 text-white";
    }
  };

  const handleStatusUpdate = (complaintId: string, action: string) => {
    if (action === "Assigned") {
      complaintsStore.updateComplaintStatus(complaintId, "In Progress", "System Assigned Officer");
    } else if (action === "Resolved") {
      complaintsStore.updateComplaintStatus(complaintId, "Resolved");
    }
    
    toast({
      title: "Action Completed",
      description: `Complaint ${complaintId} has been ${action.toLowerCase()}.`,
      className: "bg-ts-success text-black"
    });
  };

  const filteredComplaints = filterStatus === "all" 
    ? complaints 
    : complaints.filter(complaint => complaint.status.toLowerCase() === filterStatus);

  const getStats = () => {
    const total = complaints.length;
    const submitted = complaints.filter(c => c.status === "Submitted").length;
    const inProgress = complaints.filter(c => c.status === "In Progress").length;
    const resolved = complaints.filter(c => c.status === "Resolved").length;
    
    return { total, submitted, inProgress, resolved };
  };

  const stats = getStats();

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
          <span className="text-ts-text">Admin Dashboard</span>
        </div>

        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ts-text mb-2">Admin Dashboard</h1>
          <p className="text-ts-text-secondary font-telugu">అడ్మిన్ డ్యాష్‌బోర్డ్</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-ts-primary to-ts-primary-dark text-white rounded-xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold">{stats.total}</h3>
              <p className="text-white/90">Total Complaints</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-ts-secondary to-yellow-400 text-black rounded-xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold">{stats.submitted}</h3>
              <p className="text-black/80">Pending Review</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-ts-progress to-green-400 text-black rounded-xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold">{stats.inProgress}</h3>
              <p className="text-black/80">In Progress</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-ts-success to-green-500 text-black rounded-xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold">{stats.resolved}</h3>
              <p className="text-black/80">Resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl text-ts-text">Filter Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Select onValueChange={setFilterStatus} defaultValue="all">
                <SelectTrigger className="w-48 rounded-lg border-gray-300">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <Card key={complaint.id} className="shadow-lg rounded-xl border-0">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-ts-text">
                        {complaint.id}
                      </h3>
                      <Badge className={getStatusColor(complaint.status)}>
                        {complaint.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-ts-text-secondary">
                      <p><strong>Name:</strong> {complaint.name || "Anonymous"}</p>
                      <p><strong>Phone:</strong> {complaint.phone}</p>
                      <p><strong>Location:</strong> {complaint.location || "Not specified"}</p>
                      <p><strong>Category:</strong> {complaint.category}</p>
                      <p><strong>Description:</strong> {complaint.description}</p>
                      <p><strong>Submitted:</strong> {complaint.submittedDate}</p>
                      {complaint.assignedOfficer && (
                        <p><strong>Assigned to:</strong> {complaint.assignedOfficer}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 min-w-fit">
                    {complaint.status === "Submitted" && (
                      <Button 
                        onClick={() => handleStatusUpdate(complaint.id, "Assigned")}
                        className="bg-ts-secondary hover:bg-yellow-500 text-black font-medium rounded-lg"
                      >
                        Assign Officer
                      </Button>
                    )}
                    
                    {complaint.status === "In Progress" && (
                      <Button 
                        onClick={() => handleStatusUpdate(complaint.id, "Resolved")}
                        className="bg-ts-success hover:bg-green-500 text-black font-medium rounded-lg"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark Resolved
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline"
                      className="border-ts-primary text-ts-primary hover:bg-ts-primary hover:text-white rounded-lg"
                    >
                      Upload Photo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredComplaints.length === 0 && (
            <Card className="shadow-lg rounded-xl border-0">
              <CardContent className="p-8 text-center">
                <p className="text-ts-text-secondary">No complaints found for the selected filter.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
