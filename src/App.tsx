import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ComplaintSubmission from "./pages/ComplaintSubmission";
import ComplaintTracking from "./pages/ComplaintTracking";
import OfficialLogin from "./pages/OfficialLogin";
import AdminDashboard from "./pages/AdminDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import Contact from "./pages/Contact";
import MyComplaints from "./pages/MyComplaints";
import NotFound from "./pages/NotFound";
import ChatBot from "@/components/ChatBot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/submit-complaint" element={<ComplaintSubmission />} />
            <Route path="/track-complaint" element={<ComplaintTracking />} />
            <Route path="/my-complaints" element={<MyComplaints />} />
            <Route path="/official-login" element={<OfficialLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <ChatBot />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
