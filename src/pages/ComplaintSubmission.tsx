
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowUp, Home } from "lucide-react";
import { complaintsStore } from "@/lib/complaintsStore";

const ComplaintSubmission = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    category: "",
    description: "",
    image: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Roads & Infrastructure",
    "Water Supply",
    "Electricity",
    "Healthcare",
    "Education",
    "Agriculture",
    "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.category || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const complaintId = complaintsStore.addComplaint({
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        category: formData.category,
        description: formData.description,
        image: formData.image
      });
      
      setIsSubmitting(false);
      
      toast({
        title: "Complaint Submitted Successfully!",
        description: `Your complaint ID is: ${complaintId}. Please save this for tracking.`,
        className: "bg-ts-success text-black"
      });
      
      // Reset form
      setFormData({
        name: "",
        phone: "",
        location: "",
        category: "",
        description: "",
        image: null
      });
    }, 2000);
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
          <span className="text-ts-text">Submit Complaint</span>
        </div>

        <div className="max-w-2xl mx-auto">
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
                  <Label htmlFor="name" className="text-ts-text font-medium">
                    Name (Optional) / పేరు
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-2 rounded-lg border-gray-300 focus:border-ts-primary"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-ts-text font-medium">
                    Phone Number (Required) * / ఫోన్ నంబర్
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-2 rounded-lg border-gray-300 focus:border-ts-primary"
                    placeholder="Enter your mobile number"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-ts-text font-medium">
                    Location / స్థానం
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="mt-2 rounded-lg border-gray-300 focus:border-ts-primary"
                    placeholder="Village, Mandal, District"
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
      
      <Footer />
    </div>
  );
};

export default ComplaintSubmission;
