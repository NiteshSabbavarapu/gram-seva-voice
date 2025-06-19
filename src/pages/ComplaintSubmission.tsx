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
import VoiceRecorder from "@/components/VoiceRecorder";
import { ArrowUp, Home, CheckCircle, FileText, User, Phone, X, ImageIcon, Mic } from "lucide-react";
import { complaintsStore } from "@/lib/complaintsStore";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { COLLEGE_LOCATION_NAME, LOCATION_NAME } from "@/constants/authConstants";

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
    images: [] as File[]
  });
  const [voiceData, setVoiceData] = useState<{
    audioBlob: Blob | null;
    duration: number;
  }>({
    audioBlob: null,
    duration: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaintId, setSubmittedComplaintId] = useState<string | null>(null);
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
      location: location !== "" ? location : prev.location,
      areaType: areaType !== "" ? areaType : prev.areaType
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Only image files are allowed.",
        variant: "destructive"
      });
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles].slice(0, 5)
    }));

    if (formData.images.length + validFiles.length > 5) {
      toast({
        title: "Image Limit",
        description: "You can upload a maximum of 5 images.",
        variant: "destructive"
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleVoiceRecordingComplete = (audioBlob: Blob, duration: number) => {
    setVoiceData({
      audioBlob,
      duration
    });
  };

  const handleVoiceRecordingClear = () => {
    setVoiceData({
      audioBlob: null,
      duration: 0
    });
  };

  const convertAudioToBase64 = (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data:audio/webm;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  };

  const getForwardedTo = () => {
    if (formData.areaType === "Village") {
      const villageMatch = formData.location.match(/([^,]+)/);
      const village = villageMatch ? villageMatch[1].trim() : formData.location;
      return `Gram Panchayat – ${village}`;
    }
    if (formData.areaType === "City") {
      const cityMatch = formData.location.match(/([^,]+)/);
      const city = cityMatch ? cityMatch[1].trim() : formData.location;
      return `${city} Municipality Office`;
    }
    return "Unknown Authority";
  };

  const findAssignedSupervisor = async () => {
    console.log("Finding supervisor for location:", formData.location);
    
    let matchedLocationId = null;
    let supervisorInfo = null;
    
    // Check for specific college location first
    if (formData.location.toLowerCase().includes("cbit") || 
        formData.location.toLowerCase().includes("college")) {
      console.log("College location detected");
      
      const { data: collegeLocs } = await supabase
        .from("locations")
        .select("id, name")
        .eq("name", COLLEGE_LOCATION_NAME)
        .limit(1);
        
      if (collegeLocs && collegeLocs.length > 0) {
        matchedLocationId = collegeLocs[0].id;
        console.log("Found college location:", collegeLocs[0]);
      }
    } else if (formData.location.toLowerCase().includes("financial") || 
               formData.location.toLowerCase().includes("district")) {
      console.log("FD location detected");
      
      const { data: fdLocs } = await supabase
        .from("locations")
        .select("id, name")
        .eq("name", LOCATION_NAME)
        .limit(1);
        
      if (fdLocs && fdLocs.length > 0) {
        matchedLocationId = fdLocs[0].id;
        console.log("Found FD location:", fdLocs[0]);
      }
    } else {
      // Generic location search
      const { data: locs } = await supabase
        .from("locations")
        .select("id, name")
        .ilike("name", `%${formData.location}%`)
        .limit(10);

      if (locs && locs.length > 0) {
        const exactMatch = locs.find(loc => 
          loc.name.toLowerCase().includes(formData.location.toLowerCase()) ||
          formData.location.toLowerCase().includes(loc.name.toLowerCase())
        );
        matchedLocationId = exactMatch?.id;
        console.log("Found generic location match:", exactMatch);
      }
    }

    if (matchedLocationId) {
      console.log("Looking for assigned supervisor for location ID:", matchedLocationId);
      
      const { data: assignments } = await supabase
        .from("employee_assignments")
        .select(`
          user_id,
          users!inner(
            id,
            name,
            phone,
            role
          )
        `)
        .eq("location_id", matchedLocationId)
        .eq("users.role", "employee")
        .limit(1);
        
      console.log("Found supervisor assignments:", assignments);
      
      if (assignments && assignments.length > 0) {
        const supervisor = assignments[0].users;
        supervisorInfo = {
          id: supervisor.id,
          name: supervisor.name || "Supervisor",
          phone: supervisor.phone || "N/A"
        };
        console.log("Found supervisor:", supervisorInfo);
      }
    }
    
    return { locationId: matchedLocationId, supervisor: supervisorInfo };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setShowLoginModal(true);
      return;
    }

    // Validation: Either description or voice message is required
    const hasDescription = formData.description.trim().length > 0;
    const hasVoiceMessage = voiceData.audioBlob !== null;

    if (!hasDescription && !hasVoiceMessage) {
      toast({
        title: "Missing Information",
        description: "Please either write a description or record a voice message for your complaint.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category || !formData.location || !formData.areaType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields, including area type and category.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Find assigned supervisor for the location
      const { locationId, supervisor } = await findAssignedSupervisor();
      
      const forwardedTo = getForwardedTo();

      console.log("Submitting complaint with supervisor:", supervisor);

      // Convert voice to base64 if present
      let voiceMessageBase64 = null;
      if (voiceData.audioBlob) {
        voiceMessageBase64 = await convertAudioToBase64(voiceData.audioBlob);
        console.log("Voice message converted to base64, length:", voiceMessageBase64.length);
      }

      // Save complaint to Supabase database
      const { data: complaint, error: complaintError } = await supabase
        .from("complaints")
        .insert([
          {
            name: user.name,
            phone: user.phone,
            location_name: formData.location,
            area_type: formData.areaType,
            forwarded_to: forwardedTo,
            category: formData.category,
            description: hasDescription ? formData.description : "Voice message provided",
            voice_message: voiceMessageBase64,
            voice_duration: voiceData.duration,
            location_id: locationId,
            assigned_officer_id: supervisor?.id,
            status: 'submitted'
          }
        ])
        .select()
        .single();

      if (complaintError) {
        console.error("Error saving complaint:", complaintError);
        throw complaintError;
      }

      console.log("Complaint saved successfully:", complaint);

      // Create assignment record if supervisor found
      if (supervisor && complaint.id) {
        const { error: assignmentError } = await supabase
          .from("complaint_assignments")
          .insert([
            {
              complaint_id: complaint.id,
              assigned_to: supervisor.id,
              status: 'assigned'
            }
          ]);

        if (assignmentError) {
          console.error("Error creating assignment:", assignmentError);
        } else {
          console.log("Assignment created successfully");
        }
      }

      // Save to local store for backward compatibility
      const localComplaintId = complaintsStore.addComplaint({
        name: user.name,
        phone: user.phone,
        location: formData.location,
        areaType: formData.areaType,
        forwardedTo,
        category: formData.category,
        description: hasDescription ? formData.description : "Voice message provided",
        image: formData.images[0] || null,
      });

      setSubmittedComplaintId(complaint.id || localComplaintId);
      
      if (supervisor) {
        setAssignedOfficer({ name: supervisor.name, phone: supervisor.phone });
      }

      toast({
        title: "Complaint Submitted Successfully!",
        description: supervisor 
          ? `Your complaint has been assigned to ${supervisor.name}` 
          : `Your complaint has been forwarded to: ${forwardedTo}`,
        className: "bg-ts-success text-black"
      });

    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your complaint. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewMyComplaints = () => {
    navigate(`/my-complaints?phone=${encodeURIComponent(user?.phone || '')}`);
  };

  const handleSubmitAnother = () => {
    setSubmittedComplaintId(null);
    setAssignedOfficer(null);
    setFormData({
      location: "",
      areaType: "",
      category: "",
      description: "",
      images: []
    });
    setVoiceData({
      audioBlob: null,
      duration: 0
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
                Please login to submit a complaint. Use demo accounts for testing:
              </p>
              <div className="text-sm text-left bg-blue-50 p-4 rounded mb-6">
                <p className="font-semibold text-blue-800 mb-2">Demo Accounts (No SMS required):</p>
                <p>FD Supervisor: <strong>8000000001</strong></p>
                <p>College Supervisor: <strong>8000000002</strong></p>
                <p>Admin: <strong>9000000001</strong></p>
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ SMS authentication is not configured. Use demo accounts for testing.
                </p>
              </div>
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
                  
                  {assignedOfficer ? (
                    <div className="mt-4 bg-blue-50 rounded p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">📍 Assigned to Supervisor:</h3>
                      <div className="text-left">
                        <div className="mb-1">
                          <span className="font-semibold">{assignedOfficer.name}</span>
                          <span className="mx-2">–</span>
                          <span className="text-blue-900">{assignedOfficer.phone}</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          Your complaint has been directly assigned to the location supervisor for faster resolution.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <h3 className="font-semibold text-ts-text mb-1">📍 Forwarded To:</h3>
                      <div className="mb-2">{getForwardedTo()}</div>
                      <p className="text-sm text-amber-600">
                        No dedicated supervisor found for this location. Complaint forwarded to general authority.
                      </p>
                    </div>
                  )}
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

                {/* Voice Recording Section */}
                <div>
                  <Label className="text-ts-text font-medium flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Voice Message (Optional) / వాయిస్ సందేశం
                  </Label>
                  <p className="text-sm text-ts-text-secondary mb-3">
                    Record your complaint in your voice. If you provide a voice message, written description becomes optional.
                  </p>
                  <VoiceRecorder 
                    onRecordingComplete={handleVoiceRecordingComplete}
                    onRecordingClear={handleVoiceRecordingClear}
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-ts-text font-medium">
                    Description {voiceData.audioBlob ? "(Optional)" : "(Required) *"} / వివరణ
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-2 rounded-lg border-gray-300 focus:border-ts-primary min-h-[120px]"
                    placeholder={voiceData.audioBlob 
                      ? "Optional: Add additional written details..." 
                      : "Describe your complaint in detail..."
                    }
                  />
                  {voiceData.audioBlob && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Voice message recorded. Written description is now optional.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="images" className="text-ts-text font-medium">
                    Upload Images (Optional, Max 5) / చిత్రాలు అప్‌లోడ్ చేయండి
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="mt-2 rounded-lg border-gray-300 focus:border-ts-primary"
                  />
                  
                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Selected Images ({formData.images.length}/5):</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {image.name.substring(0, 10)}...
                            </div>
                          </div>
                        ))}
                        
                        {formData.images.length < 5 && (
                          <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className="text-center">
                              <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">Add Image</p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}
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
