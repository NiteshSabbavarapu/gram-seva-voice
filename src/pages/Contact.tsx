
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, Info } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent Successfully!",
        description: "We will get back to you within 24 hours.",
        className: "bg-ts-success text-black"
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    }, 2000);
  };

  const faqs = [
    {
      question: "How do I submit a complaint?",
      answer: "Click on 'Submit a Complaint' button on the home page and fill out the form with your details and complaint description."
    },
    {
      question: "How long does it take to resolve complaints?",
      answer: "Most complaints are resolved within 7-15 working days depending on the complexity and category of the issue."
    },
    {
      question: "Can I track my complaint status?",
      answer: "Yes, you can track your complaint using the Complaint ID provided after submission."
    },
    {
      question: "Is there any cost for submitting complaints?",
      answer: "No, this is a free government service for all citizens of Telangana."
    },
    {
      question: "What if I don't have internet access?",
      answer: "You can also call our helpline at 1800-123-4567 or visit your local government office."
    }
  ];

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
          <span className="text-ts-text">Contact</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="shadow-xl rounded-xl border-0">
            <CardHeader className="bg-gradient-to-r from-ts-accent to-teal-600 text-white rounded-t-xl">
              <CardTitle className="text-2xl font-bold">Contact Us</CardTitle>
              <p className="text-white/90 font-telugu">మమ్మల్ని సంప్రదించండి</p>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-ts-text font-medium">
                    Name / పేరు
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-2 rounded-lg border-gray-300 focus:border-ts-accent"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-ts-text font-medium">
                    Email / ఇమెయిల్
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-2 rounded-lg border-gray-300 focus:border-ts-accent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-ts-text font-medium">
                    Phone / ఫోన్
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-2 rounded-lg border-gray-300 focus:border-ts-accent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-ts-text font-medium">
                    Message / సందేశం
                  </Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="mt-2 rounded-lg border-gray-300 focus:border-ts-accent min-h-[120px]"
                    placeholder="Enter your message"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-ts-accent hover:bg-teal-600 text-white font-semibold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information & FAQs */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="shadow-xl rounded-xl border-0">
              <CardHeader>
                <CardTitle className="text-xl text-ts-text">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-ts-text mb-2">Helpline</h4>
                  <p className="text-ts-text-secondary">1800-123-4567 (Toll Free)</p>
                  <p className="text-sm text-ts-text-secondary">Available 24/7</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-ts-text mb-2">Email</h4>
                  <p className="text-ts-text-secondary">help@tsgramseva.gov.in</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-ts-text mb-2">Office Hours</h4>
                  <p className="text-ts-text-secondary">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-ts-text-secondary">Saturday: 9:00 AM - 1:00 PM</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-ts-text mb-2">Address</h4>
                  <p className="text-ts-text-secondary">
                    Secretariat, Hyderabad<br />
                    Telangana State - 500022
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* FAQs */}
            <Card className="shadow-xl rounded-xl border-0">
              <CardHeader>
                <CardTitle className="text-xl text-ts-text flex items-center">
                  <Info className="mr-2 h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="font-semibold text-ts-text mb-2">{faq.question}</h4>
                    <p className="text-ts-text-secondary text-sm">{faq.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
