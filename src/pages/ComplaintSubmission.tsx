
import { useState } from "react";
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
    phone: "",
    location: "",
    category: "",
    description: "",
    areaType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState<{
    blob: Blob;
    duration: number;
  } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVoiceRecordingComplete = (audioBlob: Blob, duration: number) => {
    setVoiceRecording({ blob: audioBlob, duration });
  };

  const handleVoiceRecordingClear = () => {
    setVoiceRecording(null);
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

    if (!formData.areaType) {
      toast({
        title: "Error",
        description: "Area type is required.",
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
        phone: formData.phone,
        location_name: formData.location,
        category: formData.category,
        description: voiceRecording ? "Voice message provided" : formData.description,
        area_type: formData.areaType,
        voice_message: voiceBase64,
        voice_duration: voiceRecording?.duration || null,
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

      console.log('Complaint submitted successfully:', data);

      toast({
        title: "Success!",
        description: "Your complaint has been submitted successfully.",
        className: "bg-green-50 text-green-800"
      });

      // Navigate to success page or complaint tracking
      navigate(`/track-complaint?id=${data.id}`);

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
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-ts-text">Location *</Label>
                  <Select onValueChange={(value) => handleInputChange("location", value)} value={formData.location}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label className="text-ts-text">Area Type *</Label>
                  <RadioGroup
                    value={formData.areaType}
                    onValueChange={(value) => handleInputChange("areaType", value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Village" id="village" />
                      <Label htmlFor="village">Village (గ్రామం)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="City" id="city" />
                      <Label htmlFor="city">City (నగరం)</Label>
                    </div>
                  </RadioGroup>
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
