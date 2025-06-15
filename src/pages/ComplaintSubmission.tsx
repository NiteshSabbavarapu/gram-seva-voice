import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import LocationDetector from "@/components/LocationDetector";
import { ArrowUp, Home, CheckCircle, FileText, User, Phone } from "lucide-react";
import { complaintsStore } from "@/lib/complaintsStore";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ComplaintSubmission = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    areaType: "" as "Village" | "City" | "",
    category: "",
    description: "",
    image: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaintId, setSubmittedComplaintId] = useState<string | null>(null);
  const [locationContacts, setLocationContacts] = useState<{contact_name: string, phone: string}[]>([]);
  const [assignedOfficer, setAssignedOfficer] = useState<{name: string, phone: string} | null>(null);

  const categories = [
    "Roads & Infrastructure",
    "Water Supply", 
    "Electricity",
    "Healthcare",
    "Education",
    "Agriculture",
    "Other"
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);

  const handleLocationDetected = (location: string, areaType: "Village" | "City" | "") => {
    setFormData((prev) => ({
      ...prev,
      // Only update location if detected
      location: location !== "" ? location : prev.location,
      areaType: areaType !== "" ? areaType : prev.areaType
    }));
  };

  const getForwardedTo = () => {
    if (formData.areaType === "Village") {
      // Extract village name from location string if possible
      const villageMatch = formData.location.match(/([^,]+)/);
      const village = villageMatch ? villageMatch[1].trim() : formData.location;
      return `Gram Panchayat – ${village}`;
    }
    if (formData.areaType === "City") {
      // Try to extract city name
      const cityMatch = formData.location.match(/([^,]+)/);
      const city = cityMatch ? cityMatch[1].trim() : formData.location;
      return `${city} Municipality Office`;
    }
    return "Unknown Authority";
  };

  useEffect(() => {
    const fetchContacts = async () => {
      setLocationContacts([]);
      if (!formData.location || !formData.areaType) return;
      // Find location row by name/type match
      // For cities/villages, allow partial match for flexibility.
      const { data: locs } = await supabase
        .from("locations")
        .select("id")
        .ilike("name", formData.location)
        .limit(1);

      const locId = locs?.[0]?.id;
      if (locId) {
        const { data: contacts } = await supabase
          .from("location_contacts")
          .select("contact_name, phone")
          .eq("location_id", locId);
        setLocationContacts(contacts || []);
      }
    };
    fetchContacts();
  }, [formData.location, formData.areaType]);

  useEffect(() => {
    const fetchAssignedOfficer = async () => {
      setAssignedOfficer(null);
      if (!formData.location || !formData.areaType) return;
      // 1. Find location ID by name
      const { data: locs } = await supabase
        .from("locations")
        .select("id")
        .ilike("name", formData.location)
        .limit(1);
      const locId = locs?.[0]?.id;
      if (locId) {
        // 2. Find employee assigned to this location (take the first - head/supervisor)
        const { data: assignments } = await supabase
          .from("employee_assignments")
          .select("user_id")
          .eq("location_id", locId)
          .limit(1);
        const userId = assignments?.[0]?.user_id;
        if (userId) {
          // 3. Retrieve their name & phone
          const { data: userRow } = await supabase
            .from("users")
            .select("name, phone")
            .eq("id", userId)
            .maybeSingle();
          if (userRow) {
            setAssignedOfficer({ name: userRow.name || "Officer", phone: userRow.phone || "N/A" });
          }
        }
      }
    };
    fetchAssignedOfficer();
  }, [formData.location, formData.areaType, submittedComplaintId]); // Run when relevant

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setShowLoginModal(true);
      return;
    }

    if (!formData.category || !formData.description || !formData.location || !formData.areaType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields, including area type.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Find the location id first
    let assignedOfficerId: string | undefined;
    let locId: string | undefined;
    const { data: locs } = await supabase
      .from("locations")
      .select("id")
      .ilike("name", formData.location)
      .limit(1);
    locId = locs?.[0]?.id;

    // Find assigned officer for that location (optional: head/supervisor)
    if (locId) {
      const { data: assignment } = await supabase
        .from("employee_assignments")
        .select("user_id")
        .eq("location_id", locId)
        .limit(1);
      assignedOfficerId = assignment?.[0]?.user_id;
    }

    // Compute Forwarded To (original implementation kept for user display)
    const forwardedTo = getForwardedTo();

    setTimeout(() => {
      // Async logic for fetch in setTimeout must use an IIFE
      (async () => {
        // Insert complaint into complaintsStore (simulating DB insert)
        const complaintId = complaintsStore.addComplaint({
          name: user.name,
          phone: user.phone,
          location: formData.location,
          areaType: formData.areaType,
          forwardedTo,
          category: formData.category,
          description: formData.description,
          image: formData.image,
          // assignedOfficerId and locationId not allowed, so REMOVE from argument
        });

        setIsSubmitting(false);
        setSubmittedComplaintId(complaintId);

        // Update the assigned officer display
        if (assignedOfficerId) {
          // Fetch the officer information for confirmation UI
          const { data: userRow } = await supabase
            .from("users")
            .select("name, phone")
            .eq("id", assignedOfficerId)
            .maybeSingle();
          if (userRow) {
            setAssignedOfficer({ name: userRow.name || "Officer", phone: userRow.phone || "N/A" });
          }
        }

        toast({
          title: "Complaint Submitted Successfully!",
          description: `Your complaint ID is: ${complaintId}. ✅ Complaint forwarded to: ${forwardedTo}`,
          className: "bg-ts-success text-black"
        });
      })();
    }, 2000);
  };

  const handleViewMyComplaints = () => {
    navigate(`/my-complaints?phone=${encodeURIComponent(user?.phone || '')}`);
  };

  const handleSubmitAnother = () => {
    setSubmittedComplaintId(null);
    setFormData({
      location: "",
      areaType: "", // FIX: Add areaType so it matches the expected state shape
      category: "",
      description: "",
      image: null
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ts-background font-poppins">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-ts-text mb-4">
                Login Required
              </h3>
              <p className="text-ts-text-secondary mb-6">
                Please login to submit a complaint.
              </p>
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="bg-ts-primary hover:bg-ts-primary-dark"
              >
                Login to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
        <Footer />
      </div>
    );
  }

  if (submittedComplaintId) {
    return (
      <div className="min-h-screen bg-ts-background font-poppins">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl rounded-xl border-0 text-center">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-xl">
                <div className="mx-auto mb-4">
                  <CheckCircle className="h-16 w-16 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Complaint Submitted Successfully!
                </CardTitle>
                <p className="text-white/90 font-telugu">ఫిర్యాదు విజయవంతంగా నమోదయ్యింది!</p>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-ts-text mb-2">Your Complaint ID</h3>
                  <div className="text-3xl font-bold text-ts-primary mb-2">{submittedComplaintId}</div>
                  <p className="text-sm text-ts-text-secondary">
                    Please save this ID for tracking your complaint status
                  </p>
                  <div className="mt-4">
                    <h3 className="font-semibold text-ts-text mb-1">📍 Forwarded To (Officer-in-charge):</h3>
                    {/* Prefer officer info, fallback to "forwardedTo" */}
                    {assignedOfficer ? (
                      <div className="mb-2">
                        <span className="font-semibold">{assignedOfficer.name}</span>
                        <span className="mx-2">–</span>
                        <span className="text-blue-900">{assignedOfficer.phone}</span>
                      </div>
                    ) : (
                      <div className="mb-2">{getForwardedTo()}</div>
                    )}
                    {/* Also show contacts for the location as before */}
                    {locationContacts.length > 0 && (
                      <div className="bg-blue-50 rounded p-4 mt-2 text-left">
                        <h4 className="font-medium text-blue-700 mb-1">📞 Key Contacts</h4>
                        {locationContacts.map((c, i) => (
                          <div key={i} className="mb-1">
                            <span className="font-semibold">{c.contact_name}</span>
                            <span className="mx-2">–</span>
                            <span className="text-blue-900">{c.phone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={handleViewMyComplaints}
                    className="w-full bg-ts-primary hover:bg-ts-primary-dark text-white font-semibold py-3 rounded-lg shadow-lg"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    View My Complaints
                  </Button>
                  
                  <Button 
                    onClick={handleSubmitAnother}
                    variant="outline"
                    className="w-full border-ts-primary text-ts-primary hover:bg-ts-primary hover:text-white font-semibold py-3 rounded-lg"
                  >
                    Submit Another Complaint
                  </Button>
                  
                  <Link to="/">
                    <Button 
                      variant="ghost"
                      className="w-full text-ts-text-secondary hover:text-ts-primary hover:bg-gray-100 font-medium py-3 rounded-lg"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

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
          <span className="text-ts-text">Submit Complaint</span>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* User Info Display */}
          {user && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Welcome, {user.name}!
                </h3>
                <p className="text-green-700 flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  {user.phone}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-xl rounded-xl border-0">
            <CardHeader className="bg-gradient-to-r from-ts-primary to-ts-primary-dark text-white rounded-t-xl">
              <CardTitle className="text-2xl font-bold flex items-center">
                <ArrowUp className="mr-3 h-6 w-6" />
                Submit Your Complaint
              </CardTitle>
              <p className="text-white/90 font-telugu">మీ ఫిర్యాదును నమోదు చేయండి</p>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="location" className="text-ts-text font-medium">
                    Location / స్థానం
                  </Label>
                  <div className="mt-2 space-y-2">
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="rounded-lg border-gray-300 focus:border-ts-primary"
                      placeholder="Village, Mandal, District or auto-detected coordinates"
                    />
                    <LocationDetector onLocationDetected={handleLocationDetected} />
                  </div>
                </div>

                {/* NEW: Area Type Field */}
                <div>
                  <Label htmlFor="areaType" className="text-ts-text font-medium">
                    Area Type / ప్రాంత రకం
                  </Label>
                  <Input
                    id="areaType"
                    type="text"
                    value={
                      formData.areaType
                        ? formData.areaType === "Village"
                          ? "Village (గ్రామం)"
                          : "City (నగరం)"
                        : ""
                    }
                    readOnly
                    className="rounded-lg border-gray-300 bg-gray-100 text-gray-600"
                    placeholder="Auto-filled after location detection"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-ts-text font-medium">
                    Issue Category (Required) * / సమస్య రకం
                  </Label>
                  <Select onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="mt-2 rounded-lg border-gray-300 focus:border-ts-primary">
                      <SelectValue placeholder="Select issue category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-lg">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="hover:bg-ts-primary/10">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-ts-text font-medium">
                    Description (Required) * / వివరణ
                  </Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-2 rounded-lg border-gray-300 focus:border-ts-primary min-h-[120px]"
                    placeholder="Describe your complaint in detail..."
                  />
                </div>

                <div>
                  <Label htmlFor="image" className="text-ts-text font-medium">
                    Upload Image (Optional) / చిత్రం అప్‌లోడ్ చేయండి
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, image: e.target.files?.[0] || null})}
                    className="mt-2 rounded-lg border-gray-300 focus:border-ts-primary"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-ts-primary hover:bg-ts-primary-dark text-white font-semibold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {isSubmitting ? "Submitting..." : "Submit Complaint"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      <Footer />
    </div>
  );
};

export default ComplaintSubmission;
