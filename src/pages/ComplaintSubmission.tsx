import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import VoiceRecorder from "@/components/VoiceRecorder";
import { Home, FileText, User, Phone, MessageSquare, Mic } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LocationDetector from "@/components/LocationDetector";
import telanganaData from "@/constants/telangana_structure.json";
import FeedbackForm from "../components/FeedbackForm";
import { supervisorNumbers } from "@/constants/supervisorNumbers";

const categories = [
  "Water Supply", "Electricity", "Roads", "Sanitation", "Education", "Healthcare", 
  "Agriculture", "Transportation", "Employment", "Other"
];

const locations = [
  "Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam",
  "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Miryalaguda", "Jagtial",
  "Mancherial", "Nirmal", "Kamareddy", "Medak", "Vikarabad", "Sangareddy",
  "Siddipet", "Jangaon", "Mahabubabad", "Bhadradri Kothagudem", "Mulugu",
  "Narayanpet", "Wanaparthy", "Jogulamba Gadwal", "Other"
];

const ComplaintSubmission = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: user?.phone || "",
    location: "",
    category: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState<{
    blob: Blob;
    duration: number;
  } | null>(null);
  const [successData, setSuccessData] = useState<null | { id: string; supervisor?: string }>(null);
  const [manualLocation, setManualLocation] = useState({
    district: "",
    mandal: "",
    village: ""
  });
  const [useManual, setUseManual] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVoiceRecordingComplete = (audioBlob: Blob, duration: number) => {
    setVoiceRecording({ blob: audioBlob, duration });
  };

  const handleVoiceRecordingClear = () => {
    setVoiceRecording(null);
  };

  useEffect(() => {
    if (isAuthenticated && user?.phone && formData.phone !== user.phone) {
      setFormData(prev => ({ ...prev, phone: user.phone }));
    }
  }, [isAuthenticated, user?.phone]);

  useEffect(() => {
    if (isAuthenticated && user?.name && formData.name !== user.name) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [isAuthenticated, user?.name]);

  const handleLocationDetected = (location: string) => {
    setFormData(prev => ({ ...prev, location }));
    // Try to match location to district and mandal
    let found = false;
    let matchedDistrict = "";
    let matchedMandal = "";
    // Helper to get English part before parenthesis
    const getEnglish = (name: string) => name.split('(')[0].trim();
    for (const d of telanganaData) {
      const districtEnglish = getEnglish(d.district);
      if (location.toLowerCase().includes(districtEnglish.toLowerCase())) {
        matchedDistrict = d.district;
        for (const m of d.mandals) {
          const mandalEnglish = getEnglish(m.mandal);
          if (location.toLowerCase().includes(mandalEnglish.toLowerCase())) {
            matchedMandal = m.mandal;
            break;
          }
        }
        break;
      }
    }
    if (matchedDistrict && matchedMandal) {
      setManualLocation({ district: matchedDistrict, mandal: matchedMandal, village: "" });
      setUseManual(true);
      found = true;
    } else {
      setUseManual(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Error", 
        description: "Phone number is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.location.trim()) {
      toast({
        title: "Error",
        description: "Location is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.category) {
      toast({
        title: "Error",
        description: "Category is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!voiceRecording && !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Either description or voice message is required.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let location = formData.location;
      if (useManual) {
        location = `${manualLocation.mandal}, ${manualLocation.district}`;
      }

      // Supervisor assignment logic
      let mandalName = "";
      if (useManual && manualLocation.mandal) {
        mandalName = manualLocation.mandal.split("(")[0].trim();
      } else if (formData.location) {
        const parts = formData.location.split(",");
        if (parts.length > 0) {
          mandalName = parts[0].split("(")[0].trim();
        }
      }
      let assignedOfficerId = null;
      let locationId = null;
      if (mandalName) {
        // Find the location_id for this mandal
        const { data: locationData, error: locationError } = await supabase
          .from('locations')
          .select('id, name')
          .ilike('name', `%${mandalName}%`)
          .single();
        if (locationError || !locationData) throw new Error('Location not found for mandal: ' + mandalName);
        locationId = locationData.id;
        // Find the supervisor for this location
        const { data: assignment, error: assignmentError } = await supabase
          .from('employee_assignments')
          .select('user_id')
          .eq('location_id', locationId)
          .single();
        if (assignmentError || !assignment) throw new Error('Supervisor not found for location: ' + mandalName);
        assignedOfficerId = assignment.user_id;
      }

      // Convert voice recording to base64 if present
      let voiceBase64 = null;
      if (voiceRecording) {
        const reader = new FileReader();
        voiceBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]); // Remove data:audio/webm;base64, prefix
          };
          reader.readAsDataURL(voiceRecording.blob);
        });
      }

      // Prepare complaint data
      const complaintData = {
        name: formData.name,
        phone: isAuthenticated && user?.phone ? user.phone : formData.phone,
        location_name: location,
        location_id: locationId,
        category: formData.category,
        description: voiceRecording ? "Voice message provided" : formData.description,
        voice_message: voiceBase64,
        voice_duration: voiceRecording?.duration || null,
        assigned_officer_id: assignedOfficerId,
        status: 'submitted' as const,
        submitted_at: new Date().toISOString()
      };

      // Insert complaint into database
      const { data, error } = await supabase
        .from('complaints')
        .insert([complaintData])
        .select()
        .single();

      if (error) {
        console.error('Error submitting complaint:', error);
        throw error;
      }

      // Instead of navigate, show success message
      setSuccessData({ id: data.id });
      toast({
        title: "Success!",
        description: "Your complaint has been submitted successfully.",
        className: "bg-green-50 text-green-800"
      });

    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast({
        title: "Error",
        description: "Failed to submit complaint. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Temporary: Delete all complaints for the current user
  const handleDeleteAllComplaints = async () => {
    if (!user?.phone) return;
    const { error } = await supabase.from('complaints').delete().eq('phone', user.phone);
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete complaints.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'All your complaints have been deleted.',
        className: 'bg-green-50 text-green-800',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ts-background font-poppins">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-ts-text mb-4">
                Login Required
              </h3>
              <p className="text-ts-text-secondary mb-6">
                Please login to submit a complaint.
              </p>
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="bg-ts-primary hover:bg-ts-primary-dark text-white"
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

  if (successData) {
    // Extract mandal from manualLocation or formData.location
    let mandal = "";
    if (manualLocation.mandal) {
      mandal = manualLocation.mandal.split("(")[0].trim();
    } else if (formData.location) {
      // Try to match mandal from location string
      const parts = formData.location.split(",");
      if (parts.length > 0) {
        mandal = parts[0].split("(")[0].trim();
      }
    }
    // const supervisorId = supervisorNumbers[mandal] || "";
    // Feedback form removed from here
    return (
      <div className="min-h-screen bg-ts-background font-poppins">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-xl mx-auto">
            <Card className="shadow-lg rounded-xl border-0 text-center">
              <CardContent className="p-10">
                <FileText className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800 mb-2">Complaint Submitted!</h2>
                <p className="text-ts-text-secondary mb-4">
                  Your complaint has been submitted and forwarded to your area supervisor.
                </p>
                <div className="mb-4">
                  <span className="font-semibold text-ts-text">Complaint ID:</span>
                  <span className="ml-2 text-ts-accent font-mono">{successData.id}</span>
                </div>
                <Link to={`/track-complaint?id=${successData.id}`}>
                  <Button className="bg-ts-primary hover:bg-ts-primary-dark text-white">
                    Track Your Complaint
                  </Button>
                </Link>
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
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-ts-accent hover:text-ts-primary transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <span className="text-ts-text-secondary mx-2">/</span>
          <span className="text-ts-text">Submit Complaint</span>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ts-text mb-2 flex items-center">
              <FileText className="mr-3 h-8 w-8 text-ts-primary" />
              Submit Your Complaint
            </h1>
            <p className="text-ts-text-secondary font-telugu">
              మీ ఫిర్యాదును సమర్పించండి
            </p>
          </div>

          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-xl text-ts-text">Complaint Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-ts-text flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Your Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="mt-1"
                      placeholder="Enter your full name"
                      required
                      readOnly={isAuthenticated}
                      style={isAuthenticated ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-ts-text flex items-center">
                      <Phone className="mr-2 h-4 w-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="mt-1"
                      placeholder="Enter your phone number"
                      required
                      readOnly={isAuthenticated}
                      style={isAuthenticated ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Label className="text-ts-text">Location *</Label>
                  <div className="flex flex-col gap-2">
                    <LocationDetector onLocationDetected={handleLocationDetected} />
                    <div className="text-xs text-gray-500">Or select manually if detection fails:</div>
                    {!useManual && (
                      <Button type="button" variant="outline" onClick={() => setUseManual(true)} className="w-fit">Select Manually</Button>
                    )}
                    {useManual && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                        {/* District Dropdown */}
                        <select
                          className="border rounded p-2"
                          value={manualLocation.district}
                          onChange={e => {
                            setManualLocation({ district: e.target.value, mandal: "", village: "" });
                          }}
                        >
                          <option value="">---select---</option>
                          {telanganaData.map(d => (
                            <option key={d.district} value={d.district}>{d.district}</option>
                          ))}
                        </select>
                        {/* Mandal Dropdown */}
                        <select
                          className="border rounded p-2"
                          value={manualLocation.mandal}
                          onChange={e => {
                            setManualLocation(prev => ({ ...prev, mandal: e.target.value, village: "" }));
                          }}
                          disabled={!manualLocation.district}
                        >
                          <option value="">Select Mandal</option>
                          {telanganaData.find(d => d.district === manualLocation.district)?.mandals.map(m => (
                            <option key={m.mandal} value={m.mandal}>{m.mandal}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-ts-text">Category *</Label>
                  <Select onValueChange={(value) => handleInputChange("category", value)} value={formData.category}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select complaint category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-ts-text flex items-center mb-4">
                    <Mic className="mr-2 h-4 w-4" />
                    Voice Message or Description
                  </Label>
                  
                  <div className="space-y-4">
                    <VoiceRecorder 
                      onRecordingComplete={handleVoiceRecordingComplete}
                      onRecordingClear={handleVoiceRecordingClear}
                    />
                    
                    {!voiceRecording && (
                      <div>
                        <Label htmlFor="description" className="text-ts-text flex items-center">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Written Description
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          className="mt-1"
                          placeholder="Describe your complaint in detail..."
                          rows={4}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-ts-primary hover:bg-ts-primary-dark text-white font-medium py-3 rounded-lg"
                >
                  {isSubmitting ? "Submitting..." : "Submit Complaint"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ComplaintSubmission;
